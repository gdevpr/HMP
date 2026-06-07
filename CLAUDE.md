# CLAUDE.md — Healthy Eating Plan
<!-- Claude-specific. Imports shared rules from AGENTS.md. -->
<!-- Keep under 120 lines. Overflow goes to docs/. -->

@AGENTS.md

## Memory Model
Read in this order at session start:
1. This file (CLAUDE.md) — always loaded
2. `docs/handoffs/` — most recent session handoff, if any
3. `TODO.md` — current task list
4. `docs/PROFILE.md` / `docs/DECISIONS.md` — only when working on structure or making a
   non-obvious choice (this is a small solo project; you don't need these for routine edits)

## Session Workflow
This is a **solo personal project** — no team, no PRs, no CI. Keep ceremony light:
- **Routine changes** (tweak an item, fix a render bug, adjust styling): just do it, no handoff needed.
- **Structural changes** (new module, new persisted-state shape, new view): log the decision in
  `docs/DECISIONS.md` (see ADR template there) and update `docs/PROFILE.md` if scope changed.
- **End of a substantial session**: write `docs/handoffs/YYYY-MM-DD.md` with: what changed, current
  state, anything left half-done, and the next step. Skip this for small/quick sessions.

## Project Phase
**Phase:** Restructured from a single 1841-line `index.html` into ES modules (2026-06-07).
**Focus:** Clean separation of data/state/views; JSON backup to protect saved meals from data loss.
**Stable / not actively changing:** the nutrition rules and food data — treat as reference content.

## Coding Conventions (Claude-specific)
- Match the existing style: `function`/arrow mix as already used, no semicolon-free style changes,
  no reformatting unrelated code in the same edit.
- One `render*()` per view; keep DOM-building declarative via `el()` from `js/dom.js`.
- New persisted fields go in `state` (`js/state.js`) with a sensible default in `loadState()`'s
  fallback block — old `localStorage` data must still load without throwing.
- New transient UI flags go in `uiState` (`js/ui-state.js`), not as bare module-level `let`s.
- Prefer extending an existing `js/data/*` file over inventing a new shape; if the new data doesn't
  fit existing categories, ask the user before restructuring (it's their nutrition plan, not yours
  to redesign).

## Verification (no test suite — do this manually after structural edits)
1. Serve locally: `python3 -m http.server 8765` from the project root, open `index.html`.
2. Click through: each tab renders items → search/filter → add to shopping list → add to meal
   builder → save a meal → reload it from "My Meals" → export backup downloads a `.json`.
   (A Playwright script exercising exactly this flow was used during the 2026-06-07 restructure —
   see `docs/handoffs/2026-06-07.md` if you want to recreate it.)
3. Check the browser console for errors — there's no error boundary; a thrown exception in a
   render function blanks that section silently.

## Out of Scope (by the user's choice — don't propose these)
- Build tooling, bundlers, TypeScript, frameworks (React/Vue/etc.) — see ADR-001.
- A backend / sync server / accounts — this is a single-user, offline-first phone PWA.
- Sharing features — "solo para mí," not built for Marielys or Dr. Casey's team.
