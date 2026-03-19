use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    sync::atomic::{AtomicU64, Ordering},
    time::{SystemTime, UNIX_EPOCH},
};

use axum::{
    extract::{Query, State},
    http::{
        header::{COOKIE, SET_COOKIE},
        HeaderMap, HeaderValue, StatusCode,
    },
    response::{IntoResponse, Redirect, Response},
    routing::{get, post},
    Json, Router,
};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use url::Url;

use crate::{error::AppError, state::AppState};

const SESSION_TTL_SECONDS: i64 = 12 * 60 * 60;
const BOOTSTRAP_USER_ID: &str = "oauth-bootstrap";
const BOOTSTRAP_DISPLAY_NAME: &str = "OAuth Bootstrap User";
const BOOTSTRAP_ROLE: &str = "editor";
static SESSION_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Deserialize)]
struct OAuthCallbackQuery {
    code: Option<String>,
    state: Option<String>,
}

#[derive(Debug, Serialize)]
struct SessionResponse {
    authenticated: bool,
    user: Option<SessionUser>,
}

#[derive(Debug, Serialize)]
struct SessionUser {
    id: String,
    display_name: String,
    role: String,
}

#[derive(Debug)]
struct AdminSessionRecord {
    id: String,
    user_id: String,
    role: String,
    expires_at: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/session", get(get_session))
        .route("/auth/logout", post(logout))
        .route("/oauth/callback", get(oauth_callback))
}

async fn get_session(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<SessionResponse>, AppError> {
    let Some(session_id) = extract_session_cookie(&headers, &state) else {
        return Ok(Json(signed_out_response()));
    };

    let Some(session) = load_session(state.db(), &session_id).await? else {
        return Ok(Json(signed_out_response()));
    };

    if session_is_expired(&session)? {
        delete_session(state.db(), &session.id).await?;
        return Ok(Json(signed_out_response()));
    }

    Ok(Json(SessionResponse {
        authenticated: true,
        user: Some(SessionUser {
            id: session.user_id.clone(),
            display_name: bootstrap_display_name(&session.user_id),
            role: session.role,
        }),
    }))
}

async fn logout(State(state): State<AppState>, headers: HeaderMap) -> Result<Response, AppError> {
    if let Some(session_id) = extract_session_cookie(&headers, &state) {
        if let Some(session) = load_session(state.db(), &session_id).await? {
            delete_session(state.db(), &session.id).await?;
        }
    }

    let mut response = StatusCode::NO_CONTENT.into_response();
    set_cookie_header(response.headers_mut(), build_logout_cookie(&state))?;
    Ok(response)
}

async fn oauth_callback(
    State(state): State<AppState>,
    Query(query): Query<OAuthCallbackQuery>,
) -> Result<Response, AppError> {
    let _code = query
        .code
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| AppError::bad_request("missing required query parameter: code"))?;
    let state_param = query
        .state
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| AppError::bad_request("missing required query parameter: state"))?;

    let redirect_url = derive_frontend_redirect(&state, state_param);
    let expires_at = unix_timestamp_now()? + SESSION_TTL_SECONDS;
    let session_id = generate_session_id(&state)?;

    create_session(
        state.db(),
        &session_id,
        BOOTSTRAP_USER_ID,
        BOOTSTRAP_ROLE,
        expires_at,
    )
    .await?;

    let mut response = Redirect::temporary(redirect_url.as_str()).into_response();
    set_cookie_header(
        response.headers_mut(),
        build_session_cookie(&state, &session_id),
    )?;
    Ok(response)
}

fn signed_out_response() -> SessionResponse {
    SessionResponse {
        authenticated: false,
        user: None,
    }
}

fn extract_session_cookie(headers: &HeaderMap, state: &AppState) -> Option<String> {
    headers
        .get_all(COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok())
        .flat_map(|header| header.split(';'))
        .filter_map(|pair| pair.trim().split_once('='))
        .find_map(|(name, value)| {
            if name == state.config().session_cookie_name {
                Some(value.to_string())
            } else {
                None
            }
        })
}

async fn load_session(
    db: &sqlx::SqlitePool,
    session_id: &str,
) -> Result<Option<AdminSessionRecord>, AppError> {
    let row = sqlx::query(
        r#"
        SELECT id, user_id, role, expires_at
        FROM admin_sessions
        WHERE id = ?
        "#,
    )
    .bind(session_id)
    .fetch_optional(db)
    .await
    .map_err(|error| AppError::internal(format!("failed to load admin session: {error}")))?;

    Ok(row.map(|row| AdminSessionRecord {
        id: row.get("id"),
        user_id: row.get("user_id"),
        role: row.get("role"),
        expires_at: row.get("expires_at"),
    }))
}

