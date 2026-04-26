# AnnSparsh — Project North Star

> **Status:** MVP shipped — pilot-ready
> **Owner:** Nitin
> **Last updated:** 2026-04-26

---

## 1. What is AnnSparsh?

**AnnSparsh** ("A Touch of Food") is a web platform that connects three actors in a verified, OTP-secured pickup workflow:

- **Donors** (restaurants, wedding halls, hostels, canteens) — list surplus food
- **NGOs** (shelters, food banks) — request and arrange pickup
- **Volunteers** — physically collect food, verified by an OTP at the door

The product reduces food waste while routing surplus to people who need it.

---

## 2. The Problem

- India wastes ~68 million tonnes of food every year (~₹92,000 crore)
- 190M+ people go to bed hungry nightly (Global Hunger Index rank: 111)
- Surplus → Hunger pipeline currently runs on phone calls, WhatsApp groups, and goodwill
- No verification, no tracking, no accountability → most surplus rots

**The gap is coordination, not supply.**

---

## 3. The Solution

A three-sided platform with the OTP handover as the trust backbone:

```
Donor lists food
   ↓
NGO browses & requests
   ↓
Donor approves
   ↓
NGO assigns volunteer (name, phone, vehicle)
   ↓
Backend generates 4-digit OTP → shown ONLY to NGO
   ↓
Volunteer arrives, quotes OTP to donor
   ↓
Donor enters OTP → status flips to COLLECTED
```

No OTP match = no completion. No fake pickups. Every handover auditable.

---

## 4. Tech Stack (current)

| Layer | Tech | File of record |
|-------|------|----------------|
| Frontend | React 19 + Vite 7 + Tailwind 4 | [package.json](../package.json) |
| Backend | Node.js + Express 4 | [server/app.js](../server/app.js) |
| Database | PostgreSQL 14+ | [server/config/schema.sql](../server/config/schema.sql) |
| Auth | JWT (bcrypt-hashed passwords) | [server/middleware/auth.js](../server/middleware/auth.js) |
| HTTP client | Axios with interceptors | [src/api.js](../src/api.js) |
| Realtime (planned) | Socket.IO client wired, server pending | [src/socket.js](../src/socket.js) |

---

## 5. Current Capability (what works today)

- ✅ Auth: register/login with JWT, role-gated routes (Donor/NGO/Admin)
- ✅ Admin verification gate — users cannot transact until admin verifies
- ✅ Donor: create/list/track donations, approve incoming requests
- ✅ NGO: browse available donations, request, assign volunteer
- ✅ OTP generation on volunteer assignment + verification on pickup
- ✅ Admin dashboard: stats, user list, verification action
- ✅ Three role-based dashboards (Donor / NGO / Admin)

---

## 6. Known gaps (the next 90 days)

1. **No notifications** — donors and NGOs must refresh manually. Need Socket.IO realtime + SMS/WhatsApp.
2. **No geolocation matching** — NGOs see all donations regardless of distance.
3. **No mobile app** — web-only; volunteers in the field need mobile-first.
4. **No impact reporting** — corporates need CSR-grade impact certificates.
5. **No analytics** — admin dashboard has counts but no trends or heatmaps.
6. **No automated tests** — manual QA only.
7. **Backend models layer is empty** — all SQL inlined in route handlers; refactor before scale.

---

## 7. Success Metrics (north-star)

| Metric | Target by EOY 2026 |
|--------|---------------------|
| Verified donors | 200 |
| Verified NGOs | 50 |
| Successful pickups | 5,000 |
| Meals redirected | 250,000 |
| Avg. pickup latency (request → collected) | < 90 min |
| OTP fraud rate | < 0.1% |

---

## 8. Constraints & Principles

- **Trust over speed** — OTP gate is non-negotiable, even if it adds friction.
- **Admin-verified onboarding** — no open self-serve until KYC is automated.
- **Mobile-first UI** — volunteers and field NGOs primarily on phones.
- **Free for NGOs forever** — monetization comes from CSR/corporate side.
- **Low ops cost** — single small Postgres + single Express dyno must scale to 10k pickups/mo.

---

## 9. Stakeholders

| Stakeholder | Interest |
|------------|----------|
| Donors | Easy listing, tax/CSR receipt, dignity of contribution |
| NGOs | Predictable supply, volunteer coordination, no fraud |
| Volunteers | Clear pickup details, simple OTP flow |
| Admins | Verification queue, fraud signals, platform health |
| Investors | Traction metrics, unit economics, regulatory tailwind |
| Regulators (FSSAI) | Food safety compliance trail |

---

## 10. Out of scope (for now)

- Cooking/preparing meals (we're routing only)
- Cold-chain logistics or refrigerated transport
- Cash donations or fundraising
- Cross-border food movement
- B2C consumer-facing app
