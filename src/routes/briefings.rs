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
struct BriefingsQuery {
    limit: Option<u32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BriefingResponse {
    id: String,
    briefing_date: String,
    date: String,
    analysis: BriefingAnalysisResponse,
    sections: Vec<BriefingSectionResponse>,
}

#[derive(Debug, Serialize)]
struct BriefingAnalysisResponse {
    trend: String,
    competition: String,
    demand: String,
}

#[derive(Debug, Serialize)]
struct BriefingSectionResponse {
    title: String,
    emoji: String,
    items: Vec<BriefingSectionItemResponse>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BriefingSectionItemResponse {
    id: String,
    rank: i64,
    title: String,
    company: String,
    date: String,
    summary: String,
    source: String,
    source_url: Option<String>,
    stars: i64,
    category: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BriefingArchiveResponse {
    items: Vec<BriefingArchiveItem>,
    limit: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BriefingArchiveItem {
    id: String,
    briefing_date: String,
    date: String,
    created_at: String,
    section_count: i64,
    item_count: i64,
    analysis: BriefingAnalysisResponse,
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
) -> Result<Json<BriefingResponse>, AppError> {
    let briefing_id = sqlx::query_scalar::<_, String>(
        "SELECT id FROM briefings ORDER BY briefing_date DESC, id DESC LIMIT 1",
    )
    .fetch_optional(state.db())
    .await
    .map_err(|error| AppError::internal(format!("failed to load latest briefing: {error}")))?
    .ok_or_else(|| AppError::not_found("no briefing found"))?;

    let briefing = load_briefing_response(&state, &briefing_id).await?;
    Ok(Json(briefing))
}

async fn list_briefings(
    State(state): State<AppState>,
    Query(query): Query<BriefingsQuery>,
) -> Result<Json<BriefingArchiveResponse>, AppError> {
    let limit = normalize_briefings_limit(query.limit)?;

    let rows = sqlx::query(
        r#"
        SELECT
            b.id,
            b.briefing_date,
            b.display_date,
            b.created_at,
            b.analysis_trend,
            b.analysis_competition,
            b.analysis_demand,
            COUNT(DISTINCT s.id) AS section_count,
            COUNT(i.id) AS item_count
        FROM briefings b
        LEFT JOIN briefing_sections s ON s.briefing_id = b.id
        LEFT JOIN briefing_section_items i ON i.section_id = s.id
        GROUP BY
            b.id,
            b.briefing_date,
            b.display_date,
            b.created_at,
            b.analysis_trend,
            b.analysis_competition,
            b.analysis_demand
        ORDER BY b.briefing_date DESC, b.id DESC
        LIMIT ?
        "#,
    )
    .bind(limit as i64)
    .fetch_all(state.db())
    .await
    .map_err(|error| AppError::internal(format!("failed to list briefings: {error}")))?;

    let items = rows
        .into_iter()
        .map(|row| BriefingArchiveItem {
            id: row.get("id"),
            briefing_date: row.get("briefing_date"),
            date: row.get("display_date"),
            created_at: row.get("created_at"),
            section_count: row.get("section_count"),
            item_count: row.get("item_count"),
            analysis: BriefingAnalysisResponse {
                trend: row.get("analysis_trend"),
                competition: row.get("analysis_competition"),
                demand: row.get("analysis_demand"),
            },
        })
        .collect();

    Ok(Json(BriefingArchiveResponse { items, limit }))
}

async fn get_briefing_by_date(
    State(state): State<AppState>,
    Path(date): Path<String>,
) -> Result<Json<BriefingResponse>, AppError> {
    let briefing_id =
        sqlx::query_scalar::<_, String>("SELECT id FROM briefings WHERE briefing_date = ? LIMIT 1")
            .bind(date.trim())
            .fetch_optional(state.db())
            .await
            .map_err(|error| {
                AppError::internal(format!("failed to load briefing by date: {error}"))
            })?
            .ok_or_else(|| {
                AppError::not_found(format!("briefing not found for date: {}", date.trim()))
            })?;

    let briefing = load_briefing_response(&state, &briefing_id).await?;
    Ok(Json(briefing))
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

fn normalize_briefings_limit(limit: Option<u32>) -> Result<u32, AppError> {
    const DEFAULT_LIMIT: u32 = 30;
    const MAX_LIMIT: u32 = 90;

    match limit.unwrap_or(DEFAULT_LIMIT) {
        0 => Err(AppError::bad_request("limit must be greater than 0")),
        value if value > MAX_LIMIT => Ok(MAX_LIMIT),
        value => Ok(value),
    }
}

async fn load_briefing_response(
    state: &AppState,
    briefing_id: &str,
) -> Result<BriefingResponse, AppError> {
    let briefing = sqlx::query(
        r#"
        SELECT
            id,
            briefing_date,
            display_date,
            analysis_trend,
            analysis_competition,
            analysis_demand
        FROM briefings
        WHERE id = ?
        LIMIT 1
        "#,
    )
    .bind(briefing_id)
    .fetch_optional(state.db())
    .await
    .map_err(|error| AppError::internal(format!("failed to load briefing record: {error}")))?
    .ok_or_else(|| AppError::not_found(format!("briefing not found: {briefing_id}")))?;

    let section_rows = sqlx::query(
        r#"
        SELECT id, title, emoji
        FROM briefing_sections
        WHERE briefing_id = ?
        ORDER BY sort_order ASC
        "#,
    )
    .bind(briefing_id)
    .fetch_all(state.db())
    .await
    .map_err(|error| AppError::internal(format!("failed to load briefing sections: {error}")))?;

    let mut sections = Vec::with_capacity(section_rows.len());
    for section_row in section_rows {
        let section_id: String = section_row.get("id");
        let item_rows = sqlx::query(
            r#"
            SELECT
                id,
                rank,
                title,
                company,
                display_date,
                summary,
                source_name,
                source_url,
                rating,
                category_label
            FROM briefing_section_items
            WHERE section_id = ?
            ORDER BY rank ASC, id ASC
            "#,
        )
        .bind(&section_id)
        .fetch_all(state.db())
        .await
        .map_err(|error| AppError::internal(format!("failed to load briefing items: {error}")))?;

        let items = item_rows
            .into_iter()
            .map(|row| BriefingSectionItemResponse {
                id: row.get("id"),
                rank: row.get("rank"),
                title: row.get("title"),
                company: row.get("company"),
                date: row.get("display_date"),
                summary: row.get("summary"),
                source: row.get("source_name"),
                source_url: row.get("source_url"),
                stars: row.get("rating"),
                category: row.get("category_label"),
            })
            .collect();

        sections.push(BriefingSectionResponse {
            title: section_row.get("title"),
            emoji: section_row.get("emoji"),
            items,
        });
    }

    Ok(BriefingResponse {
        id: briefing.get("id"),
        briefing_date: briefing.get("briefing_date"),
        date: briefing.get("display_date"),
        analysis: BriefingAnalysisResponse {
            trend: briefing.get("analysis_trend"),
            competition: briefing.get("analysis_competition"),
            demand: briefing.get("analysis_demand"),
        },
        sections,
    })
}
