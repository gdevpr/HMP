# TODO.md

<!-- Lightweight task list for this solo project. Check items off as you go;
     prune completed items during the next session rather than archiving them. -->

## Now
*(nothing queued — restructure complete as of 2026-06-07, see docs/handoffs/2026-06-07.md)*

## Ideas / someday
- [ ] Remind the user to export a backup periodically (e.g. show a banner if it's been a while
      since the last `exportBackup()` — would need to record a last-export timestamp in `state`).
- [ ] De-duplicate the rules content: `js/views/rules.js` currently duplicates text that also
      lives in `docs/PROFILE.md` and `Meal_Plan_English.md` / `Plan_Alimentacion_Espanol.md`.
      Consider extracting to `js/data/rules.js` as the single source of truth.
- [ ] Consider an "are you sure you have a recent backup?" nudge before any destructive action
      (clear shopping list, clear meal builder, delete saved meal) — currently just a `confirm()`.

## Done (recent)
- [x] 2026-06-07 — Restructured monolithic `index.html` (1841 lines) into ES modules
      (css/, js/data/, js/views/, js/state.js, js/ui-state.js, js/dom.js, js/pwa.js, js/app.js).
- [x] 2026-06-07 — Added JSON export/import backup for shopping list, meal builder, and saved meals.
- [x] 2026-06-07 — Verified restructured app via headless browser click-through (zero errors,
      item counts match original).
- [x] 2026-06-07 — Added AI-agent context files: AGENTS.md, CLAUDE.md, docs/PROFILE.md,
      docs/DECISIONS.md, docs/handoffs/, TODO.md.
