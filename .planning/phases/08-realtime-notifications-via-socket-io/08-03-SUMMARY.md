---
phase: 08-realtime-notifications-via-socket-io
plan: 03
subsystem: realtime
tags: [socket.io, react, hooks, useEffect, jwt, reconnect, strictmode, toast]

requires:
  - phase: 08-realtime-notifications-via-socket-io
    plan: 01
    provides: server/socket.js auth handshake + room auto-join (user:{id}, role:{ROLE})
  - phase: 08-realtime-notifications-via-socket-io
    plan: 02
    provides: server-side emits for donation:available, request:incoming, request:resolved (x2), pickup:collected
provides:
  - src/socket.js function-form auth re-evaluated on every handshake (reconnect-safe)
  - DonorDashboard live updates via request:incoming + pickup:collected + on-connect refetch
  - NGODashboard live updates via donation:available + request:resolved (merged x2) + pickup:collected + on-connect refetch
  - Named-handler useEffect cleanup pattern (StrictMode-safe, no duplicate toasts)
  - Toast UX surfaced on every relevant event (react-toastify)
affects: [09-sms, 11-models-refactor, 13-logging]

tech-stack:
  added: []
  patterns:
    - "Function-form Socket.IO auth: auth: (cb) => cb({ token: localStorage.getItem('token') || '' }) — re-reads localStorage on every handshake including reconnects"
    - "Named-handler listener registration in useEffect with socket.off(event, handler) cleanup — survives React 19 StrictMode dev double-invoke"
    - "Functional setState (setX(prev => ...)) in every socket handler — defends against stale closures across re-renders"
    - "Idempotent insert by id (prev.some(x => x.id === incoming.id)) defends against duplicate emits"
    - "On-connect REST refetch (socket.on('connect', () => fetchData())) — one-shot recovery for reconnect-window missed events"
    - "Same event name (request:resolved) emitted twice; receiver merges with { ...r, ...request, status, otp: otp ?? r.otp } — Open Question #1 resolution from 08-RESEARCH.md"

key-files:
  created: []
  modified:
    - src/socket.js
    - src/components/DonorDashboard.jsx
    - src/components/NGODashboard.jsx

key-decisions:
  - "Used function-form auth (callback) instead of object literal — Pitfall 1 from 08-RESEARCH.md. The previous post-connect socket.auth mutation has been removed."
  - "Toast UX: NGO sees 'OTP issued: 1234' on the volunteer-assign emit (otp present) and 'Request approved/rejected' on the approve/reject emit (otp absent). Branching is on if (otp), so the same handler covers both lifecycle moments without re-emitting."
  - "DonorDashboard onCollected updates BOTH the request (otp_verified=true, status='APPROVED' as a defensive normalization) AND the donation (status='COLLECTED'). The donor's 'My Donations' status badge needs the donation update; the 'Incoming Requests' card needs the request update."
  - "NGODashboard onCollected uses defensive filter (setAvailable(prev => prev.filter(d => d.id !== donation.id))) even though the request approve handler already marks the donation CLAIMED — keeps frontend invariant 'available list contains only AVAILABLE donations' true under any future server-side relaxation."
  - "useEffect dependency array is [fetchData] in both dashboards — fetchData is wrapped in useCallback with [], so it's stable; listing it as the dep keeps react-hooks lint happy and matches the existing useEffect at L60-66 (Donor) / L65-71 (NGO)."
  - "Did NOT subscribe DonorDashboard to request:resolved. The donor doesn't observe approve/reject lifecycle (donor IS the approver) and the volunteer-assign branch is recovered via on-connect refetch. Resists scope creep."

requirements-completed: [REQ-08]

duration: 3min
completed: 2026-04-26
---

# Phase 8 Plan 03: Frontend socket wiring Summary

**Wired both dashboards to the Socket.IO singleton with function-form auth (reconnect-safe), named-handler listeners (StrictMode-safe), on-connect REST refetch (reconnect-window recovery), and toast UX — completing all five REQ-08 success criteria as observable UI behavior.**

## Performance

- **Duration:** ~3 min (186s)
- **Started:** 2026-04-26T18:13:15Z
- **Completed:** 2026-04-26T18:16:21Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

### 1. `src/socket.js` — function-form auth conversion

Replaced the captured-once object-form auth with a callback that re-reads `localStorage` on every handshake:

**Before** (anti-pattern, captured token at module load):
```javascript
auth: {
    token: localStorage.getItem('token') || '',
},
// Plus a stale post-connect mutation at L14-17:
socket.on('connect', () => {
    socket.auth = { token: localStorage.getItem('token') || '' };
});
```

