# Fomos News Implementation Plan

## Goal
Build a Rust backend for the existing Fomos News frontend so another OpenClaw instance can ingest daily news via authenticated APIs, persist full news content, and expose read APIs for frontend display.

## Confirmed constraints
- Project path: `/root/.openclaw/workspace/Work/fomos-news`
- Design archive: `fomos-news-design-spec.zip`
- Source archive: `fomos-news-repo.zip`
- Frontend currently exists; backend does not
- News must be stored fully and persist historically
- Duplicate news not allowed; upstream OpenClaw is primary dedupe layer, backend adds basic filtering
- Auth required for write APIs
- SQLite accepted for v1
- Deployment files required

## Planned phases
- Phase -1: governance initialization
- Phase 0: inspect and unpack archives; assess frontend structure and API expectations
- Phase 1: design backend architecture, schema, APIs, auth, deployment
- Phase 2: scaffold Rust backend
- Phase 3: implement ingest and query APIs
- Phase 4: connect frontend to backend
- Phase 5: test, document, deploy

## Execution rules
- Evidence first; do not invent facts not found in files
- Confirm design before major implementation
- Keep resumable progress in `.claw/worklog/progress.md`
- Prefer phase-level commits to reduce recovery cost
