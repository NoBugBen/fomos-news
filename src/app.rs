use std::{
    fs,
    path::{Component, Path, PathBuf},
};

use axum::{
    body::Body,
    extract::OriginalUri,
    http::{header::CONTENT_TYPE, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Router,
};
use tower_http::trace::TraceLayer;

use crate::{routes, state::AppState};

pub fn build_app(state: AppState) -> Router {
    let router = Router::new()
        .nest("/api", routes::api_router())
        .layer(TraceLayer::new_for_http())
        .with_state(state.clone());

    if let Some(frontend_dist_dir) = state.config().frontend_dist_dir.clone() {
        router.fallback(move |uri| serve_frontend_asset(frontend_dist_dir.clone(), uri))
    } else {
        router
    }
}

async fn serve_frontend_asset(frontend_dist_dir: String, uri: OriginalUri) -> Response {
    let root = PathBuf::from(frontend_dist_dir);
    let index_path = root.join("index.html");

    let requested_path = sanitized_frontend_path(&root, uri.path());
    let file_to_serve = requested_path
        .filter(|path| path.is_file())
        .unwrap_or(index_path);

    match fs::read(&file_to_serve) {
        Ok(bytes) => {
            let mut response = Response::new(Body::from(bytes));
            response.headers_mut().insert(
                CONTENT_TYPE,
                HeaderValue::from_static(content_type_for_path(&file_to_serve)),
            );
            response
        }
        Err(_) => StatusCode::NOT_FOUND.into_response(),
    }
}

fn sanitized_frontend_path(root: &Path, request_path: &str) -> Option<PathBuf> {
    let trimmed_path = request_path.trim_start_matches('/');
    if trimmed_path.is_empty() {
        return Some(root.join("index.html"));
    }

    let mut path = root.to_path_buf();
    for component in Path::new(trimmed_path).components() {
        match component {
            Component::Normal(segment) => path.push(segment),
            Component::CurDir => {}
            Component::ParentDir | Component::RootDir | Component::Prefix(_) => return None,
        }
    }

    Some(path)
}

fn content_type_for_path(path: &Path) -> &'static str {
    match path.extension().and_then(|ext| ext.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("js") => "application/javascript; charset=utf-8",
        Some("json") => "application/json; charset=utf-8",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("ico") => "image/x-icon",
        Some("woff") => "font/woff",
        Some("woff2") => "font/woff2",
        _ => "application/octet-stream",
    }
}