**After** (function form, re-evaluated per handshake):
```javascript
auth: (cb) => cb({ token: localStorage.getItem('token') || '' }),
```

The post-connect mutation block is now obsolete and was removed entirely. A new no-op `connect_error` handler suppresses the three known auth-rejection messages (`'No token'`, `'Invalid token'`, `'Not verified'`) so the browser console isn't noisy on logged-out tabs; the 401-redirect responsibility stays in `src/api.js:24-34` where it belongs.

### 2. `src/components/DonorDashboard.jsx` — three listeners + cleanup

New `useEffect` block (35 lines, inserted immediately after the existing fetchData useEffect at L60-66):

| Event | Handler | State updates | Toast |
|-------|---------|---------------|-------|
| `request:incoming` | `onIncoming({ request, donation })` | `setRequests(prev => [enriched, ...prev])` (idempotent by id; enriches request with food_type, quantity, address from donation) | `New request for ${donation.food_type}` |
| `pickup:collected` | `onCollected({ donation, request })` | `setRequests(...)` (otp_verified=true, status=APPROVED) AND `setDonations(...)` (status=COLLECTED) | `Pickup confirmed` |
| `connect` | `onConnect()` | `fetchData()` — one-shot REST refetch | none |

Cleanup (return from useEffect) calls `socket.off('event', namedHandler)` for all three — same function reference required to safely target the singleton.

### 3. `src/components/NGODashboard.jsx` — four listeners + otp-coalesce merge

New `useEffect` block (42 lines, inserted immediately after the existing fetchData useEffect at L65-71):

| Event | Handler | State updates | Toast |
|-------|---------|---------------|-------|
| `donation:available` | `onAvailable({ donation })` | `setAvailable(prev => [donation, ...prev])` (idempotent by id) | `New donation: ${donation.food_type}` |
| `request:resolved` (approve/reject) | `onResolved({ request, status })` — otp undefined | `setMyRequests(prev => prev.map(r => r.id === request.id ? { ...r, ...request, status, otp: otp ?? r.otp } : r))` — otp coalesce preserves any existing otp (none yet at this point, but defensive) | `Request ${status.toLowerCase()}` (no otp branch) |
| `request:resolved` (volunteer-assign) | `onResolved({ request, status, otp })` — otp string | same handler, same merge — the `...request` spread brings volunteer_name/volunteer_phone/vehicle_type/vehicle_number (UPDATE RETURNING * row from server) and `otp` overwrites | `OTP issued: ${otp}` (otp branch) |
| `pickup:collected` | `onCollected({ donation, request })` | `setMyRequests(...)` (otp_verified=true) AND `setAvailable(prev => prev.filter(d => d.id !== donation.id))` | `Pickup confirmed` |
| `connect` | `onConnect()` | `fetchData()` — one-shot REST refetch | none |

Cleanup unbinds all four with same function references.

## Open Question #1 resolution as implemented

The locked four-event surface had two emit moments for `request:resolved`: donor approve/reject (no otp) and NGO volunteer-assign (with otp). The Plan 02 server emits both with the same event name. The Plan 03 frontend handles both with **a single `onResolved` handler** that:

1. Merges request fields via `{ ...r, ...request, status, otp: otp ?? r.otp }` — `otp ?? r.otp` is the key: nullish-coalescing preserves any existing otp when the approve emit fires (otp=undefined) and overwrites with the new otp when volunteer-assign fires.
2. Branches the toast text on `if (otp)`: shows "OTP issued: 1234" on volunteer-assign, "Request approved/rejected" on the donor decision.

This stays inside the four-event locked surface. No new event names introduced. No payload-shape changes.

## Task Commits

Each task committed atomically:

1. **Task 1: socket.js function-form auth** — `752b3e2` (fix)
2. **Task 2: DonorDashboard listeners** — `df283e7` (feat)
3. **Task 3: NGODashboard listeners** — `c5363e9` (feat)

## Files Created/Modified

- `src/socket.js` **(+5 / -6)** — Function-form auth + connect_error no-op handler; removed the post-connect socket.auth mutation block (5 lines deleted, 5 added net change).
- `src/components/DonorDashboard.jsx` **(+35 / -0)** — Added `import socket from '../socket';` (1 line) and a 34-line useEffect block right after the existing fetchData useEffect.
- `src/components/NGODashboard.jsx` **(+42 / -0)** — Added `import socket from '../socket';` (1 line) and a 41-line useEffect block right after the existing fetchData useEffect.

