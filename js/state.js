// Persisted app state: shopping list, meal builder, saved meals.
// Persists to localStorage. Also provides JSON export/import so the user
// can back up "My Meals" / shopping list outside the browser (see ADR-003
// in docs/DECISIONS.md — localStorage alone can be wiped if the PWA is
// uninstalled or site data is cleared).

export const STORAGE_KEY = 'mealPlan_v2';
const BACKUP_VERSION = 1;

// NOTE: kept as a stable object reference (mutated in place, never reassigned)
// so other modules can `import { state }` and see live updates.
export const state = {
  shopping: {},
  meal: { type: 'breakfast', items: [], saveName: '' },
  savedMeals: [],
};

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
      if (!state.savedMeals) state.savedMeals = [];
      if (!state.shopping) state.shopping = {};
      if (!state.meal) state.meal = { type: 'breakfast', items: [], saveName: '' };
    }
  } catch (e) {}
}

export function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ── Backup: export / import as a downloadable JSON file ──

export function exportBackup() {
  const payload = {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    state: {
      shopping: state.shopping,
      meal: state.meal,
      savedMeals: state.savedMeals,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `eating-plan-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Returns { ok: true } on success or { ok: false, error: string } on failure.
// Merge strategy: replaces shopping + meal builder, and merges savedMeals by id
// (imported meals win on id collision) so restoring doesn't silently nuke
// meals saved on the current device since the backup was made.
export function importBackupFromFile(file) {
  return file.text().then(text => {
    let payload;
    try { payload = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'That file is not valid JSON.' }; }

    const incoming = payload && payload.state ? payload.state : payload;
    if (!incoming || typeof incoming !== 'object') {
      return { ok: false, error: 'Unrecognized backup format.' };
    }

    if (incoming.shopping && typeof incoming.shopping === 'object') state.shopping = incoming.shopping;
    if (incoming.meal && typeof incoming.meal === 'object') state.meal = incoming.meal;

    if (Array.isArray(incoming.savedMeals)) {
      const byId = new Map(state.savedMeals.map(m => [m.id, m]));
      for (const m of incoming.savedMeals) byId.set(m.id, m);
      state.savedMeals = [...byId.values()];
    }

    saveState();
    return { ok: true };
  }).catch(() => ({ ok: false, error: 'Could not read that file.' }));
}
