# Phase 8: Realtime notifications via Socket.IO — Research

**Researched:** 2026-04-26
**Domain:** Realtime transport (Socket.IO 4.x) over an existing Express + JWT REST stack
**Confidence:** HIGH

---

## Summary

Phase 8 adds a Socket.IO server to the existing Express HTTP server in `server/app.js`, authenticates each connection via the same JWT used for REST, auto-joins each socket to a `user:{id}` room and a `role:{ROLE}` room, and emits four locked event names from the existing route handlers in `server/routes/donation.routes.js` and `server/routes/request.routes.js`. The frontend already imports `socket.io-client@4.8.3` (verified in `package.json:19`); the server-side `socket.io` package is **not** installed yet (verified absent from `server/package.json`).

The integration is small in surface area but has three sharp edges: (1) reconnect must not silently drop listeners or fall back to a stale token, (2) `socket.io-client` 4.x re-evaluates the `auth` option on every reconnect attempt **only when `auth` is a function**, and (3) React 19 StrictMode in dev runs every effect twice — listener registration must use named handlers + `socket.off()` cleanup.

**Primary recommendation:** Pin `socket.io@4.8.3` on the server (exact match with the client already installed). Mount with `http.createServer(app)` + `new Server(httpServer, { cors: ... })`, share the existing CORS allow-list, run JWT verification in `io.use()` middleware (reusing the same `jwt.verify` + `JWT_SECRET` as `server/middleware/auth.js`), pass `io` to routes via `app.set('io', io)`, and emit inline after the successful `pool.query` that produced the state change. Frontend extends `src/socket.js` to use a callback `auth` so reconnects pick up rotated tokens, and dashboards register listeners in a dedicated `useEffect` with named functions + cleanup.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Transport & library**
- Use `socket.io` server library. Frontend already imports `socket.io-client`. No alternative transport (no SSE, no raw WS).
- Same Express HTTP server. Mount Socket.IO on the same port the REST API runs on; share the CORS allow-list already configured in `server/app.js`.

**Authentication**
- JWT-based handshake. Client passes the same JWT from `localStorage` via `auth.token` field on connect. Server runs the existing `verifyToken` logic from `server/middleware/auth.js`.
- Reject unauthenticated sockets. No anonymous connections — disconnect on auth failure with a typed error event.
- Reuse role and userId decoded from the JWT to scope room membership.

**Room/channel design**
- One room per user: `user:{userId}` — every authenticated socket auto-joins this.
- One broadcast room per role: `role:NGO` — used to fan out new AVAILABLE donations.
- No global broadcast room. Admin gets `role:ADMIN` for stats updates (deferred — not required by REQ-08, treat as nice-to-have).

**Event names (server → client) — LOCKED**
- `donation:available` — payload `{ donation }`. To `role:NGO` on donation create.
- `request:incoming` — payload `{ request, donation }`. To `user:{donor_id}` on NGO request submit.
- `request:resolved` — payload `{ request, status, otp? }`. To `user:{ngo_id}` on approve/reject. OTP included on approval only.
- `pickup:collected` — payload `{ donation, request }`. To BOTH `user:{donor_id}` and `user:{ngo_id}` on OTP verification success.
- No client-emitted events in this phase. Sockets are listen-only client-side. State mutations still go through REST.

**Reconnection**
- Default Socket.IO reconnection (enabled by default). Client must rebind listeners on `connect` so reconnects after sleep/tab-switch restore the live feed.
- On reconnect, client triggers a one-shot REST refresh of dashboard data to recover missed events. (Acceptable for v1 — no event-replay buffer.)

**Server emit placement**
- Emit calls live in route handlers, **not** in a separate event bus, until P11 introduces the model layer. Inline emit after a successful `pool.query` that produces the state change.
- Pass the Socket.IO `io` instance to route handlers via `app.set('io', io)` and `req.app.get('io')`.

**Where realtime is wired**
- Donor dashboard listens for `request:incoming` and `pickup:collected` and merges into local state.
- NGO dashboard listens for `donation:available`, `request:resolved`, and `pickup:collected`.
- Toasts (`react-toastify`, already a dep) surface arrival of new events.

### Claude's Discretion
- Exact React state-merge strategy (functional setState vs reducer) — implementer's call.
- Whether to expose a `useSocket()` hook or import the singleton client directly.
- Backend file organization for socket setup (single `server/socket.js` is acceptable).
- Logging format for socket lifecycle (will be standardized in P13).

### Deferred Ideas (OUT OF SCOPE)
- Per-user notification preferences (mute, channel selection).
- Notification persistence (read/unread, history).
- Admin live stats updates.
- Event-replay buffer on reconnect.
- Per-event analytics (delivery latency tracking).
- Web push (browser push API) for closed-tab delivery.
- SMS/WhatsApp delivery (Phase 9).
- Mobile push (Phase 22).
- Notification UI redesign in `src/components/Notifications.jsx` (this phase makes it data-driven only).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-08 | State changes (donation create, request submit, approve/reject, OTP issue, pickup confirm) propagate to relevant connected clients within 2 seconds without manual refresh. | Socket.IO 4.x over a single Express HTTP server delivers <100ms intra-region latency; the four locked events cover all five enumerated state transitions in REQ-08 (request submit and approve/reject are two of those). The 2-second budget includes one round-trip plus React re-render — easily met by an in-process `io.to(room).emit()` immediately after `pool.query`. Reconnect tolerance is delivered by the default `reconnection: true` client option plus an on-`connect` REST refetch (locked decision). |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

These directives MUST be honored by the planner. Sourced from `CLAUDE.md` lines indicated.