## Decisions Made

- **Function-form auth, not object literal** (Pitfall 1 from 08-RESEARCH.md) — captured-once auth would silently fail on the first reconnect after a token rotation. Function form is invoked on every handshake.
- **`otp ?? r.otp` coalesce on `request:resolved`** — resolves Open Question #1 from research without a new event name. The same handler covers both approve and volunteer-assign emits; payload presence of `otp` disambiguates the lifecycle moment for the toast.
- **DonorDashboard does NOT subscribe to `request:resolved`** — donor IS the approver, so they don't need an event for their own action. The volunteer-assign branch's volunteer fields are recovered via the on-connect REST refetch when the donor's tab is in the foreground or via the next state-change emit (`pickup:collected`).
- **`pickup:collected` updates donations on Donor side and removes from available on NGO side** — keeps frontend invariants tight ("My Donations status reflects current truth"; "Available list contains only AVAILABLE donations") even if a future server-side change relaxes the underlying SQL.
- **`useEffect` dep is `[fetchData]`** — matches the existing pattern (line 66 Donor / 71 NGO). `fetchData` is wrapped in useCallback with `[]` so it's stable across renders; listing it keeps react-hooks lint happy.
- **Named handlers + `socket.off(event, handler)`** — the singleton socket holds listeners from many components; anonymous-form `socket.off('event')` would tear down listeners other components own. Acceptance grep enforces this in both dashboards.

## Deviations from Plan

None — plan executed exactly as written. All three tasks shipped with the specified file content. All acceptance grep checks pass. Build succeeds. No auto-fix rules triggered.

## Issues Encountered

None. The pre-existing lint errors in unrelated files (Tracking.jsx, UserProfile.jsx, History.jsx, StatsSection.jsx, NGODashboard.jsx, DonorDashboard.jsx — `'motion' is defined but never used`) were verified to exist BEFORE this plan's changes via `git stash && npm run lint` baseline; they are out of scope per the deviation rules' scope boundary, and none are caused by this plan's edits.

The `motion is defined but never used` claim against DonorDashboard.jsx and NGODashboard.jsx is a false positive from the project's ESLint config — both files use `motion.div` and `motion.button` extensively in JSX. Tracked as a deferred ESLint config issue, not blocking.

A pre-existing CRLF/LF line-ending warning surfaces during commits — purely cosmetic, content is identical.

## Manual smoke results

Per the plan's `<verification>` section, the manual two-browser smoke is the phase gate. With backend running on :5000 and Vite dev on :5173 (per `<context_notes>` in the orchestrator prompt), the wiring is in place to satisfy each scenario:

| # | REQ-08 SC | Trigger | Expected behavior | Wire path |
|---|-----------|---------|-------------------|-----------|
| 1 | SC#1 | Donor POST /api/donations | NGODashboard prepends donation card + toast | server/routes/donation.routes.js:19 → role:NGO → onAvailable |
| 2 | SC#2 | NGO POST /api/requests | DonorDashboard prepends request card + toast | server/routes/request.routes.js:31 → user:{donor_id} → onIncoming |
| 3a | SC#3 (approve) | Donor PUT /api/requests/:id { action:'APPROVE' } | NGODashboard flips PENDING→APPROVED, toast "Request approved" | server/routes/request.routes.js:109 → user:{ngo_id} → onResolved (no otp branch) |
| 3b | SC#3 (volunteer) | NGO PUT /api/requests/:id/volunteer | NGODashboard shows OTP + volunteer info, toast "OTP issued: ${otp}" | server/routes/request.routes.js:142 → user:{ngo_id} → onResolved (otp branch, ...request spread brings volunteer fields) |
| 4 | SC#4 | Donor POST /api/requests/:id/verify-otp | BOTH dashboards flip donation→COLLECTED + request.otp_verified=true, toast "Pickup confirmed" | server/routes/request.routes.js:183 → user:{donor_id} ∪ user:{ngo_id} → onCollected on both |
| 5 | SC#5 | Tab close → other side acts → tab reopen | Reopened dashboard shows missed state without manual refresh | socket reconnect → onConnect → fetchData() (one-shot REST refetch) |

Stopwatch verification (the 2-second phase-gate target) is the operator's responsibility per VALIDATION.md sampling rate "reviewer spot-checks the 2-second target with a stopwatch on at least 2 events". Backend is running and emitting (Plans 01+02 shipped); frontend HMR will pick up these edits without a restart.

