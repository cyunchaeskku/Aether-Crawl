// src/state.js — Game state management and localStorage persistence

import { BUILDINGS, META_UPGRADES, SHOP_POOL, SHOP_SLOTS, SHOP_REFRESH_COST } from './data.js';

const SAVE_KEY = 'aether_crawl_save';

function buildDefaultBuildings() {
  return BUILDINGS.map(b => ({ id: b.id, level: 0 }));
}

function buildDefaultMeta() {
  const upgrades = {};
  META_UPGRADES.forEach(u => { upgrades[u.id] = 0; });
  return {
    upgrades,          // { [upgradeId]: level }
    permanentDeck: [], // extra card ids beyond starter deck
    totalRuns: 0,
    bestFloor: 0
  };
}

function buildDefaultShop() {
  return {
    available: pickShopCards(),
    refreshCost: SHOP_REFRESH_COST
  };
}

export function pickShopCards() {
  const shuffled = [...SHOP_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SHOP_SLOTS).map(c => c.id);
}

export function createDefaultState() {
  return {
    idle: {
      gold: 0,
      mana: 0,
      essence: 0,
      goldRate: 0,
      manaRate: 0,
      essenceRate: 0
    },
    buildings: buildDefaultBuildings(),
    meta: buildDefaultMeta(),
    shop: buildDefaultShop(),
    run: null
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
    // Merge with defaults to handle missing keys from old saves
    const def = createDefaultState();
    return deepMerge(def, saved);
  } catch (e) {
    console.warn('Load failed, starting fresh:', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

// Deep merge: target gets overwritten by source for existing keys
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
