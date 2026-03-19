# Fomos News Delivery README

This repository contains the delivery-ready v1 implementation for the currently approved Fomos News scope:

- Rust + SQLite backend in the repo root
- Extracted Vite + React frontend under `extracted/repo/fomos-news`
- Documented local/dev and same-origin deployment paths without extra invented infrastructure

## Deliverable now

- `GET /api/healthz`
- `GET /api/news`
- `GET /api/news/:id`
- `GET /api/briefings/latest`
- `GET /api/briefings`
- `GET /api/briefings/:date`
- `POST /api/subscribe`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/oauth/callback` as a bootstrap-only callback path, not full provider-backed OAuth
- Frontend wiring for homepage news, homepage briefing preview, briefing page latest briefing, and subscribe submission

## Run paths

Use [docs/routing-and-runbook.md](/root/.openclaw/workspace/Work/fomos-news/docs/routing-and-runbook.md) for the supported run modes:

- Local development: Vite on `:5173` proxying `/api` to Rust on `:3000`
- Same-origin deployment: Rust serves `/api` and the built SPA from `FRONTEND_DIST_DIR`

Backend env starts from [`.env.example`](/root/.openclaw/workspace/Work/fomos-news/.env.example). The extracted frontend has its own `.env.example` in `extracted/repo/fomos-news`.

## Handoff docs

- Delivery notes: [.claw/handoff/delivery-notes.md](/root/.openclaw/workspace/Work/fomos-news/.claw/handoff/delivery-notes.md)
- Progress log: [.claw/worklog/progress.md](/root/.openclaw/workspace/Work/fomos-news/.claw/worklog/progress.md)
- Task board: [.claw/tasks/task-board.md](/root/.openclaw/workspace/Work/fomos-news/.claw/tasks/task-board.md)

## Deferred items

- Real OAuth provider verification and provider-specific setup
- Frontend auth/session UI wiring
- Cookie-name alignment for auth flows: set `SESSION_COOKIE_NAME=app_session_id` when that work starts
- Markets, leaderboard, and ecosystem backend integration
- Bundle-size optimization beyond the current successful build
