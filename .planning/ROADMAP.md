# Roadmap: AnnSparsh

## Milestones

- ✅ **v1.0 MVP** — Phases 1-7 (shipped 2026-04-01)
- 🚧 **v1.1 Pilot-Hardening** — Phases 8-14 (in progress)
- 📋 **v1.2 CSR & Impact** — Phases 15-19 (planned)
- 📋 **v2.0 Mobile App** — Phases 20-23 (planned)
- 📋 **v3.0 Scale** — Phases 24-28 (planned)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

<details>
<summary>✅ v1.0 MVP (Phases 1-7) — SHIPPED 2026-04-01</summary>

### Phase 1: Database schema + auth
**Goal**: Users can register and log in with role-based JWT auth.
**Plans**: 2 plans

Plans:
- [x] 01-01: PostgreSQL schema (users, donations, requests)
- [x] 01-02: JWT auth + bcrypt + role middleware

### Phase 2: Donation CRUD + Donor dashboard
**Goal**: Donors can create, list, and track their own donations.
**Plans**: 2 plans

Plans:
- [x] 02-01: Donation API (create, list-mine)
- [x] 02-02: Donor dashboard UI

### Phase 3: NGO browse + request flow
**Goal**: NGOs can browse available donations and submit pickup requests.
**Plans**: 2 plans

Plans:
- [x] 03-01: Available donations + request endpoints
- [x] 03-02: NGO dashboard UI

### Phase 4: Volunteer assignment + OTP generation
**Goal**: NGO can assign a volunteer; system generates a 4-digit OTP.
**Plans**: 1 plan

Plans:
- [x] 04-01: Volunteer assignment + OTP issuance

### Phase 5: OTP verification + status transitions
**Goal**: Donor verifies OTP at pickup; donation flips to COLLECTED.
**Plans**: 1 plan

Plans:
- [x] 05-01: OTP verification endpoint + status transitions

### Phase 6: Admin dashboard + verification gate
**Goal**: Admin can verify users; unverified users cannot transact.
**Plans**: 2 plans

Plans:
- [x] 06-01: Admin endpoints (stats, users, verify)
- [x] 06-02: Admin dashboard UI + verification-pending screen

### Phase 7: Production deploy config
**Goal**: Frontend builds for prod; backend env-driven for deploy.
**Plans**: 1 plan

Plans:
- [x] 07-01: Vite prod build + CORS allow-list + env handling

</details>

### 🚧 v1.1 Pilot-Hardening (In Progress)

**Milestone Goal:** Make AnnSparsh reliable enough for a real-world pilot of 10 donors and 5 NGOs in one city — realtime updates, location-aware matching, observability, and a hardened backend.

#### Phase 8: Realtime notifications via Socket.IO
**Goal**: Donors and NGOs see donation/request/OTP/collection state changes in real time without manual refresh.
**Depends on**: Phase 7
**Requirements**: [REQ-08]
**Success Criteria** (what must be TRUE):
  1. NGO dashboard shows newly listed donations within 2 seconds of donor creation, no refresh required.
  2. Donor dashboard shows new incoming requests within 2 seconds of NGO submission.
  3. NGO sees the OTP appear and request status flip to APPROVED in real time when donor approves.
  4. Donor sees status flip to COLLECTED in real time when OTP is verified.
  5. Reconnection works — closing and reopening the tab restores the live feed.
**Plans**: 3 plans

Plans:
- [ ] 08-01-PLAN.md — Server-side Socket.IO foundation: install socket.io@4.8.3, create server/socket.js with JWT handshake + is_verified gate + room auto-join, refactor server/app.js to http.createServer + httpServer.listen
- [ ] 08-02-PLAN.md — Server-side emit wiring: donation:available + request:incoming + 2x request:resolved (approve + volunteer-assign w/ OTP) + pickup:collected dual-room emit; verify-otp SELECT projection fix
- [ ] 08-03-PLAN.md — Frontend wiring: function-form auth in src/socket.js (reconnect-safe), DonorDashboard + NGODashboard listeners with named handlers + cleanup, on-connect REST refetch

#### Phase 9: SMS + WhatsApp alerts
**Goal**: Critical events (donation approved, OTP issued, pickup confirmed) reach users via SMS/WhatsApp even when they're not in the app.
**Depends on**: Phase 8
**Requirements**: [REQ-09]
**Success Criteria** (what must be TRUE):
  1. NGO receives SMS containing the OTP within 30s of donor approval.
  2. Donor receives SMS confirming pickup completion.
  3. Failed deliveries are logged and visible to admin.
