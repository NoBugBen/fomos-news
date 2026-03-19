use std::{
    sync::atomic::{AtomicU64, Ordering},
    time::{SystemTime, UNIX_EPOCH},
};

use axum::http::{header::AUTHORIZATION, HeaderMap};

use crate::{error::AppError, state::AppState};

static ID_COUNTER: AtomicU64 = AtomicU64::new(1);

pub fn require_ingest_bearer(state: &AppState, headers: &HeaderMap) -> Result<(), AppError> {
    let expected = state
        .config()
        .ingest_bearer_token
        .as_deref()
        .ok_or_else(|| {
            AppError::service_unavailable("INGEST_BEARER_TOKEN is not configured for ingest APIs")
        })?;

    let header_value = headers
        .get(AUTHORIZATION)
        .ok_or_else(|| AppError::unauthorized("missing Authorization header"))?;

    let authorization = header_value
        .to_str()
        .map_err(|_| AppError::unauthorized("invalid Authorization header encoding"))?;

    let provided = authorization
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::unauthorized("Authorization header must use Bearer token auth"))?;

    if provided != expected {
        return Err(AppError::unauthorized("invalid ingest bearer token"));
    }

    Ok(())
}

pub fn generate_id(prefix: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let counter = ID_COUNTER.fetch_add(1, Ordering::Relaxed);

    format!("{prefix}_{nanos:x}{counter:x}")
}

pub fn current_timestamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        .to_string()
}
