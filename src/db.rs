use anyhow::{Context, Result};
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

use crate::config::AppConfig;

pub fn create_sqlite_pool(config: &AppConfig) -> Result<SqlitePool> {
    if let Some(parent) = sqlite_parent_dir(&config.database_url) {
        std::fs::create_dir_all(parent).with_context(|| {
            format!("failed to create SQLite data directory: {}", parent.display())
        })?;
    }

    SqlitePoolOptions::new()
        .max_connections(5)
        .connect_lazy(&config.database_url)
        .with_context(|| {
            format!(
                "invalid SQLite connection string configured in DATABASE_URL: {}",
                config.database_url
            )
        })
}

fn sqlite_parent_dir(database_url: &str) -> Option<&std::path::Path> {
    let raw_path = database_url
        .strip_prefix("sqlite://")
        .or_else(|| database_url.strip_prefix("sqlite:"))?;
    let path = std::path::Path::new(raw_path);
    path.parent().filter(|parent| !parent.as_os_str().is_empty())
}
