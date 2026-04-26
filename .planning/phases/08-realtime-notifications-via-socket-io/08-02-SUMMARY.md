---
phase: 08-realtime-notifications-via-socket-io
plan: 02
subsystem: realtime
tags: [socket.io, emit, rooms, otp, jwt, security]

requires:
  - phase: 08-realtime-notifications-via-socket-io
    plan: 01
    provides: app.set('io', io) + auto-joined user:{id} and role:{ROLE} rooms
provides:
  - donation:available emit on POST /api/donations (role:NGO room)
  - request:incoming emit on POST /api/requests (user:{donor_id})
  - request:resolved emit on PUT /api/requests/:id approve/reject (user:{ngo_id}, NO otp)
  - request:resolved emit on PUT /api/requests/:id/volunteer (user:{ngo_id}, WITH otp)
  - pickup:collected emit on POST /api/requests/:id/verify-otp (BOTH user:{donor_id} AND user:{ngo_id})
  - verify-otp SELECT projection now includes d.donor_id + donation columns to support dual-room fan-out
affects: [08-03, 09-sms, 11-models-refactor, 13-logging]

tech-stack:
  added: []
  patterns:
    - "Inline emit immediately after successful pool.query (CONTEXT.md locked decision; no event bus)"
    - "req.app.get('io').to(room).emit(event, payload) — one-room pattern"
    - "req.app.get('io').to(roomA).to(roomB).emit(event, payload) — union pattern (each socket receives once)"
    - "Same event name (request:resolved) emitted twice across the lifecycle; payload disambiguated by presence of otp (Open Question #1 resolution from RESEARCH.md)"
    - "Per-user room (user:{id}) is mandatory for any payload that may carry an OTP — never role:NGO (Threat T-08-04 / Pitfall 7)"

key-files:
  created: []
  modified:
    - server/routes/donation.routes.js
    - server/routes/request.routes.js

key-decisions:
  - "Resolved Open Question #1 by emitting request:resolved twice with the same locked event name: once at donor approve/reject (no otp), once at NGO volunteer-assign (with otp). Frontend Plan 03 merges with `otp ?? r.otp`."
  - "Added donor_id, food_type, quantity, address, best_before, donation_status to the verify-otp SELECT so the pickup:collected emit can construct a fully-populated donation payload without a follow-up REST fetch on the receiver side."
  - "Used the dual-room union form io.to(a).to(b).emit(...) for pickup:collected — guarantees each socket receives the event exactly once even if a future user is in both rooms."
  - "Did NOT add a third emit at volunteer-assign for the donor — the donor's existing on-reconnect REST refetch (Plan 03) covers that, and the locked event surface is four events."

patterns-established:
  - "Pattern: emit after the LAST mutating pool.query in the handler — never between two updates that produce a partial state."
  - "Pattern: derive payload values from a captured row variable (donation, newRequest, updated, request) — do not call result.rows[0] twice inline."
  - "Pattern: any emit whose payload includes (or could include) otp targets a per-user room only. Code-review checklist for the rest of the project."

requirements-completed: [REQ-08]

duration: 2.25min
completed: 2026-04-26
---

# Phase 8 Plan 02: Server-side socket emits Summary

**Wired all four locked Socket.IO emit sites (five emit calls — request:resolved fires twice) inline in the existing route handlers, with strict per-user room targeting to prevent OTP leakage (Threat T-08-04).**

## Performance

- **Duration:** ~2.25 min (135s)
- **Started:** 2026-04-26T18:08:19Z
- **Completed:** 2026-04-26T18:10:34Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- **Five emit sites wired across two files**, each immediately after the successful `pool.query` that produces the state change:

| # | Event | File | Line | Room target | Payload |
|---|-------|------|------|-------------|---------|
| 1 | `donation:available` | server/routes/donation.routes.js | 19 | `role:NGO` | `{ donation }` |
| 2 | `request:incoming` | server/routes/request.routes.js | 31 | `user:${donation.rows[0].donor_id}` | `{ request, donation }` |
| 3 | `request:resolved` (approve/reject) | server/routes/request.routes.js | 109 | `user:${request.ngo_id}` | `{ request, status }` (NO otp) |
| 4 | `request:resolved` (volunteer-assign) | server/routes/request.routes.js | 142 | `user:${updated.ngo_id}` | `{ request, status, otp }` |
| 5 | `pickup:collected` | server/routes/request.routes.js | 183 | `user:${request.donor_id}` ∪ `user:${request.ngo_id}` (dual-room) | `{ donation, request }` |

