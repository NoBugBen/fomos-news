# API Design

## Document status
- Phase: backend design approved for scaffolding
- Implementation status: Rust backend scaffolded, business logic not implemented
- Intent: define a concrete Rust + SQLite v1 API based on confirmed frontend and project constraints

## Confirmed facts
- The extracted source is a Vite + React + TypeScript frontend.
- The existing `server/index.ts` is only a static-file Express server, not an application API.
- The frontend currently reads page data from `client/src/lib/sampleData.ts`.
- The README explicitly suggests replacing static data with `/api/news` and `/api/subscribe`.
- The stated project goal is to let another OpenClaw instance ingest daily news through authenticated APIs, persist full news content, and expose read APIs for frontend display.
- Auth is required for write APIs.
- SQLite is accepted for v1.
- Duplicate news is not allowed; upstream OpenClaw is the primary dedupe layer and the backend should still add basic filtering.
- `client/src/const.ts` constructs an OAuth redirect URL to `/api/oauth/callback`.

## Proposed v1 scope

### Included in v1
- Read API for news feed used by the homepage
- Read API for daily briefing page
- Write API for authenticated news ingestion
- Public newsletter subscription API
- Minimal auth/session endpoints required to support authenticated write access
- Health endpoint for deployment checks

### Deferred from v1
- Read APIs for markets, leaderboard, and ecosystem
- Historical briefing archive APIs beyond a simple list/read pattern
- Rich search, full-text filtering, and per-user personalization
- Admin UI

Reason for deferral:
- The extracted frontend pages for markets, leaderboard, and ecosystem still consume local mock data only.
- The current confirmed business requirement centers on news ingestion, persistence, and frontend display.

## Design principles
- Keep read APIs public unless a page already implies auth.
- Require auth for all mutating ingest/admin endpoints.
- Return frontend-shaped responses where that avoids transformation churn.
- Preserve enough source and content metadata to support auditability and future reprocessing.
- Make dedupe deterministic and explicit rather than best-effort only.

## Proposed auth design

### Confirmed input
- Write APIs must be authenticated.
- The frontend already references `/api/oauth/callback` when building a login redirect.

### Proposed v1 approach
- Browser/admin auth: cookie-backed session created after OAuth callback.
- Service-to-service ingest auth: static bearer token in `Authorization: Bearer <token>`.
- Read-only public endpoints: no auth.

### Proposed endpoints

#### `GET /api/auth/session`
Purpose:
- Let the frontend check whether an admin/editor session exists.

Response `200`
```json
{
  "authenticated": true,
  "user": {
    "id": "usr_123",
    "display_name": "Ops User",
    "role": "editor"
  }
}
```

Response `200` when signed out
```json
{
  "authenticated": false,
  "user": null
}
```

#### `GET /api/oauth/callback`
Purpose:
- Receive OAuth redirect, validate upstream identity, create session cookie, and redirect to frontend.

Query params:
- `code`: required
- `state`: required

Behavior:
- On success, set `HttpOnly`, `Secure`, `SameSite=Lax` session cookie and redirect to `/`.
- On failure, redirect to `/?auth_error=1`.

#### `POST /api/auth/logout`
Purpose:
- Clear session cookie.

Response `204`

### Authorization rules
- Public:
  - `GET /api/healthz`
  - `GET /api/news`
  - `GET /api/news/:id`
  - `GET /api/briefings/latest`
  - `GET /api/briefings`
  - `GET /api/briefings/:date`
  - `POST /api/subscribe`
- Authenticated session or bearer token:
  - `POST /api/ingest/news`
  - Future admin-only write endpoints

## Proposed data model summary

### `news_items`
- `id` TEXT primary key
- `external_id` TEXT nullable
- `title` TEXT not null
- `summary` TEXT not null
- `content_markdown` TEXT not null
- `category` TEXT not null
- `source_name` TEXT not null
- `source_url` TEXT not null
- `published_at` TEXT not null
- `ingested_at` TEXT not null
- `rating` INTEGER not null
- `is_hot` INTEGER not null default 0
- `dedupe_key` TEXT not null unique
- `content_hash` TEXT not null
- `language` TEXT not null default 'zh-CN'
- `author` TEXT nullable

