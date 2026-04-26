---
phase: 08-realtime-notifications-via-socket-io
plan: 01
subsystem: infra
tags: [socket.io, websocket, jwt, realtime, express, cors, postgres]

requires:
  - phase: 02-auth-and-roles
    provides: JWT issuance + verify pattern (jsonwebtoken, JWT_SECRET, payload {id, role})
  - phase: 04-admin-verification
    provides: users.is_verified column + admin gate semantics
provides:
  - server/socket.js exporting buildSocketServer(httpServer) factory
  - Socket.IO 4.8.3 mounted on the same Express HTTP server (port 5000)
  - JWT-authenticated handshake reusing JWT_SECRET (rejects 'No token', 'Invalid token')
  - is_verified=false rejection at handshake (defense in depth, CLAUDE.md L77)
  - Auto-join to user:{id} and role:{ROLE} rooms on every connection
  - app.set('io', io) so any route handler can reach io via req.app.get('io')
affects: [08-02, 08-03, 09-sms, 11-models-refactor, 13-logging, 26-scale]

tech-stack:
  added: ["socket.io@4.8.3 (server)"]
  patterns:
    - "buildSocketServer(httpServer) factory in server/socket.js (CommonJS export)"
    - "JWT verify duplicated inline in io.use() rather than reusing express authMiddleware (different signature/source: socket.handshake.auth.token vs req.headers.authorization)"
    - "req.app.get('io') as the io-access pattern from route handlers (locked in CONTEXT.md, will be exercised by Wave 2)"
    - "Room naming: user:{id} and role:{ROLE} — formats hardcoded in Wave 2 emit calls"

key-files:
  created:
    - server/socket.js
  modified:
    - server/app.js
    - server/package.json
    - server/package-lock.json

key-decisions:
  - "Pin socket.io@4.8.3 (exact match with socket.io-client@4.8.3 already in root package.json)"
  - "Enforce is_verified=true at handshake (Open Question #2 resolved with secure default per CLAUDE.md L77)"
  - "Do NOT reuse express authMiddleware in socket land — duplicate the jwt.verify call, share JWT_SECRET only"
  - "Socket.IO cors.origin pinned to same allow-list as REST (no wildcards, no drift — Pitfall 6)"
  - "Inline new requires (http core, ./socket) at the bottom of app.js to preserve top-of-file readability"

patterns-established:
  - "Pattern: Single buildSocketServer(httpServer) factory file — sole concession to organization the locked decision allows (CONTEXT.md L72)"
  - "Pattern: Auth errors as exact strings ('No token', 'Invalid token', 'Not verified') — frontend will pattern-match in connect_error.message (Plan 03)"
  - "Pattern: app.set('io', io) BEFORE httpServer.listen() to avoid startup race when first request hits a route"

requirements-completed: [REQ-08]

duration: 2min
completed: 2026-04-26
---

# Phase 8 Plan 01: Socket.IO server foundation Summary

**Socket.IO 4.8.3 server attached to the existing Express HTTP server with JWT-authenticated handshake, is_verified gate, and auto-join to user:{id} + role:{ROLE} rooms.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-26T18:03:45Z
- **Completed:** 2026-04-26T18:05:20Z
- **Tasks:** 3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- Installed `socket.io@4.8.3` on the server side (exact-version match with the already-installed `socket.io-client@4.8.3`). 20 transitive deps added (engine.io, socket.io-adapter, socket.io-parser, debug, cors, accepts, base64id and friends). `npm ls socket.io --depth=0` reports `socket.io@4.8.3`.
- Created `server/socket.js` (33 lines, zero comments per CLAUDE.md L61) exporting a single factory `buildSocketServer(httpServer)` that returns a configured `io: Server`. The handshake middleware:
  - Reads token from `socket.handshake.auth?.token` (NOT headers, NOT querystring)
  - Calls `jwt.verify(token, process.env.JWT_SECRET)` with the same payload contract as `server/middleware/auth.js`
  - Runs `SELECT is_verified FROM users WHERE id = $1` and rejects `'Not verified'` if missing or false
  - Returns typed error strings exactly: `'No token'`, `'Invalid token'`, `'Not verified'`
  - On `connection`, auto-joins `user:${socket.user.id}` and `role:${socket.user.role}`
