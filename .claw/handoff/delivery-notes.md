# Delivery Notes

This folder tracks delivery artifacts for the Fomos News project.

## Current status
Rust backend APIs for health, news, briefings, subscribe, and auth/session are implemented. The extracted frontend is now minimally wired for homepage news, homepage latest briefing preview, briefing page latest briefing view, and subscribe submission. Markets, leaderboard, and ecosystem remain intentionally static and unwired.

## Frontend wiring delivered (2026-03-19)
- `GET /api/news` now feeds the extracted homepage news grid and hot-news sidebar through a small adapter in `extracted/repo/fomos-news/client/src/lib/api.ts`.
- `GET /api/briefings/latest` now feeds both the homepage briefing preview and the briefing page.
- `POST /api/subscribe` now backs the subscribe modal, including error display via toast and idempotent messaging for already-subscribed emails.
- Briefing item source links now use backend `sourceUrl` when present and render plain source text when absent.
- Loading, empty, and failure states were added in-place with minimal UI changes.
- No frontend wiring was added for markets, leaderboard, ecosystem, or auth/session flows.

## Remaining integration notes
- The repo now supports two documented, evidence-based routing modes in `docs/routing-and-runbook.md`: Vite dev on `:5173` proxying `/api` to the Rust backend on `:3000`, and same-origin deployment where the Rust backend serves the built SPA from `extracted/repo/fomos-news/dist/public`.
- The Rust backend static serving path is intentionally minimal and env-driven through `FRONTEND_DIST_DIR`. If that directory is absent, backend behavior remains API-only and unmatched non-`/api` routes still return `404`.
- Cookie-name alignment is still a later auth task. The extracted frontend shared constant remains `app_session_id`, while backend default env remains `fomos_news_session`; `.env.example` now notes that `SESSION_COOKIE_NAME` should be set to `app_session_id` before frontend auth/session wiring begins.
- Real upstream OAuth identity verification is still not implemented. The backend callback remains a local bootstrap path after `code` and `state` validation.

## Routing and deployment support delivered (2026-03-19)
- Added frontend dev proxy support in `extracted/repo/fomos-news/vite.config.ts` so local browser requests to `/api` forward to `VITE_BACKEND_ORIGIN` instead of requiring a separate external proxy.
- Moved the extracted frontend dev server default back to `:5173`, which matches the backend `FRONTEND_BASE_URL` default and avoids the previous port collision with the Rust backend default `APP_PORT=3000`.
- Added optional backend SPA static serving for non-`/api` routes when `FRONTEND_DIST_DIR` points to a built frontend directory.
- Added `extracted/repo/fomos-news/.env.example` for frontend-local env placeholders without inventing real OAuth or map-provider values.
- Added `docs/routing-and-runbook.md` with the supported local/dev flow, same-origin deployment flow, and explicit non-goals.
- Validation completed on the Rust side with `cargo fmt --all` and `cargo check --offline`.
- Frontend validation could not be run here because `pnpm` is not installed and `extracted/repo/fomos-news/node_modules` is absent in this sandbox.

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

## Frontend integration readiness audit (2026-03-19)

Scope audited:
- Extracted frontend touchpoints for homepage news and briefing preview: `extracted/repo/fomos-news/client/src/pages/Home.tsx`
- Extracted frontend touchpoints for briefing detail page: `extracted/repo/fomos-news/client/src/pages/BriefingPage.tsx`
- Extracted frontend touchpoint for newsletter subscribe flow: `extracted/repo/fomos-news/client/src/components/SubscribeModal.tsx`
- Extracted frontend auth/session-related touchpoints: `extracted/repo/fomos-news/client/src/const.ts`, `extracted/repo/fomos-news/client/src/components/ManusDialog.tsx`
- Implemented backend API handlers: `src/routes/news.rs`, `src/routes/briefings.rs`, `src/routes/subscribe.rs`, `src/routes/auth.rs`

Confirmed ready or mostly ready:
- News list response shape is already close to the homepage sample type. The frontend sample expects `id`, `title`, `summary`, `category`, `source`, `sourceUrl`, `date`, `stars`, `tags`, and `isHot`; the backend `GET /api/news` returns those names in camelCase after serde renaming, including `sourceUrl` and `isHot`.
- Briefing detail response shape is also close to the briefing page sample type. The frontend sample expects `date`, `analysis`, `sections[].title`, `sections[].emoji`, and `sections[].items[]` with `id`, `rank`, `title`, `company`, `date`, `summary`, `source`, `stars`, and `category`; the backend `GET /api/briefings/latest` already returns those fields in camelCase and only adds extra `id`, `briefingDate`, and optional `sourceUrl`.
- Public API routing prefix is aligned with the extracted frontend assumptions because the Rust app nests all handlers under `/api`.

Confirmed gaps:
- The homepage and briefing page are still fully sample-data driven, so there is no current fetch wiring to the backend yet. This is a readiness gap, not a backend contract bug.
- The homepage renders both the main news grid and the right-rail hot-news block from one local `newsItems` array. The backend can support this with either one `GET /api/news` call plus client-side hot filtering, or with an additional `GET /api/news?hot_only=true&limit=3` call for the sidebar. No backend change is required.
- The homepage briefing preview reads `dailyBriefing.sections[0].items.slice(0, 3)`. The backend `GET /api/briefings/latest` can satisfy this directly, but the frontend will need a small adapter because the preview currently assumes the first section always exists in local data.
- The briefing page currently renders the source link with `href="#"` even though the backend includes optional `sourceUrl`. Smallest path: frontend uses `item.sourceUrl ?? "#"`. No backend change needed.
- The subscribe modal does not call the backend yet; it only waits 1.2 seconds and marks success. The backend `POST /api/subscribe` is ready, but the frontend will need to branch on HTTP status `201` versus `200` and optionally use `alreadySubscribed` to tune the toast copy.
- The frontend shared cookie constant is `app_session_id`, while the backend default session cookie name is `fomos_news_session`. This will matter once frontend session/logout code is added or if any middleware starts reading cookie names client-side. Smallest path: set `SESSION_COOKIE_NAME=app_session_id` in backend env to match the extracted frontend constant instead of changing frontend code.
- The extracted frontend contains a login URL builder and login dialog, but no active session fetch or logout integration today. The backend does implement `GET /api/auth/session`, `POST /api/auth/logout`, and `GET /api/oauth/callback`, so the missing work is frontend wiring rather than missing endpoints.
- Auth remains intentionally incomplete at the upstream OAuth identity-verification layer. The current backend callback only validates `code` and `state`, then creates a local bootstrap session. This is acceptable for compile-safe scaffolding but should not be treated as production-ready OAuth.

Smallest adaptation paths:
- News: frontend-first change only. Replace `newsItems` with `GET /api/news`, keep the existing sample item shape as the client-side type, and map the JSON directly.
- Briefing: frontend-first change only. Replace `dailyBriefing` with `GET /api/briefings/latest`; accept backend extras and use `item.sourceUrl` when present.
- Subscribe: frontend-first change only. Replace the simulated delay with `POST /api/subscribe`, `{ email }`, and preserve current success UI with slightly different copy for `alreadySubscribed`.
- Session cookie naming: backend-first config change only. Use `SESSION_COOKIE_NAME=app_session_id` when frontend auth wiring starts.
- OAuth: do not invent provider-specific steps. Keep current callback contract documented as a temporary bootstrap path until the upstream identity-verification details are explicitly provided.