### `news_tags`
- `news_id` TEXT not null
- `tag` TEXT not null
- composite unique `(news_id, tag)`

### `briefings`
- `id` TEXT primary key
- `briefing_date` TEXT not null unique
- `display_date` TEXT not null
- `analysis_trend` TEXT not null
- `analysis_competition` TEXT not null
- `analysis_demand` TEXT not null
- `created_at` TEXT not null

### `briefing_sections`
- `id` TEXT primary key
- `briefing_id` TEXT not null
- `title` TEXT not null
- `emoji` TEXT not null
- `sort_order` INTEGER not null

### `briefing_section_items`
- `id` TEXT primary key
- `section_id` TEXT not null
- `rank` INTEGER not null
- `title` TEXT not null
- `company` TEXT not null
- `display_date` TEXT not null
- `summary` TEXT not null
- `source_name` TEXT not null
- `source_url` TEXT nullable
- `rating` INTEGER not null
- `category_label` TEXT not null

### `subscribers`
- `id` TEXT primary key
- `email` TEXT not null unique
- `status` TEXT not null
- `source` TEXT not null default 'site_modal'
- `created_at` TEXT not null
- `confirmed_at` TEXT nullable
- `unsubscribed_at` TEXT nullable

### `admin_sessions`
- `id` TEXT primary key
- `user_id` TEXT not null
- `role` TEXT not null
- `expires_at` TEXT not null
- `created_at` TEXT not null

## Proposed endpoint contract

### 1. Health

#### `GET /api/healthz`
Response `200`
```json
{
  "ok": true,
  "service": "fomos-news-api",
  "version": "v1"
}
```

### 2. News read API

#### `GET /api/news`
Purpose:
- Replace homepage use of `newsItems`.

Query params:
- `category`: optional enum `ai-trend | product-insight | crypto | trading-agent | global`
- `limit`: optional integer, default `20`, max `100`
- `cursor`: optional opaque cursor for pagination
- `hot_only`: optional boolean

Response `200`
```json
{
  "items": [
    {
      "id": "news_01HQ...",
      "title": "Anthropic 推出 Claude Enterprise Agents，覆盖财务、工程和设计领域",
      "summary": "Anthropic 正式推出企业级 Agent 计划...",
      "category": "product-insight",
      "source": "TechCrunch",
      "source_url": "https://techcrunch.com/...",
      "published_at": "2026-03-03T00:00:00+08:00",
      "display_date": "2026-03-03",
      "stars": 5,
      "tags": ["Claude", "Enterprise", "Agent"],
      "is_hot": true
    }
  ],
  "next_cursor": "eyJwdWJsaXNoZWRfYXQiOiIyMDI2LTAzLTAzVDAwOjAwOjAwKzA4OjAwIiwiaWQiOiJuZXdzXzAxSFEifQ=="
}
```

Notes:
- Response intentionally mirrors the shape already used in the homepage to minimize frontend change.
- `display_date` is proposed because the frontend currently renders a compact date string rather than a raw timestamp.

#### `GET /api/news/:id`
Purpose:
- Support a future news detail view and give the backend a canonical full-content read path.

Response `200`
```json
{
  "id": "news_01HQ...",
  "title": "Anthropic 推出 Claude Enterprise Agents，覆盖财务、工程和设计领域",
  "summary": "Anthropic 正式推出企业级 Agent 计划...",
  "content_markdown": "Full article content...",
  "category": "product-insight",
  "source": "TechCrunch",
  "source_url": "https://techcrunch.com/...",
  "published_at": "2026-03-03T00:00:00+08:00",
  "display_date": "2026-03-03",
  "stars": 5,
  "tags": ["Claude", "Enterprise", "Agent"],
  "is_hot": true
}
```

Response `404`
```json
{
  "error": {
    "code": "not_found",
    "message": "News item not found"
  }
}
```

### 3. News ingest API

