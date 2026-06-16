// UI.js
// Mobile-first HUD: a build toolbar (pick a blueprint to enter placement mode),
// inventory readout, and toast messages. Pure DOM overlay on top of the canvas;
// it talks to the Game via callbacks so UI and engine stay decoupled.

import { BLUEPRINTS } from '../entities/EntityFactory.js';

export class UI {
  constructor(root, { onSelectBlueprint, onCancel, onSave, onReset }) {
    this.root = root;
    this.cb = { onSelectBlueprint, onCancel, onSave, onReset };
    this.selected = null;
    this._build();
  }

  _build() {
    this.toast = el('div', 'iso-toast');
    this.root.appendChild(this.toast);

    // top bar: inventory + actions
    this.top = el('div', 'iso-top');
    this.invEl = el('div', 'iso-inv');
    this.top.appendChild(this.invEl);
    const actions = el('div', 'iso-actions');
    actions.appendChild(btn('💾', () => this.cb.onSave()));
    actions.appendChild(btn('🗑️', () => this.cb.onReset()));
    this.top.appendChild(actions);
    this.root.appendChild(this.top);

    // bottom toolbar: blueprints
    this.bar = el('div', 'iso-bar');
    for (const [key, bp] of Object.entries(BLUEPRINTS)) {
      const b = btn(bp.label, () => this._select(key, b));
      b.dataset.key = key;
      this.bar.appendChild(b);
    }
    this.cancelBtn = btn('✖ ยกเลิก', () => this._select(null));
    this.cancelBtn.classList.add('iso-cancel');
    this.cancelBtn.style.display = 'none';
    this.bar.appendChild(this.cancelBtn);
    this.root.appendChild(this.bar);
  }

  _select(key, button) {
    this.selected = key;
    [...this.bar.querySelectorAll('button')].forEach(b => b.classList.remove('active'));
    if (key && button) {
      button.classList.add('active');
      this.cancelBtn.style.display = '';
      this.cb.onSelectBlueprint(key);
    } else {
      this.cancelBtn.style.display = 'none';
      this.cb.onCancel();
    }
  }

  clearSelection() { this._select(null); }

  setInventory(inv, coins) {
    const parts = [`🪙 ${coins}`];
    for (const [k, v] of Object.entries(inv)) parts.push(`${icon(k)} ${v}`);
    this.invEl.textContent = parts.join('   ');
  }

  showToast(msg) {
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.toast.classList.remove('show'), 1600);
  }
}

function icon(k) {
  return ({ wheat: '🌾', egg: '🥚', milk: '🥛' })[k] || '📦';
}
function el(tag, cls) { const e = document.createElement(tag); e.className = cls; return e; }
function btn(label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}
