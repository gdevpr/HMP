// Renders the Pantry tab — "free" cooking staples grouped by section,
// each with a toggle to add/remove from the shopping list.

import { PANTRY } from '../data/pantry.js';
import { state, saveState } from '../state.js';
import { uiState } from '../ui-state.js';
import { el, showToast } from '../dom.js';
import { render } from '../app.js';

export function renderPantry() {
  const wrap = el('div', {},
    el('h2', { class: 'section-header' }, 'Pantry & cooking'),
    el('p', { class: 'section-sub' }, '"Free" cooking staples — Casey-approved. Tap + to add to your shopping list.'),
  );
  const grid = el('div', { class: 'pantry-grid' });
  const searchTerm = uiState.searchTerm;
  for (const section in PANTRY) {
    const items = PANTRY[section];
    const filtered = items.filter(i => !searchTerm || i.toLowerCase().includes(searchTerm.toLowerCase()) || section.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length === 0) continue;
    const sec = el('div', { class: 'pantry-section' }, el('h3', {}, section));
    const ul = el('ul');
    for (const item of filtered) {
      const shopKey = 'pantry|' + section + '|' + item;
      const onList = !!state.shopping[shopKey];
      ul.appendChild(el('li', {},
        el('span', { style: 'flex:1' }, item),
        el('button', {
          class: 'pantry-add-btn' + (onList ? ' on-list' : ''),
          title: onList ? 'Remove from shopping list' : 'Add to shopping list',
          onclick: () => {
            if (onList) delete state.shopping[shopKey];
            else state.shopping[shopKey] = { name: item, section, isPantry: true };
            saveState(); render();
            showToast(onList ? 'Removed from list' : 'Added to shopping list');
          },
        }, onList ? '✓' : '+'),
      ));
    }
    sec.appendChild(ul);
    grid.appendChild(sec);
  }
  wrap.appendChild(grid);
  return wrap;
}
