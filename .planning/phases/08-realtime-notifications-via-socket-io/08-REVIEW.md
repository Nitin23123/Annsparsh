---
phase: 08
slug: realtime-notifications-via-socket-io
status: clean
reviewed: 2026-04-26
findings: 4
blockers: 0
warnings: 0
suggestions: 4
files_reviewed: 8
files_reviewed_list:
  - server/socket.js
  - server/app.js
  - server/routes/donation.routes.js
  - server/routes/request.routes.js
  - server/package.json
  - src/socket.js
  - src/components/DonorDashboard.jsx
  - src/components/NGODashboard.jsx
---

# Phase 8 — Code Review

## Summary

Phase 8 ships a clean, well-scoped Socket.IO integration that satisfies every locked decision and dodges every mapped pitfall in 08-RESEARCH.md. The hard mitigation against OTP leakage (T-08-04) holds: zero `request:resolved` emits target `role:NGO`. Auth handshake order, CORS parity, function-form auth, named-handler cleanup, dual-room emit on pickup, and the otp-coalesce merge are all implemented correctly. No bugs, security issues, or warnings worth blocking on. Four suggestions captured below for future hardening.

## Findings

### BLOCKERS

None.

### WARNINGS

None.

### SUGGESTIONS

#### SU-01: DB / connection errors in `io.use()` are masked as `'Invalid token'`

**File:** `server/socket.js:13-25`
**Issue:** The `try { ... } catch { next(new Error('Invalid token')); }` block wraps both `jwt.verify(...)` (line 17) and the `pool.query('SELECT is_verified ...')` call (line 18). If Postgres is down or the query throws for any non-auth reason (connection reset, statement timeout), the client receives `connect_error: 'Invalid token'`. This conflates infrastructure failure with auth failure, complicating debugging and operator alerting in P13.
**Fix:** Narrow the try/catch to only the JWT decode, and let the DB query throw its own typed error:
```javascript
io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next(new Error('Invalid token'));
    }
    try {
        const r = await pool.query('SELECT is_verified FROM users WHERE id = $1', [decoded.id]);
        if (!r.rows.length || !r.rows[0].is_verified) return next(new Error('Not verified'));
        socket.user = decoded;
        next();
    } catch {
        next(new Error('Server error'));
    }
});
```
Defer to P13 (logging) — non-blocking for v1.

#### SU-02: `transports: ['websocket']` skips long-polling fallback

**File:** `src/socket.js:6`
**Issue:** Forcing the WebSocket-only transport means corporate-firewall users with WS blocked cannot connect at all (no graceful degradation to polling). Acceptable for the modern-browser pilot per RESEARCH.md "State of the Art" note, but worth flagging if the pilot ever sees connectivity complaints.
**Fix:** Drop the `transports` override (Socket.IO defaults to `['polling', 'websocket']` with auto-upgrade) once production deploys to a context with possible WS-blocking proxies. No code change needed for v1.

#### SU-03: Production origin not yet in either CORS allow-list

**File:** `server/socket.js:8` and `server/app.js:7`
**Issue:** Both CORS allow-lists are pinned identically to `['http://localhost:5173', 'http://localhost:5174']`, which correctly avoids drift (Pitfall 6). However, when a production origin is added during deploy, it MUST be added to **both** sites in the same commit — otherwise REST works on prod and sockets break, or vice versa.
**Fix:** Track in deploy checklist (P26). Consider extracting the allow-list to a single `const ALLOWED_ORIGINS = [...]` shared from `server/config/cors.js` so future drift is impossible. Out of scope for P8.

#### SU-04: Late-arriving `request:resolved` could overwrite `otp_verified=true`

**File:** `src/components/NGODashboard.jsx:82-92`
**Issue:** The `onResolved` handler merges via `{ ...r, ...request, status, otp: otp ?? r.otp }`. If a stale `request:resolved` (from approve) arrives AFTER `pickup:collected` (e.g., due to network reordering during a reconnect-window replay), the spread `...request` would inject the server's pre-collection `otp_verified: false` over the local `otp_verified: true`, briefly showing the wrong UI state until the next refetch. In normal monotonic flow this can't happen (approve precedes verify-otp), but reconnect-replay is the explicit recovery mechanism here.
**Fix:** Defensive merge that never regresses `otp_verified`:
```javascript
const onResolved = ({ request, status, otp }) => {
    setMyRequests(prev => prev.map(r => {
        if (r.id !== request.id) return r;
        return {
            ...r,
            ...request,
            status,
            otp: otp ?? r.otp,
            otp_verified: r.otp_verified || request.otp_verified || false,
        };
    }));
    if (otp) toast.success(`OTP issued: ${otp}`);
    else toast.info(`Request ${status.toLowerCase()}`);
};
```
Low likelihood; primarily robustness against future flow changes. The on-connect REST refetch (`onConnect`) recovers truth either way.

## Verdict

**clean** — Zero blockers, zero warnings. Phase 8 implementation matches the locked decisions in 08-CONTEXT.md exactly, all eight pitfalls in 08-RESEARCH.md are correctly avoided, and the OTP-leakage hard mitigation (T-08-04) holds. Suggestions are forward-looking hardening items, not gating issues.

---

*Reviewed: 2026-04-26*
*Reviewer: Claude (gsd-code-reviewer)*
*Depth: standard*
