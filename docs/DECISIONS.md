# DECISIONS.md — Architectural Decision Records

<!-- MADR-lite format. One file until ~15 entries, then split into docs/adr/NNNN-*.md -->
<!-- Template per entry:
## ADR-NNN: Title
**Date:** YYYY-MM-DD  **Status:** Accepted | Superseded by ADR-NNN
**Context:** Why this decision needed to be made.
**Decision:** What we decided.
**Consequences:** What becomes easier / harder as a result.
-->

---

## ADR-001: Stay a No-Build-Step Vanilla-JS PWA
**Date:** 2026-06-07  **Status:** Accepted

**Context:**
The app started as a single 1841-line `index.html` (CSS + data + render logic inline). The user
considered "rethinking the whole stack" but, on reflection, said the priority was better code
organization for AI-agent handling — not a framework rewrite. The app is used as an installed PWA
on a phone for quick lookups; "open and it just works" is a feature, not a limitation.

**Decision:**
Keep zero build tooling. Split the monolith into native ES modules (`<script type="module">`),
served as static files. No bundler, no npm dependencies, no framework, no TypeScript.

**Consequences:**
+ The app still works by just serving (or even opening) static files — no `npm install`, no build,
  no toolchain to keep working across years of infrequent edits.
+ Smaller, single-purpose modules are far easier for an AI agent (or the user) to load into context
  and reason about than one 1841-line file.
+ Service worker / PWA caching stays simple — cache a flat list of static files.
- Some ergonomics a bundler would give (CSS preprocessing, JSX, hot reload) are unavailable —
  acceptable trade-off for a small personal reference app.
- Adding a dependency later means either a CDN `<script>` tag or revisiting this ADR.

---

## ADR-002: ES Modules with Intentional Circular Imports for Rendering
**Date:** 2026-06-07  **Status:** Accepted

**Context:**
View modules (`js/views/*.js`) need to trigger a full re-render after a user action (e.g. "add to
shopping list" → `render()`). The orchestrator (`js/app.js`) needs to import each view's
`render*()` function to dispatch on the active tab. That's a two-way dependency between `app.js`
and every view module.

**Decision:**
Let the circular import exist: views do `import { render } from '../app.js'`, and `app.js` imports
render functions from views. This is *safe* in native ES modules because:
- Imports are live bindings resolved at link-time, not copies taken at import-time.
- `render` is only ever *called* inside event-handler closures — at runtime, long after both
  modules have finished evaluating — never at module-evaluation time.

**Consequences:**
+ Each view module is self-contained and owns its own event handlers — no need to thread callbacks
  down from `app.js`.
+ No "god object" — `app.js` stays a thin orchestrator (render loop + top-level event wiring).
- This pattern looks like a mistake to anyone (including future-Claude) who doesn't know ES modules
  handle circular imports via live bindings. **Don't "fix" it by merging files or adding indirection
  layers** — re-read this ADR first.

---

## ADR-003: JSON Export/Import Backup for Persisted State
**Date:** 2026-06-07  **Status:** Accepted

**Context:**
All persisted state (shopping list, meal builder, and — most importantly — "My Meals" saved combos)
lives only in `localStorage` under key `mealPlan_v2`. The user explicitly flagged the risk: *"si
borro la app, pierdo los meals que haya guardado"* (if I delete the app, I lose my saved meals).
`localStorage` can be wiped by clearing site data, reinstalling the PWA, switching browsers/devices,
or iOS's occasional aggressive storage eviction — with no warning to the user.

**Decision:**
Add `exportBackup()` / `importBackupFromFile()` to `js/state.js`:
- **Export**: serialize `{ shopping, meal, savedMeals }` to JSON (with a `backupVersion` and
  `exportedAt` timestamp), download via `Blob` + `URL.createObjectURL`.
- **Import**: read a `.json` file (`File.text()` + `JSON.parse`), replace `shopping`/`meal`, and
  **merge** `savedMeals` by `id` (imported entries win on collision) so restoring an old backup
  can't silently delete meals saved since that backup was made.
- UI: "Export backup" / "Import backup" buttons in the "More" drawer, wired in `js/app.js`.

**Consequences:**
+ The user can keep a `.json` backup anywhere they like (Files app, cloud drive, email to self) —
  fully outside the browser's storage, immune to site-data clearing.
+ The merge-by-id import strategy means importing is low-risk: it can't destroy newer local data.
+ If the persisted-state shape changes later, bump `BACKUP_VERSION` in `js/state.js` and handle
  old-version payloads in `importBackupFromFile` — don't just change the shape silently.
- This is a manual backup (the user has to remember to export) — no automatic cloud sync. Acceptable
  for v1; could revisit if data loss actually occurs.
