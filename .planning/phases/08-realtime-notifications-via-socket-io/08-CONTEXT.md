# Phase 8: Realtime notifications via Socket.IO — Context

**Gathered:** 2026-04-26
**Status:** Ready for planning
**Source:** PRD Express Path (derived from CLAUDE.md + ROADMAP.md + conversation with project owner)

<domain>
## Phase Boundary

This phase delivers **server-side Socket.IO + live dashboard updates** for AnnSparsh.

In scope:
- Server-side Socket.IO server attached to the existing Express HTTP server.
- Authenticated socket handshake (reuse the existing JWT in `localStorage`).
- Server emits events on the four state changes that matter to dashboards:
  1. Donation created (AVAILABLE) → fan out to NGOs
  2. Pickup request submitted → push to the affected donor
  3. Donor approves/rejects (and OTP issued) → push to the requesting NGO
  4. OTP verified, donation collected → push to both donor and NGO
- Reconnect-tolerant client wiring in [src/socket.js](../../src/socket.js).
- Dashboard live updates: [src/components/DonorDashboard.jsx](../../src/components/DonorDashboard.jsx) and [src/components/NGODashboard.jsx](../../src/components/NGODashboard.jsx) must reflect new state without `window.location.reload()` or polling.

Out of scope (deferred to later phases):
- SMS/WhatsApp out-of-app delivery — Phase 9.
- Push notifications to mobile — Phase 22.
- New marketing/UI surfaces — this phase only updates *existing* dashboards.
- Notification UI surface for unread/badge tracking ([src/components/Notifications.jsx](../../src/components/Notifications.jsx) is a placeholder; this phase makes it data-driven but UI redesign is out of scope).

</domain>

<decisions>
## Implementation Decisions

### Transport & library
- **Use `socket.io` server library.** Frontend already imports `socket.io-client` (in `package.json`). No alternative transport (no SSE, no raw WS).
- **Same Express HTTP server.** Mount Socket.IO on the same port the REST API runs on; share the CORS allow-list already configured in [server/app.js](../../server/app.js).

### Authentication
- **JWT-based handshake.** Client passes the same JWT from `localStorage` via `auth.token` field on connect. Server runs the existing `verifyToken` logic from [server/middleware/auth.js](../../server/middleware/auth.js).
- **Reject unauthenticated sockets.** No anonymous connections — disconnect on auth failure with a typed error event.
- **Reuse role and userId** decoded from the JWT to scope room membership.

### Room/channel design
- One room per user: `user:{userId}` — every authenticated socket auto-joins this.
- One broadcast room per role: `role:NGO` — used to fan out new AVAILABLE donations.
- No global broadcast room. Admin gets its own `role:ADMIN` for stats updates (deferred — not required by REQ-08, treat as nice-to-have).

### Event names (server → client)
- `donation:available` — payload: `{ donation }`. Emitted to `role:NGO` on donation create.
- `request:incoming` — payload: `{ request, donation }`. Emitted to `user:{donor_id}` when an NGO requests.
- `request:resolved` — payload: `{ request, status, otp? }`. Emitted to `user:{ngo_id}` on approve/reject. OTP included on approval only.
- `pickup:collected` — payload: `{ donation, request }`. Emitted to BOTH `user:{donor_id}` and `user:{ngo_id}` on OTP verification success.

No client-emitted events in this phase — sockets are listen-only from client side. State mutations still go through REST.

### Reconnection
- Use Socket.IO default reconnection (enabled by default). Client must rebind listeners on `connect` (not just at component mount) so reconnects after sleep/tab-switch restore the live feed.
- On reconnect, client triggers a one-shot REST refresh of dashboard data to recover missed events while disconnected. (Acceptable for v1 — no event-replay buffer.)

### Server emit placement
- Emit calls live in route handlers, **not** in a separate event bus, until P11 introduces the model layer. Inline emit after a successful `pool.query` that produces the state change.
- Pass the Socket.IO `io` instance to route handlers via `app.set('io', io)` and `req.app.get('io')`.

### Where realtime is wired
- Donor dashboard listens for `request:incoming` and `pickup:collected` and merges into local state.
- NGO dashboard listens for `donation:available`, `request:resolved`, and `pickup:collected`.
- Toasts (`react-toastify`, already a dep) surface arrival of new events.

### Claude's Discretion
- Exact React state-merge strategy (functional setState vs reducer) — implementer's call.
- Whether to expose a `useSocket()` hook or import the singleton client directly.
- Backend file organization for socket setup (single `server/socket.js` is acceptable).
- Logging format for socket lifecycle (will be standardized in P13).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- [CLAUDE.md](../../CLAUDE.md) — Repo conventions, don'ts, hot paths
- [.planning/PROJECT.md](../PROJECT.md) — North star, gaps, success metrics
- [.planning/STATE.md](../STATE.md) — Current state, blockers, risks
- [.planning/intel/codebase-map.md](../intel/codebase-map.md) — File map, API surface, schema

### Code that this phase depends on
- [server/app.js](../../server/app.js) — Express entry; Socket.IO mounts here
- [server/middleware/auth.js](../../server/middleware/auth.js) — JWT verify; reused in handshake
- [server/routes/donation.routes.js](../../server/routes/donation.routes.js) — emit on create
- [server/routes/request.routes.js](../../server/routes/request.routes.js) — emit on submit, approve, OTP verify
- [src/api.js](../../src/api.js) — JWT pattern (same token feeds the socket handshake)
- [src/socket.js](../../src/socket.js) — existing client stub to extend
- [src/components/DonorDashboard.jsx](../../src/components/DonorDashboard.jsx) — wire `request:incoming` + `pickup:collected`
- [src/components/NGODashboard.jsx](../../src/components/NGODashboard.jsx) — wire `donation:available` + `request:resolved` + `pickup:collected`

### Schema
- [server/config/schema.sql](../../server/config/schema.sql) — Tables: users, donations, requests. No schema changes in this phase.

</canonical_refs>

<specifics>
## Specific Ideas

- The frontend already has `socket.io-client` installed; no client-side npm install needed.
- The backend does NOT yet have `socket.io` installed — the planner must include the install task.
- CORS for Socket.IO must mirror the REST CORS list (`http://localhost:5173`, `http://localhost:5174`, plus future production origin).
- Existing toast infrastructure: [src/components/Notifications.jsx](../../src/components/Notifications.jsx) and `react-toastify` (already imported).
- Verification target: from REQ-08 success criteria — events arrive within **2 seconds** of state change.

</specifics>

<deferred>
## Deferred Ideas

- Per-user notification preferences (mute, channel selection) — backlog.
- Notification persistence (read/unread, history) — Phase 16+ may require it for impact UI.
- Admin live stats updates — could fit here but not required by REQ-08; defer unless trivially cheap.
- Event-replay buffer on reconnect — v1 uses one-shot REST refresh.
- Per-event analytics (delivery latency tracking) — covered by P13 monitoring.
- Web push (browser push API) for closed-tab delivery — Phase 9 covers via SMS.

</deferred>

---

*Phase: 08-realtime-notifications-via-socket-io*
*Context gathered: 2026-04-26 via PRD Express Path*
