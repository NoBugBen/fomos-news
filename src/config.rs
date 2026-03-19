use std::{env, net::SocketAddr, path::Path};

use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub app_env: String,
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub session_cookie_name: String,
    pub session_secret: String,
    pub ingest_bearer_token: Option<String>,
    pub oauth_portal_url: Option<String>,
    pub frontend_base_url: String,
    pub frontend_dist_dir: Option<String>,
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Self {
            app_env: env::var("APP_ENV").unwrap_or_else(|_| "development".to_string()),
            host: env::var("APP_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: parse_u16_env("APP_PORT", 3000)?,
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://data/fomos-news.db".to_string()),
            session_cookie_name: env::var("SESSION_COOKIE_NAME")
                .unwrap_or_else(|_| "fomos_news_session".to_string()),
            session_secret: env::var("SESSION_SECRET").unwrap_or_else(|_| "change-me".to_string()),
            ingest_bearer_token: optional_env("INGEST_BEARER_TOKEN"),
            oauth_portal_url: optional_env("OAUTH_PORTAL_URL"),
            frontend_base_url: env::var("FRONTEND_BASE_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            frontend_dist_dir: optional_env("FRONTEND_DIST_DIR")
                .or_else(detect_default_frontend_dist_dir),
        })
    }

    pub fn socket_addr(&self) -> SocketAddr {
        SocketAddr::new(
            self.host
                .parse()
                .unwrap_or_else(|_| std::net::Ipv4Addr::UNSPECIFIED.into()),
            self.port,
        )
    }
}

fn parse_u16_env(key: &str, default: u16) -> Result<u16> {
    match env::var(key) {
        Ok(value) => value
            .parse::<u16>()
            .with_context(|| format!("invalid value for {key}: {value}")),
        Err(_) => Ok(default),
    }
}

fn optional_env(key: &str) -> Option<String> {
    env::var(key).ok().and_then(|value| {
        let trimmed = value.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    })
}

fn detect_default_frontend_dist_dir() -> Option<String> {
    let default_path = Path::new("extracted/repo/fomos-news/dist/public");
    default_path
        .is_dir()
        .then(|| default_path.display().to_string())
}
