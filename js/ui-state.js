// Transient UI state — not persisted. Shared as a single mutable object so
// every view module can read/write it without circular-import headaches
// (mutate properties on `uiState`, never reassign the export).

export const uiState = {
  activeTab: 'breakfast',
  searchTerm: '',
  activeFilters: new Set(),
  panelView: 'meal', // 'meal' | 'shopping'
};
