# AnnSparsh Backend — Explained Simply

This document explains how the entire backend of AnnSparsh works, written for
people who are not from a technical background. No coding knowledge is needed
to understand this. Think of it as a "story" of how data moves through the system.

---

## What is a "Backend"?

Imagine AnnSparsh as a restaurant.

- The **frontend** (what you see in the browser) is the dining hall — the tables,
  the menu, the waiters. It's what the customer interacts with.
- The **backend** is the kitchen — it stores the ingredients, does the cooking,
  and sends the finished meal back out. The customer never sees the kitchen,
  but nothing works without it.

Our backend is a program that runs on a computer (server) and handles all the
"real work" — storing data, checking passwords, sending the right information
to the right person, and enforcing rules like "only NGOs can request food."

---

## The Three Pieces of Our Backend

### 1. The Server (Node.js + Express)
This is the program that "listens" for requests from the browser. When you
click "Login" or "Create Donation," the browser sends a message to the server.
The server reads that message, does something (like check your password), and
sends a reply back.

We built this using **Node.js** (a tool that lets us write server programs in
JavaScript) and **Express** (a framework that makes it easy to define what
happens for each type of request).

### 2. The Database (PostgreSQL)
This is where all data lives permanently. Think of it as a set of Excel sheets
stored on the server. When you create a donation, it gets saved here. When
you log in, your password is checked against data stored here.

We use **PostgreSQL**, which is one of the most trusted database systems in
the world. It's free, fast, and very reliable.

### 3. The Rules Layer (Middleware + JWT)
Not everyone should be able to do everything. A donor should not be able to
see the admin panel. An NGO should not be able to delete someone else's donation.

We enforce these rules using something called **JWT (JSON Web Token)** — a
digital ID card that is given to you when you log in. Every time you do
something on the platform, you show your ID card and the server checks if
you're allowed to do that thing.

---

## The Database — Our "Filing Cabinet"

The database has three main tables (think of each as a separate sheet in Excel):

---

### Table 1: Users

Stores everyone who has an account on the platform.

| Column | What it stores |
|--------|----------------|
| id | A unique number for each user (auto-generated) |
| name | The user's full name |
| email | Their email address (must be unique) |
| password_hash | Their password — stored in scrambled form (not readable by anyone) |
| role | Whether they are a DONOR, NGO, or ADMIN |
| is_verified | Whether an admin has verified them (TRUE or FALSE) |
| created_at | The date and time they signed up |

**Why is the password "scrambled"?**
We never store your actual password. Instead, we run it through a one-way
scrambling process called **bcrypt hashing**. The scrambled version (called a
"hash") is stored. When you log in, your entered password gets scrambled the
same way and compared. If they match, you're in. This means even if someone
stole our database, they could not read any passwords.

---

### Table 2: Donations

Stores every food donation listed on the platform.

| Column | What it stores |
|--------|----------------|
| id | A unique number for each donation |
| donor_id | Which user created this donation (links to Users table) |
| food_type | Type of food (e.g., "Rice", "Biryani") |
| quantity | How much (e.g., "20 plates") |
| address | Pickup address |
| best_before | How many hours until the food expires |
| notes | Any extra info from the donor |
| status | Current state of the donation (see below) |
| created_at | When the donation was listed |

**Donation Status — The Life of a Donation:**

```
AVAILABLE  →  Someone listed food, waiting for an NGO to request it
CLAIMED    →  An NGO's request was approved, food is being arranged for pickup
COLLECTED  →  Volunteer picked up the food (OTP was verified)
COMPLETED  →  The full cycle is done
EXPIRED    →  Nobody claimed it before the best_before time ran out
```

---

### Table 3: Requests

When an NGO sees a donation and wants it, they create a "request." This table
stores all those requests, plus all the volunteer/OTP information.

| Column | What it stores |
|--------|----------------|
| id | A unique number for each request |
| donation_id | Which donation is being requested (links to Donations table) |
| ngo_id | Which NGO is making the request (links to Users table) |
| status | PENDING, APPROVED, or REJECTED |
| volunteer_name | Name of the volunteer assigned for pickup |
| volunteer_phone | Volunteer's phone number |
| vehicle_type | What vehicle they're using (bike, car, etc.) |
| vehicle_number | The vehicle's registration number |
| otp | A 4-digit code generated when volunteer is assigned |
| otp_verified | Whether the donor confirmed the OTP (TRUE or FALSE) |
| created_at | When the request was made |

---

## How the Server is Organized — The "Routes"

Every action on the platform is called an **API endpoint** — think of it as a
specific "window" at a post office. You go to the right window for the right task.

Our server has 4 groups of windows:

---

### Group 1: `/api/auth` — The Identity Window

This handles everything about accounts and login.

**POST /api/auth/register** — Create a new account
- You send: name, email, password, role
- Server does: scrambles the password, saves you to the Users table
- You get back: a JWT token (your ID card) + your user info

