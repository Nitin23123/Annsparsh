# AnnSparsh — Claude/GSD Context

This file is loaded automatically by Claude Code and GSD agents working in this repo.

---

## What this project is

**AnnSparsh** ("A Touch of Food") is a 3-role food-donation platform: **Donors** list surplus food, **NGOs** request and arrange pickup, **Volunteers** collect it. A 4-digit **OTP** generated at volunteer-assignment and verified by the donor at pickup is the trust backbone — no OTP match, no completed pickup.

Full vision in [.planning/PROJECT.md](.planning/PROJECT.md). Current state in [.planning/STATE.md](.planning/STATE.md). Roadmap in [.planning/ROADMAP.md](.planning/ROADMAP.md).

---

## Repo layout

```
annsparsh/
├── src/                          # React 19 frontend (Vite + Tailwind 4)
│   ├── api.js                    # Axios instance, JWT interceptor, 401 redirect
│   ├── socket.js                 # Socket.IO client (server-side not wired yet)
│   ├── App.jsx                   # Routes
│   └── components/               # Auth, dashboards, OTP UI, etc.
│
├── server/                       # Node + Express backend
│   ├── app.js                    # Entry point — mounts /api/* routers
│   ├── config/
│   │   ├── db.js                 # pg Pool
│   │   └── schema.sql            # users, donations, requests + admin seed
│   ├── middleware/auth.js        # JWT verify + role guard
│   ├── routes/                   # auth, donation, request, admin
│   └── models/                   # EMPTY — currently inline SQL in routes
│
└── .planning/                    # GSD planning artifacts
    ├── PROJECT.md                # North-star vision
    ├── ROADMAP.md                # Milestones M1–M5, phases P1–P28
    └── STATE.md                  # Current state (read first when resuming)
```

---

## Tech facts to remember

- **Frontend:** React 19, Vite 7, Tailwind 4, react-router-dom 7, axios, socket.io-client, framer-motion, react-toastify
- **Backend:** Express 4, pg, jsonwebtoken, bcrypt, dotenv, cors
- **Database:** Postgres 14+. Schema in [server/config/schema.sql](server/config/schema.sql).
- **Auth:** JWT in `localStorage`, `Authorization: Bearer <token>` header injected by [src/api.js](src/api.js).
- **Roles:** `DONOR | NGO | ADMIN` (enum-checked in `users.role`).
- **Donation status:** `AVAILABLE | CLAIMED | COLLECTED | COMPLETED | EXPIRED`.
- **Request status:** `PENDING | APPROVED | REJECTED`. OTP lives on `requests.otp` (4 chars).

---

## Conventions

- **Backend:** CommonJS (`require`). Frontend: ESM (`import`).
- **Inline SQL** is the current pattern in route handlers — slated for refactor in **P11**. Don't introduce ORM yet.
- **Frontend HTTP** always goes through `api` from `src/api.js` — never raw `fetch` or `axios.create()` elsewhere.
- **Component files** are `.jsx` with co-located `.css` where styles are non-Tailwind.
- **No tests yet** — adding them is **P12**. Don't block features waiting for them, but write code as if tests will be added.
- **No comments** unless the *why* is non-obvious. Do not add JSDoc blocks to new code.

---

## Hot paths / files I touch most

- New API endpoint → add to `server/routes/<thing>.routes.js`, mount in [server/app.js](server/app.js).
- New role-gated route → wrap with middleware in [server/middleware/auth.js](server/middleware/auth.js).
- New frontend page → add component in [src/components/](src/components/), route in [src/App.jsx](src/App.jsx), link in [src/components/Header.jsx](src/components/Header.jsx).

---

## Don'ts

- Don't replace inline SQL with an ORM mid-feature — that's P11's whole job.
- Don't store secrets in repo. Use `server/.env` (gitignored).
- Don't bypass the `is_verified` check on users — admin verification is a hard gate by design.
- Don't generate OTPs longer than 4 digits without updating `requests.otp VARCHAR(6)` and the verification UI.
- Don't ship features without considering the mobile viewport — volunteers and field NGOs are mobile-first.

---

## How to run locally

```bash
# Backend (Terminal 1)
cd server && npm install && npm run dev   # http://localhost:5000

# Frontend (Terminal 2)
npm install && npm run dev                # http://localhost:5173
```

DB setup and env vars: see [README.md](README.md).

---

## Working with GSD

This repo uses **gsd-pi** (GSD CLI) for phased planning and execution.

| Command | Purpose |
|---------|---------|
| `gsd /gsd:progress` | Where am I, what's next |
| `gsd /gsd:plan-phase P8` | Plan the next phase (P8 = Realtime notifications) |
| `gsd /gsd:execute-phase` | Execute the planned phase |
| `gsd /gsd:resume-work` | Resume after a context break |
| `gsd /gsd:add-todo` | Capture an idea without losing context |

Phase docs land in `.planning/phases/<phase-id>/`.
