# AnnSparsh — A Touch of Food

> **Connecting surplus food to those who need it — verified by a 4-digit OTP at the door.**

AnnSparsh is a three-sided web platform that turns the messy phone-call-and-WhatsApp-group economy of food redistribution into a verified, real-time, auditable workflow. Donors list surplus food, NGOs request and arrange pickup, and a volunteer collects it — every handover confirmed by a one-time password the donor enters on their own screen.

🔗 **Live repo:** https://github.com/Nitin23123/Annsparsh

---

## The problem

- India wastes **~68 million tonnes of food a year** (~₹92,000 cr).
- 190M+ people go to bed hungry nightly.
- The pipeline from surplus → hunger runs on phone calls, goodwill, and trust nobody can verify.

The shortage isn't supply. It's coordination.

---

## What AnnSparsh does

```
Donor lists surplus food          (web form, takes ~30 seconds)
        ↓
NGO browses & requests            (real-time — no refresh needed)
        ↓
Donor approves                    (one click)
        ↓
NGO assigns a volunteer           (name, phone, vehicle, number plate)
        ↓
Server generates a 4-digit OTP    (visible only to the NGO)
        ↓
Volunteer arrives, quotes OTP     (offline, in person)
        ↓
Donor enters OTP                  (status flips to COLLECTED)
```

**No OTP match = no completed pickup.** This is the trust spine.

---

## What's working today

- ✅ JWT-authenticated 3-role platform (Donor / NGO / Admin)
- ✅ Admin verification gate — no transactions until KYC is approved
- ✅ End-to-end pickup flow with OTP verification
- ✅ **Real-time updates via Socket.IO** — both sides see donations, requests, approvals, OTPs, and pickup confirmations live, no manual refresh
- ✅ Reconnect-tolerant client — close the tab, reopen, state is recovered
- ✅ Donor & NGO **history view** with filter (All / Completed only)
- ✅ Form validation on the donation form (quantity must be a number, address sanity, pickup-time window 30 min – 7 days, etc.)
- ✅ Admin dashboard with platform stats and user verification queue
- ✅ Production-ready DB layer (works on local Postgres or managed: Neon / Supabase / RDS)

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 + Tailwind CSS 4 + react-router-dom 7 |
| Realtime | Socket.IO 4.8 (server + client, JWT handshake) |
| UI polish | framer-motion + react-toastify |
| Backend | Node.js + Express 4 (CommonJS) |
| Database | PostgreSQL 14+ (works locally or via Neon / Supabase) |
| Auth | JWT (bcrypt-hashed passwords) |
| HTTP client | Axios singleton with auto-injected token + 401 redirect |

---

## Quick start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A Postgres database — either local Postgres 14+ OR a free [Neon](https://neon.tech/) account (~60 sec signup, no install)

### 1. Clone and install
```bash
git clone https://github.com/Nitin23123/Annsparsh.git
cd Annsparsh
npm install                # frontend deps
cd server && npm install   # backend deps
cd ..
```

### 2. Provision the database

**Option A — Neon (zero install, recommended for first run)**

1. Sign up at https://neon.tech/, create a project named `annsparsh`.
2. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```
3. Apply the schema. Either paste `server/config/schema.sql` into Neon's SQL editor, or:
   ```bash
   psql "<your-neon-connection-string>" -f server/config/schema.sql
   ```

**Option B — Local Postgres**

```sql
CREATE DATABASE annsparsh;
```
```bash
psql -U postgres -d annsparsh -f server/config/schema.sql
```

Either path seeds an admin account: `admin@annsparsh.com` / `password`.

### 3. Configure the backend

Create `server/.env`:

**For Neon:**
```env
PORT=5000
DB_HOST=ep-xxx.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_user
DB_PASSWORD=your_password
DB_SSL=true
JWT_SECRET=any_long_random_string
```

**For local Postgres:**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=annsparsh
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_long_random_string
```

> `DB_SSL=true` is required by Neon and other managed providers; omit it for local Postgres.

### 4. (Optional) Configure the frontend

Create `.env` in the project root only if your backend isn't on `localhost:5000`:
```env
VITE_API_URL=https://your-deployed-backend.example.com/api
```

### 5. Run it

Two terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev      # http://localhost:5000

# Terminal 2 — frontend
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173 and log in.

---

## Demo accounts

