# Phase Workspace

This directory holds per-phase artifacts created by GSD agents.

When you start a phase (`gsd /gsd:plan-phase P8`), GSD writes:

```
.planning/phases/P8-realtime-notifications/
├── DISCUSS.md      # Q&A captured during /gsd:discuss-phase
├── RESEARCH.md     # Output of /gsd:research-phase
├── PLAN.md         # The actual executable plan
├── REVIEW.md       # Code review findings
├── VERIFICATION.md # Goal-backward verification report
└── notes/          # Free-form working notes
```

Phases for AnnSparsh are listed in [../ROADMAP.md](../ROADMAP.md). Active phase is named in [../STATE.md](../STATE.md).
