use sqlx::SqlitePool;

use crate::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    config: AppConfig,
    db: SqlitePool,
}

impl AppState {
    pub fn new(config: AppConfig, db: SqlitePool) -> Self {
        Self { config, db }
    }

    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    pub fn db(&self) -> &SqlitePool {
        &self.db
    }
}
