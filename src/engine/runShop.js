// src/engine/runShop.js — Run shop actions

import { CARDS, CARD_COST } from '../data.js';
import { saveState } from '../state.js';
import { addLog } from './helpers.js';

export function buyRunCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  const card = CARDS[cardId];
  if (!card) return;
  const isSale = (cardId === run.shopSaleCard);
  const cost = isSale ? Math.floor(CARD_COST[card.rarity] * 0.5) : CARD_COST[card.rarity];
  if (state.idle.gold < cost) return;
  state.idle.gold -= cost;
  run.player.discardPile.push(cardId);
  const idx = (run.shopCards || []).indexOf(cardId);
  if (idx !== -1) run.shopCards.splice(idx, 1);
  if (isSale) run.shopSaleCard = null;
  addLog(state, 'You purchased ' + card.name + (isSale ? ' (sale!)' : '') + '!');
  saveState(state); render();
}

export function removeRunCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  if (run.shopRemovalUsed) return;
  const cost = 75 + (run.removeCount || 0) * 25;
  if (state.idle.gold < cost) return;
  const piles = [run.player.hand, run.player.drawPile, run.player.discardPile];
  let removed = false;
  for (const pile of piles) {
    const idx = pile.indexOf(cardId);
    if (idx !== -1) {
      pile.splice(idx, 1);
      removed = true;
      break;
    }
  }
  if (!removed) return;
  state.idle.gold -= cost;
  run.removeCount = (run.removeCount || 0) + 1;
  run.shopRemovalUsed = true;
  addLog(state, 'Removed ' + CARDS[cardId].name + ' from your deck.');
  saveState(state); render();
}

export function leaveShop(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  run.phase = 'map';
  saveState(state); render();
}
