// src/engine/shop.js — Hub shop actions

import { CARDS, CARD_COST, SHOP_POOL } from '../data.js';
import { saveState, pickShopCards } from '../state.js';

export function buyCard(state, render, cardId) {
  const card = CARDS[cardId];
  const cost = CARD_COST[card.rarity];
  if (state.idle.gold < cost) return;
  state.idle.gold -= cost;
  state.meta.permanentDeck.push(cardId);
  const idx = state.shop.available.indexOf(cardId);
  if (idx !== -1) {
    const used = new Set(state.shop.available);
    const pool = SHOP_POOL.filter(c => !used.has(c.id) || c.id === cardId);
    const next = pool.filter(c => c.id !== cardId);
    state.shop.available[idx] = next.length > 0
      ? next[Math.floor(Math.random() * next.length)].id
      : (SHOP_POOL.find(c => c.id !== cardId) || SHOP_POOL[0]).id;
  }
  saveState(state); render();
}

export function refreshShop(state, render) {
  if (state.idle.gold < state.shop.refreshCost) return;
  state.idle.gold -= state.shop.refreshCost;
  state.shop.available = pickShopCards();
  state.shop.refreshCost = Math.min(100, Math.floor(state.shop.refreshCost * 1.5));
  saveState(state); render();
}
