---
phase: 08
slug: realtime-notifications-via-socket-io
status: human_needed
verified: 2026-04-26T19:05:00Z
must_haves_passed: 5/5
req_ids_covered: [REQ-08]
human_verification:
  - test: "SC#1 stopwatch — Donor creates donation; NGO sees card within 2s"
    expected: "NGODashboard prepends new donation card + toast 'New donation: ${food_type}' in <2s of donor 201 response"
    why_human: "2-second wall-clock budget can only be observed with two live browsers and a stopwatch (per VALIDATION.md sampling rate)"
  - test: "SC#2 stopwatch — NGO submits request; Donor sees incoming card within 2s"
    expected: "DonorDashboard prepends incoming request card + toast 'New request for ${food_type}' in <2s"
    why_human: "Live two-browser observation; timing budget"
  - test: "SC#3 two-step — Donor approves; NGO sees APPROVED. NGO assigns volunteer; NGO sees OTP."
    expected: "First emit flips status PENDING→APPROVED with toast 'Request approved' in <2s. Second emit (volunteer-assign) shows OTP block + toast 'OTP issued: ${otp}' in <2s."
    why_human: "Two distinct lifecycle events, live observation required for both timing budgets"
  - test: "SC#4 — Donor verifies OTP; both dashboards flip to COLLECTED in <2s"
    expected: "Both browsers receive pickup:collected; donor's donation card shows COLLECTED, NGO's available list drops the donation, both fire 'Pickup confirmed' toast"
    why_human: "Dual-room fan-out — must verify both endpoints receive event exactly once each within 2s"
  - test: "SC#5 — Reconnect resilience: close tab, trigger event from other side, reopen tab"
    expected: "Reopened dashboard shows missed state without manual refresh (on-connect fetchData triggers REST refetch)"
    why_human: "Reconnect window timing (Socket.IO default 1-5s backoff) + state recovery requires live disconnect/reconnect cycle"
  - test: "StrictMode dev — single toast, not duplicate"
    expected: "In React 19 dev StrictMode, one server event produces exactly one toast (cleanup unbinds first registration before second registers)"
    why_human: "StrictMode behavior is dev-only and visible only when running the app; cannot be grep-verified"
  - test: "connect_error rejection paths"
    expected: "Connecting without token → connect_error.message='No token'. With tampered JWT → 'Invalid token'. With is_verified=false user → 'Not verified'."
    why_human: "Requires running server + crafting bad-token connections; auth string contract is wired correctly per code, but exact connect_error.message verification needs live socket"
---

# Phase 8: Realtime notifications via Socket.IO Verification Report

**Phase Goal:** Donors and NGOs see donation/request/OTP/collection state changes in real time without manual refresh.
**Verified:** 2026-04-26T19:05:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | NGO dashboard shows newly listed donations within 2s of donor creation, no refresh required | ✓ VERIFIED (code path; timing pending human) | Server emit at `server/routes/donation.routes.js:19` to `role:NGO` ; NGO sockets auto-join `role:NGO` at `server/socket.js:29`; `NGODashboard.jsx:102` subscribes to `donation:available` with idempotent prepend; toast fires |
| 2 | Donor dashboard shows new incoming requests within 2s of NGO submission | ✓ VERIFIED (code path) | Server emit at `server/routes/request.routes.js:31` to `user:${donation.rows[0].donor_id}`; `DonorDashboard.jsx:92` subscribes to `request:incoming`, enriches request row with food_type/quantity/address from donation payload, prepends idempotently |
| 3 | NGO sees OTP appear and request status flip to APPROVED in real time when donor approves | ✓ VERIFIED (code path) | Two emits: `request.routes.js:109` (approve, no otp) and `request.routes.js:142` (volunteer-assign, with otp), both targeting `user:${ngo_id}`. NGO listener at `NGODashboard.jsx:103` uses `otp ?? r.otp` merge (line 85) and branches toast on `if (otp)` (lines 87-91). Open Question #1 resolution implemented as designed. |
| 4 | Donor sees status flip to COLLECTED in real time when OTP is verified | ✓ VERIFIED (code path) | Dual-room emit at `request.routes.js:183-186` to `user:${donor_id}` AND `user:${ngo_id}`. DonorDashboard `onCollected` at `DonorDashboard.jsx:83-87` updates BOTH `requests` (otp_verified=true) and `donations` (status='COLLECTED'). NGODashboard mirror at `NGODashboard.jsx:93-97`. |
| 5 | Reconnection works — closing and reopening the tab restores the live feed | ✓ VERIFIED (code path) | `src/socket.js:8` function-form auth re-reads `localStorage.getItem('token')` on every handshake (Pitfall 1 mitigated). Both dashboards subscribe to `socket.on('connect', onConnect)` → `fetchData()` (DonorDashboard.jsx:88-90, 94; NGODashboard.jsx:98-100, 105). Default Socket.IO reconnection enabled. |

