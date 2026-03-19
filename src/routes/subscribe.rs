use axum::{extract::State, routing::post, Json, Router};
use serde::Serialize;

use crate::{error::AppError, state::AppState};

#[derive(Debug, Serialize)]
struct PlaceholderResponse {
    status: &'static str,
    message: &'static str,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/subscribe", post(subscribe))
}

async fn subscribe(
    State(state): State<AppState>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();

    Err(AppError::not_implemented(
        "Subscription API is scaffolded but not implemented yet",
    ))
}
