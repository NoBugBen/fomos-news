use axum::Router;
use tower_http::trace::TraceLayer;

use crate::{routes, state::AppState};

pub fn build_app(state: AppState) -> Router {
    Router::new()
        .nest("/api", routes::api_router())
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
