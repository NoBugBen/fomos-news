pub mod auth;
pub mod briefings;
pub mod health;
pub mod news;
pub mod subscribe;

use axum::Router;

use crate::state::AppState;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .merge(health::router())
        .merge(auth::router())
        .merge(news::router())
        .merge(briefings::router())
        .merge(subscribe::router())
}
