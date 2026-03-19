mod app;
mod config;
mod db;
mod error;
mod ingest;
mod routes;
mod state;

use std::net::SocketAddr;

use anyhow::Context;
use tokio::net::TcpListener;
use tracing::info;

use crate::{app::build_app, config::AppConfig, db::create_sqlite_pool, state::AppState};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    init_tracing();

    let config = AppConfig::from_env().context("failed to load application config")?;
    let db = create_sqlite_pool(&config)
        .await
        .context("failed to create SQLite pool")?;
    let state = AppState::new(config, db);
    let app = build_app(state.clone());

    let address: SocketAddr = state.config().socket_addr();
    let listener = TcpListener::bind(address)
        .await
        .with_context(|| format!("failed to bind HTTP listener on {address}"))?;

    info!(%address, "starting fomos-news-api");
    if let Some(frontend_dist_dir) = &state.config().frontend_dist_dir {
        info!(
            frontend_dist_dir,
            "serving frontend static assets from configured dist directory"
        );
    }

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("HTTP server terminated unexpectedly")?;

    Ok(())
}

fn init_tracing() {
    let filter = std::env::var("RUST_LOG")
        .unwrap_or_else(|_| "fomos_news_api=debug,tower_http=info,axum=info".to_string());

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(false)
        .compact()
        .init();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        let _ = tokio::signal::ctrl_c().await;
    };

    #[cfg(unix)]
    let terminate = async {
        use tokio::signal::unix::{signal, SignalKind};

        if let Ok(mut signal) = signal(SignalKind::terminate()) {
            signal.recv().await;
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    info!("shutdown signal received");
}