#### `POST /api/ingest/news`
Auth:
- Required
- Accept either valid session cookie or ingest bearer token

Purpose:
- Accept news batches from another OpenClaw instance.

Request body
```json
{
  "items": [
    {
      "external_id": "openclaw-run-2026-03-03-001",
      "title": "Anthropic 推出 Claude Enterprise Agents，覆盖财务、工程和设计领域",
      "summary": "Anthropic 正式推出企业级 Agent 计划...",
      "content_markdown": "Full article markdown...",
      "category": "product-insight",
      "source_name": "TechCrunch",
      "source_url": "https://techcrunch.com/...",
      "published_at": "2026-03-03T00:00:00+08:00",
      "stars": 5,
      "tags": ["Claude", "Enterprise", "Agent"],
      "is_hot": true,
      "author": "OpenClaw",
      "language": "zh-CN"
    }
  ]
}
```

Response `200`
```json
{
  "accepted": 1,
  "inserted": 1,
  "duplicates": 0,
  "rejected": 0,
  "results": [
    {
      "external_id": "openclaw-run-2026-03-03-001",
      "status": "inserted",
      "news_id": "news_01HQ..."
    }
  ]
}
```

Response `200` with duplicate handling
```json
{
  "accepted": 2,
  "inserted": 1,
  "duplicates": 1,
  "rejected": 0,
  "results": [
    {
      "external_id": "a1",
      "status": "inserted",
      "news_id": "news_01HQ..."
    },
    {
      "external_id": "a2",
      "status": "duplicate",
      "reason": "matched_dedupe_key",
      "existing_news_id": "news_01HQ..."
    }
  ]
}
```

Validation rules:
- `title`, `summary`, `content_markdown`, `category`, `source_name`, `source_url`, `published_at` required
- `stars` must be integer `1..5`
- `tags` maximum `10`
- batch size maximum `100`

## Briefing ingestion responsibility

### Confirmed product decision
- Daily briefing content will be written by another OpenClaw instance as a separate artifact.
- The backend should not auto-generate briefing content from news items in v1.
- Integration and handoff docs must make this explicit so the ingesting OpenClaw knows it must submit briefing data separately.

### Integration note for upstream OpenClaw
The upstream OpenClaw integration must treat `news` and `briefing` as two separate write flows:
- `news` ingest sends full news items for storage and frontend feed display
- `briefing` ingest sends the already-structured daily briefing payload for the briefing page

This separation is intentional. The backend is responsible for validation, persistence, and read APIs; the upstream OpenClaw is responsible for briefing composition.

### 4. Briefing read API

#### `POST /api/ingest/briefings`
Auth:
- Required
- Accept either valid session cookie or ingest bearer token

Purpose:
- Accept a completed daily briefing payload from another OpenClaw instance.

Request body
```json
{
  "date_key": "2026-03-03",
  "display_date": "2026年3月3日",
  "sections": [
    {
      "title": "通用 Agent 产品",
      "emoji": "🌐",
      "items": [
        {
          "id": "brief_item_01",
          "rank": 1,
          "title": "Claude Enterprise Agents",
          "company": "Anthropic",
          "date": "03-03",
          "summary": "Anthropic 推出企业 Agent 计划...",
          "source": "TechCrunch",
          "source_url": "https://techcrunch.com/...",
          "stars": 5,
          "category": "通用 Agent"
        }
      ]
    }
  ],
  "analysis": {
    "trend": "...",
    "competition": "...",
    "demand": "..."
  }
}
```

Response `200`
```json
{
  "status": "stored",
  "date_key": "2026-03-03"
}
```

Behavior:
- Upsert by `date_key` for v1 so the upstream OpenClaw can safely correct the same day's briefing.
- Replace briefing sections/items atomically for the target `date_key`.

#### `GET /api/briefings/latest`
Purpose:
- Replace `dailyBriefing` on the current briefing page.

