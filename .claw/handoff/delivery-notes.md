# Delivery Notes

This folder tracks delivery artifacts for the Fomos News project.

## Delivery-ready status (2026-03-19)
The repo is in a delivery-ready v1 state for the currently implemented scope:

- Rust backend APIs are implemented for health, news read, briefing read, newsletter subscribe, authenticated ingest, and bootstrap auth/session handling.
- The extracted frontend is minimally wired to the live backend for homepage news, homepage latest briefing preview, briefing page latest briefing view, and subscribe submission.
- Local development and same-origin deployment paths are documented and implemented without introducing unsupported reverse-proxy or provider-specific infrastructure.
- Backend and frontend validation already completed for the implemented integration path.

Not in current delivery scope:

- Real OAuth provider verification and provider-specific login configuration.
- Deployment infrastructure beyond the documented Rust single-origin run path.
- Backend wiring for markets, leaderboard, and ecosystem pages.

## Frontend wiring delivered (2026-03-19)
- `GET /api/news` now feeds the extracted homepage news grid and hot-news sidebar through a small adapter in `extracted/repo/fomos-news/client/src/lib/api.ts`.
- `GET /api/briefings/latest` now feeds both the homepage briefing preview and the briefing page.
- `POST /api/subscribe` now backs the subscribe modal, including error display via toast and idempotent messaging for already-subscribed emails.
- Briefing item source links now use backend `sourceUrl` when present and render plain source text when absent.
- Loading, empty, and failure states were added in-place with minimal UI changes.
- No frontend wiring was added for markets, leaderboard, ecosystem, or auth/session flows.

## Validated delivery evidence
- Rust validation completed with `cargo fmt --all` and `cargo check --offline`.
- Frontend validation completed in the current environment with `corepack pnpm install --frozen-lockfile`, `corepack pnpm check`, and `corepack pnpm build`.
- The frontend production build completes successfully.
- Known build-time warnings were limited to unresolved optional analytics placeholders in `index.html` and a large JavaScript chunk; these did not block the build.

## Deliverable now
- Backend service can ingest persisted news and briefing content into SQLite and serve the implemented public APIs.
- Frontend can display live homepage news, live latest briefing content, and real subscribe submissions against the Rust backend.
- Repo can be handed off with one supported local/dev path and one supported same-origin deployment path, both documented in `docs/routing-and-runbook.md`.
- Root repo handoff now has a concise `README.md` that points to setup, scope, and the routing/runbook doc.

## Deferred items and remaining risks
- Real upstream OAuth identity verification is still not implemented. `GET /api/oauth/callback` remains a controlled local bootstrap path after `code` and `state` validation and should not be represented as production OAuth.
- Cookie-name alignment is still deferred until frontend auth/session wiring begins. The extracted frontend constant remains `app_session_id`, while backend default env remains `fomos_news_session`.
- Markets, leaderboard, and ecosystem remain intentionally static/unwired and are outside current backend scope.
- The frontend production build warning about a large JS chunk remains a performance follow-up, not a current delivery blocker.
- Optional analytics and other provider-related frontend env placeholders remain unset unless real values are supplied later.

## Resume protocol
1. Read `.claw/plans/implementation-plan.md`
2. Read `.claw/worklog/progress.md`
3. Read `.claw/tasks/task-board.md`
4. Inspect latest git commits and working tree
5. Continue only the current phase's unfinished tasks

## Confirmed integration ownership
- Another OpenClaw instance is responsible for composing and writing daily briefing payloads.
- This project backend should store and serve briefing data, not generate briefing content automatically in v1.
- Integration docs and future implementation must preserve this separation.