**Score:** 5/5 truths verified (code paths). Stopwatch timing for SC#1–4 and live reconnect cycle for SC#5 require human two-browser verification.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `server/socket.js` | buildSocketServer factory with io.use + room auto-join | ✓ VERIFIED | 33 lines, exports function arity 1; io.use validates JWT + queries `is_verified`; throws `'No token'`/`'Invalid token'`/`'Not verified'`; auto-joins `user:${socket.user.id}` and `role:${socket.user.role}` |
| `server/app.js` | http.createServer + buildSocketServer mount + httpServer.listen | ✓ VERIFIED | Line 17 `createServer`, line 18 `buildSocketServer`, line 22 `app.set('io', io)`, line 25 `httpServer.listen(PORT, ...)`. Zero `app.listen(` matches — Pitfall 5 dodged |
| `server/package.json` | socket.io@4.8.3 dependency | ✓ VERIFIED | Line 16: `"socket.io": "^4.8.3"` |
| `server/routes/donation.routes.js` | donation:available emit after INSERT | ✓ VERIFIED | Line 19: `req.app.get('io').to('role:NGO').emit('donation:available', { donation });` after INSERT (line 12-17) succeeds |
| `server/routes/request.routes.js` | request:incoming + 2x request:resolved + pickup:collected | ✓ VERIFIED | Total `req.app.get('io')` count = 4. `request:resolved` count = 2. `pickup:collected` count = 1. SELECT at line 159 projects `d.donor_id`. Dual-room chain at 184-185 |
| `src/socket.js` | function-form auth re-evaluated per handshake | ✓ VERIFIED | Line 8: `auth: (cb) => cb({ token: localStorage.getItem('token') || '' })`. Old object-form auth and post-`connect` mutation removed. `transports: ['websocket']`, `withCredentials: true` preserved |
| `src/components/DonorDashboard.jsx` | listeners for request:incoming + pickup:collected + connect with named-handler cleanup | ✓ VERIFIED | Import line 6, useEffect at 69-101 with `onIncoming`/`onCollected`/`onConnect` named handlers; all 3 `socket.off` calls use 2-arg form (lines 97-99) |
| `src/components/NGODashboard.jsx` | listeners for donation:available + request:resolved + pickup:collected + connect; otp coalesce | ✓ VERIFIED | Import line 6, useEffect at 74-113 with 4 named handlers; `otp ?? r.otp` merge at line 85; toast branches on `if (otp)` at lines 87-91; all 4 `socket.off` calls use 2-arg form (lines 108-111) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `server/app.js` | `server/socket.js` | `require('./socket') + buildSocketServer(httpServer)` | ✓ WIRED | Lines 18, 21 |
| `server/socket.js` | `server/config/db.js` | pool.query for is_verified lookup | ✓ WIRED | Line 18 |
| `server/app.js` | express app `io` slot | `app.set('io', io)` BEFORE `httpServer.listen` | ✓ WIRED | Line 22 (set), line 25 (listen) — correct order, no startup race |
| `donation.routes.js POST /` | `role:NGO` room | `req.app.get('io').to('role:NGO').emit('donation:available', { donation })` | ✓ WIRED | Line 19, after pool.query INSERT succeeds |
| `request.routes.js POST /` | `user:{donor_id}` room | `to(\`user:${donation.rows[0].donor_id}\`).emit('request:incoming', ...)` | ✓ WIRED | Line 31, payload `{ request: newRequest, donation: donation.rows[0] }` |
| `request.routes.js PUT /:id` | `user:{ngo_id}` room | `to(\`user:${request.ngo_id}\`).emit('request:resolved', { request, status })` no otp | ✓ WIRED | Line 109, after IF-APPROVE block, payload spreads new status |
| `request.routes.js PUT /:id/volunteer` | `user:{ngo_id}` room | `to(\`user:${updated.ngo_id}\`).emit('request:resolved', { request, status, otp })` | ✓ WIRED | Line 142, payload includes `otp: updated.otp` |
| `request.routes.js POST /:id/verify-otp` | `user:{donor_id}` AND `user:{ngo_id}` | dual-room `.to(a).to(b).emit('pickup:collected', ...)` | ✓ WIRED | Lines 183-186, after both UPDATEs succeed |
| `src/socket.js` | localStorage 'token' | function-form auth `(cb) => cb({ token: localStorage.getItem('token') || '' })` | ✓ WIRED | Line 8, re-evaluated on every handshake including reconnects |
| `DonorDashboard.jsx` | `src/socket.js` | `import socket from '../socket'` | ✓ WIRED | Line 6 |
| `DonorDashboard.jsx` | `fetchData` on reconnect | `socket.on('connect', onConnect)` where `onConnect` calls `fetchData()` | ✓ WIRED | Lines 88-90, 94 |
| `NGODashboard.jsx` | `src/socket.js` | `import socket from '../socket'` | ✓ WIRED | Line 6 |
| `NGODashboard.jsx` | `fetchData` on reconnect | `socket.on('connect', onConnect)` | ✓ WIRED | Lines 98-100, 105 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `DonorDashboard.requests` | `requests[]` | REST `fetchData()` (initial) + socket `request:incoming` (live) + `pickup:collected` (live) | Yes — backed by `requests` table INSERT in request.routes.js POST | ✓ FLOWING |
| `DonorDashboard.donations` | `donations[]` | REST `fetchData()` (initial) + socket `pickup:collected` (live) | Yes — backed by `donations` table | ✓ FLOWING |
| `NGODashboard.available` | `available[]` | REST `fetchData()` (initial) + socket `donation:available` (live) + `pickup:collected` removal (live) | Yes — backed by donations.routes.js GET /available query + INSERT emits | ✓ FLOWING |
| `NGODashboard.myRequests` | `myRequests[]` | REST `fetchData()` (initial) + socket `request:resolved` x2 + `pickup:collected` (live) | Yes — backed by requests table queries; otp coalesce preserves merge correctness | ✓ FLOWING |
| Socket emit payloads | `donation`/`request` rows | `INSERT/UPDATE ... RETURNING *` and JOIN SELECTs | Yes — payloads carry actual DB rows, not stubbed data | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `server/socket.js` parses and exports a 1-arity function | `node -e "const fn=require('./server/socket'); process.exit(typeof fn==='function' && fn.length===1 ? 0 : 1)"` | (per Plan 01 SUMMARY self-check: PASS) | ✓ PASS |
| `donation.routes.js` parses cleanly | `node --check server/routes/donation.routes.js` | (per Plan 02 SUMMARY self-check: PASS) | ✓ PASS |
| `request.routes.js` parses cleanly | `node --check server/routes/request.routes.js` | (per Plan 02 SUMMARY self-check: PASS) | ✓ PASS |
| Vite production build succeeds with all 3 frontend files | `npm run build` | (per Plan 03 SUMMARY self-check: PASS) | ✓ PASS |
| Live Socket.IO handshake with valid JWT establishes connection | n/a — requires running server + valid JWT | not run | ? SKIP (human) |
| Two-browser smoke for 2-second timing | n/a — requires two live browsers | not run | ? SKIP (human) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REQ-08 | 08-01, 08-02, 08-03 | State changes (donation create, request submit, approve/reject, OTP issue, pickup confirm) propagate to relevant connected clients within 2 seconds without manual refresh | ✓ SATISFIED (code paths) — timing budget pending human | All five state-change moments wire an emit + listener pair; on-connect refetch covers reconnect window. The 2-second budget is the only remaining gate and requires stopwatch verification. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | No TODO/FIXME/PLACEHOLDER markers, no empty handlers, no stub returns, no hardcoded empty arrays in user-facing state. All grep negatives pass. | — | None |
| `server/socket.js` | 16-24 | `try/catch` block wraps both `jwt.verify` and `pool.query` — DB failures surface as `'Invalid token'` (per 08-REVIEW SU-01) | ℹ️ Info | Future logging concern (P13). Not a goal-blocker for REQ-08; auth still rejects correctly. |
| `src/socket.js` | 6 | `transports: ['websocket']` skips polling fallback (per 08-REVIEW SU-02) | ℹ️ Info | Acceptable per RESEARCH.md state-of-the-art; flag if production sees firewall complaints. Not a P8 goal-blocker. |
| `src/components/NGODashboard.jsx` | 82-92 | Late-arriving `request:resolved` could spread `otp_verified=false` over local `true` (per 08-REVIEW SU-04) | ℹ️ Info | Low likelihood; on-connect refetch recovers. Not a P8 goal-blocker. |

