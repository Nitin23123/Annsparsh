# AnnSparsh — Roadmap

> **Active milestone:** M2 — Pilot-Hardening
> **Last updated:** 2026-04-26

---

## Milestone status

| # | Milestone | Status | Target |
|---|-----------|--------|--------|
| M1 | MVP — Core 3-role pickup flow with OTP | ✅ DONE | Shipped |
| M2 | Pilot-Hardening — Notifications, geo, tests | 🟡 IN PROGRESS | Q3 2026 |
| M3 | CSR & Impact — Reports, certificates, dashboards | ⏳ NEXT | Q4 2026 |
| M4 | Mobile App — React Native for volunteers + NGOs | ⏳ PLANNED | Q1 2027 |
| M5 | Scale — Multi-city, FSSAI compliance, payments | ⏳ PLANNED | Q2 2027 |

---

## Milestone M1 — MVP (DONE)

**Goal:** End-to-end donor → NGO → volunteer → OTP pickup flow on web.

| Phase | Goal | Status |
|-------|------|--------|
| P1 | Database schema + auth (users, JWT, bcrypt) | ✅ |
| P2 | Donation CRUD + Donor dashboard | ✅ |
| P3 | NGO browse + request flow | ✅ |
| P4 | Volunteer assignment + OTP generation | ✅ |
| P5 | OTP verification + status transitions | ✅ |
| P6 | Admin dashboard + user verification gate | ✅ |
| P7 | Production deploy config | ✅ |

---

## Milestone M2 — Pilot-Hardening (ACTIVE)

**Goal:** Make the platform reliable enough for a real-world pilot of 10 donors + 5 NGOs in one city.

**Why now:** MVP works in dev. To run a pilot, donors and NGOs must get notified in real time, find each other by location, and the system must not break under concurrent use.

| # | Phase | Goal | Status |
|---|-------|------|--------|
| P8 | Realtime notifications | Wire Socket.IO server-side, push events on donation create / request / approval / OTP / collection | ⏳ |
| P9 | SMS + WhatsApp alerts | Integrate Twilio/MSG91 for OTP delivery and pickup-status pings | ⏳ |
| P10 | Geolocation matching | Capture lat/lng on donation, sort/filter NGO feed by distance | ⏳ |
| P11 | Backend refactor: routes → controllers → models | Extract inline SQL into a model layer; add input validation (zod/joi) | ⏳ |
| P12 | Automated tests | Vitest for frontend, Jest + supertest for backend; cover OTP and auth paths | ⏳ |
| P13 | Error monitoring & logging | Add Sentry + structured logs (pino/winston) | ⏳ |
| P14 | Pilot onboarding | Verification SOP, donor/NGO onboarding docs, support workflow | ⏳ |

---

## Milestone M3 — CSR & Impact (NEXT)

**Goal:** Make AnnSparsh fundable by corporate CSR — verifiable impact, downloadable certificates, audit trail.

| # | Phase | Goal |
|---|-------|------|
| P15 | Impact data model | Track meals-equivalent, kg saved, CO2-equivalent per pickup |
| P16 | Donor impact dashboard | Personal "you fed X people this month" view + shareable cards |
| P17 | CSR certificates | PDF generation per quarter with platform-signed hash |
| P18 | Corporate admin role | Multi-location donor accounts (e.g., a hotel chain) |
| P19 | Payment rails | Subscription billing for corporates (Razorpay/Stripe) |

---

## Milestone M4 — Mobile App (PLANNED)

**Goal:** Native-feel mobile experience for the actors who are in the field.

| # | Phase | Goal |
|---|-------|------|
| P20 | RN scaffolding + auth parity | Expo/React Native with shared API client |
| P21 | Volunteer app | OTP entry, navigation to pickup, photo confirmation |
| P22 | Push notifications | FCM/APNs for instant pickup alerts |
| P23 | Offline-first cache | Volunteer can see assignment even with flaky internet |

---

## Milestone M5 — Scale (PLANNED)

| # | Phase | Goal |
|---|-------|------|
| P24 | Multi-city support | City selector, region-scoped admins |
| P25 | FSSAI compliance | Food category, expiry windows, cold-chain flags |
| P26 | Volunteer marketplace | Self-signup volunteers (KYC) so NGOs don't have to source |
| P27 | Public API | Allow third-party donors (POS systems) to push surplus automatically |
| P28 | Analytics & ML | Predict surplus by venue/day; smart-match NGOs |

---

## Backlog (un-scheduled but tracked)

- Donor recurring donations (every Friday at 10pm)
- NGO group requests (one request, multiple NGOs split a donation)
- Heat-map of pickups for city authorities
- Whistleblower channel (report misuse anonymously)
- Multi-language UI (Hindi, Marathi, Tamil)
- WhatsApp-only donor flow (no app needed)
