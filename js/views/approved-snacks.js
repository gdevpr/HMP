// Renders the "Additional approved snacks" tab — read-only catalog of
// Casey-approved packaged brands, grouped by type.

import { APPROVED_SNACKS } from '../data/snacks.js';
import { uiState } from '../ui-state.js';
import { el } from '../dom.js';

export function renderApprovedSnacks() {
  const wrap = el('div', {},
    el('h2', { class: 'section-header' }, 'Additional approved snacks'),
    el('p', { class: 'section-sub' }, 'All Casey-approved brands and packaged items.'),
  );
  const searchTerm = uiState.searchTerm;
  for (const group in APPROVED_SNACKS) {
    const items = APPROVED_SNACKS[group];
    const filtered = items.filter(it => !searchTerm || it.n.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length === 0) continue;
    const block = el('div', { class: 'approved-group' }, el('h4', {}, group));
    const list = el('div', { class: 'approved-list' });
    for (const it of filtered) {
      list.appendChild(el('div', { class: 'approved-card' },
        el('span', { class: 'approved-name' }, it.n),
        it.note ? el('span', { class: 'approved-note' }, it.note) : null,
      ));
    }
    block.appendChild(list);
    wrap.appendChild(block);
  }
  return wrap;
}
