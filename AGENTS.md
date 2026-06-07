# AGENTS.md — Healthy Eating Plan
<!-- Universal: read by Claude, Cursor, Copilot, Gemini CLI, etc. -->
<!-- Keep under 120 lines. Move details to docs/. -->

## Project Identity
A personal PWA: a "5 IN · 3 OUT" healthy-eating reference and meal planner,
used on G's phone for quick lookups while shopping and cooking.
Stack: vanilla HTML/CSS/JS — native ES modules, **no build step, no framework, no backend.**
Runtime: static files opened directly / served as a PWA (manifest + service worker).

## Repo Layout
```
index.html        Thin shell — markup only, links css/styles.css and js/app.js
css/styles.css    All styles
js/data/          Static reference data (food items, snacks, pantry, meal targets)
js/state.js       Persisted app state (localStorage) + JSON backup export/import
js/ui-state.js    Transient UI state (active tab, search, filters, panel view)
js/dom.js         Tiny DOM helpers (el, showToast, catLabel)
js/views/         One render function per tab/panel
js/pwa.js         Service worker registration + install-prompt wiring
js/app.js         Orchestration: render loop, event wiring, app entry point
sw.js, manifest.json, icon-*.png   PWA plumbing
docs/             PROFILE.md, DECISIONS.md, handoffs/
*.pdf, *.md (Meal_Plan_*, Plan_Alimentacion_*)   Source nutrition references (read-only material)
```

## Architecture Rules (non-negotiable)
1. **No build step.** This stays a "double-click index.html and it works" PWA. Don't introduce
   bundlers, transpilers, npm dependencies, or frameworks — see ADR-001 in `docs/DECISIONS.md`.
2. **Data / state / UI-state / views / orchestration stay separated:**
   - `js/data/*` — pure static arrays/objects. No functions, no DOM.
   - `js/state.js` — persisted state (`state` object): shopping list, meal builder, saved meals.
   - `js/ui-state.js` — transient UI state (`uiState` object): tab, search, filters, panel view.
   - `js/views/*` — one `render*()` function (or small group) per tab/panel. Pure rendering + the
     event handlers for that view's own controls.
   - `js/app.js` — the only place that wires top-level events, owns `render()`, and calls `setupPWA()`.
3. **`state` and `uiState` are stable object references.** Mutate properties (`state.shopping[k] = …`,
   `Object.assign(state, x)`) — never reassign the exported binding (`export const`, not `let`).
   ES module imports are read-only live bindings; reassigning the binding breaks every importer.
4. **Circular imports between views and app.js are expected and fine.** Views call `render()` from
   inside event-handler closures (runtime), not at module-evaluation time — see ADR-002.

## Commands
```bash
# No install, no build. Just serve the static files:
cd /path/to/Nutrition && python3 -m http.server 8765
# then open http://localhost:8765/index.html

# Quick data-integrity check (counts items, validates exports parse):
node -e "import('./js/data/items.js').then(m => console.log(m.ITEMS.length))"
```

## Always / Never
**Always:**
- Preserve the Dr. Casey "5 IN · 3 OUT" framework and Marielys' portion-structure rules verbatim
  when touching `js/data/*` or `js/views/rules.js` — they are domain content, not code to "improve".
- Mark items not on Dr. Casey's official list with `override: true` (rendered as "✎ Manual").
- Keep `docs/PROFILE.md` and `docs/DECISIONS.md` in sync with any structural change.
- Run the app in a browser (or the verification flow in a recent handoff) after structural edits —
  there's no test suite, so manual/scripted click-through is the safety net.

**Never:**
- Add a bundler, npm dependency, or framework — defeats the "open and it just works" PWA goal.
- Reassign `state` or `uiState` (`state = {...}`) — always mutate in place.
- Change the nutrition rules/portions/food lists without the user's explicit say-so — this is
  medically-adjacent reference content sourced from Dr. Casey Means and Lcda. Mariely Rosado.
- Touch `localStorage` key `mealPlan_v2` format without updating `exportBackup`/`importBackupFromFile`
  in `js/state.js` (bumping `BACKUP_VERSION` if the shape changes) — this is the user's only
  protection against losing saved meals if the browser/PWA data is cleared.

## Domain Glossary
| Term | Meaning |
|---|---|
| `5 IN · 3 OUT` | Dr. Casey Means' framework: 5 things to eat daily, 3 to avoid (see `js/views/rules.js`) |
| Portion structure | Marielys' per-meal counts (e.g. "2 Carbs · 2 Fruit · 4 Protein") shown on each meal tab |
| `override: true` | Item kept by user choice though not on Dr. Casey's official list ("✎ Manual") |
| Meal builder | Panel where the user assembles a meal from items, tracked against `MEAL_TARGETS` |
| Saved meal / "My Meals" | A named meal combo saved to `state.savedMeals` for quick reuse |
| Backup | JSON export/import of `state` (shopping, meal builder, saved meals) — see ADR-003 |

## For Claude Users
See `CLAUDE.md` for the memory model and session workflow.