| Directive | Source | Implication for P8 |
|---|---|---|
| Backend uses CommonJS (`require`); frontend uses ESM (`import`) | CLAUDE.md L56 | `server/socket.js` (if added) uses `require`; `src/socket.js` stays ESM. |
| Inline SQL in route handlers — slated for P11 refactor; do not introduce ORM | CLAUDE.md L57 | Emit calls go inline alongside the existing `pool.query` calls in `donation.routes.js` and `request.routes.js`. Do not extract a service/event-bus layer. |
| Frontend HTTP always goes through `api` from `src/api.js` — never raw `fetch` or `axios.create()` elsewhere | CLAUDE.md L58 | The on-reconnect REST refetch must use `api` (already in dashboards). |
| No tests yet — adding them is P12. Don't block features waiting for tests, but write code as if tests will be added | CLAUDE.md L60 | Validation Architecture below proposes a manual test plan + future automated sketch, no test framework install in this phase. |
| No comments unless the *why* is non-obvious. No JSDoc | CLAUDE.md L61 | Apply to all new code in this phase. |
| Do not bypass `is_verified` check on users | CLAUDE.md L77 | Socket auth middleware must reject sockets whose JWT belongs to a non-verified user (or, alternatively, route handlers continue to enforce — see Open Questions below). |
| Mobile-first | CLAUDE.md L79 | Toasts (`react-toastify`) are already mobile-friendly; no extra UI work needed. |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| `socket.io` | **4.8.3** | Server-side realtime transport | Exact-version match with `socket.io-client@4.8.3` already in `package.json:19`. Released 2025-12-23 (verified via `npm view socket.io@4.8.3 time`). Requires Node `>=10.2.0` (well below current). [VERIFIED: npm registry] |
| `socket.io-client` | 4.8.3 (already installed) | Client-side realtime transport | Already present in `package.json:19`. No client install needed. [VERIFIED: package.json] |

**Compatibility:** Socket.IO 4.x server and client must be on the same major version. Same minor + patch is the safest choice. [CITED: socket.io/docs/v4/client-installation]

**Transitive dependencies of `socket.io@4.8.3`** (informational, all auto-installed): `accepts ~1.3.4`, `base64id ~2.0.0`, `cors ~2.8.5`, `debug ~4.4.1`, `engine.io ~6.6.0`, `socket.io-adapter ~2.5.2`, `socket.io-parser ~4.2.4`. [VERIFIED: `npm view socket.io@4.8.3 dependencies`]

### Supporting

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| `jsonwebtoken` (already installed) | 9.0.2 | JWT verify in handshake | Already in `server/package.json:14`. Reuse — do not install a different JWT lib. |
| `react-toastify` (already installed) | 11.0.5 | Surface incoming events | Already in `package.json:18`. Already imported in both dashboards. |
| `cors` (already installed) | 2.8.5 | Express-side CORS (already configured) | Socket.IO uses its own `cors` option for the Engine.IO HTTP polling fallback; the existing `app.use(cors(...))` in `server/app.js:7` covers REST only. Configure both. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| `socket.io` | Native `ws` package | Loses auto-reconnect, rooms, JSON parsing, fallback to long-polling. Frontend already locked to `socket.io-client`, so this is moot. |
| `socket.io` | Server-Sent Events | Locked out by CONTEXT — server→client only would fit, but the team chose Socket.IO for ecosystem familiarity. |
| Inline emit in routes | Event-bus / observer | Locked: deferred to P11 model layer. |

**Installation (single command):**
```bash
cd server && npm install socket.io@4.8.3
```

**Version verification done in this research session:**
```
$ npm view socket.io version          → 4.8.3
$ npm view socket.io-client version   → 4.8.3 (match)
$ npm view socket.io@4.8.3 time       → "4.8.3": "2025-12-23T16:42:13.022Z"
```
[VERIFIED: npm registry, this session]

---

## Architecture Patterns

### Recommended File Layout

```
server/
├── app.js              # MODIFY — switch from app.listen() to http.createServer(app), build io, wire to app
├── socket.js           # NEW — exports a function buildSocketServer(httpServer, app) that returns io
├── middleware/auth.js  # UNCHANGED — its jwt.verify call is reused inline in socket.js (do not import the express middleware itself)
├── routes/
│   ├── donation.routes.js  # MODIFY — emit 'donation:available' after the INSERT
│   └── request.routes.js   # MODIFY — emit 'request:incoming', 'request:resolved', 'pickup:collected'

src/
├── socket.js           # MODIFY — change auth to a callback so reconnects pick up the latest token; expose a small wrapper that emits a 'reconnected' lifecycle hook for dashboards
└── components/
    ├── DonorDashboard.jsx  # MODIFY — listen for 'request:incoming' + 'pickup:collected'; refetch on reconnect
    └── NGODashboard.jsx    # MODIFY — listen for 'donation:available' + 'request:resolved' + 'pickup:collected'; refetch on reconnect
```

This matches the locked decision "single `server/socket.js` is acceptable" (CONTEXT.md L72).

### Pattern 1: Mount Socket.IO on the Existing Express HTTP Server

`app.listen()` returns a server but Socket.IO 4.x needs the http.Server *before* listen so it can attach upgrade handlers. The official replacement is `http.createServer(app)`. [CITED: https://socket.io/docs/v4/server-initialization/]

**Replace** the current `server/app.js:17-18`:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

**With** (verbatim shape — apply project no-comments rule):
```javascript
const { createServer } = require('http');
const { Server } = require('socket.io');
const buildSocketServer = require('./socket');

const httpServer = createServer(app);
const io = buildSocketServer(httpServer, app);
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

`buildSocketServer` (in new `server/socket.js`) constructs the `io` and registers the auth middleware + connection handler. Keeping it in its own file is the sole concession to organization the locked decision allows.

[CITED: https://socket.io/docs/v4/server-initialization/]

### Pattern 2: JWT Auth Middleware in `io.use()`

Reuse the same `JWT_SECRET` and verify shape as `server/middleware/auth.js:8`. The **decoded payload shape is `{ id, role }`** (verified in `server/routes/auth.routes.js:26` and `:47`).

```javascript
// server/socket.js (new file)
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = function buildSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { id, role }
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.id}`);
        socket.join(`role:${socket.user.role}`);
    });

    return io;
};
```

