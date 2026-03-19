use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, state::AppState};

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

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/session", get(get_session))
        .route("/auth/logout", post(logout))
        .route("/oauth/callback", get(oauth_callback))
}

async fn get_session(State(state): State<AppState>) -> Json<SessionResponse> {
    let _ = state.db();

    Json(SessionResponse {
        authenticated: false,
        user: None,
    })
}

async fn logout() -> StatusCode {
    StatusCode::NO_CONTENT
}

async fn oauth_callback(
    State(state): State<AppState>,
    Query(query): Query<OAuthCallbackQuery>,
) -> Result<impl IntoResponse, AppError> {
    let _ = state.config();

    if query.code.is_none() || query.state.is_none() {
        return Err(AppError::not_implemented(
            "OAuth callback validation is scaffolded but not implemented yet",
        ));
    }

    Err(AppError::not_implemented(
        "OAuth callback session exchange is scaffolded but not implemented yet",
    ))
}
