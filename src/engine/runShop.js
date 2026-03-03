// src/engine/runShop.js — Run shop actions

import { CARDS, CARD_COST, RELICS, RELIC_SHOP_COST, POTIONS } from '../data.js';
import { saveState } from '../state.js';
import { addLog, hasRelic } from './helpers.js';
import { addCardToRun, gainRelic } from './relics.js';

function shopDiscount(state) {
  return hasRelic(state, 'membership_card') ? 0.5 : 1;
}

function spendGold(state, amount) {
  if (state.idle.gold < amount) return false;
  state.idle.gold -= amount;
  if (state.run && state.run.relicState) state.run.relicState.maw_bank_active = false;
  return true;
}

export function buyRunCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  const card = CARDS[cardId];
  if (!card) return;
  const isSale = (cardId === run.shopSaleCard);
  let cost = isSale ? Math.floor(CARD_COST[card.rarity] * 0.5) : CARD_COST[card.rarity];
  cost = Math.floor(cost * shopDiscount(state));
  if (!spendGold(state, cost)) return;
  const added = addCardToRun(state, cardId);
  const idx = (run.shopCards || []).indexOf(cardId);
  if (idx !== -1) run.shopCards.splice(idx, 1);
  if (isSale) run.shopSaleCard = null;
  addLog(state, 'You purchased ' + CARDS[added].name + (isSale ? ' (sale!)' : '') + '!');
  saveState(state); render();
}

export function removeRunCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  if (run.shopRemovalUsed) return;
  const base = hasRelic(state, 'smiling_mask') ? 50 : (75 + (run.removeCount || 0) * 25);
  const cost = Math.floor(base * shopDiscount(state));
  if (!spendGold(state, cost)) return;
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
  run.removeCount = (run.removeCount || 0) + 1;
  run.shopRemovalUsed = true;
  addLog(state, 'Removed ' + CARDS[cardId].name + ' from your deck.');
  saveState(state); render();
}

export function buyRunRelic(state, render, relicId) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  const relic = RELICS[relicId];
  if (!relic) return;
  const cost = Math.floor(RELIC_SHOP_COST * shopDiscount(state));
  if (!spendGold(state, cost)) return;
  const idx = (run.shopRelics || []).indexOf(relicId);
  if (idx !== -1) run.shopRelics.splice(idx, 1);
  gainRelic(state, render, relicId);
}

export function buyRunPotion(state, render, potionId) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  if (hasRelic(state, 'sozu')) return;
  if (!POTIONS[potionId]) return;
  if (run.potions.length >= run.potionSlots) return;
  const cost = Math.floor(40 * shopDiscount(state));
  if (!spendGold(state, cost)) return;
  run.potions.push(potionId);
  const idx = (run.shopPotions || []).indexOf(potionId);
  if (idx !== -1) run.shopPotions.splice(idx, 1);
  addLog(state, 'Purchased potion: ' + POTIONS[potionId].name + '.');
  saveState(state); render();
}

export function leaveShop(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  run.phase = 'map';
  saveState(state); render();
}