Why not import `authMiddleware` from `server/middleware/auth.js` directly? It is an Express middleware with `(req, res, next)` signature and reads `req.headers.authorization`. The socket handshake exposes the token through `socket.handshake.auth.token`, not headers — adapter-shaped reuse is uglier than just calling `jwt.verify` again with the same secret. The two stay in sync because they share `JWT_SECRET` and the same payload contract. [CITED: https://socket.io/docs/v4/middlewares/]

### Pattern 3: Inline Emit from Route Handlers

Pattern: `req.app.get('io').to('room').emit('event', payload)`.

**`server/routes/donation.routes.js` — after L17 success path:**
```javascript
const donation = result.rows[0];
req.app.get('io').to('role:NGO').emit('donation:available', { donation });
res.status(201).json(donation);
```

**`server/routes/request.routes.js` — after L29 (NGO submits request):**
```javascript
const newRequest = result.rows[0];
req.app.get('io').to(`user:${donation.rows[0].donor_id}`).emit('request:incoming', {
    request: newRequest,
    donation: donation.rows[0],
});
res.status(201).json(newRequest);
```

**`server/routes/request.routes.js` — after L93/L101 (donor approve/reject):**
```javascript
const io = req.app.get('io');
const ngoId = request.ngo_id;
io.to(`user:${ngoId}`).emit('request:resolved', {
    request: { ...request, status: newStatus },
    status: newStatus,
    // OTP is generated only at /volunteer step, NOT here. No otp field on approve.
});
```

⚠️ Note: per the LOCKED event spec, `request:resolved` includes `otp?` "on approval only", but the existing schema generates the OTP **later**, in the `PUT /:id/volunteer` handler at `request.routes.js:124`. Two valid interpretations:
- (A) Strictly follow the locked event payload: include `otp` in `request:resolved` only when the volunteer step is collapsed (would require a flow change → out of scope).
- (B) Emit `request:resolved` with `otp: null` on approve, then emit a second `request:resolved` (or a new `volunteer:assigned`) when the OTP is generated.

**Recommendation for the planner:** treat the OTP-issue moment (volunteer assignment, `request.routes.js:124`) as a *third* state-change emission point and use `request:resolved` again with `status: 'APPROVED'` and the now-populated `otp`. This stays inside the locked event names. Surface this in the Plan as an explicit note. (See Open Question #1.)

**`server/routes/request.routes.js` — after L155 (OTP verify success):**
```javascript
const io = req.app.get('io');
io.to(`user:${request.ngo_id}`)
  .to(`user:${donation.donor_id}`) // need to fetch donor_id alongside request
  .emit('pickup:collected', { donation, request });
```

⚠️ The current verify-otp query at `request.routes.js:142-148` joins `donations` but does not return `donor_id` in the projection — it uses `r.*` only. The planner's task should adjust the SELECT to also pick `d.donor_id` so we can route the emit. Alternatively, run a second small SELECT after success.

[CITED: https://socket.io/docs/v4/rooms/ — `io.to('room1').to('room2').emit(...)` performs union, each socket gets the event once.]

### Pattern 4: Frontend — Listener Registration in `useEffect` with Cleanup

**`src/socket.js` (replace current contents):**
```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
    auth: (cb) => cb({ token: localStorage.getItem('token') || '' }),
    withCredentials: true,
});

export default socket;
```

**Why a function for `auth`, not an object:** the function is called on every connection attempt, including each automatic reconnect, so the latest token in `localStorage` is always sent. The current `src/socket.js:15-17` mutates `socket.auth` inside the `connect` handler — that runs *after* the new handshake, so the very first reconnect after a token rotation would still use the old token. [CITED: https://github.com/socketio/socket.io/discussions/3902]

**Dashboard listener pattern (NGO example):**
```javascript
// src/components/NGODashboard.jsx
import socket from '../socket';

useEffect(() => {
    const onAvailable = ({ donation }) => {
        setAvailable(prev => [donation, ...prev]);
        toast.info(`New donation: ${donation.food_type}`);
    };
    const onResolved = ({ request, status, otp }) => {
        setMyRequests(prev => prev.map(r => r.id === request.id ? { ...r, status, otp: otp ?? r.otp } : r));
        toast.info(`Request ${status.toLowerCase()}`);
    };
    const onCollected = ({ request }) => {
        setMyRequests(prev => prev.map(r => r.id === request.id ? { ...r, otp_verified: true } : r));
        toast.success('Pickup confirmed');
    };
    const onConnect = () => fetchData(); // recover missed events on reconnect

    socket.on('donation:available', onAvailable);
    socket.on('request:resolved', onResolved);
    socket.on('pickup:collected', onCollected);
    socket.on('connect', onConnect);

    return () => {
        socket.off('donation:available', onAvailable);
        socket.off('request:resolved', onResolved);
        socket.off('pickup:collected', onCollected);
        socket.off('connect', onConnect);
    };
}, [fetchData]);
```

Three things this pattern gets right:
1. **Named handlers + `socket.off(event, handler)`** — anonymous handlers + `socket.off('event')` would remove listeners other components registered on the same shared socket (the singleton from `src/socket.js`). [CITED: https://socket.io/how-to/use-with-react]
2. **Refetch on `connect`, not just on mount** — `connect` fires both on initial connect and on every reconnect. [CITED: https://socket.io/docs/v4/client-socket-instance/ — "This event is fired by the Socket instance upon connection and reconnection"]
3. **`useEffect` cleanup unbinds listeners** — survives React 19 StrictMode dev double-invoke without doubling handlers (StrictMode runs setup → cleanup → setup, and the cleanup `socket.off()` removes the first registration before the second registers). [CITED: dev.to react-19-strict-mode-guide]

### Anti-Patterns to Avoid

- **Anti-pattern: `socket.off('event')` with no handler reference.** Removes listeners other components own on the shared singleton. Use `socket.off('event', namedHandler)`.
- **Anti-pattern: registering listeners inside the `connect` handler.** They get re-registered on every reconnect → duplicates. [CITED: https://socket.io/docs/v4/client-socket-instance/]
- **Anti-pattern: `auth: { token: localStorage.getItem('token') }` (object literal).** Captures the token value at module-load time. The current `src/socket.js:8-10` does this; it works on first connect but stale on reconnects after token rotation.
- **Anti-pattern: `io.emit('event', payload)` (broadcast to everyone).** No room scoping → leaks data across users. Always `io.to(room).emit(...)`.
- **Anti-pattern: emitting before the DB write succeeds.** Listeners would see state that doesn't exist if the query rolls back. Emit *after* `await pool.query(...)`.
- **Anti-pattern: storing the `io` instance as a module-level singleton in `server/socket.js` and `require()`-ing it from routes.** Creates a circular import risk. Use `app.set('io', io)` + `req.app.get('io')` (locked decision, also the standard pattern).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| WebSocket transport with fallback | Raw `ws` + reconnect logic + heartbeat + room broadcasting | `socket.io` server + client | Engine.IO (under socket.io) handles HTTP long-poll fallback, heartbeats, reconnect backoff with jitter, room dispatch, JSON encoding. Re-implementing is weeks of bugs. |
| Reconnect backoff | `setTimeout` retry loops | Default client options (`reconnectionDelay: 1000`, `reconnectionDelayMax: 5000`, `randomizationFactor: 0.5`) | Already battle-tested. [VERIFIED: socket.io/docs/v4/client-options/] |
| Per-user/per-role pub-sub | An in-memory `Map<userId, Set<socket>>` | `socket.join('user:42')` + `io.to('user:42').emit(...)` | Auto-cleanup on disconnect; supports adapters (Redis) when you scale to >1 process — relevant for P26+ but free now. |
| Auth in handshake | Custom token-in-querystring scheme | `socket.handshake.auth.token` + `io.use(...)` middleware | Standard pattern, supported by client `auth` option, doesn't leak tokens into URL access logs. |

**Key insight:** This phase exists *because* socket.io exists. The whole point is that AnnSparsh gets four-line emits in routes and a singleton import in dashboards. Anything more elaborate is a smell.

---

## Common Pitfalls

### Pitfall 1: Stale token on reconnect after JWT rotation
**What goes wrong:** User logs out and back in (or token gets rotated by a future refresh-token feature in P11). New token is in `localStorage`. The socket auto-reconnects on next network blip — but uses the original token captured at module load. Server rejects with `connect_error: Invalid token`. UI shows a permanent "disconnected" banner.
**Why it happens:** The current `src/socket.js:8` uses `auth: { token: localStorage.getItem(...) }` — an object literal evaluated once.
**How to avoid:** Use the function form: `auth: (cb) => cb({ token: localStorage.getItem('token') || '' })`. Function is called on every handshake attempt. [CITED: socket.io/docs/v4/client-options/]
**Warning signs:** Sockets stop receiving events after a logout/login cycle in the same browser tab; manual refresh fixes it.

### Pitfall 2: Vite proxy drops WebSocket upgrade
**What goes wrong:** Frontend `npm run dev` runs Vite at 5173 and Vite proxies `/api` → 5000 (verified in `vite.config.js:8-13`). If the socket connects through the same proxy without `ws: true`, the `Upgrade: websocket` header isn't forwarded — connection silently downgrades to long-polling or fails.
**Why it happens:** Vite's HTTP proxy is non-WS by default. [CITED: vite.dev/config/server-options]
**How to avoid:** The current `src/socket.js:3` connects **directly** to `http://localhost:5000` (it strips `/api`), so the Vite proxy is bypassed for sockets — this is correct and should be preserved. **Do not** route the socket through the Vite proxy. If a future change does proxy sockets, add `ws: true` to the proxy entry: `'/socket.io': { target: 'ws://localhost:5000', ws: true, changeOrigin: true }`. Document this in code comments at the proxy site if changed.
**Warning signs:** Browser DevTools Network tab shows the WS handshake stuck in "pending" or repeatedly retrying as polling.

### Pitfall 3: React 19 StrictMode double-binds listeners in dev
**What goes wrong:** In dev with `<StrictMode>` (default in `src/main.jsx`), every effect runs twice: setup → cleanup → setup. If you register listeners without `useEffect` cleanup, you get two handlers per event → toasts fire twice, state updates apply twice.
**Why it happens:** React 19 keeps the StrictMode dev double-invoke from React 18.
**How to avoid:** Always `socket.off(event, handler)` in the `useEffect` return. Use named function references — never anonymous arrows in the `socket.on` call. [CITED: socket.io/how-to/use-with-react]
**Warning signs:** Two toasts pop for one server event in dev only.

### Pitfall 4: Anonymous `socket.off('event')` clears other components' listeners
**What goes wrong:** Component A unmounts, calls `socket.off('donation:available')`. Component B (which also subscribed) loses its listener too — because the singleton socket holds *all* listeners.
**Why it happens:** `socket.off('event')` with no second arg removes every handler for that event name on the socket. [CITED: socket.io/how-to/use-with-react]
**How to avoid:** Always pass the same function reference: `socket.off('donation:available', onAvailable)`.
**Warning signs:** Some dashboards stop updating after navigating between tabs.

### Pitfall 5: Switching from `app.listen()` to `httpServer.listen()` and forgetting one
**What goes wrong:** Devs reflexively type `app.listen(PORT)` (the existing pattern in `server/app.js:18`). With Socket.IO mounted on `httpServer`, calling `app.listen()` creates a *second* HTTP server with no socket attached. REST works, sockets silently never connect.
**Why it happens:** Muscle memory. The Socket.IO docs explicitly call this out: `"Using app.listen(3000) will not work here, as it creates a new HTTP server."` [CITED: socket.io/docs/v4/server-initialization/]
**How to avoid:** Replace `app.listen` with `httpServer.listen` in the same commit that adds `http.createServer`. Code review the diff for any leftover `app.listen` calls.
**Warning signs:** Browser DevTools shows `connect_error: xhr poll error`; server logs show the REST server but no `engine.io` startup line.

### Pitfall 6: CORS allowlist drift between Express and Socket.IO
**What goes wrong:** REST is reachable from `localhost:5174` (allowed in `server/app.js:7`), but socket connects from `5174` and gets `connect_error: server error`. The Socket.IO `cors` option is independent from `app.use(cors(...))`.
**Why it happens:** Engine.IO uses its own CORS check for the initial polling handshake. [CITED: socket.io/docs/v4/server-options/ — "the cors configuration directly will be forwarded to the cors module"]
**How to avoid:** Pass the same array to both. Today: `['http://localhost:5173', 'http://localhost:5174']`. Production origin must be added to **both** sites in the same commit when deploying.
**Warning signs:** Sockets work locally on 5173 but break when devs run a second Vite instance on 5174.

### Pitfall 7: OTP leaking via wrong room
**What goes wrong:** `request:resolved` payload includes `otp` (per the locked spec, on approval). If the emit accidentally targets `role:NGO` instead of `user:{ngo_id}`, every NGO sees every other NGO's OTP. Trust backbone broken.
**Why it happens:** Copy-paste from the `donation:available` emit (which legitimately targets `role:NGO`).
**How to avoid:** Manual review checklist: any emit that includes `otp` in payload MUST target `user:{ngo_id}` only. Add a code-review note in the PR template (or, post-P11, a unit test). See Threat Model below.
**Warning signs:** During manual test with two NGO accounts, the wrong NGO's UI shows an OTP after the right NGO is approved.

### Pitfall 8: `is_verified=false` user gets a working socket
**What goes wrong:** REST routes are guarded by `requireRole(...)` which only checks role, not `is_verified`. If admin verification is also a hard gate for sockets (CLAUDE.md L77 says "don't bypass `is_verified`"), a verified-pending user could subscribe to `role:NGO` and see live donations before being verified.
**Why it happens:** The locked auth design says reuse JWT verify; JWT doesn't carry `is_verified`.
**How to avoid:** In the `io.use()` middleware, after `jwt.verify`, run a quick `pool.query('SELECT is_verified FROM users WHERE id=$1', [decoded.id])` and reject if false. ⚠️ Adds a DB hit per connection; acceptable for current scale (single NGO/donor count). See Open Question #2.
**Warning signs:** A pending-verification user logs in and starts seeing donations on their NGO dashboard.

---

## Code Examples

Verified patterns from official sources, adapted to AnnSparsh.

### Server: complete `server/socket.js` (new file)
```javascript
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

module.exports = function buildSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const r = await pool.query('SELECT is_verified FROM users WHERE id = $1', [decoded.id]);
            if (!r.rows.length || !r.rows[0].is_verified) return next(new Error('Not verified'));
            socket.user = decoded;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.id}`);
        socket.join(`role:${socket.user.role}`);
    });

    return io;
};
```
[Sources: socket.io/docs/v4/server-initialization, socket.io/docs/v4/middlewares, socket.io/docs/v4/rooms]

### Server: emit on donation create — patch to `server/routes/donation.routes.js`
```javascript
// Replace L11-L21 inside the try block:
const result = await pool.query(
    `INSERT INTO donations (donor_id, food_type, quantity, address, best_before, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.user.id, food_type, quantity, address, best_before, notes || null]
);
const donation = result.rows[0];
req.app.get('io').to('role:NGO').emit('donation:available', { donation });
res.status(201).json(donation);
```

### Client: extend `src/socket.js`
```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
    auth: (cb) => cb({ token: localStorage.getItem('token') || '' }),
    withCredentials: true,
});

socket.on('connect_error', (err) => {
    if (err.message === 'Invalid token' || err.message === 'No token') {
        // Token rotated or missing — let the next REST 401 handle the redirect
    }
});

export default socket;
```

### Client: dashboard wiring (Donor)
```javascript
// Inside DonorDashboard component, alongside the existing fetchData useEffect at L60-66
import socket from '../socket';

useEffect(() => {
    const onIncoming = ({ request, donation }) => {
        setRequests(prev => [{ ...request, food_type: donation.food_type, quantity: donation.quantity, address: donation.address }, ...prev]);
        toast.info(`New request from ${request.ngo_name || 'an NGO'}`);
    };
    const onCollected = ({ request }) => {
        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, otp_verified: true } : r));
        setDonations(prev => prev.map(d => d.id === request.donation_id ? { ...d, status: 'COLLECTED' } : d));
        toast.success('Pickup confirmed');
    };
    const onConnect = () => fetchData();

    socket.on('request:incoming', onIncoming);
    socket.on('pickup:collected', onCollected);
    socket.on('connect', onConnect);

    return () => {
        socket.off('request:incoming', onIncoming);
        socket.off('pickup:collected', onCollected);
        socket.off('connect', onConnect);
    };
}, [fetchData]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `socket.on('reconnect', ...)` directly on socket | `socket.io.on('reconnect', ...)` on the Manager | v3.0 (2020) | Socket-level `reconnect` event was removed; use `connect` (which fires for both initial and reconnect) or Manager-level events. [CITED: socket.io migrating-from-2-x-to-3-0] |
| Object `auth: { token }` re-assigned in connect handler | Function `auth: (cb) => cb({ token })` | v3.0+ | Function form is re-evaluated each handshake → reconnects always send fresh token. [CITED: socket.io/docs/v4/client-options/] |
| Pass token in querystring `io({ query: { token } })` | `io({ auth: { token } })` | v3.0 | Auth payload, not URL query string → not in access logs. Existing client code already uses `auth`. ✓ |

**Deprecated/outdated:**
- `socket.id` is **NOT stable across reconnects** in v4. Don't key React state by `socket.id`; reconnect will give a new id. [CITED: socket.io/docs/v4/client-socket-instance/]
- `transports: ['websocket']` (current `src/socket.js:6`) skips long-polling fallback. Acceptable for modern browsers but means corp-firewall users with WS blocked cannot connect. v1 acceptable; revisit if pilot has connectivity issues.

---

## Validation Architecture

### Test Framework
| Property | Value |
|---|---|
| Framework | **None installed.** Test framework introduction is P12 per CLAUDE.md L60. |
| Config file | none — see Wave 0 (deferred to P12) |
| Quick run command | `npm run lint` (frontend ESLint only); no server lint script |
| Full suite command | none |
| Phase 8 verification mode | **Manual smoke test, scripted, two-browser** |

Per the project's no-tests-yet stance, P8 ships with a **scripted manual smoke test plan** (executable in ~10 minutes). The same scenarios become integration tests in P12.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Manual Steps | Future Automated Sketch |
|---|---|---|---|---|
| REQ-08 | Donor creates donation → NGO sees it within 2s | manual two-browser | Browser A logged in as Donor on `/donor-dashboard`; Browser B logged in as NGO on `/ngo-dashboard`. In A, submit `POST /api/donations`. Time from submit to NGO list update < 2s. | `supertest` + `socket.io-client` test harness: spin up server, connect 2 sockets with 2 JWTs, POST donation, assert NGO socket fires `donation:available` within 2000ms. |
| REQ-08 | NGO requests pickup → Donor sees incoming request within 2s | manual two-browser | NGO browser clicks "Request Food" on a donation. Donor browser's "Incoming Requests" section shows new entry < 2s without reload. | Connect 2 sockets, POST request, assert Donor socket receives `request:incoming` within 2000ms. |
| REQ-08 | Donor approves request → NGO sees status change within 2s | manual two-browser | Donor clicks "Approve" on incoming request. NGO browser's "My Requests" status flips PENDING→APPROVED < 2s. | POST approve, assert NGO socket receives `request:resolved` with `status: 'APPROVED'`. |
| REQ-08 | NGO assigns volunteer (OTP issued) → Donor sees OTP-pending UI within 2s | manual two-browser | NGO submits volunteer form. Donor's UI shows "Volunteer En Route" + OTP input field < 2s. | (Open Question #1 settles event name) |
| REQ-08 | Donor verifies OTP → both browsers flip to COLLECTED within 2s | manual two-browser | Donor enters correct OTP, clicks Confirm. Both Donor and NGO browsers update donation status to COLLECTED < 2s. | POST verify-otp, assert both sockets receive `pickup:collected`. |
| REQ-08 | Reconnect tolerance: client recovers after 30s offline | manual single-browser | Open NGO dashboard, kill the server's WebSocket via DevTools Network throttling → Offline for 30s → back Online. Confirm: socket reconnects automatically; on reconnect, `fetchData()` runs and any state changes that occurred while offline are now reflected. | Spawn socket, force `socket.disconnect()` then `socket.connect()`, assert `connect` event fires and refetch is triggered. |
| REQ-08 | Listener cleanup: no duplicate toasts in StrictMode dev | manual single-browser | In dev mode, navigate to NGO dashboard, then back to home, then back to dashboard. Trigger one server event from another browser. Confirm exactly one toast fires (not two, not three). | Mount/unmount component in test, fire event, count toast invocations. |
| REQ-08 | Auth rejection: invalid token → no connection | manual single-browser | Manually edit `localStorage.token` to garbage. Open dashboard. Confirm DevTools shows `connect_error: Invalid token` and no events flow. | Connect with bad token, expect `connect_error` event with message 'Invalid token'. |

### Sampling Rate
- **Per task commit:** developer runs the affected scenario once in the dev environment.
- **Per phase merge:** all 8 manual scenarios above must pass on the same machine in one session, recorded in the PR description.
- **Phase gate:** `/gsd-verify-work` confirms all 8 manual scenarios checked; reviewer spot-checks the 2-second target with a stopwatch on at least 2 events.

### Wave 0 Gaps
*(P12 will add a real test harness; this phase intentionally has none.)*
- [ ] No test framework installed → **DEFERRED to P12** (per CLAUDE.md L60).
- [ ] No CI to run sockets → **DEFERRED to P12**.
- [ ] Manual test plan must be written into the phase's PLAN.md as an explicit Wave-N task (not optional, not "if time").

*(If no gaps for an automated path: not applicable here — the project intentionally ships P8 without tests, with a documented manual gate.)*

---

## Threat Model

> Required by output spec. Covers auth, OTP leakage, room scoping, reconnect abuse.

### Authentication & Authorization

| Threat | STRIDE | Vector | Mitigation in this phase |
|---|---|---|---|
| Anonymous socket connection | Spoofing | Client connects with empty/missing `auth.token` | `io.use()` rejects via `next(new Error('No token'))`; client sees `connect_error`. [Pattern 2 above] |
| Forged JWT | Spoofing | Attacker mints a JWT with arbitrary `id` and `role` | `jwt.verify(token, JWT_SECRET)` throws — same protection as REST. Reuses `JWT_SECRET` from `.env`. ⚠️ Risk noted in `.planning/STATE.md:55` — `JWT_SECRET` is per-developer-env, must be rotated for prod. |
| Expired JWT | Spoofing | Long-lived tab; token expired during session | `jwt.verify` throws → `connect_error: Invalid token` → client's REST 401 interceptor (`src/api.js:27`) on the next API call clears localStorage and redirects. Socket stays disconnected until next login. ✓ |
| `is_verified=false` user gets sockets | Elevation of Privilege | Pending user with valid JWT subscribes to `role:NGO` | Optional DB check in `io.use()` (see Pitfall 8). ⚠️ See Open Question #2 — adds 1 query per connection. |
| Privilege escalation via JWT tampering | Tampering | Modify JWT to flip `role: DONOR` → `role: NGO` | HMAC signature check inside `jwt.verify` — same as REST. ✓ |

### OTP Leakage (the trust-backbone risk)

| Threat | STRIDE | Vector | Mitigation in this phase |
|---|---|---|---|
| Wrong NGO sees another NGO's OTP | Information Disclosure | `request:resolved` accidentally emitted to `role:NGO` instead of `user:{ngo_id}` | Code review checklist: every emit with `otp` in payload MUST target `user:{ngo_id}`. Pitfall 7 above. |
| OTP visible in browser dev tools to a user it shouldn't reach | Information Disclosure | A donor with admin-impersonated JWT subscribes to wrong room | Room membership is decided by `io.on('connection')` from `socket.user.id` and `socket.user.role` only — clients cannot self-join other rooms (no `client → server` events in this phase, locked decision). ✓ |
| OTP intercepted on the wire | Information Disclosure | Plain WebSocket on a hostile network | Production deploy MUST use `wss://` (TLS). Tracked in [.planning/STATE.md:55] alongside JWT_SECRET. Local dev uses `ws://` — acceptable for dev only. |
| OTP persisted in browser history/localStorage | Information Disclosure | Page screenshot or browser sync | Existing risk from REST (`requests.otp` field is already returned in `/api/requests/mine`). Sockets don't worsen this. Out of scope for P8. |
| OTP sent in `pickup:collected` event after verify | Information Disclosure | Server-side mistake | The `pickup:collected` payload shape is `{ donation, request }` — `request` already has `otp_verified: true` and the OTP value is no longer secret post-verify. Acceptable. |

### Room Scoping

| Threat | STRIDE | Vector | Mitigation |
|---|---|---|---|
| User A subscribes to `user:{B_id}` room | Information Disclosure | Client tries `socket.emit('join', 'user:42')` | **No client-emitted events handled in this phase** (locked decision: "sockets are listen-only from client side"). Server never reads `socket.emit` from client. Rooms are joined exclusively in the server-side `connection` handler. ✓ |
| Cross-tenant fanout | Information Disclosure | Future feature adds region scoping but forgets to update room name | Out of scope for P8 — no tenancy yet. Note for P24 (multi-city) and P11 (model layer): room-name conventions must be revisited then. |
| Donor in `role:NGO` room (mistaken role) | Information Disclosure | Bug in JWT issuance gives a donor `role: NGO` | Existing risk from REST role guards; same trust source. Sockets don't worsen this. JWT issuance is in `auth.routes.js:26,47` and uses DB role. ✓ |

### Reconnect Abuse / DoS

| Threat | STRIDE | Vector | Mitigation in this phase | Future phase |
|---|---|---|---|---|
| Reconnect storm from a single client | DoS | Misbehaving client disconnects/reconnects in a tight loop | Default `reconnectionDelay: 1000` + `randomizationFactor: 0.5` provides server-side breathing room. Each connect re-runs `jwt.verify` (cheap) + 1 DB query (`is_verified`). For pilot scale (single NGO, low-double-digit users), acceptable. | P11 adds rate-limiting at Express level; consider applying same at `io.use()` (e.g., `socket.io-rate-limiter`). |
| Many clients per user | Resource exhaustion | Same JWT reused across many tabs/devices | Each tab opens its own socket → multiplies broadcast cost linearly. Pilot scale: not a concern. | Track in P26 (scale phase). |
| Server emit blocking the event loop | DoS | Synchronous heavy work in the emit path | All emits are simple `io.to(...).emit(...)` calls — fire-and-forget, non-blocking. ✓ |
| Socket-only DoS (HTTP polling spam) | DoS | Attacker hammers `/socket.io/?EIO=4&transport=polling` | Engine.IO has its own connection limits, but no rate-limit at this layer. | Add `socket.io` rate-limit middleware in P11 alongside Express rate-limit. |
| Fingerprinting via `connect_error` messages | Information Disclosure | Different errors for "no token" vs "invalid token" leak existence info | Generic mitigation: collapse all auth errors to `next(new Error('Authentication failed'))`. Optional for v1. |

### CORS / Origin

| Threat | STRIDE | Vector | Mitigation |
|---|---|---|---|
| Cross-site socket connection from malicious page | Spoofing/Info Disclosure | A user has annsparsh.com open and visits attacker.com which opens a socket to api.annsparsh.com using the user's cookie/token | Two layers: (1) Engine.IO `cors.origin` allowlist enforced at handshake (server/socket.js); (2) JWT in `auth` is in `localStorage` (not cookies) — attacker.com can't read it due to same-origin policy. ✓ |
| Wildcard `cors.origin: '*'` with `credentials: true` | Misconfiguration → spoofing | Copy-paste from a tutorial | Locked decision pins origin list. Code review must reject `'*'`. |
| Allowlist drift between Express and Socket.IO | Misconfiguration → connection failure (operational risk, not security) | Add prod origin to one site, forget the other | Pitfall 6. |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | Server runtime | Assumed ✓ (existing project runs) | ≥ 10.2.0 needed; project uses modern Node | — |
| `socket.io` (server lib) | New emit infrastructure | ✗ NOT INSTALLED | — | Must be added: `cd server && npm install socket.io@4.8.3` |
| `socket.io-client` | Frontend wiring | ✓ | 4.8.3 (`package.json:19`) | — |
| `jsonwebtoken` | Handshake auth | ✓ | 9.0.2 (`server/package.json:14`) | — |
| `pg` (Postgres pool) | `is_verified` lookup in `io.use()` | ✓ | 8.11.3 (`server/package.json:15`) | — |
| `react-toastify` | Surface incoming events | ✓ | 11.0.5 (`package.json:18`) | — |
| Two browsers (or two profiles) | Manual two-browser smoke test | Assumed ✓ | — | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none.
**Action required:** install `socket.io@4.8.3` server-side as the first task of Wave 0.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | The `is_verified` gate also applies to socket connections (CLAUDE.md L77 says "don't bypass" but is silent on whether it's a REST-only check or a session-wide check). | Threat Model, Pattern 2 | If the user wants `is_verified` to be REST-only, the extra DB query in `io.use()` is wasted work but harmless. If they want it enforced, omitting it is a security gap. Plan should ask. → Open Question #2 |
| A2 | `request:resolved` is the right event name to emit *twice* — once on approve (no OTP), once on volunteer-assign (with OTP). The locked spec says "OTP included on approval only" but the code path generates OTP at volunteer-assign, not approval. | Pattern 3 | If the user wants a separate event name, the planner needs explicit guidance. → Open Question #1 |
| A3 | The `pickup:collected` payload should include the `donor_id` so the route handler can target both rooms. The current SQL at `request.routes.js:142-148` doesn't return `donor_id`. | Pattern 3 | Mechanical fix — adjust the SELECT. No design risk, but task must be explicit in PLAN. |
| A4 | Default Socket.IO 4.x reconnection settings (1s initial delay, 5s max, 0.5 jitter) meet the "within 2 seconds" REQ-08 budget *during normal operation* (not during a reconnect — REQ-08 doesn't specify reconnect latency). | Validation Architecture | If REQ-08 is interpreted as "even immediately after a reconnect, events must arrive in 2s", that's not what reconnection delay implies. Recommend planner clarify with user. |

---

## Open Questions

### 1. OTP-issue event timing — same name or new name?
- **What we know:** Locked event names: `donation:available`, `request:incoming`, `request:resolved`, `pickup:collected`. The spec says `request:resolved` carries `{ request, status, otp? }` "on approval only".
- **What's unclear:** OTP is generated at NGO volunteer-assignment (`request.routes.js:124`), NOT at donor approval. Two reasonable readings:
  - (a) Emit `request:resolved` at approval (no OTP) AND emit `request:resolved` again at volunteer-assign (with OTP). Same event name, two distinct payloads, NGO dashboard merges by request id.
  - (b) The locked spec is incomplete; introduce a fifth event like `volunteer:assigned` or `otp:issued`. **This contradicts the lock.**
- **Recommendation:** Go with (a) — keeps the locked four-event surface, payload disambiguates by presence of `otp`. Surface this in PLAN.md and ask user to confirm before implementation.

### 2. Should `io.use()` enforce `is_verified=true`?
- **What we know:** REST routes enforce role only, not `is_verified`. CLAUDE.md L77 says "don't bypass the `is_verified` check on users — admin verification is a hard gate by design".
- **What's unclear:** Is REST relying on the UI to gate unverified users from reaching donor/NGO dashboards (verified by `VerificationPending.jsx` component)? If so, sockets connect from those dashboards and would never connect for unverified users in practice — the DB check in `io.use()` is defense in depth.
- **Recommendation:** Enforce it in `io.use()` (one extra query per connection). For pilot scale, the cost is negligible. The phase ships a more secure default.

### 3. Multiple-tab same-user behavior
- **What we know:** Same user on two tabs → two sockets in the same `user:{id}` room → both receive every event for that user. State updates de-dupe naturally because both tabs run their own merge.
- **What's unclear:** Whether the user wants per-tab or per-user notification semantics (e.g., toasts firing on every tab can be noisy).
- **Recommendation:** Acceptable for v1. Track for backlog if pilot users complain.

### 4. Should the on-reconnect refetch be debounced?
- **What we know:** Locked decision: "On reconnect, client triggers a one-shot REST refresh of dashboard data". `connect` handler calls `fetchData()`.
- **What's unclear:** A flapping connection (5 reconnects in 30s) → 5 REST refetches. Likely fine, but worth noting.
- **Recommendation:** Ship without debounce; revisit if pilot logs show >2 refetches/min/user.

---

## Sources

### Primary (HIGH confidence)
- **Socket.IO 4.x official docs** — verified by direct fetch this session:
  - https://socket.io/docs/v4/server-initialization/ — `http.createServer(app)` + `new Server(httpServer, {...})` pattern
  - https://socket.io/docs/v4/server-options/ — CORS option syntax
  - https://socket.io/docs/v4/middlewares/ — `io.use((socket, next) => ...)` auth pattern
  - https://socket.io/docs/v4/rooms/ — `socket.join` + `io.to(room).to(room).emit(...)` union semantics
  - https://socket.io/docs/v4/client-socket-instance/ — `connect` event fires on initial AND reconnect
  - https://socket.io/docs/v4/client-options/ — reconnection defaults, `auth` function form
  - https://socket.io/how-to/use-with-react — listener cleanup pattern with `socket.off(event, handler)`
- **npm registry** (verified this session): `socket.io@4.8.3` published 2025-12-23, deps verified, `socket.io-client@4.8.3` matches.
- **CLAUDE.md, CONTEXT.md, REQUIREMENTS.md, STATE.md, codebase-map.md** in this repo — all read this session.
- **server/app.js, server/middleware/auth.js, server/routes/{donation,request,auth}.routes.js, src/socket.js, src/api.js, src/components/{Donor,NGO}Dashboard.jsx, vite.config.js, package.json files** — all read this session.

### Secondary (MEDIUM confidence)
- https://github.com/socketio/socket.io/discussions/3902 — confirms `auth` as function is re-evaluated per handshake; alternative is `socket.io.on('reconnect_attempt', () => socket.auth.token = ...)`.
- https://dev.to/pockit_tools/why-is-useeffect-running-twice-the-complete-guide-to-react-19-strict-mode-and-effect-cleanup-1n60 — React 19 StrictMode dev double-invoke confirmed.
- https://vite.dev/config/server-options — Vite proxy `ws: true` requirement.

### Tertiary (LOW confidence)
- *None used in this research — every claim is backed by either Context7-equivalent official docs or a direct file read.*

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — exact version match verified against npm registry, transitive deps listed, both libraries actively maintained (4.8.3 released 4 months ago).
- Architecture: **HIGH** — every pattern cited from official Socket.IO 4.x docs read this session; integration points cited by file:line in this repo.
- Pitfalls: **HIGH** — each pitfall mapped to a specific file:line in this codebase and a specific Socket.IO doc page.
- Threat model: **MEDIUM-HIGH** — STRIDE coverage complete for the locked surface; some operational mitigations (rate-limit) deferred to P11 by design.
- Validation: **MEDIUM** — manual smoke plan is concrete and runnable; automated sketches are intentionally not implemented per CLAUDE.md L60.

**Research date:** 2026-04-26
**Valid until:** 2026-05-26 (30 days — Socket.IO 4.x is stable; refresh if a 4.9.x or 5.x lands before phase execution)
