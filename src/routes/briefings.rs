use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

use crate::{
    error::AppError,
    ingest::{current_timestamp, generate_id, require_ingest_bearer},
    state::AppState,
};

#[derive(Debug, Deserialize)]
struct BriefingsQuery {
    limit: Option<u32>,
}

#[derive(Debug, Serialize)]
struct PlaceholderResponse {
    status: &'static str,
    message: &'static str,
}

#[derive(Debug, Deserialize)]
struct BriefingIngestRequest {
    briefing_date: String,
    display_date: String,
    analysis: BriefingAnalysisInput,
    #[serde(default)]
    sections: Vec<BriefingSectionInput>,
}

#[derive(Debug, Deserialize)]
struct BriefingAnalysisInput {
    trend: String,
    competition: String,
    demand: String,
}

#[derive(Debug, Deserialize)]
struct BriefingSectionInput {
    title: String,
    emoji: String,
    #[serde(default)]
    items: Vec<BriefingSectionItemInput>,
}

#[derive(Debug, Deserialize)]
struct BriefingSectionItemInput {
    rank: i64,
    title: String,
    company: String,
    display_date: String,
    summary: String,
    source_name: String,
    source_url: Option<String>,
    rating: i64,
    category_label: String,
}

#[derive(Debug, Serialize)]
struct BriefingIngestResponse {
    briefing_id: String,
    briefing_date: String,
    replaced_existing: bool,
    section_count: usize,
    item_count: usize,
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
    headers: HeaderMap,
    Json(payload): Json<BriefingIngestRequest>,
) -> Result<Json<BriefingIngestResponse>, AppError> {
    require_ingest_bearer(&state, &headers)?;
    validate_briefing_request(&payload)?;

    let mut tx = state.db().begin().await.map_err(|error| {
        AppError::internal(format!("failed to start briefing transaction: {error}"))
    })?;

    let existing_briefing_id =
        sqlx::query_scalar::<_, String>("SELECT id FROM briefings WHERE briefing_date = ?")
            .bind(payload.briefing_date.trim())
            .fetch_optional(&mut *tx)
            .await
            .map_err(|error| {
                AppError::internal(format!("failed to look up briefing by date: {error}"))
            })?;

    let briefing_id = existing_briefing_id
        .clone()
        .unwrap_or_else(|| generate_id("briefing"));
    let created_at = current_timestamp();

    if existing_briefing_id.is_some() {
        sqlx::query(
            r#"
            UPDATE briefings
            SET display_date = ?, analysis_trend = ?, analysis_competition = ?,
                analysis_demand = ?, created_at = ?
            WHERE id = ?
            "#,
        )
        .bind(payload.display_date.trim())
        .bind(payload.analysis.trend.trim())
        .bind(payload.analysis.competition.trim())
        .bind(payload.analysis.demand.trim())
        .bind(&created_at)
        .bind(&briefing_id)
        .execute(&mut *tx)
        .await
        .map_err(|error| AppError::internal(format!("failed to update briefing: {error}")))?;
    } else {
        sqlx::query(
            r#"
            INSERT INTO briefings (
                id, briefing_date, display_date, analysis_trend,
                analysis_competition, analysis_demand, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&briefing_id)
        .bind(payload.briefing_date.trim())
        .bind(payload.display_date.trim())
        .bind(payload.analysis.trend.trim())
        .bind(payload.analysis.competition.trim())
        .bind(payload.analysis.demand.trim())
        .bind(&created_at)
        .execute(&mut *tx)
        .await
        .map_err(|error| AppError::internal(format!("failed to insert briefing: {error}")))?;
    }

    sqlx::query("DELETE FROM briefing_sections WHERE briefing_id = ?")
        .bind(&briefing_id)
        .execute(&mut *tx)
        .await
        .map_err(|error| {
            AppError::internal(format!("failed to clear briefing sections: {error}"))
        })?;

    let mut item_count = 0usize;
    for (section_index, section) in payload.sections.iter().enumerate() {
        let section_id = generate_id("briefing_section");
        sqlx::query(
            "INSERT INTO briefing_sections (id, briefing_id, title, emoji, sort_order) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&section_id)
        .bind(&briefing_id)
        .bind(section.title.trim())
        .bind(section.emoji.trim())
        .bind(section_index as i64)
        .execute(&mut *tx)
        .await
        .map_err(|error| AppError::internal(format!("failed to insert briefing section: {error}")))?;

        for item in &section.items {
            let item_id = generate_id("briefing_item");
            sqlx::query(
                r#"
                INSERT INTO briefing_section_items (
                    id, section_id, rank, title, company, display_date, summary,
                    source_name, source_url, rating, category_label
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(item_id)
            .bind(&section_id)
            .bind(item.rank)
            .bind(item.title.trim())
            .bind(item.company.trim())
            .bind(item.display_date.trim())
            .bind(item.summary.trim())
            .bind(item.source_name.trim())
            .bind(optional_trimmed(item.source_url.as_deref()).map(str::to_owned))
            .bind(item.rating)
            .bind(item.category_label.trim())
            .execute(&mut *tx)
            .await
            .map_err(|error| {
                AppError::internal(format!("failed to insert briefing item: {error}"))
            })?;
            item_count += 1;
        }
    }

    tx.commit().await.map_err(|error| {
        AppError::internal(format!("failed to commit briefing transaction: {error}"))
    })?;

    Ok(Json(BriefingIngestResponse {
        briefing_id,
        briefing_date: payload.briefing_date,
        replaced_existing: existing_briefing_id.is_some(),
        section_count: payload.sections.len(),
        item_count,
    }))
}

fn validate_briefing_request(payload: &BriefingIngestRequest) -> Result<(), AppError> {
    require_non_empty("briefing_date", &payload.briefing_date)?;
    require_non_empty("display_date", &payload.display_date)?;
    require_non_empty("analysis.trend", &payload.analysis.trend)?;
    require_non_empty("analysis.competition", &payload.analysis.competition)?;
    require_non_empty("analysis.demand", &payload.analysis.demand)?;

    for section in &payload.sections {
        require_non_empty("section.title", &section.title)?;
        require_non_empty("section.emoji", &section.emoji)?;

        let mut seen_ranks = BTreeSet::new();
        for item in &section.items {
            require_non_empty("section.item.title", &item.title)?;
            require_non_empty("section.item.company", &item.company)?;
            require_non_empty("section.item.display_date", &item.display_date)?;
            require_non_empty("section.item.summary", &item.summary)?;
            require_non_empty("section.item.source_name", &item.source_name)?;
            require_non_empty("section.item.category_label", &item.category_label)?;

            if item.rank < 1 {
                return Err(AppError::bad_request(
                    "briefing section item rank must be >= 1",
                ));
            }
            if !(1..=5).contains(&item.rating) {
                return Err(AppError::bad_request(
                    "briefing section item rating must be between 1 and 5",
                ));
            }
            if !seen_ranks.insert(item.rank) {
                return Err(AppError::bad_request(
                    "briefing section item ranks must be unique within a section",
                ));
            }
        }
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