After the schema runs, you have one seeded admin. The fastest path to a full demo:

```bash
# From server/ — creates donor + ngo accounts (verified) + ensures admin
node -e "
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
(async () => {
  const hash = await bcrypt.hash('password', 10);
  for (const u of [
    { name: 'Demo Admin', email: 'admin@annsparsh.com', role: 'ADMIN' },
    { name: 'Demo Donor', email: 'donor@annsparsh.com', role: 'DONOR' },
    { name: 'Demo NGO',   email: 'ngo@annsparsh.com',   role: 'NGO'   },
  ]) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (\$1,\$2,\$3,\$4,TRUE) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, is_verified=TRUE, role=EXCLUDED.role, name=EXCLUDED.name',
      [u.name, u.email, hash, u.role]
    );
    console.log('upsert ok:', u.role, u.email);
  }
  await pool.end();
})();
"
```

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@annsparsh.com` | `password` |
| Donor | `donor@annsparsh.com` | `password` |
| NGO | `ngo@annsparsh.com` | `password` |

To see the realtime story, open the three accounts in three browser windows (regular + incognito + another browser) side-by-side.

---

## Demo flow

1. **Donor** clicks *Donate Food*, fills the form (try entering `Servings` in quantity — validator rejects it ✓), submits.
2. **NGO** sees the donation card appear instantly — no refresh.
3. **NGO** clicks Request → **Donor** sees the incoming request live.
4. **Donor** approves → **NGO** sees status flip to APPROVED.
5. **NGO** assigns volunteer (any test details) → **OTP appears on NGO screen** with a toast.
6. **Donor** enters that OTP → **both windows** flip to COLLECTED in real time.
7. **Either side** clicks **History** in the sidebar → sees the completed pickup with full details.

---

## Project structure

```
Annsparsh/
├── src/                              # React frontend
│   ├── api.js                        # Axios singleton + JWT interceptor + 401 redirect
│   ├── socket.js                     # Socket.IO client (function-form auth — reconnect-safe)
│   ├── App.jsx                       # Routes
│   └── components/
│       ├── Auth.jsx                  # Login / Register
│       ├── DonorDashboard.jsx        # Donor home (live updates)
│       ├── NGODashboard.jsx          # NGO home (live updates)
│       ├── AdminDashboard.jsx        # Admin panel
│       ├── CreateDonation.jsx        # Donation form (with validation)
│       ├── DonationManagement.jsx    # Approve / OTP-verify UI
│       ├── History.jsx               # Past donations / requests
│       └── ...
│
├── server/                           # Express backend
│   ├── app.js                        # Entry — mounts /api/* and Socket.IO
│   ├── socket.js                     # Socket.IO server (JWT handshake + room auto-join)
│   ├── config/
│   │   ├── db.js                     # pg pool (SSL-aware)
│   │   └── schema.sql                # users / donations / requests + admin seed
│   ├── middleware/auth.js            # JWT verify + role guard
│   └── routes/
│       ├── auth.routes.js            # /api/auth
│       ├── donation.routes.js        # /api/donations  (emits donation:available)
│       ├── request.routes.js         # /api/requests   (emits request:incoming, request:resolved, pickup:collected)
│       └── admin.routes.js           # /api/admin
│
└── .planning/                        # Phase-by-phase planning artifacts (vision → roadmap → plans → reviews)
    ├── PROJECT.md
    ├── ROADMAP.md
    ├── STATE.md
    └── phases/<NN-slug>/{CONTEXT,RESEARCH,VALIDATION,PLAN,SUMMARY,REVIEW,VERIFICATION}.md
```

---

## API surface

| Method | Endpoint | Role | What it does |
|--------|----------|------|--------------|
| POST | `/api/auth/register` | public | Register a new donor or NGO (admin must verify) |
| POST | `/api/auth/login` | public | Returns JWT + user |
| GET | `/api/auth/me` | any | Current user profile |
| GET | `/api/donations/available` | NGO | All AVAILABLE donations |
| GET | `/api/donations/mine` | Donor | Own donations (used by History) |
| POST | `/api/donations` | Donor | Create donation → emits `donation:available` |
| GET | `/api/donations/:id/requests` | Donor | All requests on a single donation |
| PUT | `/api/donations/:id/status` | Donor | Manual status override |
| DELETE | `/api/donations/:id` | Donor | Delete (only if AVAILABLE) |
| POST | `/api/requests` | NGO | Request a pickup → emits `request:incoming` |
| GET | `/api/requests/mine` | NGO | Own requests (used by History) |
| GET | `/api/requests/incoming` | Donor | All incoming requests on own donations |
| PUT | `/api/requests/:id` | Donor | Approve / Reject → emits `request:resolved` |
| PUT | `/api/requests/:id/volunteer` | NGO | Assign volunteer + generate OTP → emits `request:resolved` (with otp) |
| POST | `/api/requests/:id/verify-otp` | Donor | Verify OTP → emits `pickup:collected` to both rooms |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/verify` | Admin | Flip `is_verified=true` |
| GET | `/api/health` | public | Health check |

