// src/state.js — Game state management and localStorage persistence

import { BUILDINGS, META_UPGRADES, SHOP_POOL, SHOP_SLOTS, SHOP_REFRESH_COST, STARTER_DECK } from './data.js';

const SAVE_KEY = 'aether_crawl_save';

export function pickShopCards() {
  const arr = [...SHOP_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, SHOP_SLOTS).map(c => c.id);
}

export function createDefaultState() {
  const upgrades = {};
  META_UPGRADES.forEach(u => { upgrades[u.id] = 0; });
  const buildings = BUILDINGS.map(def => ({ id: def.id, level: 0 }));
  return {
    idle: { gold:0, essence:0, goldRate:0, essenceRate:0 },
    buildings,
    meta: {
      upgrades,
      startingDeck: [...STARTER_DECK],
      permanentDeck: [],
      relics: ['burning_blood'],
      relicBindings: {},
      relicCharges: {},
      bonusMaxHp: 0,
      potionSlotBonus: 0,
      totalRuns: 0,
      bestFloor: 0,
      bestGold: 0
    },
    shop: { available: pickShopCards(), refreshCost: SHOP_REFRESH_COST },
    run: null,
    settings: {
      bgmEnabled: true,
      language: 'en',
    },
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const merged = deepMerge(createDefaultState(), saved);
    if (!Array.isArray(merged.buildings)) {
      merged.buildings = BUILDINGS.map(def => ({ id: def.id, level: 0 }));
    }
    return merged;
  } catch (e) {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
