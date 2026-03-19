use axum::{extract::State, http::StatusCode, routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::Row;

use crate::{
    error::AppError,
    ingest::{current_timestamp, generate_id},
    state::AppState,
};

const ACTIVE_SUBSCRIBER_STATUS: &str = "active";
const SUBSCRIBE_SOURCE: &str = "site_modal";

#[derive(Debug, Deserialize)]
struct SubscribeRequest {
    email: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SubscribeResponse {
    status: &'static str,
    message: &'static str,
    email: String,
    already_subscribed: bool,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/subscribe", post(subscribe))
}

async fn subscribe(
    State(state): State<AppState>,
    Json(payload): Json<SubscribeRequest>,
) -> Result<(StatusCode, Json<SubscribeResponse>), AppError> {
    let normalized_email = normalize_email(&payload.email)?;
    let created_at = current_timestamp();

    let insert_result = sqlx::query(
        r#"
        INSERT INTO subscribers (
            id,
            email,
            status,
            source,
            created_at,
            confirmed_at,
            unsubscribed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NULL)
        ON CONFLICT(email) DO NOTHING
        "#,
    )
    .bind(generate_id("sub"))
    .bind(&normalized_email)
    .bind(ACTIVE_SUBSCRIBER_STATUS)
    .bind(SUBSCRIBE_SOURCE)
    .bind(&created_at)
    .bind(&created_at)
    .execute(state.db())
    .await
    .map_err(|error| AppError::internal(format!("failed to persist subscription: {error}")))?;

    if insert_result.rows_affected() == 1 {
        return Ok((
            StatusCode::CREATED,
            Json(SubscribeResponse {
                status: "subscribed",
                message: "Subscription created",
                email: normalized_email,
                already_subscribed: false,
            }),
        ));
    }

    let existing = sqlx::query("SELECT id, status FROM subscribers WHERE email = ?")
        .bind(&normalized_email)
        .fetch_optional(state.db())
        .await
        .map_err(|error| AppError::internal(format!("failed to load subscription: {error}")))?;

    let Some(existing) = existing else {
        return Err(AppError::internal(
            "subscription insert conflicted but no existing subscriber was found",
        ));
    };

    let subscriber_id: String = existing.get("id");
    let status: String = existing.get("status");

    if status == ACTIVE_SUBSCRIBER_STATUS {
        return Ok((
            StatusCode::OK,
            Json(SubscribeResponse {
                status: "already_subscribed",
                message: "Email is already subscribed",
                email: normalized_email,
                already_subscribed: true,
            }),
        ));
    }

    sqlx::query(
        r#"
        UPDATE subscribers
        SET status = ?, confirmed_at = COALESCE(confirmed_at, ?), unsubscribed_at = NULL
        WHERE id = ?
        "#,
    )
    .bind(ACTIVE_SUBSCRIBER_STATUS)
    .bind(&created_at)
    .bind(subscriber_id)
    .execute(state.db())
    .await
    .map_err(|error| AppError::internal(format!("failed to reactivate subscription: {error}")))?;

    Ok((
        StatusCode::OK,
        Json(SubscribeResponse {
            status: "subscribed",
            message: "Subscription reactivated",
            email: normalized_email,
            already_subscribed: false,
        }),
    ))
}

fn normalize_email(email: &str) -> Result<String, AppError> {
    let normalized = email.trim().to_ascii_lowercase();

    if !is_valid_email(&normalized) {
        return Err(AppError::bad_request("invalid email address"));
    }

    Ok(normalized)
}

fn is_valid_email(email: &str) -> bool {
    if email.is_empty() || email.len() > 254 || email.bytes().any(|byte| byte.is_ascii_whitespace())
    {
        return false;
    }

    let mut parts = email.split('@');
    let Some(local) = parts.next() else {
        return false;
    };
    let Some(domain) = parts.next() else {
        return false;
    };

    if parts.next().is_some() || local.is_empty() || domain.is_empty() || local.len() > 64 {
        return false;
    }

    if local.starts_with('.') || local.ends_with('.') || local.contains("..") {
        return false;
    }

    if !local.chars().all(|ch| {
        ch.is_ascii_alphanumeric()
            || matches!(
                ch,
                '.' | '!'
                    | '#'
                    | '$'
                    | '%'
                    | '&'
                    | '\''
                    | '*'
                    | '+'
                    | '/'
                    | '='
                    | '?'
                    | '^'
                    | '_'
                    | '`'
                    | '{'
                    | '|'
                    | '}'
                    | '~'
                    | '-'
            )
    }) {
        return false;
    }

    if domain.ends_with('.') || !domain.contains('.') {
        return false;
    }

    let mut labels = domain.split('.').peekable();
    if labels.peek().is_none() {
        return false;
    }

    let mut saw_tld = false;

    for label in labels {
        if label.is_empty()
            || label.len() > 63
            || label.starts_with('-')
            || label.ends_with('-')
            || !label
                .chars()
                .all(|ch| ch.is_ascii_alphanumeric() || ch == '-')
        {
            return false;
        }

        saw_tld = true;
    }

    if !saw_tld {
        return false;
    }

    match domain.rsplit('.').next() {
        Some(tld) => tld.len() >= 2 && tld.chars().all(|ch| ch.is_ascii_alphabetic()),
        None => false,
    }
}
