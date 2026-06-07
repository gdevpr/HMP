// Renders the Meal Builder panel — lets the user assemble a meal from items
// added via "+ Meal", tracks progress against Marielys' portion-structure
// targets (MEAL_TARGETS), and saves the result into state.savedMeals.

import { ITEMS } from '../data/items.js';
import { MEAL_TARGETS } from '../data/meal-targets.js';
import { state, saveState } from '../state.js';
import { el, showToast, catLabel } from '../dom.js';
import { render } from '../app.js';

export function renderMealBuilder() {
  const wrap = el('div');

  const select = el('select', {
    onchange: (e) => { state.meal.type = e.target.value; saveState(); render(); }
  },
    el('option', { value: 'breakfast' }, 'Breakfast'),
    el('option', { value: 'lunch' }, 'Lunch'),
    el('option', { value: 'dinner' }, 'Dinner'),
  );
  select.value = state.meal.type;
  wrap.appendChild(el('div', { class: 'meal-selector' }, select));

  const targets = MEAL_TARGETS[state.meal.type];
  const tally = {};
  const items = state.meal.items.map(id => ITEMS.find(i => i.id === id)).filter(Boolean);
  for (const it of items) tally[it.category] = (tally[it.category] || 0) + 1;

  const progressWrap = el('div', { class: 'meal-target-row' });
  for (const cat of ['carb', 'fruit', 'protein', 'vegetable', 'fat']) {
    if (!(cat in targets)) continue;
    const target = targets[cat];
    const current = tally[cat] || 0;
    const pct = Math.min(100, (current / target) * 100);
    const done = current >= target;
    progressWrap.appendChild(el('div', { class: 'meal-progress cat-' + cat },
      el('span', { class: 'label' }, catLabel(cat)),
      el('div', { class: 'bar' }, el('div', { class: 'fill', style: 'width:' + pct + '%' })),
      el('span', { class: 'nums' + (done ? ' complete' : '') }, current + '/' + target + (done ? ' ✓' : '')),
    ));
  }
  wrap.appendChild(progressWrap);

  if (items.length === 0) {
    wrap.appendChild(el('div', { class: 'empty-state' }, 'Tap "+ Meal" on any item to start building.'));
  } else {
    const list = el('div', { class: 'panel-list' });
    items.forEach((it, idx) => {
      list.appendChild(el('div', { class: 'panel-item' },
        el('span', { class: 'category-pill cat-' + it.category, style: 'font-size:9px;padding:1px 6px;flex-shrink:0' }, catLabel(it.category)[0]),
        el('span', { class: 'name' }, it.name),
        el('span', { class: 'portion' }, it.portion),
        el('button', {
          class: 'panel-item-remove',
          onclick: () => { state.meal.items.splice(idx, 1); saveState(); render(); }
        }, '×'),
      ));
    });
    wrap.appendChild(list);
    wrap.appendChild(el('button', {
      class: 'clear-all',
      onclick: () => { if (confirm('Clear meal builder?')) { state.meal.items = []; saveState(); render(); } }
    }, 'Clear meal'));
  }

  // Save meal form
  const nameInput = el('input', {
    class: 'save-meal-input',
    type: 'text',
    placeholder: 'e.g. My usual breakfast',
    value: state.meal.saveName || '',
    oninput: (e) => { state.meal.saveName = e.target.value; },
  });
  wrap.appendChild(el('div', { class: 'save-meal-form' },
    el('label', {}, 'Save this meal as'),
    nameInput,
    el('button', {
      class: 'save-meal-btn',
      onclick: () => {
        const name = (state.meal.saveName || '').trim();
        if (!name) { showToast('Enter a name first'); return; }
        if (state.meal.items.length === 0) { showToast('Add items first'); return; }
        state.savedMeals.push({
          id: Date.now().toString(),
          name,
          type: state.meal.type,
          items: [...state.meal.items],
          createdAt: Date.now(),
        });
        state.meal.saveName = '';
        saveState(); render();
        showToast('Meal saved!');
      }
    }, '💾 Save Meal'),
  ));

  return wrap;
}
