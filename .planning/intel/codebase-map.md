# Codebase Intel — AnnSparsh

> Quick-reference map for agents and contributors. Updated 2026-04-26.

---

## Frontend (`src/`)

| File | Role |
|------|------|
| [src/main.jsx](../../src/main.jsx) | Vite entry — mounts `<App />` into `#root` |
| [src/App.jsx](../../src/App.jsx) | Top-level routes + role-aware layout |
| [src/api.js](../../src/api.js) | Axios singleton — baseURL, JWT injector, 401 redirect |
| [src/socket.js](../../src/socket.js) | Socket.IO client init (server-side pending P8) |
| [src/constants.js](../../src/constants.js) | Shared enums/strings |
| [src/index.css](../../src/index.css) | Tailwind + global styles |

### Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `Auth.jsx` | Register / login (writes JWT to localStorage) |
| `RoleSelection.jsx` | Pick role at signup |
| `VerificationPending.jsx` | Shown while admin hasn't verified user yet |
| `ProtectedRoute.jsx` | Route guard — checks JWT + role |
| `DonorDashboard.jsx` | Donor home — lists own donations + incoming requests |
| `NGODashboard.jsx` | NGO home — available donations + own requests |
| `AdminDashboard.jsx` | Admin home — stats + user verification queue |
| `CreateDonation.jsx` | Donor-side form to list new food |
| `DonationManagement.jsx` | Donor-side approve/reject + OTP verify UI |
| `Tracking.jsx` | Live status of a request (will hook into Socket.IO in P8) |
| `Notifications.jsx` | Notification UI (placeholder — P8 fills logic) |
| `History.jsx` | Past pickups for a user |
| `UserProfile.jsx` | Profile view/edit |
| `ImpactMap.jsx` | Heat map placeholder |
| `ShelterFinder.jsx` | NGO directory |
| `HelpCenter.jsx` | Static FAQ |
| `Header.jsx` / `Footer.jsx` / `Hero.jsx` / `HowItWorks.jsx` / `StatsSection.jsx` | Marketing layout |

---

## Backend (`server/`)

| File | Role |
|------|------|
| [server/app.js](../../server/app.js) | Express entry — CORS, JSON, routers, health check |
| [server/config/db.js](../../server/config/db.js) | `pg.Pool` instance |
| [server/config/schema.sql](../../server/config/schema.sql) | Tables + admin seed |
| [server/middleware/auth.js](../../server/middleware/auth.js) | `verifyToken`, role-guard helpers |
| [server/routes/auth.routes.js](../../server/routes/auth.routes.js) | `POST /api/auth/register`, `POST /api/auth/login` |
| [server/routes/donation.routes.js](../../server/routes/donation.routes.js) | Donation CRUD + listings |
| [server/routes/request.routes.js](../../server/routes/request.routes.js) | Request lifecycle + volunteer + OTP |
| [server/routes/admin.routes.js](../../server/routes/admin.routes.js) | Stats + user verification |
| `server/models/` | **Empty** — earmarked for P11 model layer |

---

## API surface

| Method | Path | Role | What it does |
|--------|------|------|--------------|
| POST | `/api/auth/register` | public | Create user (default unverified) |
| POST | `/api/auth/login` | public | Verify password, return JWT + user |
| GET | `/api/donations/available` | NGO | Donations with status=AVAILABLE |
| GET | `/api/donations/mine` | DONOR | Own donations |
| POST | `/api/donations` | DONOR | Create donation |
| POST | `/api/requests` | NGO | Request a donation |
| GET | `/api/requests/mine` | NGO | Own requests |
| GET | `/api/requests/incoming` | DONOR | Requests on own donations |
| PUT | `/api/requests/:id` | DONOR | Approve / Reject |
| PUT | `/api/requests/:id/volunteer` | NGO | Assign volunteer + generate OTP |
| POST | `/api/requests/:id/verify-otp` | DONOR | Verify OTP → mark COLLECTED |
| GET | `/api/admin/stats` | ADMIN | Counts |
| GET | `/api/admin/users` | ADMIN | All users |
| PUT | `/api/admin/users/:id/verify` | ADMIN | Flip `is_verified=true` |
| GET | `/api/health` | public | `{status: 'ok'}` |

---

## Database schema

```
users (id, name, email, password_hash, role, is_verified, created_at)
  └── role ∈ {DONOR, NGO, ADMIN}

donations (id, donor_id→users, food_type, quantity, address,
           best_before, notes, status, created_at)
  └── status ∈ {AVAILABLE, CLAIMED, COLLECTED, COMPLETED, EXPIRED}

requests (id, donation_id→donations, ngo_id→users, status,
          volunteer_name, volunteer_phone, vehicle_type, vehicle_number,
          otp, otp_verified, created_at)
  └── status ∈ {PENDING, APPROVED, REJECTED}
```

Seed: one admin (`admin@annsparsh.com` / `admin123`).

---

## Cross-cutting concerns

- **Auth token lifecycle:** issued at login, stored in `localStorage`, attached by `api.js` request interceptor, verified by `middleware/auth.js`, cleared by `api.js` response interceptor on 401.
- **CORS:** allow-list is `localhost:5173` and `localhost:5174` only — production origin must be added in [server/app.js:7](../../server/app.js#L7) before deploy.
- **No rate limiting** — auth endpoints currently unprotected. Track in P11.
- **No tests** — slot in P12.
