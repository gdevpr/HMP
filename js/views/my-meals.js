// Renders the "My Meals" tab — saved meal combos the user can reload into
// the meal builder or delete. This is the data the export/import backup
// feature in state.js exists to protect (see js/state.js, docs/DECISIONS.md).

import { ITEMS } from '../data/items.js';
import { state, saveState } from '../state.js';
import { uiState } from '../ui-state.js';
import { el, showToast } from '../dom.js';
import { render, togglePanel } from '../app.js';

export function renderMyMeals() {
  const types = ['breakfast', 'lunch', 'dinner'];
  const typeLabels = { breakfast: '🍳 Breakfast', lunch: '🥗 Lunch', dinner: '🍽 Dinner' };
  const wrap = el('div', {},
    el('h2', { class: 'section-header' }, 'My Meals'),
    el('p', { class: 'section-sub' }, 'Your saved meals. Tap Load to bring a meal back into the builder.'),
  );

  const hasMeals = state.savedMeals.length > 0;
  if (!hasMeals) {
    wrap.appendChild(el('div', { class: 'empty' }, 'No saved meals yet. Build a meal and tap "Save Meal" to store it here.'));
    return wrap;
  }

  for (const type of types) {
    const meals = state.savedMeals.filter(m => m.type === type);
    if (meals.length === 0) continue;
    const section = el('div', { class: 'my-meals-section' },
      el('h3', { class: 'my-meals-type-header' }, typeLabels[type]),
    );
    for (const meal of meals) {
      const itemNames = meal.items
        .map(id => ITEMS.find(i => i.id === id))
        .filter(Boolean)
        .map(i => i.name);
      const preview = itemNames.length > 4
        ? itemNames.slice(0, 4).join(', ') + ` +${itemNames.length - 4} more`
        : itemNames.join(', ');

      section.appendChild(el('div', { class: 'saved-meal-card' },
        el('div', { class: 'saved-meal-info' },
          el('div', { class: 'saved-meal-name' }, meal.name),
          el('div', { class: 'saved-meal-items' }, preview || 'No items'),
        ),
        el('div', { class: 'saved-meal-actions' },
          el('button', {
            class: 'load-meal-btn',
            onclick: () => {
              state.meal.type = meal.type;
              state.meal.items = [...meal.items];
              saveState();
              uiState.panelView = 'meal';
              if (window.innerWidth < 1024) togglePanel(true);
              render();
              showToast('Meal loaded into builder');
            }
          }, 'Load'),
          el('button', {
            class: 'delete-meal-btn',
            onclick: () => {
              if (confirm('Delete "' + meal.name + '"?')) {
                state.savedMeals = state.savedMeals.filter(m => m.id !== meal.id);
                saveState(); render();
                showToast('Meal deleted');
              }
            }
          }, 'Delete'),
        ),
      ));
    }
    wrap.appendChild(section);
  }
  return wrap;
}
