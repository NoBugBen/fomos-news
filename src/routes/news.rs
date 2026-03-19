use axum::{
    extract::{Path, Query, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, state::AppState};

#[derive(Debug, Deserialize)]
struct NewsListQuery {
    category: Option<String>,
    limit: Option<u32>,
    cursor: Option<String>,
    hot_only: Option<bool>,
}

#[derive(Debug, Serialize)]
struct PlaceholderResponse {
    status: &'static str,
    message: &'static str,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/news", get(list_news))
        .route("/news/{id}", get(get_news))
        .route("/ingest/news", post(ingest_news))
}

async fn list_news(
    State(state): State<AppState>,
    Query(query): Query<NewsListQuery>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();
    let _ = (query.category, query.limit, query.cursor, query.hot_only);

    Err(AppError::not_implemented(
        "News listing is scaffolded but not implemented yet",
    ))
}

async fn get_news(
    State(state): State<AppState>,
    Path(news_id): Path<String>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();
    let _ = news_id;

    Err(AppError::not_implemented(
        "News detail is scaffolded but not implemented yet",
    ))
}

async fn ingest_news(
    State(state): State<AppState>,
) -> Result<Json<PlaceholderResponse>, AppError> {
    let _ = state.db();

    Err(AppError::not_implemented(
        "News ingest is scaffolded but not implemented yet",
    ))
}
