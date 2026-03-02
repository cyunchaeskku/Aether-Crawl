// src/ui/interaction.js — Drag/targeting helpers

import { uiContext } from './context.js';
import { playCard } from '../engine.js';

export function cardNeedsTarget(card) {
  return (card.type === 'attack' || card.effect.weak || card.effect.vulnerable) && !card.effect.aoe;
}

export function ensureArrow() {
  if (uiContext.arrowSvg) return;
  uiContext.arrowSvg = document.getElementById('target-arrow');
  if (uiContext.arrowSvg) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'target-arrow');
  svg.setAttribute('class', 'target-arrow hidden');
  svg.innerHTML =
    '<defs>' +
      '<marker id="arrow-head" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">' +
        '<polygon points="0 0, 10 3.5, 0 7"></polygon>' +
      '</marker>' +
    '</defs>' +
    '<line id="target-arrow-line" x1="0" y1="0" x2="0" y2="0" marker-end="url(#arrow-head)"></line>';
  document.body.appendChild(svg);
  uiContext.arrowSvg = svg;
}

export function showArrow(x1, y1, x2, y2) {
  ensureArrow();
  if (!uiContext.arrowSvg) return;
  const line = document.getElementById('target-arrow-line');
  if (!line) return;
  uiContext.arrowSvg.classList.remove('hidden');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
}

export function hideArrow() {
  if (!uiContext.arrowSvg) return;
  uiContext.arrowSvg.classList.add('hidden');
}

function getEnemyIndexAtPoint(x, y) {
  const nodes = document.querySelectorAll('.enemy-unit');
  for (const el of nodes) {
    if (el.classList.contains('dead')) continue;
    const rect = el.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      const id = el.getAttribute('id') || '';
      const idx = parseInt(id.replace('enemy-unit-', ''), 10);
      if (!Number.isNaN(idx)) return idx;
    }
  }
  return -1;
}

export function attachDragListeners() {
  if (attachDragListeners._done) return;
  attachDragListeners._done = true;
  document.addEventListener('mousemove', (ev) => {
    if (!uiContext.dragState.active) return;
    uiContext.dragState.moved = true;
    showArrow(uiContext.dragState.startX, uiContext.dragState.startY, ev.clientX, ev.clientY);
  });
  document.addEventListener('mouseup', (ev) => {
    if (!uiContext.dragState.active) return;
    hideArrow();
    const targetIdx = getEnemyIndexAtPoint(ev.clientX, ev.clientY);
    const cardIdx = uiContext.dragState.cardIdx;
    uiContext.dragState.active = false;
    if (uiContext.dragState.moved) uiContext.dragState.justDragged = true;
    if (targetIdx !== -1) {
      playCard(uiContext.state, uiContext.render, cardIdx, targetIdx);
    }
  });
}