**Plans**: TBD

Plans:
- [ ] 09-01: Provider integration (MSG91 or Twilio)
- [ ] 09-02: Notification dispatcher with retry + admin log

#### Phase 10: Geolocation matching
**Goal**: NGOs see donations sorted/filterable by distance from their address.
**Depends on**: Phase 7
**Requirements**: [REQ-10]
**Success Criteria** (what must be TRUE):
  1. Donor can pin pickup location on a map at donation creation.
  2. NGO feed defaults to closest-first ordering.
  3. NGO can filter feed by max-distance slider.
**Plans**: TBD

Plans:
- [ ] 10-01: Lat/lng schema + geocoding on donation create
- [ ] 10-02: Distance-based sort/filter API + UI

#### Phase 11: Backend refactor — routes → controllers → models
**Goal**: Inline SQL extracted to a model layer; input validation on every endpoint; auth endpoints rate-limited.
**Depends on**: Phase 7
**Requirements**: [REQ-11]
**Success Criteria** (what must be TRUE):
  1. No raw `pool.query` calls inside `server/routes/*` files.
  2. Every POST/PUT endpoint validates input via zod.
  3. `/api/auth/*` returns 429 after 10 attempts/min from same IP.
**Plans**: TBD

Plans:
- [ ] 11-01: Model layer scaffolding (user, donation, request)
- [ ] 11-02: Zod validators on all routes
- [ ] 11-03: express-rate-limit on auth endpoints

#### Phase 12: Automated tests
**Goal**: Critical paths (auth, OTP issue/verify, role gating) covered by automated tests; CI runs them on every PR.
**Depends on**: Phase 11
**Requirements**: [REQ-12]
**Success Criteria** (what must be TRUE):
  1. `npm test` exits 0 with at least 30 passing tests.
  2. OTP issue → wrong code → correct code flow has explicit coverage.
  3. GitHub Actions workflow runs tests on every push to a branch with PR.
**Plans**: TBD

Plans:
- [ ] 12-01: Backend Jest + supertest setup + auth/OTP tests
- [ ] 12-02: Frontend Vitest + React Testing Library smoke tests
- [ ] 12-03: GitHub Actions CI workflow

#### Phase 13: Error monitoring & structured logs
**Goal**: Production errors are captured to Sentry; backend emits structured JSON logs.
**Depends on**: Phase 11
**Requirements**: [REQ-13]
**Success Criteria** (what must be TRUE):
  1. Throwing an error in any route appears in Sentry within 1 minute.
  2. All `console.log` in `server/` replaced with pino logger.
  3. Frontend uncaught errors hit Sentry with user role tagged.
**Plans**: TBD

Plans:
- [ ] 13-01: Sentry SDK (frontend + backend) + DSN env
- [ ] 13-02: pino logger + replace console.* in server

#### Phase 14: Pilot onboarding & SOPs
**Goal**: Documented onboarding flow + admin SOP enables non-engineer to onboard a donor or NGO end-to-end.
**Depends on**: Phase 13
**Requirements**: [REQ-14]
**Success Criteria** (what must be TRUE):
  1. `docs/pilot-onboarding.md` exists with step-by-step donor and NGO flows.
  2. `docs/admin-sop.md` covers verification, fraud signals, escalation.
  3. A first-time admin can verify a new NGO without engineering help.
**Plans**: TBD

Plans:
- [ ] 14-01: Onboarding docs (donor + NGO)
- [ ] 14-02: Admin SOP + fraud-signal checklist

### 📋 v1.2 CSR & Impact (Planned)

**Milestone Goal:** Make AnnSparsh fundable by corporate CSR — verifiable impact, downloadable certificates, audit trail, and a paid corporate tier.

#### Phase 15: Impact data model
**Goal**: Each pickup records meals-equivalent, weight saved, and CO2-equivalent.
**Depends on**: Phase 14
**Requirements**: [REQ-15]
**Plans**: TBD

Plans:
- [ ] 15-01: Schema + computation rules

#### Phase 16: Donor impact dashboard
**Goal**: Donor sees lifetime impact metrics + shareable card.
**Depends on**: Phase 15
**Requirements**: [REQ-16]
**Plans**: TBD

Plans:
- [ ] 16-01: Impact UI + share image generator

#### Phase 17: CSR certificates
**Goal**: Corporates download quarterly PDF certificates with signed hash.
**Depends on**: Phase 16
**Requirements**: [REQ-17]
**Plans**: TBD

Plans:
- [ ] 17-01: PDF service + signature