**POST /api/auth/login** — Log into your account
- You send: email, password
- Server does: finds your account, scrambles the entered password, compares
  it to the stored scrambled version. If they match, login is successful.
- You get back: a JWT token + your user info

**GET /api/auth/me** — "Who am I?" — Refresh your info
- You send: your JWT token
- You get back: your latest user info from the database

---

### Group 2: `/api/donations` — The Food Listings Window

This handles creating and managing food donations.

**POST /api/donations** — List new food (Donors only)
- You send: food type, quantity, address, best_before hours, notes
- Server does: saves it to Donations table with status = AVAILABLE
- You get back: the newly created donation

**GET /api/donations/available** — See all available food (NGOs only)
- You send: just your JWT token
- You get back: all donations with status = AVAILABLE

**GET /api/donations/mine** — See your own donations (Donors only)
- You send: just your JWT token
- You get back: all donations you created, with a count of pending requests

**DELETE /api/donations/:id** — Remove a donation (Donors only)
- Only works if the donation is still AVAILABLE (not yet claimed)

**PUT /api/donations/:id/status** — Update donation status (Donors only)
- Used to manually mark a donation as COLLECTED or COMPLETED

---

### Group 3: `/api/requests` — The Request & Pickup Window

This is the most important group. It handles the entire flow from
"NGO requests food" all the way to "volunteer delivers and OTP is verified."

**POST /api/requests** — NGO requests a donation (NGOs only)
- NGO sends: the donation_id they want
- Server does: creates a new request with status = PENDING
- You get back: the new request

**GET /api/requests/mine** — NGO sees their own requests (NGOs only)
- You get back: all requests made by this NGO, with food details

**GET /api/requests/incoming** — Donor sees all requests on their food (Donors only)
- You get back: all requests from all NGOs on all of the donor's donations
- This is how the donor sees who wants their food

**PUT /api/requests/:id** — Donor approves or rejects a request (Donors only)
- You send: action = "APPROVE" or "REJECT"
- If APPROVE: request status becomes APPROVED, donation status becomes CLAIMED
- If REJECT: request status becomes REJECTED

**PUT /api/requests/:id/volunteer** — NGO assigns a volunteer (NGOs only)
- Only works on APPROVED requests
- You send: volunteer_name, volunteer_phone, vehicle_type, vehicle_number
- Server does: saves volunteer info, generates a random 4-digit OTP, stores it
- You get back: the updated request including the OTP (shown to NGO)

**POST /api/requests/:id/verify-otp** — Donor verifies the OTP (Donors only)
- You send: the 4-digit OTP
- Server does: checks if the OTP matches what's stored in the database
- If correct: otp_verified = TRUE, donation status becomes COLLECTED
- If wrong: returns an error "Invalid OTP"

---

### Group 4: `/api/admin` — The Control Room Window

Only accessible by users with role = ADMIN.

**GET /api/admin/stats** — Platform overview numbers
- Returns: total users, total donations, total requests, completed donations

**GET /api/admin/users** — List all users
- Returns: everyone registered on the platform

**PUT /api/admin/users/:id/verify** — Verify or unverify a user
- Toggles the is_verified flag on a user account

**GET /api/admin/donations** — See all donations
**GET /api/admin/requests** — See all requests

---

## The Security System — JWT Tokens Explained

When you log in, the server creates a **JWT token** — a long string of
characters that looks like this:

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6Ik5HTyJ9.abc123xyz
```

Think of it as a **wristband at a theme park.** When you enter (log in), you
get a wristband. Every ride (every action) checks your wristband. You don't
need to show your password again — just the wristband. After 7 days, the
wristband expires and you need to log in again.

The JWT contains:
- Your user ID
- Your role (DONOR, NGO, or ADMIN)
- An expiry time

It is digitally signed using a secret key only the server knows. Nobody can
fake a JWT or change what role it says you are.

**How the frontend uses it:**
The token is saved in the browser's localStorage (like a small notepad in
your browser). Every time you make a request to the server, the token is
automatically attached. The server reads it, confirms it's valid, and knows
who you are.

---

## The Role Guard — "You're Not Allowed Here"

Every sensitive endpoint has a role check. Here's how it works:

```
Request comes in
      ↓
Does it have a valid JWT token?
      ↓ NO → Return error: "Access token required"
      ↓ YES
Is the user's role allowed for this action?
      ↓ NO → Return error: "Forbidden"
      ↓ YES
