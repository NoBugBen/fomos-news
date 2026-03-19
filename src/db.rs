use std::str::FromStr;

use anyhow::{Context, Result};
use sqlx::{
    migrate::Migrator,
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    SqlitePool,
};

use crate::config::AppConfig;

static MIGRATOR: Migrator = sqlx::migrate!("./migrations");

pub async fn create_sqlite_pool(config: &AppConfig) -> Result<SqlitePool> {
    if let Some(parent) = sqlite_parent_dir(&config.database_url) {
        std::fs::create_dir_all(parent).with_context(|| {
            format!(
                "failed to create SQLite data directory: {}",
                parent.display()
            )
        })?;
    }

    let connect_options = SqliteConnectOptions::from_str(&config.database_url)
        .with_context(|| {
            format!(
                "invalid SQLite connection string configured in DATABASE_URL: {}",
                config.database_url
            )
        })?
        .create_if_missing(true)
        .foreign_keys(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await
        .with_context(|| {
            format!(
                "failed to connect to SQLite database configured in DATABASE_URL: {}",
                config.database_url
            )
        })?;

    MIGRATOR
        .run(&pool)
        .await
        .context("failed to run SQLite migrations")?;

    Ok(pool)
}

fn sqlite_parent_dir(database_url: &str) -> Option<&std::path::Path> {
    let raw_path = database_url
        .strip_prefix("sqlite://")
        .or_else(|| database_url.strip_prefix("sqlite:"))?;
    let path = std::path::Path::new(raw_path);
    path.parent()
        .filter(|parent| !parent.as_os_str().is_empty())
}
