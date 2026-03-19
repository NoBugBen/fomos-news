use axum::{
    extract::{Path, Query, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, state::AppState};

#[derive(Debug, Deserialize)]
struct BriefingsQuery {
    limit: Option<u32>,
}

#[derive(Debug, Serialize)]
struct PlaceholderResponse {
    status: &'static str,
    message: &'static str,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/briefings/latest", get(get_latest_briefing))
        .route("/briefings", get(list_briefings))
        .route("/briefings/{date}", get(get_briefing_by_date))
        .route("/ingest/briefings", post(ingest_briefing))
}

async fn get_latest_briefing(
    State(state): State<AppState>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();

    Err(AppError::not_implemented(
        "Latest briefing read is scaffolded but not implemented yet",
    ))
}

async fn list_briefings(
    State(state): State<AppState>,
    Query(query): Query<BriefingsQuery>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();
    let _ = query.limit;

    Err(AppError::not_implemented(
        "Briefing archive read is scaffolded but not implemented yet",
    ))
}

async fn get_briefing_by_date(
    State(state): State<AppState>,
    Path(date): Path<String>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();
    let _ = date;

    Err(AppError::not_implemented(
        "Briefing read by date is scaffolded but not implemented yet",
    ))
}

async fn ingest_briefing(
    State(state): State<AppState>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();

    Err(AppError::not_implemented(
        "Briefing ingest is scaffolded but not implemented yet",
    ))
}
