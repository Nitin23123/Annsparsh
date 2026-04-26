# Requirements: AnnSparsh

> Each requirement maps to one or more roadmap phases. Goal-backward: every phase delivers at least one requirement.

---

## v1.0 MVP (shipped)

### REQ-01 — User identity and roles
Users can register and authenticate as one of three roles: DONOR, NGO, ADMIN. Passwords are hashed; sessions use JWT.

### REQ-02 — Donor lists surplus food
A verified donor can create a donation specifying food type, quantity, pickup address, best-before window, and notes.

### REQ-03 — NGO browses available food
A verified NGO sees the list of donations with status `AVAILABLE`.

### REQ-04 — NGO requests pickup
A verified NGO can submit a pickup request against an available donation.

### REQ-05 — Donor approves/rejects requests
A donor sees incoming requests on their donations and approves or rejects each.

### REQ-06 — Volunteer assignment + OTP
After approval, the NGO assigns a volunteer (name, phone, vehicle type, vehicle number); the system generates a 4-digit OTP visible only to the NGO.

### REQ-07 — OTP verification at pickup
At pickup, the donor enters the OTP. On match the donation is marked `COLLECTED`. On mismatch the OTP is rejected and the donation stays in its current state.

---

## v1.1 Pilot-Hardening (active)

### REQ-08 — Realtime state propagation
State changes (donation create, request submit, approve/reject, OTP issue, pickup confirm) propagate to relevant connected clients within 2 seconds without a manual refresh.

### REQ-09 — Out-of-app notifications
Critical events (request approved with OTP, pickup confirmed) reach users via SMS or WhatsApp regardless of whether the app is open.

### REQ-10 — Geolocation matching
Donations carry latitude/longitude; NGOs can sort and filter the donation feed by distance from their address.

### REQ-11 — Hardened backend
SQL is encapsulated in a model layer (no raw queries in route handlers); every write endpoint validates input via a schema; auth endpoints are rate-limited.

### REQ-12 — Test coverage on critical paths
Auth, OTP issue/verify, and role gating have automated test coverage; CI runs the suite on every PR.

### REQ-13 — Error monitoring and structured logs
Production errors are captured in Sentry; backend logs are structured JSON.

### REQ-14 — Pilot operability
Documented onboarding and admin SOPs let a non-engineer run a pilot: onboard donors, NGOs, and resolve verification queues.

---

## v1.2 CSR & Impact (planned)

### REQ-15 — Impact metrics per pickup
Each completed pickup records meals-equivalent, weight saved, and CO2-equivalent.

### REQ-16 — Donor impact dashboard
Donors see lifetime aggregated impact metrics and can share a generated impact card.

### REQ-17 — CSR certificates
Corporate accounts can download quarterly PDF impact certificates with a platform-signed hash for audit.

### REQ-18 — Multi-location corporate accounts
A corporate account can manage many donor locations under one umbrella.

### REQ-19 — Subscription billing
Corporates can subscribe to a paid tier via a payment provider.

---

## v2.0 Mobile (planned)

### REQ-20 — Mobile auth parity
Users can register and log in from a React Native mobile app with the same backend.

### REQ-21 — Volunteer mobile flow
A volunteer can see their assignment, navigate to pickup, and confirm with photo + OTP entry from mobile.

### REQ-22 — Push notifications
Mobile clients receive push notifications for assignment and pickup events.

### REQ-23 — Offline-first volunteer view
A volunteer can see their current assignment even without internet; actions sync when connectivity returns.

---

## v3.0 Scale (planned)

### REQ-24 — Multi-city operability
The platform supports multiple cities with region-scoped admins.

### REQ-25 — FSSAI compliance metadata
Donations capture food category, expiry windows, and cold-chain flags as required for compliance.

### REQ-26 — Self-signup volunteers
Volunteers can self-register with KYC and be matched to NGOs that need pickup capacity.

### REQ-27 — Third-party donor API
External systems (POS, kitchen software) can push surplus to AnnSparsh via authenticated API.

### REQ-28 — Predictive matching
Analytics predict surplus by venue/day-of-week; matching favours NGOs likely to fulfill the pickup.
