---
phase: 8
slug: realtime-notifications-via-socket-io
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed yet (P12 introduces Jest + Vitest) |
| **Config file** | none — automated tests deferred to P12 by repo convention |
| **Quick run command** | `node -e "require('./server/socket.js')"` (smoke check) |
| **Full suite command** | manual two-browser smoke plan (see Manual-Only Verifications) |
| **Estimated runtime** | manual: ~5 minutes; smoke require: ~1 second |

> **Note:** This phase intentionally relies on a manual smoke plan because the project has no test framework yet (per CLAUDE.md: "No tests yet — adding them is **P12**. Don't block features waiting for them"). All verification points are still grep-checkable file existence/content checks plus a documented manual two-browser plan. Phase 12 will retroactively add automated coverage.

---

## Sampling Rate

- **After every task commit:** Run quick require/import smoke (server + frontend bundles must not throw on import).
- **After every plan wave:** Re-run the manual smoke plan for any wave that touches a state-change emit site or dashboard listener.
- **Before `/gsd-verify-work`:** Full manual smoke plan must pass (donor-creates-donation → NGO sees within 2s; OTP-verify → donor sees within 2s).
- **Max feedback latency:** Manual ~5 min; automated coverage land in P12.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | REQ-08 | T-08-01 (auth bypass) | Reject sockets without valid JWT | grep | `grep -q "io.use" server/socket.js` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | REQ-08 | T-08-02 (CORS) | Socket CORS matches REST allow-list | grep | `grep -q "origin: \\[" server/socket.js` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | REQ-08 | — | http.createServer used (not app.listen) | grep | `grep -q "createServer(app)" server/app.js` | ✅ | ⬜ pending |
| 08-02-01 | 02 | 2 | REQ-08 | T-08-03 (room scoping) | Donation create emits to role:NGO only | grep | `grep -q "to('role:NGO').emit('donation:available'" server/routes/donation.routes.js` | ✅ | ⬜ pending |
| 08-02-02 | 02 | 2 | REQ-08 | T-08-04 (OTP leakage) | Approve emits without OTP | grep | `grep -q "request:resolved" server/routes/request.routes.js` | ✅ | ⬜ pending |
| 08-02-03 | 02 | 2 | REQ-08 | T-08-04 | Volunteer-assign emits OTP only to ngo room | grep | `grep -q "to('user:'" server/routes/request.routes.js` | ✅ | ⬜ pending |
| 08-02-04 | 02 | 2 | REQ-08 | — | Verify-OTP SELECT now returns donor_id | grep | `grep -E "SELECT.*donor_id" server/routes/request.routes.js` | ✅ | ⬜ pending |
| 08-02-05 | 02 | 2 | REQ-08 | — | pickup:collected fans to donor + ngo | grep | `grep -c "pickup:collected" server/routes/request.routes.js` (≥1) | ✅ | ⬜ pending |
| 08-03-01 | 03 | 3 | REQ-08 | T-08-05 (stale token) | Client uses function-form auth (re-evaluated on reconnect) | grep | `grep -q "auth: (cb) =>" src/socket.js` | ✅ | ⬜ pending |
| 08-03-02 | 03 | 3 | REQ-08 | T-08-06 (dup listeners) | Donor dashboard uses named handlers + cleanup | grep | `grep -q "socket.off('request:incoming'" src/components/DonorDashboard.jsx` | ✅ | ⬜ pending |
| 08-03-03 | 03 | 3 | REQ-08 | T-08-06 | NGO dashboard uses named handlers + cleanup | grep | `grep -q "socket.off('donation:available'" src/components/NGODashboard.jsx` | ✅ | ⬜ pending |
| 08-03-04 | 03 | 3 | REQ-08 | — | Reconnect refresh hook in place | grep | `grep -q "socket.on('connect'" src/components/DonorDashboard.jsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/socket.js` — created in Wave 1 Plan 01 (file does not exist yet)
- [ ] `socket.io@4.8.3` installed in `server/package.json` — Wave 1 Plan 01

*Test framework install is explicitly NOT a dependency of this phase — deferred to P12 per CLAUDE.md convention.*

---

## Manual-Only Verifications

> The five REQ-08 success criteria require live two-browser observation and cannot be grep-checked alone. Run this manual smoke plan before `/gsd-verify-work`.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| New donation appears on NGO dashboard within 2s of donor creation, no refresh | REQ-08 SC#1 | Realtime UI; needs human observation of two browsers | 1. Open Browser A logged in as Donor, B logged in as NGO. 2. In A, create donation. 3. Start a stopwatch. 4. Confirm donation card appears in B within 2s. |
| New incoming request appears on donor dashboard within 2s | REQ-08 SC#2 | Realtime UI | 1. From the same B (NGO), click Request on the donation. 2. Switch to A within 2s; confirm "Incoming Request" card visible. |
| OTP and APPROVED status appear on NGO side in real time on donor approve + volunteer assign | REQ-08 SC#3 | Two-step (approve → volunteer-assign) flow with OTP issuance | 1. In A, approve. 2. In B, confirm status flips to APPROVED in <2s. 3. In B, fill volunteer form and submit. 4. Confirm OTP appears in B in <2s. |
| Donation flips to COLLECTED in real time on both sides on OTP verify | REQ-08 SC#4 | Two-target fan-out | 1. In A, enter the OTP shown in B. 2. Confirm both A and B show COLLECTED in <2s without refresh. |
| Closing and reopening the tab restores the live feed | REQ-08 SC#5 | Reconnect resilience | 1. Close A (donor) tab. 2. From B (NGO) trigger another request. 3. Reopen A. 4. Confirm A shows the new request without manual refresh. |

---

## Validation Sign-Off

- [ ] All tasks have grep-verifiable acceptance criteria OR a manual smoke step
- [ ] Sampling continuity: every wave has at least one grep check
- [ ] Wave 0 covers MISSING file (`server/socket.js`) and dependency (`socket.io`)
- [ ] No watch-mode flags
- [ ] Manual smoke latency < 5 minutes
- [ ] `nyquist_compliant: true` set in frontmatter (defer until manual plan executed and clean)

**Approval:** pending