---

## Realtime events (Socket.IO)

All sockets authenticate at handshake using the same JWT issued by `/api/auth/login`. Sockets only join two kinds of rooms:

- `user:<id>` — every authenticated socket auto-joins their personal room
- `role:NGO` — fan-out room used to broadcast new donations to all NGOs

| Event | Direction | Target | Payload |
|-------|-----------|--------|---------|
| `donation:available` | server → NGOs | `role:NGO` | `{ donation }` |
| `request:incoming` | server → donor | `user:<donor_id>` | `{ request, donation }` |
| `request:resolved` | server → NGO | `user:<ngo_id>` | `{ request, status, otp? }` (otp only on volunteer-assign) |
| `pickup:collected` | server → both | `user:<donor_id>` + `user:<ngo_id>` | `{ donation, request }` |

Security: OTP-bearing emits target only the requesting NGO's personal room. The negative-grep `to('role:NGO').emit('request:resolved')` returns zero matches — enforced by code review.

---

## Roadmap snapshot

| Milestone | Phases | Status |
|-----------|--------|--------|
| **v1.0 MVP** | 1–7: schema/auth, donations, requests, OTP, admin, deploy | ✅ shipped |
| **v1.1 Pilot-Hardening** | 8: realtime ✅ · 9–14: SMS, geolocation, backend refactor, tests, monitoring, pilot SOPs | 🚧 in progress |
| **v1.2 CSR & Impact** | 15–19: impact metrics, donor dashboard, CSR certificates, multi-location accounts, payments | 📋 planned |
| **v2.0 Mobile** | 20–23: RN scaffold, volunteer app, push, offline-first | 📋 planned |
| **v3.0 Scale** | 24–28: multi-city, FSSAI compliance, volunteer marketplace, public API, ML matching | 📋 planned |

Full breakdown in `.planning/ROADMAP.md`.

---

## Environment variables

### `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | optional (default 5000) | Backend port |
| `DB_HOST` | yes | Postgres host |
| `DB_PORT` | yes | Postgres port |
| `DB_NAME` | yes | Database name |
| `DB_USER` | yes | DB username |
| `DB_PASSWORD` | yes | DB password |
| `DB_SSL` | optional | Set to `true` for managed Postgres (Neon, Supabase, RDS); omit for local |
| `JWT_SECRET` | yes | Long random string for signing JWTs |

### `.env` (project root — frontend)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL. Defaults to `http://localhost:5000/api`. |

---

## Troubleshooting

**Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac / Linux
lsof -i :5000
kill -9 <PID>
```

**Postgres `ECONNREFUSED`**
- Local: ensure the service is running. On Windows, services.msc → start `postgresql-x64-XX`.
- Managed (Neon/Supabase): ensure `DB_SSL=true` is in `server/.env`. The pool refuses unencrypted traffic.

**Login returns "Invalid credentials" but you typed the right password**
- The seeded admin password is literally `password`, not `admin123` (an old comment in `schema.sql` was wrong).

**Login appears to succeed then bounces you back to /auth**
- A stale or invalid JWT in `localStorage`. From the browser console:
  ```js
  localStorage.clear(); location.href = '/auth';
  ```

**Real-time updates don't appear**
- Open DevTools → Network → WS tab. The Socket.IO connection should show as `101 Switching Protocols`. If it's failing, check that the backend includes your origin in its CORS list (`server/app.js` and `server/socket.js`).

---

## License & contributing

Built for impact. The code is offered as-is; reach out via GitHub issues if you'd like to pilot AnnSparsh in your city or contribute.

*Reducing waste. Feeding hope. One verified pickup at a time.*
