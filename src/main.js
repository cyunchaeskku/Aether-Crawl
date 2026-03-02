// src/main.js — Entry point, idle loop, auto-save

import { createDefaultState, loadState, saveState } from './state.js';
import { idleTick, recomputeRates, initAudio } from './engine.js';
import { initUI, render, renderResources, renderShop, renderMetaUpgrades } from './ui.js';

const TICK_MS = 100;
const SAVE_INTERVAL_MS = 5000;

const state = loadState() || createDefaultState();
recomputeRates(state);

function onUpdate() {
  render();
}

initUI(state, onUpdate);

// Idle tick — runs every 100ms
let lastTick = performance.now();
let lastHubGold = -1;
let lastHubEssence = -1;

setInterval(() => {
  const now = performance.now();
  idleTick(state, (now - lastTick) / 1000);
  lastTick = now;
  renderResources();
  // Only re-render hub buttons when floor gold/essence changes (avoids hover flicker)
  const curGold = Math.floor(state.idle.gold);
  const curEssence = Math.floor(state.idle.essence);
  if (curGold !== lastHubGold || curEssence !== lastHubEssence) {
    lastHubGold = curGold;
    lastHubEssence = curEssence;
    if (!state.run) {
      renderShop();
      renderMetaUpgrades();
    }
  }
}, TICK_MS);

// Periodic auto-save
setInterval(() => {
  saveState(state);
}, SAVE_INTERVAL_MS);

// Start audio on first user interaction
window.addEventListener('click', () => initAudio(state), { once: true });
