// Tiny DOM helpers shared across views. No framework — see ADR-001 in
// docs/DECISIONS.md for why this stays a vanilla-JS, no-build-step PWA.

export function el(tag, attrs, ...children) {
  attrs = attrs || {};
  const e = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null || child === false) continue;
    if (typeof child === 'string') e.appendChild(document.createTextNode(child));
    else e.appendChild(child);
  }
  return e;
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1600);
}

export function catLabel(cat) {
  return { carb: 'Carbs', protein: 'Protein', fruit: 'Fruit', vegetable: 'Vegetable', fat: 'Fat', pantry: 'Pantry' }[cat] || cat;
}