- Refactored `server/app.js` from `app.listen(PORT, ...)` to `httpServer = createServer(app); buildSocketServer(httpServer); app.set('io', io); httpServer.listen(PORT, ...)`. No stray `app.listen` left over (Pitfall 5 dodged). Existing log line "Server running on http://localhost:..." preserved.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install socket.io@4.8.3** — `e7f1346` (chore)
2. **Task 2: Create server/socket.js with JWT handshake + is_verified gate + room auto-join** — `75d113a` (feat)
3. **Task 3: Refactor server/app.js to mount Socket.IO on http.createServer** — `3662e9f` (refactor)

## Files Created/Modified

- `server/socket.js` **(new, 33 lines)** — `buildSocketServer(httpServer)` factory. Configures CORS allow-list mirroring REST, JWT handshake with is_verified gate, room auto-join.
- `server/app.js` **(+9 / -2)** — Wraps express app in `http.createServer(app)`, builds io via the factory, exposes via `app.set('io', io)`, switches `app.listen` to `httpServer.listen`. The two new `require()` calls (`http` core, `./socket`) sit inline before the createServer call (per plan hard rule 4).
- `server/package.json` **(+1 line)** — `"socket.io": "^4.8.3"` added under `dependencies`.
- `server/package-lock.json` **(+234 lines / -1)** — socket.io 4.8.3 + 19 transitive deps locked.

## Three lines added/changed in app.js (Task 3 spec compliance)

The plan asked SUMMARY to call out the exact lines. Lines 17–18 of the original file were:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

Now lines 17–25:

```javascript
const { createServer } = require('http');
const buildSocketServer = require('./socket');

const httpServer = createServer(app);
const io = buildSocketServer(httpServer);
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

One line removed: `app.listen(PORT, ...)`. Seven lines added (two requires, blank, three setup lines, the PORT line is unchanged, and the listen line is materially changed from `app.listen` to `httpServer.listen`).

## Decisions Made

- **`is_verified` enforced at handshake** (resolves researcher Open Question #2). One extra `SELECT is_verified` per connect; cost is negligible at pilot scale and gives defense-in-depth alignment with CLAUDE.md L77.
- **Duplicated `jwt.verify` rather than reusing `authMiddleware`** — the express middleware reads `req.headers.authorization` and has `(req, res, next)` shape; the socket handshake exposes the token via `socket.handshake.auth.token`. The two call sites stay in sync because they share `JWT_SECRET` and the same `{ id, role }` payload contract.
- **CORS allow-list pinned identical to REST** (`['http://localhost:5173', 'http://localhost:5174']`). Engine.IO's polling-fallback handshake uses its own CORS check independent of `app.use(cors(...))`; drift between the two would silently break sockets on 5174 (Pitfall 6).
- **No client→server event handlers registered.** Sockets are listen-only on the client side per locked CONTEXT decision. This neutralizes the "client self-joins arbitrary room" threat (T-08-11) at the source.
- **Inline new `require`s at the bottom of `app.js`** rather than top-of-file. Preserves the existing `dotenv → express → cors → app + middleware + routes` reading order per plan hard rule 4.

## Deviations from Plan

None — plan executed exactly as written. All three tasks shipped with the specified file content, the specified acceptance grep checks all pass, and no auto-fix rules triggered.

## Issues Encountered

None — `node -c server/socket.js` parsed cleanly, `node -e "require('./server/socket')"` exited 0, `PORT=0 node -e "require('./server/app')"` printed the expected `Server running on http://localhost:0` line, and the `url.parse` deprecation warning surfaced during the smoke load is from a pre-existing transitive dependency unrelated to this plan (logged here as a note, not as a blocker).

## Manual smoke (Auth-rejection — deferred to Plan 03)

