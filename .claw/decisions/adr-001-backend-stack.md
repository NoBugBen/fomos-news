# ADR-001 Backend Stack

## Status
Accepted

## Decision
Use a Rust backend with SQLite for Fomos News v1.

## Decision date
2026-03-19

## Confirmed context
- The project already has a frontend but no real business backend.
- The current server is a small Express static-file server only.
- The required backend must accept authenticated write traffic from another OpenClaw instance.
- The backend must persist full news content historically.
- SQLite is explicitly accepted for v1.
- Duplicate news is disallowed, with upstream OpenClaw as the primary dedupe layer and the backend providing additional filtering.
- The current extracted frontend has immediate API replacement points for news, briefing, subscribe, and OAuth callback flow.

## Finalized decision details

### Backend language
Rust

### Primary database
SQLite

### Architectural shape
- Single deployable HTTP service
- REST-style JSON API
- Cookie/session support for browser auth
- Bearer-token support for service-to-service ingest
- Local SQLite file for v1 persistence

## Rationale

### Why Rust
- Good fit for a small, single-binary backend with low runtime overhead.
- Strong type safety helps keep ingest validation, dedupe logic, and API contracts consistent.
- Suitable for long-term evolution if the project later adds scheduled ingestion, more APIs, or concurrency-heavy workloads.

### Why SQLite
- Confirmed acceptable for v1.
- Matches the current project stage: one service, low operational complexity, and straightforward local deployment.
- Strong enough for the initial requirements of persisted news, briefings, subscriptions, and sessions.
- Keeps the first release simple while still supporting indexed uniqueness constraints for dedupe behavior.

### Why not keep Node/Express for the backend
- The existing Node server is only serving static assets and provides no meaningful application foundation to preserve.
- The project goal already targets a Rust backend, and no evidence in the extracted source suggests a requirement to keep the backend in TypeScript.

### Why not choose PostgreSQL for v1
- PostgreSQL would improve concurrency and operational flexibility, but those benefits are not yet justified by confirmed requirements.
- SQLite reduces deployment burden and is explicitly accepted, so it is the better v1 tradeoff.

## Consequences

### Positive
- Fast path to a self-contained v1 backend.
- Operationally simple local development and deployment.
- Strong basis for deterministic dedupe through unique indexes and normalized keys.
- Easy separation between public read APIs and authenticated ingest/admin APIs.

### Negative
- SQLite constrains multi-writer scaling and some future operational patterns.
- OAuth/session handling still needs careful implementation despite the simple storage choice.
- If ingest volume or concurrent admin workflows grow quickly, migration to PostgreSQL may become necessary.

## Rejected alternatives

### Node.js + SQLite
Rejected because:
- It does not match the stated backend direction.
- There is no existing application backend worth preserving beyond static file serving.

### Rust + PostgreSQL
Rejected for v1 because:
- It adds operational complexity without a confirmed need.
- SQLite already satisfies the known requirements.

### Hybrid backend split
Rejected because:
- A split static server plus separate API service adds deployment and coordination overhead too early.
- A single Rust service can eventually serve both API and built frontend assets if desired.

## Migration outlook
- Keep schema and API design portable enough that SQLite can be replaced by PostgreSQL later.
- Avoid SQLite-only behavior in the API contract.
- Treat database choice as a v1 optimization for simplicity, not a permanent platform constraint.
