# Task Board

## Todo
- Record upstream OpenClaw handoff details for separate briefing ingest
- Approve or revise the proposed v1 API contract
- Approve or revise the proposed auth approach
- Approve or revise the proposed dedupe strategy
- Connect frontend to backend
- Add deployment files and runbook

## Doing
- Browser-session auth implementation

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