- **Verify-OTP SELECT projection extended** (server/routes/request.routes.js:159) — added `d.donor_id, d.food_type, d.quantity, d.address, d.best_before, d.status AS donation_status` to the projection. Previously the query selected `r.*` only, leaving the handler with no access to `donor_id` to target the donor's room. The new projection makes the dual-room emit possible AND lets the payload carry the full donation row so receivers don't need a follow-up REST fetch to render the COLLECTED card.
- **Open Question #1 resolved** by emitting `request:resolved` twice with the locked event name. The first emit (donor approve/reject) carries `{ request, status }` without `otp`. The second emit (NGO volunteer-assign, where the OTP is generated) carries `{ request, status, otp }`. Frontend Plan 03 merges via `otp ?? r.otp` — already documented in 08-RESEARCH.md.
- **Threat T-08-04 / Pitfall 7 mitigated and verified** — every `request:resolved` emit targets a per-user `user:${ngo_id}` room. Negative grep `to(['\"]role:NGO['\"])\.emit(['\"]request:resolved` returns **0 matches** in `server/routes/request.routes.js`. OTP cannot leak to a multi-user broadcast room.

## Task Commits

Each task committed atomically:

1. **Task 1: donation:available + request:incoming emits** — `0bb11a5` (feat)
2. **Task 2: two request:resolved emits (approve/reject + volunteer-assign with OTP)** — `d5a72f1` (feat)
3. **Task 3: verify-otp SELECT donor_id projection + pickup:collected dual-room emit** — `80e8c63` (feat)

## Files Created/Modified

- `server/routes/donation.routes.js` **(+3 / -1)** — POST `/` handler now captures `const donation = result.rows[0]`, emits `donation:available` to `role:NGO`, then returns the same `donation` in the 201 response. No other handlers in the file emit (the four GET handlers, PUT `/:id/status`, DELETE `/:id` are untouched).
- `server/routes/request.routes.js` **(+38 / -4)** — four handlers modified:
  - POST `/`: capture `newRequest`, emit `request:incoming` to `user:${donor_id}` with `{ request: newRequest, donation: donation.rows[0] }`, return `newRequest` in 201.
  - PUT `/:id` (donor approve/reject): emit `request:resolved` to `user:${request.ngo_id}` with `{ request: { ...request, status: newStatus }, status: newStatus }` between the IF block and the response.
  - PUT `/:id/volunteer` (NGO volunteer-assign): capture `const updated = result.rows[0]`, emit `request:resolved` to `user:${updated.ngo_id}` with `{ request: updated, status: updated.status, otp: updated.otp }`, return `updated`.
  - POST `/:id/verify-otp`: SELECT projection extended with `d.donor_id, d.food_type, d.quantity, d.address, d.best_before, d.status AS donation_status`; obsolete `// Mark OTP verified, donation as COLLECTED` comment removed; after both UPDATEs, emit `pickup:collected` to the union of `user:${request.donor_id}` and `user:${request.ngo_id}` with `{ donation: collectedDonation, request: collectedRequest }`.

## Decisions Made