Response `200`
```json
{
  "date": "2026年3月3日",
  "date_key": "2026-03-03",
  "sections": [
    {
      "title": "通用 Agent 产品",
      "emoji": "🌐",
      "items": [
        {
          "id": "brief_item_01",
          "rank": 1,
          "title": "Claude Enterprise Agents",
          "company": "Anthropic",
          "date": "03-03",
          "summary": "Anthropic 推出企业 Agent 计划...",
          "source": "TechCrunch",
          "source_url": "https://techcrunch.com/...",
          "stars": 5,
          "category": "通用 Agent"
        }
      ]
    }
  ],
  "analysis": {
    "trend": "AI Agent 正在从通用助手向垂直领域专家快速演进...",
    "competition": "Anthropic 与 OpenAI 在企业 Agent 市场展开正面竞争...",
    "demand": "机构投资者对 AI Trading Agent 需求激增..."
  }
}
```

#### `GET /api/briefings`
Purpose:
- Support the extracted page hint that archive/history will exist later.

Query params:
- `limit`: optional integer, default `30`, max `180`

Response `200`
```json
{
  "items": [
    {
      "date_key": "2026-03-03",
      "display_date": "2026年3月3日",
      "section_count": 3
    }
  ]
}
```

#### `GET /api/briefings/:date`
Path param:
- `date`: `YYYY-MM-DD`

Response:
- Same shape as `GET /api/briefings/latest`

### 5. Subscription API

#### `POST /api/subscribe`
Purpose:
- Replace the simulated request in `SubscribeModal.tsx`.

Request body
```json
{
  "email": "user@example.com"
}
```

Response `201`
```json
{
  "status": "subscribed"
}
```

Response `200` when already subscribed
```json
{
  "status": "already_subscribed"
}
```

Response `400`
```json
{
  "error": {
    "code": "invalid_email",
    "message": "Email address is invalid"
  }
}
```

Behavior:
- Idempotent on email address
- Normalizes email to lowercase before dedupe check
- For v1, stores locally in SQLite only; downstream mail provider integration is deferred

## Proposed dedupe behavior

### Confirmed constraint
- Duplicate news is not allowed.
- Upstream OpenClaw is the primary dedupe layer.
- Backend still needs basic filtering.

### Proposed backend rule
Generate a `dedupe_key` from normalized:
- `source_url` if present and canonicalizable, otherwise
- `source_name + normalized_title + published_date`

Normalization:
- Trim whitespace
- Lowercase host and path
- Remove common tracking query params like `utm_*`
- Normalize repeated spaces in title
- Use UTC date bucket from `published_at`

Additional safeguard:
- Store `content_hash` of normalized title + summary + content body
- If `dedupe_key` misses but `content_hash` matches a recent item from the same source, treat as duplicate

Conflict policy:
- v1 does not update existing rows during ingest
- Duplicate items are reported as `status = duplicate`
- Manual/admin merge tools are deferred

Why this proposal:
- It respects the confirmed requirement that upstream should do most dedupe work.
- It gives SQLite-friendly deterministic uniqueness without needing fuzzy matching infrastructure.

## Error format
All non-2xx API responses should use:
```json
{
  "error": {
    "code": "machine_readable_code",
    "message": "Human readable message"
  }
}
```

## Frontend integration notes

### Confirmed current frontend mapping
- Homepage news grid can move from `newsItems` to `GET /api/news`
- Briefing page can move from `dailyBriefing` to `GET /api/briefings/latest`
- Subscription modal can move from simulated delay to `POST /api/subscribe`
- Existing login redirect logic expects `/api/oauth/callback`

### Proposed frontend migration notes
- Keep API field names close to existing sample data to reduce churn in React components.
- Use `display_date` for compact UI rendering and `published_at` for sorting.
- The homepage category filter can pass `category` directly using current category keys.
- The homepage hot-news sidebar can call `GET /api/news?hot_only=true&limit=3` or filter client-side from the main payload; server-side filtering is preferred.
- Markets, leaderboard, and ecosystem should remain backed by local sample data until a later backend phase is explicitly approved.

## Non-goals for this doc
- Rust crate selection and module layout
- SQL migration details
- Deployment manifests
- Background jobs and email sending pipeline