#### Phase 18: Corporate admin role
**Goal**: One corporate account can manage many donor locations.
**Depends on**: Phase 17
**Requirements**: [REQ-18]
**Plans**: TBD

Plans:
- [ ] 18-01: Org schema + sub-account management

#### Phase 19: Payment rails
**Goal**: Corporates pay subscription via Razorpay.
**Depends on**: Phase 18
**Requirements**: [REQ-19]
**Plans**: TBD

Plans:
- [ ] 19-01: Razorpay subscription integration

### 📋 v2.0 Mobile App (Planned)

**Milestone Goal:** Native-feel mobile experience for the field actors — volunteers and on-the-ground NGO staff.

#### Phase 20: RN scaffolding + auth parity
**Goal**: React Native (Expo) app with shared API client and login working.
**Plans**: TBD

Plans:
- [ ] 20-01: Expo scaffold + shared api client

#### Phase 21: Volunteer app
**Goal**: Volunteer can see assignment, navigate, and confirm pickup with photo + OTP entry.
**Plans**: TBD

Plans:
- [ ] 21-01: Volunteer flows + camera

#### Phase 22: Push notifications
**Goal**: FCM/APNs deliver instant pickup alerts.
**Plans**: TBD

Plans:
- [ ] 22-01: FCM + APNs integration

#### Phase 23: Offline-first cache
**Goal**: Volunteer sees assignment even without internet.
**Plans**: TBD

Plans:
- [ ] 23-01: Local storage + sync layer

### 📋 v3.0 Scale (Planned)

#### Phase 24: Multi-city support
**Goal**: City selector and region-scoped admins.
**Plans**: TBD

#### Phase 25: FSSAI compliance fields
**Goal**: Food category, expiry windows, cold-chain flags.
**Plans**: TBD

#### Phase 26: Volunteer marketplace
**Goal**: Self-signup volunteers with KYC, available to NGOs.
**Plans**: TBD

#### Phase 27: Public API
**Goal**: POS systems can push surplus automatically.
**Plans**: TBD

#### Phase 28: Analytics & ML matching
**Goal**: Predict surplus by venue/day; smart-match NGOs.
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database schema + auth | v1.0 | 2/2 | Complete | 2026-04-01 |
| 2. Donation CRUD + Donor dashboard | v1.0 | 2/2 | Complete | 2026-04-01 |
| 3. NGO browse + request flow | v1.0 | 2/2 | Complete | 2026-04-01 |
| 4. Volunteer assignment + OTP | v1.0 | 1/1 | Complete | 2026-04-01 |
| 5. OTP verification + transitions | v1.0 | 1/1 | Complete | 2026-04-01 |
| 6. Admin dashboard + verify gate | v1.0 | 2/2 | Complete | 2026-04-01 |
| 7. Production deploy config | v1.0 | 1/1 | Complete | 2026-04-01 |
| 8. Realtime notifications | v1.1 | 0/3 | Not started | - |
| 9. SMS + WhatsApp alerts | v1.1 | 0/2 | Not started | - |
| 10. Geolocation matching | v1.1 | 0/2 | Not started | - |
| 11. Backend refactor | v1.1 | 0/3 | Not started | - |
| 12. Automated tests | v1.1 | 0/3 | Not started | - |
| 13. Error monitoring + logs | v1.1 | 0/2 | Not started | - |
| 14. Pilot onboarding & SOPs | v1.1 | 0/2 | Not started | - |
| 15. Impact data model | v1.2 | 0/1 | Not started | - |
| 16. Donor impact dashboard | v1.2 | 0/1 | Not started | - |
| 17. CSR certificates | v1.2 | 0/1 | Not started | - |
| 18. Corporate admin role | v1.2 | 0/1 | Not started | - |
| 19. Payment rails | v1.2 | 0/1 | Not started | - |
| 20. RN scaffolding | v2.0 | 0/1 | Not started | - |
| 21. Volunteer app | v2.0 | 0/1 | Not started | - |
| 22. Push notifications | v2.0 | 0/1 | Not started | - |
| 23. Offline-first cache | v2.0 | 0/1 | Not started | - |
| 24. Multi-city support | v3.0 | 0/0 | Not started | - |
| 25. FSSAI compliance | v3.0 | 0/0 | Not started | - |
| 26. Volunteer marketplace | v3.0 | 0/0 | Not started | - |
| 27. Public API | v3.0 | 0/0 | Not started | - |
| 28. Analytics & ML | v3.0 | 0/0 | Not started | - |
