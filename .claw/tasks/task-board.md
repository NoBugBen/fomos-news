# Task Board

## Todo
- Record or receive any additional upstream OpenClaw handoff details for separate briefing ingest if that external workflow changes
- Align deployed `SESSION_COOKIE_NAME` with extracted frontend constant before wiring frontend auth/session flows
- Review whether to trim the current frontend production bundle size or explicitly defer chunk-splitting optimization to a later phase
- Replace bootstrap OAuth callback behavior with real provider-backed identity verification once approved provider details exist

## Doing
- None

## Done
- Project directory confirmed
- Archive filenames confirmed
- Governance initialization
- Archive inspection completed
- Archives extracted into controlled project folders
- Frontend stack identified
- Current data-source pattern identified
- Existing API-related placeholders noted
- Exact frontend integration points verified from source
- v1 backend design documented
- Backend stack ADR finalized for Rust + SQLite v1
- Rust backend scaffolded in repo root with config/state/router bootstrap
- SQLite schema and migrations implemented for the confirmed v1 backend design
- Authenticated ingest API implemented for news and briefings
- Public read APIs implemented for `/api/news`, `/api/news/:id`, `/api/briefings/latest`, `/api/briefings`, and `/api/briefings/:date`
- Subscribe API implemented for `POST /api/subscribe` with normalized email persistence and idempotent active-subscription behavior
- Browser-session auth endpoints implemented against SQLite `admin_sessions` with cookie-backed session read, logout, and OAuth callback bootstrap
- Documented the current limitation that OAuth callback session creation is a local bootstrap path until real upstream identity verification is wired
- Frontend integration readiness audited against the implemented Rust backend, with exact gaps and smallest adaptation paths recorded in handoff docs
- Extracted frontend wired to backend for homepage news, homepage latest briefing preview, briefing page latest briefing view, and subscribe modal submission
- Markets, leaderboard, and ecosystem left untouched and still backed by static/mock data
- Local/dev routing path chosen and implemented via Vite `/api` proxy to the Rust backend
- Same-origin deployment/runbook added using Rust as the single origin with optional SPA static serving from `FRONTEND_DIST_DIR`
- Backend and frontend env examples updated for the supported combined run path
- Backend validation completed with `cargo fmt --all` and `cargo check --offline`
- Frontend validation completed with `corepack pnpm install --frozen-lockfile`, `corepack pnpm check`, and `corepack pnpm build`
- Delivery/handoff docs updated to reflect the validated state, current deliverable scope, and deferred work
