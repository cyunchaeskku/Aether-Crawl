// src/ui/index.js — UI entry

import { flushEffects } from '../engine.js';
import { uiContext } from './context.js';
import { renderResources, renderBgmButton } from './resources.js';
import { renderShop, renderMetaUpgrades, renderDeck, renderRelics, renderRunBtn, renderCatalog } from './hub.js';
import { renderDungeon } from './dungeon.js';
import { ensureArrow, attachDragListeners } from './interaction.js';
import { initUIHandlers } from './handlers.js';
import './tooltip.js';

export function initUI(state, onUpdate) {
  uiContext.state = state;
  uiContext.onUpdate = onUpdate;
  uiContext.render = render;
  ensureArrow();
  attachDragListeners();
  initUIHandlers();
  render();
}

export function render() {
  try {
    renderResources();
    renderShop();
    renderMetaUpgrades();
    renderDeck();
    renderRelics();
    renderRunBtn();
    renderCatalog();
    renderBgmButton();
    renderDungeon();
    requestAnimationFrame(flushEffects);
  } catch (e) {
    console.error('Render error:', e);
  }
}

export { renderResources } from './resources.js';
export { renderShop, renderMetaUpgrades, renderCatalog } from './hub.js';