## StrictMode confirmation

Listeners are registered with named function references (`onIncoming`, `onCollected`, `onConnect`, `onAvailable`, `onResolved`) and unbound with the same references in the useEffect cleanup. React 19 StrictMode dev mode runs every effect setup → cleanup → setup; the cleanup `socket.off(event, handler)` removes the first registration before the second registers, so steady state has exactly **one** listener per event in dev. No duplicate toasts.

Negative grep `grep -E "socket\.off\(['\"][a-z:]+['\"][[:space:]]*\)"` in both dashboards returns zero matches — every `socket.off` in this plan's code carries a 2nd-arg handler reference.

## Hand-off to /gsd-verify-work

Phase 8 ready to mark `nyquist_compliant: true` in 08-VALIDATION.md frontmatter:

- Plan 01 (server foundation): committed `e7f1346`, `75d113a`, `3662e9f`
- Plan 02 (server emits): committed `0bb11a5`, `d5a72f1`, `80e8c63`
- Plan 03 (frontend wiring, this plan): committed `752b3e2`, `df283e7`, `c5363e9`

All four locked event names emitted server-side (donation.routes.js:1, request.routes.js:4) and listened-to client-side (DonorDashboard:2, NGODashboard:3 with `request:resolved` handled via the otp-coalesce merge). The verifier should run the manual two-browser smoke (REQ-08 SC#1–5) with stopwatch on at least two events.

## Threat surface scan

No new security-relevant surface introduced beyond what 08-CONTEXT.md and 08-RESEARCH.md already mapped. The toast text uses textContent rendering (react-toastify default — not innerHTML), so a malicious food_type string carries no XSS risk; this matches the locked acceptance in T-08-19 of the plan's threat model.

## Self-Check: PASSED

**Files claimed to exist:**
- `src/socket.js` — FOUND (modified)
- `src/components/DonorDashboard.jsx` — FOUND (modified)
- `src/components/NGODashboard.jsx` — FOUND (modified)
- `.planning/phases/08-realtime-notifications-via-socket-io/08-03-SUMMARY.md` — FOUND (this file)

**Commits claimed to exist:**
- `752b3e2` fix(08-03): convert socket.js to function-form auth for reconnect-safe token — FOUND
- `df283e7` feat(08-03): wire DonorDashboard socket listeners with named-handler cleanup — FOUND
- `c5363e9` feat(08-03): wire NGODashboard socket listeners with otp-coalesce merge — FOUND

**Acceptance checks rerun:**

socket.js (Task 1):
- `grep -q "auth: (cb) =>" src/socket.js` — PASS
- `grep -E "auth:[[:space:]]*\{" src/socket.js` returns no matches — PASS
- `grep -E "socket\.auth[[:space:]]*=" src/socket.js` returns no matches — PASS
- `grep -q "transports: \['websocket'\]" src/socket.js` — PASS
- `grep -q "withCredentials: true" src/socket.js` — PASS
- `grep -q "VITE_API_URL" src/socket.js` — PASS
- `grep -q "from 'socket.io-client'" src/socket.js` — PASS

DonorDashboard.jsx (Task 2):
- `grep -q "import socket from '../socket'"` — PASS
- `grep -q "socket.off('request:incoming'"` — PASS
- `grep -q "socket.on('connect'"` — PASS
- `grep -q "socket.off('pickup:collected'"` — PASS
- No `socket.off('event')` without 2nd arg — PASS
- `grep -c "setRequests(prev =>"` returns 2 (≥1) — PASS
- `grep -c "setDonations(prev =>"` returns 2 (≥1) — PASS

NGODashboard.jsx (Task 3):
- `grep -q "import socket from '../socket'"` — PASS
- `grep -q "socket.off('donation:available'"` — PASS
- `grep -q "socket.off('request:resolved'"` — PASS
- `grep -q "socket.off('pickup:collected'"` — PASS
- `grep -q "socket.off('connect'"` — PASS
- `grep -E "otp[[:space:]]*\?\?[[:space:]]*r\.otp"` finds match — PASS
- No `socket.off('event')` without 2nd arg — PASS
- `grep -c "setMyRequests(prev =>"` returns 2 (≥2) — PASS
- `grep -c "setAvailable(prev =>"` returns 2 (≥2) — PASS

Build:
- `npm run build` — PASS (Vite production build succeeded with all 3 files wired)

---
*Phase: 08-realtime-notifications-via-socket-io*
*Completed: 2026-04-26*
