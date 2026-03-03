// src/ui/tooltip.js — Tooltip globals

import { CARDS, RELICS, POTIONS } from '../data.js';

// These are exposed globally since they are called from inline HTML onmouseenter attributes
// that reference showTooltip/hideTooltip directly (not via window._ui).

window.showTooltip = function(e, type, id) {
  const el = document.getElementById('game-tooltip');
  if (!el) return;

  let title = '', desc = '', rarity = '';
  if (type === 'card') {
    const c = CARDS[id];
    if (!c) return;
    title = c.name; desc = c.description; rarity = c.rarity;
  } else if (type === 'relic') {
    const r = RELICS[id];
    if (!r) return;
    title = r.name; desc = r.description; rarity = r.rarity;
  } else if (type === 'potion') {
    const p = POTIONS[id];
    if (!p) return;
    title = p.name; desc = p.description; rarity = '';
  }

  const rarColor = rarity
    ? (rarity === 'common' ? '#aaa'
      : rarity === 'uncommon' ? '#50b070'
      : rarity === 'starter' ? '#aaa'
      : '#f0a030')
    : '';
  el.innerHTML =
    '<span class="tooltip-title">' + title + '</span>' +
    '<span class="tooltip-desc">' + desc + '</span>' +
    (rarity ? '<span class="tooltip-rarity" style="color:' + rarColor + '">' + rarity + '</span>' : '');

  el.classList.add('visible');

  const move = (ev) => {
    const x = ev.clientX + 15;
    const y = ev.clientY + 15;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = (x + w > window.innerWidth) ? (ev.clientX - w - 10) : x;
    const top  = (y + h > window.innerHeight) ? (ev.clientY - h - 10) : y;
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
  };
  move(e || window.event);
};

window.hideTooltip = function() {
  const el = document.getElementById('game-tooltip');
  if (el) el.classList.remove('visible');
};
