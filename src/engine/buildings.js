// src/engine/buildings.js — Building upgrades

import { BUILDINGS } from '../data.js';
import { saveState } from '../state.js';
import { recomputeRates } from './idle.js';

export function buildingUpgradeCost(state, i) {
  const def = BUILDINGS[i];
  const lv = state.buildings[i].level;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, lv));
}

export function upgradeBuilding(state, render, i) {
  const def = BUILDINGS[i];
  const b = state.buildings[i];
  if (b.level >= def.maxLevel) return;
  const cost = buildingUpgradeCost(state, i);
  if (state.idle.gold < cost) return;
  state.idle.gold -= cost;
  b.level++;
  recomputeRates(state);
  saveState(state); render();
}