- **Same event name `request:resolved` emitted twice** (Open Question #1 resolution): once at approve/reject (no otp), once at volunteer-assign (with otp). Stays inside the four-event locked surface; payload-shape disambiguation is already what Plan 03's listener handles (`otp ?? r.otp` merge).
- **Verify-OTP SELECT now ships full donation columns**, not just `donor_id`. Marginal cost; large simplification for the receiver-side payload.
- **Dual-room form `io.to(a).to(b).emit(...)`** for `pickup:collected` — Socket.IO guarantees union semantics (each socket gets the event exactly once even if it's in both rooms), per docs cited in 08-RESEARCH.md Pattern 3.
- **No comment retained** in the verify-otp handler (the existing `// Mark OTP verified, donation as COLLECTED` line was self-evident from the SQL — CLAUDE.md L61 prohibits comments unless the *why* is non-obvious).
- **No third emit added** at volunteer-assign for the donor. Donor sees "volunteer en route" via the next state-change event (`pickup:collected`) plus the on-reconnect REST refetch wired in Plan 03. The locked event surface is four events; resisting scope creep.

## Deviations from Plan

None — plan executed exactly as written. All three tasks shipped with the specified file content. All acceptance grep checks pass. No auto-fix rules triggered.

## Issues Encountered

None. Both files parse cleanly (`node --check` passes for both). Pre-existing `git status` warnings about LF→CRLF line-ending normalization are cosmetic — the file content on disk and in git is identical modulo line endings.

One minor process note: during Task 1 verification, a Node `-e` regex check using backticks in a bash heredoc reported a false-negative due to backtick escaping in the Windows shell. Direct `grep` with the same pattern confirmed both emits were correctly wired. Switched to `grep` for the remaining verifications.

## Security Checklist (T-08-04 / Pitfall 7)

- [x] `grep -E "to\(['\"]role:NGO['\"]\)\.emit\(['\"]request:resolved"` returns **0 matches** in `server/routes/request.routes.js` — verified post-Task-3.
- [x] Both `request:resolved` emits target `user:${ngo_id}` per-user rooms (lines 109 and 142).
- [x] The volunteer-assign emit (the only one carrying `otp`) targets `user:${updated.ngo_id}` only.
- [x] `pickup:collected` payload contains the request row with `otp_verified: true`; the OTP is no longer secret post-verify (per RESEARCH.md threat model T-08-06 — accepted risk).
- [x] No `io.emit('event', ...)` global broadcast anywhere — every emit is room-scoped.

## Final emit-count contract

After Plan 02:
- `server/routes/donation.routes.js`: exactly **1** `req.app.get('io')` call.
- `server/routes/request.routes.js`: exactly **4** `req.app.get('io')` calls (1 incoming + 2 resolved + 1 collected).
- Total locked-event-name occurrences: 1 × `donation:available`, 1 × `request:incoming`, 2 × `request:resolved`, 1 × `pickup:collected`.

## Hand-off Note for Plan 03 (Wave 3 — Frontend wiring)

The server now emits all four locked event names with payloads exactly as described in `08-CONTEXT.md`:

- `donation:available` → `{ donation }` to `role:NGO`. **NGODashboard** listener: prepend `donation` to the available list, fire toast.
- `request:incoming` → `{ request, donation }` to `user:{donor_id}`. **DonorDashboard** listener: prepend `request` (with food_type/quantity/address spread from `donation`) to the incoming-requests list, fire toast.
- `request:resolved` (no otp) → `{ request, status }` to `user:{ngo_id}`. **NGODashboard** listener: merge by `request.id`, set `status`, leave `otp` untouched.
- `request:resolved` (with otp) → `{ request, status, otp }` to `user:{ngo_id}`. **NGODashboard** listener: same handler, merge `otp ?? r.otp` so the previous emit's missing-otp doesn't clobber. The locked spec promised `otp?` — Plan 03 must use the optional-chaining merge.
- `pickup:collected` → `{ donation, request }` to BOTH `user:{donor_id}` and `user:{ngo_id}`. **Both dashboards** listen: donor flips the donation to COLLECTED in its `donations` list and marks `otp_verified=true` on the request; NGO marks `otp_verified=true` on its `myRequests` entry; both fire success toasts.

Plan 03 only needs to wire `socket.on(name, handler)` + `useEffect` cleanup. No new event types, no new payload shapes. The contract is frozen.

## Next Phase Readiness

- Server-side emit wiring complete; Plan 03 (frontend listeners + reconnect-refetch + StrictMode-safe cleanup) is unblocked.
- No new blockers introduced for the rest of M1.
- Hand-off contract: every state change in donation.routes.js POST and request.routes.js (POST, PUT /:id, PUT /:id/volunteer, POST /:id/verify-otp) emits the corresponding locked event with the locked payload shape, scoped to the minimum-necessary room(s).

## Self-Check: PASSED

**Files claimed to exist:**
- `server/routes/donation.routes.js` — FOUND (modified)
- `server/routes/request.routes.js` — FOUND (modified)
- `.planning/phases/08-realtime-notifications-via-socket-io/08-02-SUMMARY.md` — FOUND (this file)

**Commits claimed to exist:**
- `0bb11a5` feat(08-02): emit donation:available and request:incoming after INSERTs — FOUND
- `d5a72f1` feat(08-02): emit request:resolved on approve/reject and volunteer-assign — FOUND
- `80e8c63` feat(08-02): add donor_id to verify-otp SELECT and emit pickup:collected to both rooms — FOUND

**Acceptance checks rerun:**
- `grep -c "req.app.get('io')" server/routes/donation.routes.js` → 1 (PASS)
- `grep -c "req.app.get('io')" server/routes/request.routes.js` → 4 (PASS)
- `grep -c "donation:available" server/routes/donation.routes.js` → 1 (PASS)
- `grep -c "request:incoming" server/routes/request.routes.js` → 1 (PASS)
- `grep -c "request:resolved" server/routes/request.routes.js` → 2 (PASS)
- `grep -c "pickup:collected" server/routes/request.routes.js` → 1 (PASS)
- Negative grep T-08-04 `to(['"]role:NGO['"]).emit(['"]request:resolved` in request.routes.js → 0 matches (PASS — security)
- `grep -c "// Mark OTP verified" server/routes/request.routes.js` → 0 (PASS — obsolete comment removed)
- `node --check server/routes/donation.routes.js` exits 0 (PASS)
- `node --check server/routes/request.routes.js` exits 0 (PASS)
- SELECT projection at line 159 of request.routes.js includes `d.donor_id` (PASS)
- Dual-room chain at request.routes.js:184-185 in correct `donor_id` → `ngo_id` order (PASS)

---
*Phase: 08-realtime-notifications-via-socket-io*
*Completed: 2026-04-26*