async fn delete_session(db: &sqlx::SqlitePool, session_id: &str) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM admin_sessions
        WHERE id = ?
        "#,
    )
    .bind(session_id)
    .execute(db)
    .await
    .map_err(|error| AppError::internal(format!("failed to delete admin session: {error}")))?;

    Ok(())
}

async fn create_session(
    db: &sqlx::SqlitePool,
    session_id: &str,
    user_id: &str,
    role: &str,
    expires_at: i64,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        INSERT INTO admin_sessions (id, user_id, role, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )
    .bind(session_id)
    .bind(user_id)
    .bind(role)
    .bind(expires_at.to_string())
    .bind(unix_timestamp_now()?.to_string())
    .execute(db)
    .await
    .map_err(|error| AppError::internal(format!("failed to create admin session: {error}")))?;

    Ok(())
}

fn session_is_expired(session: &AdminSessionRecord) -> Result<bool, AppError> {
    let expires_at = session.expires_at.parse::<i64>().map_err(|error| {
        AppError::internal(format!(
            "failed to parse admin session expiry for {}: {error}",
            session.id
        ))
    })?;

    Ok(expires_at <= unix_timestamp_now()?)
}

fn build_session_cookie(state: &AppState, session_id: &str) -> String {
    let mut cookie = format!(
        "{}={session_id}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_TTL_SECONDS}",
        state.config().session_cookie_name,
    );

    if cookie_should_be_secure(state) {
        cookie.push_str("; Secure");
    }

    cookie
}

fn build_logout_cookie(state: &AppState) -> String {
    let mut cookie = format!(
        "{}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        state.config().session_cookie_name
    );

    if cookie_should_be_secure(state) {
        cookie.push_str("; Secure");
    }

    cookie
}

fn cookie_should_be_secure(state: &AppState) -> bool {
    state.config().frontend_base_url.starts_with("https://")
}

fn bootstrap_display_name(user_id: &str) -> String {
    if user_id == BOOTSTRAP_USER_ID {
        BOOTSTRAP_DISPLAY_NAME.to_string()
    } else {
        user_id.to_string()
    }
}

fn derive_frontend_redirect(state: &AppState, raw_state: &str) -> Url {
    let fallback = frontend_base_url(state);
    let Some(decoded) = decode_state_url(raw_state) else {
        return fallback;
    };
    let Ok(candidate) = Url::parse(&decoded) else {
        return fallback;
    };

    if candidate.path() != "/api/oauth/callback" {
        return fallback;
    }

    if candidate.origin().ascii_serialization() != fallback.origin().ascii_serialization() {
        return fallback;
    }

    let mut redirect = fallback;
    redirect.set_path("/");
    redirect.set_query(None);
    redirect.set_fragment(None);
    redirect
}

fn decode_state_url(raw_state: &str) -> Option<String> {
    STANDARD
        .decode(raw_state)
        .ok()
        .and_then(|bytes| String::from_utf8(bytes).ok())
}

fn frontend_base_url(state: &AppState) -> Url {
    Url::parse(&state.config().frontend_base_url).unwrap_or_else(|_| {
        Url::parse("http://localhost:5173").expect("hard-coded frontend fallback is valid")
    })
}

fn set_cookie_header(headers: &mut HeaderMap, cookie: String) -> Result<(), AppError> {
    let value = HeaderValue::from_str(&cookie)
        .map_err(|error| AppError::internal(format!("invalid Set-Cookie header value: {error}")))?;
    headers.append(SET_COOKIE, value);
    Ok(())
}

fn unix_timestamp_now() -> Result<i64, AppError> {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| AppError::internal(format!("system clock error: {error}")))?;
    i64::try_from(duration.as_secs())
        .map_err(|error| AppError::internal(format!("timestamp conversion error: {error}")))
}

fn generate_session_id(state: &AppState) -> Result<String, AppError> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| AppError::internal(format!("system clock error: {error}")))?;
    let counter = SESSION_COUNTER.fetch_add(1, Ordering::Relaxed);

    let mut hasher = DefaultHasher::new();
    state.config().session_secret.hash(&mut hasher);
    state.config().session_cookie_name.hash(&mut hasher);
    std::process::id().hash(&mut hasher);
    now.as_nanos().hash(&mut hasher);
    counter.hash(&mut hasher);

    Ok(format!("{:016x}{:016x}", hasher.finish(), counter))
}
