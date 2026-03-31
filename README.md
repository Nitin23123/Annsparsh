# AnnSparsh — Food Donation Platform

**AnnSparsh** ("Touch of Food") connects food donors with NGOs to reduce food waste. Donors list surplus food, NGOs request it, and volunteers pick it up — verified with an OTP at the door.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (stored in localStorage) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/download/) v14+
- Git

---

## Setup Guide

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/Annsparsh.git
cd Annsparsh
```

---

### 2. Create the PostgreSQL Database

Open your PostgreSQL shell (`psql`) and run:

```sql
CREATE DATABASE annsparsh;
```

Then apply the schema (creates tables + seeds admin account):

```bash
psql -U postgres -d annsparsh -f server/config/schema.sql
```

---

### 3. Configure the Backend

```bash
cd server
```

Create `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=annsparsh
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secret_key_here
```

---

### 4. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend (from project root)
cd .. && npm install
```

---

### 5. Configure the Frontend

In the project root, create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

> For production, replace with your deployed backend URL.

---

### 6. Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm start
# or with auto-reload:
npm run dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Default Accounts

The schema seeds one admin account:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@annsparsh.com | password |

Register Donor and NGO accounts through the UI at `/auth`.

---

## How It Works

### Roles
- **Donor** — Lists surplus food with pickup address and expiry time
- **NGO** — Browses available food and sends pickup requests
- **Admin** — Verifies users, monitors all donations and requests

### Full Flow

```
Donor lists food
     ↓
NGO requests food
     ↓
Donor approves the request
     ↓
NGO assigns a volunteer (name, phone, vehicle type & number)
     ↓
4-digit OTP generated — shown to the NGO
     ↓
Volunteer arrives at pickup → quotes OTP to donor
     ↓
Donor enters OTP → food marked COLLECTED
```

---

## Project Structure

```
Annsparsh/
├── src/                        # React frontend
│   ├── components/
│   │   ├── Auth.jsx            # Login / Register
│   │   ├── DonorDashboard.jsx  # Donor view
│   │   ├── NGODashboard.jsx    # NGO view
│   │   ├── AdminDashboard.jsx  # Admin panel
│   │   └── CreateDonation.jsx  # Donation form
│   └── api.js                  # Axios instance with JWT interceptor
│
└── server/                     # Express backend
    ├── config/
    │   ├── db.js               # PostgreSQL pool
    │   └── schema.sql          # DB schema + seed
    ├── middleware/
    │   └── auth.js             # JWT verify + role guard
    ├── routes/
    │   ├── auth.routes.js      # /api/auth
    │   ├── donation.routes.js  # /api/donations
    │   ├── request.routes.js   # /api/requests
    │   └── admin.routes.js     # /api/admin
    └── app.js                  # Express entry point
```

---

## API Overview

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/donations/available` | NGO | List available donations |
| GET | `/api/donations/mine` | Donor | List own donations |
| POST | `/api/donations` | Donor | Create donation |
| POST | `/api/requests` | NGO | Request a donation |
| GET | `/api/requests/mine` | NGO | View own requests |
| GET | `/api/requests/incoming` | Donor | View all incoming requests |
| PUT | `/api/requests/:id` | Donor | Approve / Reject request |
| PUT | `/api/requests/:id/volunteer` | NGO | Assign volunteer + generate OTP |
| POST | `/api/requests/:id/verify-otp` | Donor | Verify OTP → mark collected |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/verify` | Admin | Verify a user |

---

## Environment Variables

### `server/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default: 5000) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | DB username |
| `DB_PASSWORD` | DB password |
| `JWT_SECRET` | Secret for signing JWTs |

### `.env` (root — frontend)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Troubleshooting

**Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**PostgreSQL connection refused**
- Ensure PostgreSQL service is running
- Check `DB_PASSWORD` in `server/.env`

**"Access token required" on all requests**
- Clear localStorage and log in again

---

*Built with care for a hunger-free world.*
