// src/engine/meta.js — Meta upgrades

import { META_UPGRADES } from '../data.js';
import { saveState } from '../state.js';

export function metaUpgradeCost(state, id) {
  const def = META_UPGRADES.find(u => u.id === id);
  const lv = state.meta.upgrades[id];
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, lv));
}

export function buyMetaUpgrade(state, render, id) {
  const def = META_UPGRADES.find(u => u.id === id);
  const lv = state.meta.upgrades[id];
  if (lv >= def.maxLevel) return;
  const cost = metaUpgradeCost(state, id);
  if (state.idle.essence < cost) return;
  state.idle.essence -= cost;
  state.meta.upgrades[id]++;
  saveState(state); render();
}
