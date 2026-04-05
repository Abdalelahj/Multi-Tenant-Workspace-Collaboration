# Reasonix — Multi-Tenant Workspace Collaboration Platform

## What I Built & Reasoning Behind Scope

A **Slack-like real-time workspace collaboration platform** with:
- **Workspaces** as tenants (complete data isolation between Acme Corp and Globex)
- **Channels** within workspaces for topic-based communication
- **Real-time messaging** via WebSocket (Socket.io)
- **Presence tracking and rate limiting** via Redis (two distinct, meaningful uses)
- **Hardcoded seed users** (no auth complexity wasted)

**Why this scope?** The spec says "quality, reasoning, and trade-offs over quantity." I deliberately skipped file uploads, reactions, search, and threads to deliver these core features with depth: multi-tenancy at every layer, proper concurrency handling, real-time with reconnect logic, Redis used correctly.

---

## Running the Project

```bash
# 1. Set your Neon DATABASE_URL in backend/.env (see backend/.env.example)

# 2. Run everything with a single command:
docker compose up

# Or locally without Docker:
cd backend && npm install && npx prisma migrate dev && npx prisma db seed && npm run start:dev
cd frontend && npm install && npm run dev
```

**Seeded users (open two browser tabs to test isolation):**

| Name  | Email              | Workspace  | User ID               |
|-------|--------------------|------------|-----------------------|
| Alice | alice@acme.com     | acme-corp  | user_alice_acme       |
| Bob   | bob@acme.com       | acme-corp  | user_bob_acme         |
| Carol | carol@globex.com   | globex     | user_carol_globex     |
| Dave  | dave@globex.com    | globex     | user_dave_globex      |

---

## Data Model & Design Rationale

```
Workspace (tenant root)
  └── User[]    (belongs to exactly one workspace)
  └── Channel[] (scoped to workspace, unique name per tenant)
        └── Message[] (denormalized workspaceId for fast queries)
```

**Key decisions:**
- `workspaceId` is on **every table** — Postgres indexes enforce tenant-scoped queries
- `@@unique([workspaceId, name])` on Channel — duplicate channel names blocked at DB level
- `workspaceId` denormalized on Message — allows index scan without JOIN for tenant queries
- Cursor-based pagination (`before` param) — scalable, consistent under concurrent inserts

---

## Multi-Tenancy Approach

**Row-Level Isolation** — single database, single schema, `workspaceId` on every table.

Three enforcement layers (defence in depth):
1. **`WorkspaceGuard`** (NestJS Guard) — validates `X-User-Id` + `X-Workspace-Id` headers on every request. Checks the user exists AND belongs to the claimed workspace in Postgres.
2. **Service layer** — every service method takes `requesterWorkspaceId` and cross-checks it against the route param before querying.
3. **DB constraints** — `@@index([workspaceId])` ensures Postgres never does a cross-tenant full scan.

**Trade-off vs. schema-per-tenant:** Simpler to implement and operate at this scale. For 1000s of tenants with strict compliance requirements, schema-per-tenant is preferred.

---

## How and Why Redis Was Used

### 1. Presence Tracking (Redis Sets + per-member TTL)
```
Key: presence:{workspaceId}        → Redis Set of userId strings
Key: presence:{workspaceId}:{uid}  → Expiry sentinel (TTL: 35s)
```
- On WebSocket connect → `SADD` + set sentinel with 35s TTL
- On disconnect → `SREM` + `DEL` sentinel
- Frontend heartbeat every 30s → refreshes sentinel TTL
- `getPresence()` lazily removes stale members (set without live sentinel)

**Why Redis?** Presence is ephemeral, doesn't belong in Postgres. Redis TTL handles stale sessions automatically. A Postgres row per online user would require cleanup jobs.

### 2. Message Rate Limiting (Atomic INCR Sliding Window)
```
Key: ratelimit:{workspaceId}:{userId} → Counter (TTL: 10s window)
Max: 10 messages per 10 seconds
```
- Each message POST → atomic `INCR`. First call sets 10s TTL.
- If counter > 10 → HTTP 429 returned; WebSocket emits `rate_limited` event
- Frontend shows warning banner and disables input for 10s

**Why Redis?** Rate limiting requires atomic increment + TTL in a single round-trip. Postgres advisory locks or row updates would be slower and require cleanup. Redis `INCR` + `EXPIRE` is O(1) and designed for exactly this pattern.

---

## Real-Time Implementation

**Socket.io WebSocket Gateway** (NestJS `@WebSocketGateway`):

| Event (client → server) | Behaviour |
|--------------------------|-----------|
| `join_channel` | Validates channel belongs to user's workspace, joins socket room |
| `leave_channel` | Leaves socket room |
| `send_message` | Rate-limit check → persist to DB → broadcast to channel room |
| `typing_start` | Broadcasts to channel room (excludes sender) |
| `typing_stop` | Clears typing indicator |
| `heartbeat` | Refreshes Redis presence TTL |

| Event (server → client) | Behaviour |
|--------------------------|-----------|
| `new_message` | Broadcast to all channel room members |
| `presence:update` | Broadcast to workspace room on connect/disconnect |
| `rate_limited` | Unicast to rate-limited client |
| `user_typing` / `user_stopped_typing` | Channel room broadcast |

**Reconnection:** Socket.io client configured with 5 retry attempts, 1–5s backoff. On reconnect, the client re-emits `join_channel` via the `useMessages` hook's effect cleanup/re-run.

**State consistency:** Optimistic UI adds the message immediately; the server broadcast replaces it (deduplicated by ID in `useMessages`).

---

## Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Row-level isolation | Simpler than schema-per-tenant but less strict isolation at DB level |
| Cursor-based pagination (50 msgs) | No infinite scroll / load-more implemented in 3h |
| Hardcoded session (sessionStorage) | Avoids JWT/OAuth complexity; not production-safe |
| Single Redis instance | No Redis Sentinel/Cluster; single point of failure |
| No message edit/delete | Core real-time works; CRUD deferred |
| Optimistic UI without rollback | Messages won't un-send on gateway error (handled via `rate_limited` event) |

---

## What I Would Do With More Time

1. **Proper auth** — JWT with refresh tokens, next-auth or Lucia
2. **Message edit/delete** — with `editedAt` tracking (DB field already present)
3. **Infinite scroll** — full cursor-based pagination in the UI
4. **Redis Cluster / Sentinel** — production-grade Redis for the rate limiter and presence
5. **Socket.io Redis adapter** — for horizontal scaling of the WebSocket layer across multiple instances
6. **Schema-per-tenant** migration — for strict enterprise compliance
7. **Tests** — unit tests for WorkspaceGuard and MessageService rate limiter; e2e for the WebSocket gateway
8. **Observability** — structured logging (Pino), health check endpoints
