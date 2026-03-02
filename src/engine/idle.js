// src/engine/idle.js — Idle tick & resource rates

import { BUILDINGS } from '../data.js';

export function idleTick(state, dtSeconds) {
  state.idle.gold    += state.idle.goldRate    * dtSeconds;
  state.idle.essence += state.idle.essenceRate * dtSeconds;
}

export function recomputeRates(state) {
  let gold = 0, essence = 0;
  state.buildings.forEach((b, i) => {
    if (b.level === 0) return;
    const def = BUILDINGS[i];
    const rate = def.baseRate * b.level;
    if (def.resource === 'gold')    gold    += rate;
    if (def.resource === 'essence') essence += rate;
  });
  state.idle.goldRate    = gold;
  state.idle.essenceRate = essence;
}
