use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::collections::BTreeSet;

use crate::{
    error::AppError,
    ingest::{current_timestamp, generate_id, require_ingest_bearer},
    state::AppState,
};

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

#[derive(Debug, Deserialize)]
struct NewsIngestRequest {
    items: Vec<NewsIngestItem>,
}

#[derive(Debug, Deserialize)]
struct NewsIngestItem {
    external_id: Option<String>,
    title: String,
    summary: String,
    content_markdown: String,
    category: String,
    source_name: String,
    source_url: String,
    published_at: String,
    rating: i64,
    #[serde(default)]
    is_hot: bool,
    dedupe_key: String,
    content_hash: String,
    language: Option<String>,
    author: Option<String>,
    #[serde(default)]
    tags: Vec<String>,
}

#[derive(Debug, Serialize)]
struct NewsIngestResponse {
    inserted_count: usize,
    duplicate_count: usize,
    duplicates: Vec<NewsDuplicateRecord>,
}

#[derive(Debug, Serialize)]
struct NewsDuplicateRecord {
    dedupe_key: String,
    content_hash: String,
    matched_on: &'static str,
    existing_news_id: String,
    existing_dedupe_key: String,
    existing_content_hash: String,
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
    headers: HeaderMap,
    Json(payload): Json<NewsIngestRequest>,
) -> Result<Json<NewsIngestResponse>, AppError> {
    require_ingest_bearer(&state, &headers)?;

    if payload.items.is_empty() {
        return Err(AppError::bad_request(
            "news ingest request must include at least one item",
        ));
    }

    let mut tx = state.db().begin().await.map_err(|error| {
        AppError::internal(format!("failed to start ingest transaction: {error}"))
    })?;

    let mut inserted_count = 0usize;
    let mut duplicates = Vec::new();

    for item in payload.items {
        validate_news_item(&item)?;

        if let Some(row) =
            sqlx::query("SELECT id, dedupe_key, content_hash FROM news_items WHERE dedupe_key = ?")
                .bind(&item.dedupe_key)
                .fetch_optional(&mut *tx)
                .await
                .map_err(|error| {
                    AppError::internal(format!("failed to check news dedupe_key: {error}"))
                })?
        {
            duplicates.push(NewsDuplicateRecord {
                dedupe_key: item.dedupe_key,
                content_hash: item.content_hash,
                matched_on: "dedupe_key",
                existing_news_id: row.get("id"),
                existing_dedupe_key: row.get("dedupe_key"),
                existing_content_hash: row.get("content_hash"),
            });
            continue;
        }

        if let Some(row) = sqlx::query(
            "SELECT id, dedupe_key, content_hash FROM news_items WHERE content_hash = ? LIMIT 1",
        )
        .bind(&item.content_hash)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|error| {
            AppError::internal(format!("failed to check news content_hash: {error}"))
        })? {
            duplicates.push(NewsDuplicateRecord {
                dedupe_key: item.dedupe_key,
                content_hash: item.content_hash,
                matched_on: "content_hash",
                existing_news_id: row.get("id"),
                existing_dedupe_key: row.get("dedupe_key"),
                existing_content_hash: row.get("content_hash"),
            });
            continue;
        }

        let news_id = generate_id("news");
        let ingested_at = current_timestamp();
        let language = optional_trimmed(item.language.as_deref()).unwrap_or("zh-CN");
        let author = optional_trimmed(item.author.as_deref()).map(str::to_owned);

        sqlx::query(
            r#"
            INSERT INTO news_items (
                id, external_id, title, summary, content_markdown, category,
                source_name, source_url, published_at, ingested_at, rating, is_hot,
                dedupe_key, content_hash, language, author
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&news_id)
        .bind(optional_trimmed(item.external_id.as_deref()).map(str::to_owned))
        .bind(item.title.trim())
        .bind(item.summary.trim())
        .bind(item.content_markdown.trim())
        .bind(item.category.trim())
        .bind(item.source_name.trim())
        .bind(item.source_url.trim())
        .bind(item.published_at.trim())
        .bind(ingested_at)
        .bind(item.rating)
        .bind(item.is_hot)
        .bind(item.dedupe_key.trim())
        .bind(item.content_hash.trim())
        .bind(language)
        .bind(author)
        .execute(&mut *tx)
        .await
        .map_err(|error| AppError::internal(format!("failed to insert news item: {error}")))?;

        let normalized_tags = normalize_tags(item.tags);
        for tag in normalized_tags {
            sqlx::query("INSERT INTO news_tags (news_id, tag) VALUES (?, ?)")
                .bind(&news_id)
                .bind(tag)
                .execute(&mut *tx)
                .await
                .map_err(|error| {
                    AppError::internal(format!("failed to insert news tag: {error}"))
                })?;
        }

        inserted_count += 1;
    }

    tx.commit().await.map_err(|error| {
        AppError::internal(format!("failed to commit news ingest transaction: {error}"))
    })?;

    Ok(Json(NewsIngestResponse {
        inserted_count,
        duplicate_count: duplicates.len(),
        duplicates,
    }))
}

fn validate_news_item(item: &NewsIngestItem) -> Result<(), AppError> {
    require_non_empty("title", &item.title)?;
    require_non_empty("summary", &item.summary)?;
    require_non_empty("content_markdown", &item.content_markdown)?;
    require_non_empty("category", &item.category)?;
    require_non_empty("source_name", &item.source_name)?;
    require_non_empty("source_url", &item.source_url)?;
    require_non_empty("published_at", &item.published_at)?;
    require_non_empty("dedupe_key", &item.dedupe_key)?;
    require_non_empty("content_hash", &item.content_hash)?;

    if !(1..=5).contains(&item.rating) {
        return Err(AppError::bad_request(
            "rating must be between 1 and 5 for each news item",
        ));
    }

    Ok(())
}

fn require_non_empty(field: &str, value: &str) -> Result<(), AppError> {
    if value.trim().is_empty() {
        return Err(AppError::bad_request(format!("{field} must not be empty")));
    }

    Ok(())
}

fn optional_trimmed(value: Option<&str>) -> Option<&str> {
    value.and_then(|value| {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    })
}

fn normalize_tags(tags: Vec<String>) -> Vec<String> {
    let mut deduped = BTreeSet::new();
    for tag in tags {
        let trimmed = tag.trim();
        if !trimmed.is_empty() {
            deduped.insert(trimmed.to_string());
        }
    }

    deduped.into_iter().collect()
}