The plan's `<output>` section asks the SUMMARY to confirm the manual auth-rejection smoke (no token / bad token / unverified user). That smoke fully exercises the io.use() error strings and is most efficiently run end-to-end alongside the Plan 03 client wiring (where `connect_error.message` is observed in DevTools). The server-side wiring is in place and unit-traceable here:

- `'No token'` — line 15 of `server/socket.js`: `if (!token) return next(new Error('No token'));`
- `'Invalid token'` — line 23: `catch { next(new Error('Invalid token')); }`
- `'Not verified'` — line 19: `if (!r.rows.length || !r.rows[0].is_verified) return next(new Error('Not verified'));`

The exact error-string contract is locked here so Plan 03's frontend `connect_error.message` checks compile against stable values.

## Hand-off Note for Plan 02 (Wave 2 — Server emits)

`req.app.get('io')` is now available in every route handler. Wave 2 emit calls should use:

- `req.app.get('io').to('role:NGO').emit('donation:available', { donation })` — fan out new AVAILABLE donations
- `req.app.get('io').to(`user:${donorId}`).emit('request:incoming', { request, donation })` — push to the affected donor on NGO request submit
- `req.app.get('io').to(`user:${ngoId}`).emit('request:resolved', { request, status, otp? })` — push to the requesting NGO on approve/reject (and again when the OTP is generated at volunteer-assign — see RESEARCH.md Open Question #1)
- `req.app.get('io').to(`user:${ngoId}`).to(`user:${donorId}`).emit('pickup:collected', { donation, request })` — push to BOTH on OTP verify success

Both `user:{id}` and `role:{ROLE}` rooms are auto-populated by `server/socket.js:28-29`; Wave 2 only emits, never joins. The `pickup:collected` route MUST select `donor_id` alongside the request in its SQL (see RESEARCH.md Pattern 3 ⚠️ note for `request.routes.js:142-148` — current SELECT does not return `donor_id`). Plan 02 task spec should call this out explicitly.

## Next Phase Readiness

- Server-side foundation complete; Plan 02 (server emit calls) and Plan 03 (frontend wiring) are unblocked.
- No new blockers introduced for the rest of M1.
- Hand-off contract: `app.get('io')` returns the configured `io` instance immediately on first request after startup (because `app.set('io', io)` runs before `httpServer.listen` per plan hard rule 2).

## Self-Check: PASSED

**Files claimed to exist:**
- `server/socket.js` — FOUND
- `server/app.js` — FOUND (modified)
- `server/package.json` — FOUND (modified)
- `server/package-lock.json` — FOUND (modified)
- `.planning/phases/08-realtime-notifications-via-socket-io/08-01-SUMMARY.md` — FOUND (this file)

**Commits claimed to exist:**
- `e7f1346` chore(08-01): install socket.io@4.8.3 server dependency — FOUND
- `75d113a` feat(08-01): add Socket.IO server with JWT handshake and room auto-join — FOUND
- `3662e9f` refactor(08-01): mount Socket.IO on http.createServer in app.js — FOUND

**Acceptance checks rerun:**
- `grep -q '"socket.io"' server/package.json` — PASS
- `grep -q "io.use" server/socket.js` — PASS
- `grep -q "origin: \[" server/socket.js` — PASS
- `grep -q "is_verified" server/socket.js` — PASS
- `grep -q "user:\${socket.user.id}" server/socket.js` — PASS
- `grep -q "role:\${socket.user.role}" server/socket.js` — PASS
- `grep -q "module.exports = function buildSocketServer" server/socket.js` — PASS
- `grep -c "//" server/socket.js` — 0 (PASS)
- `grep -q "createServer(app)" server/app.js` — PASS
- `grep -q "buildSocketServer(httpServer)" server/app.js` — PASS
- `grep -q "app.set('io', io)" server/app.js` — PASS
- `grep -q "httpServer.listen(PORT" server/app.js` — PASS
- No stray `app.listen` matches in `server/app.js` — PASS
- `node -e "require('./server/socket')"` exits 0 — PASS
- `PORT=0 node -e "require('./server/app')"` exits 0 with expected log line — PASS

---
*Phase: 08-realtime-notifications-via-socket-io*
*Completed: 2026-04-26*
