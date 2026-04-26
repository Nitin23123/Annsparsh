# AnnSparsh — Current State

> **Last updated:** 2026-04-26
> **Current branch:** main
> **Latest commit:** 7072a38 — docs: add plain-English backend explanation

---

## Active milestone

**M2 — Pilot-Hardening** (see [ROADMAP.md](ROADMAP.md))

## Active phase

None active. Next up: **P8 — Realtime notifications (Socket.IO)**.

To start it, run: `gsd /gsd:plan-phase P8`

---

## What's built and verified

- All M1 phases (P1–P7) complete and merged to `main`.
- Manual end-to-end test passed: donor creates → NGO requests → donor approves → NGO assigns volunteer → OTP generated → donor verifies → status flips to COLLECTED.

## What's in flight

Nothing in flight. Working tree has deleted server scaffolding files (test-flow.js, seed-dev.js, etc.) staged for cleanup but not committed.

## What's blocked

Nothing blocked.

---

## Outstanding decisions to make

| Decision | Owner | By when |
|----------|-------|---------|
| Twilio vs MSG91 for SMS in India | Nitin | Before P9 |
| Pilot city (Delhi NCR vs Bengaluru) | Nitin | Before P14 |
| Self-host Postgres or managed (Neon/Supabase) | Nitin | Before pilot |
| Hosting for Express backend (Render / Railway / VPS) | Nitin | Before pilot |

---

## Risks being tracked

| Risk | Severity | Mitigation |
|------|---------|-----------|
| Inline SQL in routes makes refactor painful as features grow | Medium | P11 explicitly addresses this |
| No tests = regression risk on every feature | High | P12 prioritized in M2 |
| OTP delivered via UI only (not SMS) means NGO must hand-relay → friction | Medium | P9 SMS rollout |
| No rate limiting on auth endpoints | High | Add to P11 scope |
| `JWT_SECRET` is per-developer-env; needs production secret store | High | Before pilot deploy |

---

## Repo housekeeping

- Working tree has staged deletions (server/test-*.js, seed-dev.js, etc.) — commit or restore before next phase.
- `.claude/` folder created (not yet in `.gitignore` — verify intent).
- No CI/CD configured yet — consider GitHub Actions in P12.