### Security Checklist (T-08-04: OTP-leakage)

| Check | Result |
|-------|--------|
| `request:resolved` emits never target `role:NGO` | ✓ PASS — negative grep returns 0 matches in `server/routes/request.routes.js` |
| Both `request:resolved` emits target `user:${ngo_id}` per-user rooms | ✓ PASS — line 109 (`request.ngo_id`), line 142 (`updated.ngo_id`) |
| Volunteer-assign emit (the OTP-bearing one) targets per-user only | ✓ PASS — line 142 |
| `pickup:collected` post-verify OTP exposure scoped to donor + ngo only | ✓ PASS — dual-room union at lines 183-186 |
| No `io.emit(...)` global broadcast anywhere | ✓ PASS — every emit is room-scoped |

### Human Verification Required

The code paths for all 5 success criteria are wired correctly. The remaining verification is the **live timing budget** (REQ-08's 2-second clause) plus reconnect resilience and StrictMode behavior — none of which are observable through file-grep.

#### 1. SC#1 stopwatch — Donor creates donation; NGO sees card within 2s

**Test:** Open Browser A as Donor, Browser B as NGO. In A, fill donation form and submit. Start stopwatch on click.
**Expected:** NGODashboard in B prepends new donation card with toast "New donation: ${food_type}" in <2s.
**Why human:** 2-second wall-clock budget can only be observed with two live browsers and a stopwatch.

#### 2. SC#2 stopwatch — NGO submits request; Donor sees incoming card within 2s

**Test:** From B, click Request on a donation. Start stopwatch on click. Switch to A.
**Expected:** DonorDashboard in A prepends incoming request card with toast in <2s.
**Why human:** Live two-browser observation; timing budget.

#### 3. SC#3 two-step — Approve then volunteer-assign

**Test:** In A, approve. Confirm B flips PENDING→APPROVED in <2s with toast "Request approved". Then in B, fill volunteer form, submit. Confirm B shows OTP in <2s with toast "OTP issued: ${otp}".
**Expected:** Two distinct emits, two state flips, two toasts; both under 2s.
**Why human:** Live observation required for both timing budgets.

#### 4. SC#4 — Donor verifies OTP; both dashboards flip to COLLECTED in <2s

**Test:** In A, enter the OTP shown in B and confirm. Watch both browsers.
**Expected:** Both A and B flip donation/request to COLLECTED + "Pickup confirmed" toast in <2s. Each browser fires the toast exactly once (not twice).
**Why human:** Dual-room fan-out timing + at-most-once delivery on each socket.

#### 5. SC#5 — Reconnect resilience

**Test:** Close A's tab. From B, trigger another request on a different donation. Reopen A.
**Expected:** Reopened A shows the new request without manual refresh (on-connect `fetchData()` triggers REST recovery).
**Why human:** Reconnect window timing (Socket.IO default 1-5s backoff) + state recovery requires live disconnect/reconnect.

#### 6. StrictMode dev mode — single toast, not duplicate

**Test:** Run `npm run dev`. Trigger one server event (e.g., NGO submits a request from another browser).
**Expected:** Exactly one toast fires, not two. (Cleanup unbinds first registration before second registers in StrictMode.)
**Why human:** StrictMode double-invoke behavior is dev-only and visible only when running the app.

#### 7. connect_error rejection paths

**Test:** Open DevTools console. (a) Clear localStorage token, refresh — confirm `connect_error.message === 'No token'`. (b) Set localStorage token to a tampered value, refresh — confirm `'Invalid token'`. (c) Login as an `is_verified=false` user — confirm `'Not verified'`.
**Expected:** Three error strings exactly matching the contract Plan 03's frontend pattern-matches against.
**Why human:** Live socket connections + crafted bad tokens; auth string contract is wired correctly per code, but exact `connect_error.message` verification needs live socket.

### Gaps Summary

No gaps in code wiring. All five REQ-08 success criteria have correct code paths from emit-site to listener with proper room scoping, named-handler cleanup, on-connect REST refetch, and OTP-leakage mitigation (T-08-04).

The phase status is `human_needed` because the **2-second timing budget** in REQ-08's wording, the live reconnect cycle for SC#5, the StrictMode no-duplicate-toast guarantee, and the connect_error error-string contract all require live observation that no automated grep can verify. The implementation matches the locked decisions exactly; what remains is operator UAT.

Per VALIDATION.md sampling rate: "Before /gsd-verify-work: full manual smoke plan must pass" — the smoke plan is now this document's Human Verification section. Once the user runs the manual smoke and confirms the 2-second timing on at least two events (per VALIDATION.md phase gate), the phase is complete and `nyquist_compliant: true` can be set in 08-VALIDATION.md.

---

*Verified: 2026-04-26T19:05:00Z*
*Verifier: Claude (gsd-verifier)*
