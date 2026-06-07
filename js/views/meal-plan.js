// Renders the Breakfast / Lunch / Dinner / AM-Snack / PM-Snack tabs:
// item cards (with "+ List" / "+ Meal" actions), grouped by category,
// filtered by the search box and category chips.

import { ITEMS } from '../data/items.js';
import { state, saveState } from '../state.js';
import { uiState } from '../ui-state.js';
import { el, showToast, catLabel } from '../dom.js';
import { render } from '../app.js';

export function itemMatchesSearch(item) {
  if (!uiState.searchTerm) return true;
  const q = uiState.searchTerm.toLowerCase();
  return item.name.toLowerCase().includes(q) ||
    (item.brand && item.brand.toLowerCase().includes(q)) ||
    (item.note && item.note.toLowerCase().includes(q)) ||
    item.category.toLowerCase().includes(q);
}

export function itemMatchesFilters(item) {
  if (uiState.activeFilters.size === 0) return true;
  return uiState.activeFilters.has(item.category);
}

// Both Lunch and Dinner pull from the same 'lunch_dinner' item pool.
export function getMealKey(tab) {
  return (tab === 'lunch' || tab === 'dinner') ? 'lunch_dinner' : tab;
}

export function getItemsForMeal(mealKey) {
  return ITEMS.filter(i => i.meals.includes(mealKey) && itemMatchesSearch(i) && itemMatchesFilters(i));
}

export function makeItemCard(item) {
  const isShop = !!state.shopping[item.id];
  return el('div', { class: 'item-card' },
    el('div', { class: 'item-top' },
      el('div', { class: 'item-name' }, item.name),
      el('span', { class: 'item-portion' }, item.portion),
    ),
    (item.brand || item.override) ? el('div', {},
      item.brand ? el('span', { class: 'item-brand' }, item.brand) : null,
      item.override ? el('span', { class: 'item-manual' }, '✎ Manual') : null,
    ) : null,
    item.note ? el('div', { class: 'item-note' }, item.note) : null,
    el('div', { class: 'item-actions' },
      el('button', {
        class: 'action-btn shop' + (isShop ? ' active' : ''),
        title: 'Toggle on shopping list',
        onclick: () => {
          if (isShop) delete state.shopping[item.id];
          else state.shopping[item.id] = true;
          saveState(); render();
          showToast(isShop ? 'Removed from list' : 'Added to shopping list');
        },
      }, isShop ? '✓ List' : '+ List'),
      el('button', {
        class: 'action-btn action-btn-add',
        title: 'Add to meal builder',
        onclick: () => {
          state.meal.items.push(item.id);
          saveState(); render(); showToast('Added to meal');
        },
      }, '+ Meal'),
    ),
  );
}

export function renderItemsByCategory(mealKey) {
  const items = getItemsForMeal(mealKey);
  if (items.length === 0) return el('div', { class: 'empty' }, 'No items match your search or filters.');

  const byCat = {};
  for (const item of items) {
    if (!byCat[item.category]) byCat[item.category] = [];
    byCat[item.category].push(item);
  }

  const order = ['carb', 'fruit', 'protein', 'vegetable', 'fat'];
  const wrap = el('div');
  for (const cat of order) {
    if (!byCat[cat]) continue;
    wrap.appendChild(el('div', { class: 'category-block' },
      el('h3', { class: 'category-title' },
        el('span', { class: 'category-pill cat-' + cat }, catLabel(cat)),
        el('span', {}, byCat[cat].length + ' option' + (byCat[cat].length === 1 ? '' : 's')),
      ),
      el('div', { class: 'item-grid' }, ...byCat[cat].map(makeItemCard)),
    ));
  }
  return wrap;
}

export function renderBreakfast() {
  return el('div', {},
    el('div', { class: 'structure-card' },
      el('span', { class: 'structure-by' }, 'Marielys'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--carb)' }), '2 Carbs'),
      el('span', { class: 'structure-sep' }, '·'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--fruit)' }), '2 Fruit'),
      el('span', { class: 'structure-sep' }, '·'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--protein)' }), '4 Protein'),
      el('span', { class: 'structure-sep' }, '·'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--fat)' }), '1 Fat (opt)'),
    ),
    renderItemsByCategory('breakfast'),
  );
}

export function renderLunchOrDinner(tabName) {
  return el('div', {},
    el('div', { class: 'structure-card' },
      el('span', { class: 'structure-by' }, 'Marielys'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--carb)' }), '4 Carbs'),
      el('span', { class: 'structure-sep' }, '·'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--protein)' }), '5 Protein'),
      el('span', { class: 'structure-sep' }, '·'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--vegetable)' }), '1 Vegetable'),
      el('span', { class: 'structure-sep' }, '·'),
      el('div', { class: 'structure-group' }, el('div', { class: 'structure-dot', style: 'background:var(--fat)' }), '1 Fat (opt)'),
    ),
    renderItemsByCategory('lunch_dinner'),
  );
}

export function renderSnackTab(combos, title, calLabel) {
  return el('div', {},
    el('h2', { class: 'section-header' }, title),
    el('p', { class: 'section-sub' }, calLabel),
    el('div', { class: 'combo-list' },
      ...combos.filter(c => !uiState.searchTerm || c.toLowerCase().includes(uiState.searchTerm.toLowerCase())).map(c =>
        el('div', { class: 'combo-card' }, el('div', { class: 'combo-bullet' }), el('div', {}, c))
      ),
    ),
  );
}