Do the thing (save data, fetch data, etc.)
```

For example:
- `POST /api/requests` — only NGOs can do this. If a donor tries, they get "Forbidden."
- `PUT /api/requests/:id` (approve/reject) — only donors can do this
- `/api/admin/*` — only admins can access any of this

---

## The Complete Journey — One Donation, Start to Finish

Let's walk through the entire lifecycle of a food donation step by step.

---

**Step 1: Donor Signs Up**
- Donor goes to the register page, fills in name, email, password, selects "Donor"
- Frontend sends this to `POST /api/auth/register`
- Server scrambles the password, saves the donor in the Users table
- Server sends back a JWT token
- Donor is now logged in and lands on the Donor Dashboard

**Step 2: Donor Lists Food**
- Donor clicks "New Donation," fills in the form (food type, quantity, address, expiry)
- Frontend sends this to `POST /api/donations`
- Server saves it in the Donations table with status = AVAILABLE
- The donation is now visible to all NGOs

**Step 3: NGO Sees the Food**
- NGO logs in, goes to their dashboard
- Dashboard automatically calls `GET /api/donations/available`
- Server returns all AVAILABLE donations
- NGO sees the donor's food listed on their screen

**Step 4: NGO Requests the Food**
- NGO clicks "Request Food" on the donation card
- Frontend sends `POST /api/requests` with the donation_id
- Server creates a new Request row: status = PENDING
- The donor now sees "1 pending request" on their dashboard

**Step 5: Donor Approves**
- Donor goes to "Incoming Requests," sees the NGO's request
- Donor clicks "Approve"
- Frontend sends `PUT /api/requests/:id` with action = "APPROVE"
- Server updates: request status → APPROVED, donation status → CLAIMED
- All other pending requests for the same donation are automatically REJECTED

**Step 6: NGO Assigns a Volunteer**
- NGO sees the request is now APPROVED on their dashboard
- NGO clicks "Assign Volunteer," fills in the volunteer's details
- Frontend sends `PUT /api/requests/:id/volunteer`
- Server saves the volunteer info and generates a 4-digit OTP (e.g., 7342)
- The OTP is stored in the database and displayed to the NGO
- NGO tells the volunteer: "Your OTP is 7342, show it to the donor"

**Step 7: Volunteer Goes for Pickup**
- Donor's dashboard now shows the volunteer's name, phone, and vehicle
- A box appears: "Enter OTP from volunteer"
- Volunteer arrives at the donor's location and says "My OTP is 7342"
- Donor types 7342 into the box and clicks "Confirm"
- Frontend sends `POST /api/requests/:id/verify-otp` with the OTP

**Step 8: Verification & Completion**
- Server checks: does "7342" match what's stored in the database?
- YES → otp_verified = TRUE, donation status → COLLECTED
- The donor's dashboard shows "Food Collected ✓"
- The food is now on its way to feed people in need

---

## File-by-File Guide

Here is what each file in the `server/` folder does:

| File | Plain English Purpose |
|------|-----------------------|
| `app.js` | The main "front door" — starts the server, sets up security rules (CORS), connects all the routes |
| `config/db.js` | Sets up the connection to the PostgreSQL database (like dialing a phone number to connect) |
| `config/schema.sql` | The blueprint for the database — defines all the tables and their columns. Run once to set up a fresh database |
| `middleware/auth.js` | The security guard — checks every request for a valid JWT token and verifies the user's role |
| `routes/auth.routes.js` | Handles register and login |
| `routes/donation.routes.js` | Handles creating, listing, and updating donations |
| `routes/request.routes.js` | Handles NGO requests, donor approvals, volunteer assignment, and OTP verification |
| `routes/admin.routes.js` | Handles admin panel data — stats, user list, verify users |

---

## Why We Made These Technology Choices

| Choice | Why |
|--------|-----|
| **Node.js** | Same language (JavaScript) as the frontend — easier to maintain |
| **Express** | Simple, fast, widely used — huge community support |
| **PostgreSQL** | Rock-solid, handles relationships between tables perfectly, free and open source |
| **JWT** | Stateless authentication — no need to store sessions on the server, scales easily |
| **bcrypt** | Industry standard for password hashing — extremely hard to reverse |
| **Raw SQL (no ORM)** | Direct database queries — easier to understand, no "magic" abstraction layer |

---

## Common Terms Glossary

| Term | What it means |
|------|---------------|
| **API** | A set of "windows" (endpoints) the frontend uses to talk to the backend |
| **Endpoint** | One specific URL/action, like `/api/auth/login` |
| **JWT** | A digital ID card given after login, used to authenticate every request |
| **Hash / bcrypt** | A one-way scramble of a password so it can never be read |
| **CORS** | A browser security rule — we tell the server which websites are allowed to talk to it |
| **Middleware** | Code that runs in-between every request — like a checkpoint before the real work happens |
| **OTP** | One-Time Password — a 4-digit code used once to verify the volunteer's identity |
| **Role** | What type of user you are: DONOR, NGO, or ADMIN |
| **Status** | The current "stage" of a donation or request (AVAILABLE, CLAIMED, etc.) |
| **Foreign Key** | A link between two tables — e.g., a donation's `donor_id` points to a row in the Users table |

---

*This document was written to help every member of the AnnSparsh team —
technical or not — understand how the platform works under the hood.*
