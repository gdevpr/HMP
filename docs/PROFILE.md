# PROFILE.md — Project Identity

## What Is This?
**Healthy Eating Plan** is a personal reference PWA built around Dr. Casey Means' "5 IN · 3 OUT"
nutrition framework and Lcda. Mariely Rosado's per-meal portion-structure rules. It's a quick-lookup
tool G uses on their phone: "what can I eat for breakfast that fits the plan?", "what's on my
shopping list?", "what was that meal combo I liked last week?"

## Who Is It For?
- **Just G.** Not shared with Marielys, Dr. Casey's team, or anyone else.
- The reference PDFs/markdown (`DrCasey.pdf`, `Marielys.pdf`, `Meal_Plan_*.md`,
  `Plan_Alimentacion_*.md`) are source material the app's data was built from — not app inputs.

## How It's Used
- **PWA on the phone**, installed via "Add to Home Screen". Quick consultation, not a sit-down
  planning session — speed and at-a-glance clarity matter more than feature depth.
- Primary flows: browse a meal tab → check portion structure → add items to the shopping list or
  meal builder → save favorite combos to "My Meals" for fast reuse later.

## What Makes It "This" Plan (not a generic meal app)?
1. **5 IN · 3 OUT** is Dr. Casey Means' framework: eat enough omega-3s, probiotics, micronutrients,
   fiber, and protein daily; avoid refined sugar, refined grains, and industrial seed oils.
   See `js/views/rules.js` for the full reference text — keep it verbatim.
2. **Portion structure** (e.g. breakfast = 2 Carbs · 2 Fruit · 4 Protein · 1 Fat optional) comes from
   Lcda. Mariely Rosado, the user's dietitian. Shown as the "structure card" atop each meal tab.
3. **Curated food lists**: every item in `js/data/items.js` is either on Dr. Casey's official
   "Ultimate Food List" or explicitly marked `override: true` ("✎ Manual") because the user chose
   to keep it anyway (e.g. Ezekiel bread, oats, quinoa — see the full list in `js/views/rules.js`).
4. **Shopping rules**: organic/grass-fed/pasture-raised preferences, zero seed oils, no added sugar —
   these aren't generic "eat healthy" tips, they're specific label-reading rules the user follows.

## Success Metrics
- Opens instantly, works offline (PWA + service worker), installable on iOS/Android.
- Saved meals and shopping list survive app updates and don't get silently lost — protected by the
  JSON export/import backup (see ADR-003 in `docs/DECISIONS.md`).
- Adding/removing items from the shopping list or meal builder feels instant (no network round-trip;
  everything is local).
- The rules/portion-structure reference is fast to find when standing in a grocery aisle.

## Technical Ownership
- Solo personal project. G is the only user and maintainer.
- Claude (via Cowork / Claude Code) is the coding assistant — full context lives in this repo.
- No backend, no build step, no team — keep it that simple (see ADR-001).

## Out of Scope
- Multi-user / accounts / sharing — explicitly "solo para mí".
- A build pipeline, framework, or TypeScript — adds ceremony with no payoff for a single-file-ish PWA.
- Nutrition tracking / calorie counting / logging what was actually eaten — this is a *planning and
  reference* tool, not a food diary.
- Editing the underlying nutrition rules without the user's say-so — they come from a licensed
  dietitian and a physician's published list; Claude shouldn't second-guess them.

## Notes for Claude
- When a question is about *what to eat*, the answer lives in `js/data/*` and `js/views/rules.js` —
  don't invent food advice; surface what's already encoded (or ask the user to add it).
- When a question is about *code structure*, this file + `docs/DECISIONS.md` + `AGENTS.md` should be
  enough context — the project is intentionally small.
- If the user asks for something that would require a build step, backend, or framework, point out
  the tension with ADR-001 and confirm they actually want to change that decision before proceeding.
