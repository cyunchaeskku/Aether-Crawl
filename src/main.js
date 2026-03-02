// src/main.js — Entry point

import { createDefaultState, loadState, saveState } from './state.js';
import { idleTick, recomputeRates } from './engine.js';
import { initUI, render } from './ui.js';

const TICK_MS = 100;
const SAVE_INTERVAL_MS = 5000;

let state = loadState() || createDefaultState();
recomputeRates(state);

function onUpdate() {
  render();
}

initUI(state, onUpdate);

// Idle tick
let lastTick = performance.now();
setInterval(() => {
  const now = performance.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;
  idleTick(state, dt);
  render();
}, TICK_MS);

// Periodic save
setInterval(() => {
  saveState(state);
}, SAVE_INTERVAL_MS);
