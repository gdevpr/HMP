// App orchestration: wires together state, UI state, and views; owns the
// render loop and all top-level event listeners (tabs, search, panel,
// "More" drawer, backup import/export, PWA setup).
//
// Circular-import note: view modules `import { render } from './app.js'`
// and this module imports their render-functions back. That's fine in ES
// modules — `render` is only invoked inside event-handler closures at
// runtime, never during module evaluation, so live bindings resolve
// correctly by the time anything actually calls it. See docs/DECISIONS.md
// (ADR-002) if you're tempted to "fix" this by merging files.

import { AM_SNACKS, PM_SNACKS } from './data/snacks.js';
import { state, loadState, saveState, exportBackup, importBackupFromFile } from './state.js';
import { uiState } from './ui-state.js';
import { el, showToast, catLabel } from './dom.js';
import { setupPWA } from './pwa.js';

import { renderBreakfast, renderLunchOrDinner, renderSnackTab } from './views/meal-plan.js';
import { renderPantry } from './views/pantry.js';
import { renderApprovedSnacks } from './views/approved-snacks.js';
import { renderRules } from './views/rules.js';
import { renderMyMeals } from './views/my-meals.js';
import { renderMealBuilder } from './views/meal-builder.js';
import { renderShoppingList } from './views/shopping-list.js';

export function renderMain() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  let content;
  switch (uiState.activeTab) {
    case 'breakfast':  content = renderBreakfast(); break;
    case 'lunch':      content = renderLunchOrDinner('lunch'); break;
    case 'dinner':     content = renderLunchOrDinner('dinner'); break;
    case 'am_snack':   content = renderSnackTab(AM_SNACKS, 'AM Snack', '≈ 220 cal, 11–18 g carbs, 8–15 g protein'); break;
    case 'pm_snack':   content = renderSnackTab(PM_SNACKS, 'PM Snack', '≈ 160 cal'); break;
    case 'pantry':     content = renderPantry(); break;
    case 'snacks':     content = renderApprovedSnacks(); break;
    case 'rules':      content = renderRules(); break;
    case 'my_meals':   content = renderMyMeals(); break;
    default:           content = renderBreakfast();
  }
  main.appendChild(content);
}

export function renderPanel() {
  const p = document.getElementById('panel');
  p.innerHTML = '';
  p.appendChild(el('div', { class: 'panel-tabs' },
    el('button', { class: 'panel-tab' + (uiState.panelView === 'meal' ? ' active' : ''), onclick: () => { uiState.panelView = 'meal'; render(); } }, 'Meal Builder'),
    el('button', { class: 'panel-tab' + (uiState.panelView === 'shopping' ? ' active' : ''), onclick: () => { uiState.panelView = 'shopping'; render(); } }, 'Shopping'),
  ));
  if (uiState.panelView === 'meal') p.appendChild(renderMealBuilder());
  else p.appendChild(renderShoppingList());
}

export function renderHeader() {
  document.getElementById('shopCount').textContent = Object.keys(state.shopping).length;

  const filterRow = document.getElementById('filterRow');
  filterRow.innerHTML = '';

  const hasActive = uiState.activeFilters.size > 0;
  const chipsWrap = el('div', { class: 'filter-chips-wrap' });
  const cats = ['carb', 'protein', 'fruit', 'vegetable', 'fat'];
  for (const cat of cats) {
    chipsWrap.appendChild(el('button', {
      class: 'filter-chip cat-' + cat + (uiState.activeFilters.has(cat) ? ' active' : ''),
      onclick: () => { if (uiState.activeFilters.has(cat)) uiState.activeFilters.delete(cat); else uiState.activeFilters.add(cat); render(); }
    }, catLabel(cat)));
  }
  if (hasActive || uiState.searchTerm) {
    chipsWrap.appendChild(el('button', {
      class: 'filter-chip',
      style: 'background:transparent;color:var(--protein);border-color:var(--protein)',
      onclick: () => { uiState.activeFilters.clear(); uiState.searchTerm = ''; document.getElementById('searchInput').value = ''; render(); }
    }, '× Clear'));
  }
  filterRow.appendChild(chipsWrap);
}

export function setTab(tab) {
  uiState.activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.getElementById('moreNavBtn').classList.remove('active');
  render();
}

export function render() {
  renderHeader();
  renderMain();
  renderPanel();
}

export function togglePanel(show) {
  const w = document.getElementById('panelWrap');
  if (show === undefined) {
    w.classList.toggle('mobile-shown');
    w.classList.toggle('mobile-hidden');
  } else if (show) {
    w.classList.add('mobile-shown');
    w.classList.remove('mobile-hidden');
  } else {
    w.classList.remove('mobile-shown');
    w.classList.add('mobile-hidden');
  }
}

export function closeMoreDrawer() {
  document.getElementById('moreOverlay').classList.remove('open');
}

function wireEvents() {
  // Desktop tab clicks
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => setTab(t.dataset.tab));
  });

  // Bottom nav item clicks
  document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(b => {
    b.addEventListener('click', () => setTab(b.dataset.tab));
  });

  // More button
  document.getElementById('moreNavBtn').addEventListener('click', () => {
    document.getElementById('moreOverlay').classList.add('open');
    document.getElementById('moreNavBtn').classList.add('active');
  });

  // More overlay: close on background click
  document.getElementById('moreOverlay').addEventListener('click', (e) => {
    // close when tapping the dark backdrop (not the sheet itself)
    if (!e.target.closest('.more-sheet')) closeMoreDrawer();
  });

  document.querySelectorAll('.more-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeMoreDrawer();
      setTab(btn.dataset.tab);
    });
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    uiState.searchTerm = e.target.value;
    render();
  });

  document.getElementById('shopBtn').addEventListener('click', () => {
    uiState.panelView = 'shopping';
    if (window.innerWidth < 1024) togglePanel(true);
    render();
  });

  document.getElementById('mobileFab').addEventListener('click', () => {
    uiState.panelView = 'meal';
    togglePanel(true);
    render();
  });

  document.getElementById('panelWrap').addEventListener('click', (e) => {
    if (e.target.id === 'panelWrap') togglePanel(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { togglePanel(false); closeMoreDrawer(); }
  });

  wireBackup();
}

// Backup export/import — buttons live in the "More" drawer (#exportBackupBtn,
// #importBackupBtn + hidden #importBackupFile). See js/state.js for the
// actual export/import logic; this just wires the UI and user feedback.
function wireBackup() {
  const exportBtn = document.getElementById('exportBackupBtn');
  const importBtn = document.getElementById('importBackupBtn');
  const importFile = document.getElementById('importBackupFile');
  if (!exportBtn || !importBtn || !importFile) return;

  exportBtn.addEventListener('click', () => {
    closeMoreDrawer();
    exportBackup();
    showToast('Backup downloaded');
  });

  importBtn.addEventListener('click', () => {
    importFile.value = '';
    importFile.click();
  });

  importFile.addEventListener('change', () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    closeMoreDrawer();
    importBackupFromFile(file).then(result => {
      if (result.ok) {
        render();
        showToast('Backup imported');
      } else {
        showToast(result.error || 'Could not import that file');
      }
    });
  });
}

loadState();
wireEvents();
render();
setupPWA();
