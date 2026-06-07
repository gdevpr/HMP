// Renders the Shopping List panel — items added via "+ List" (food, grouped
// by category) and pantry items (added with a 'pantry|<section>|<name>' key,
// see js/views/pantry.js), with per-item removal and a clear-all action.

import { ITEMS } from '../data/items.js';
import { state, saveState } from '../state.js';
import { el, catLabel } from '../dom.js';
import { render } from '../app.js';

export function renderShoppingList() {
  const wrap = el('div');
  const keys = Object.keys(state.shopping);
  if (keys.length === 0) {
    wrap.appendChild(el('div', { class: 'empty-state' }, 'Tap + on any item to add to your list.'));
    return wrap;
  }

  // Separate food items from pantry items
  const foodKeys = keys.filter(k => !k.startsWith('pantry|'));
  const pantryKeys = keys.filter(k => k.startsWith('pantry|'));

  // Food items grouped by category
  const byCat = {};
  for (const id of foodKeys) {
    const it = ITEMS.find(i => i.id === id);
    if (!it) continue;
    if (!byCat[it.category]) byCat[it.category] = [];
    byCat[it.category].push({ key: id, it });
  }
  for (const cat in byCat) {
    wrap.appendChild(el('h4', { style: 'margin:12px 0 6px;font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em' }, catLabel(cat)));
    const list = el('div', { class: 'panel-list', style: 'max-height:none' });
    for (const { key, it } of byCat[cat]) {
      list.appendChild(el('div', { class: 'panel-item' },
        el('span', { class: 'name' }, (it.brand ? it.brand + ' — ' : '') + it.name),
        el('span', { class: 'portion' }, it.portion),
        el('button', { class: 'panel-item-remove', onclick: () => { delete state.shopping[key]; saveState(); render(); } }, '×'),
      ));
    }
    wrap.appendChild(list);
  }

  // Pantry items grouped under one header
  if (pantryKeys.length > 0) {
    wrap.appendChild(el('h4', { style: 'margin:12px 0 6px;font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em' }, 'Pantry'));
    const list = el('div', { class: 'panel-list', style: 'max-height:none' });
    for (const key of pantryKeys) {
      const entry = state.shopping[key];
      const name = typeof entry === 'object' ? entry.name : key.split('|')[2];
      list.appendChild(el('div', { class: 'panel-item' },
        el('span', { class: 'name' }, name),
        el('button', { class: 'panel-item-remove', onclick: () => { delete state.shopping[key]; saveState(); render(); } }, '×'),
      ));
    }
    wrap.appendChild(list);
  }

  wrap.appendChild(el('button', {
    class: 'clear-all',
    onclick: () => { if (confirm('Clear shopping list?')) { state.shopping = {}; saveState(); render(); } }
  }, 'Clear list'));
  return wrap;
}
