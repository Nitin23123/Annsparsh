---
status: partial
phase: 08-realtime-notifications-via-socket-io
source: [08-VERIFICATION.md]
started: 2026-04-26
updated: 2026-04-26
---

## Current Test

[awaiting human testing]

## Tests

### 1. NGO sees newly listed donation within 2s, no refresh
expected: Donor creates a donation in Browser A; the donation card appears in Browser B (NGO) within 2 seconds without any refresh.
result: [pending]

### 2. Donor sees new incoming request within 2s
expected: NGO clicks Request in Browser B; the "Incoming Request" card appears in Browser A (Donor) within 2 seconds without refresh.
result: [pending]

### 3. NGO sees APPROVED status flip in real time when donor approves
expected: Donor approves the request in Browser A; Browser B (NGO) shows status `APPROVED` within 2 seconds without refresh. Toast text reads "Request approved" (no OTP).
result: [pending]

### 4. NGO sees OTP appear in real time when donor… err… NGO assigns volunteer
expected: NGO submits the volunteer-assign form in Browser B; the OTP appears on the NGO screen and the request status flips to APPROVED-with-OTP within 2 seconds. Toast text reads something like "Pickup OTP issued: NNNN".
result: [pending]

### 5. Donor sees COLLECTED flip in real time on OTP verify
expected: Donor enters the correct OTP in Browser A; both Browser A and Browser B show donation status `COLLECTED` within 2 seconds without refresh.
result: [pending]

### 6. Reconnection — closing and reopening the tab restores the live feed
expected: Close the Donor tab. Have the NGO submit a new request from Browser B. Reopen Browser A and log back in (or revisit the dashboard). The newly arrived request is visible without manual refresh, recovered via the on-`connect` REST refetch.
result: [pending]

### 7. No duplicate toasts under React 19 StrictMode (dev only)
expected: With Vite dev server (StrictMode active), trigger any of the four events. Each toast appears exactly once — not twice.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps
