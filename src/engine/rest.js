// src/engine/rest.js — Rest site actions

import { CARDS, CARD_UPGRADES } from '../data.js';
import { saveState } from '../state.js';
import { addLog } from './helpers.js';

export function restAndHeal(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  const healAmt = Math.floor(run.player.maxHp * 0.3);
  run.player.hp = Math.min(run.player.maxHp, run.player.hp + healAmt);
  run.restedThisFloor = true;
  run.upgradeChoiceActive = false;
  saveState(state); render();
}

export function showUpgradeChoice(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  run.upgradeChoiceActive = true;
  saveState(state); render();
}

export function hideUpgradeChoice(state, render) {
  const run = state.run;
  if (!run) return;
  run.upgradeChoiceActive = false;
  saveState(state); render();
}

export function upgradeCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  const upgradedId = CARD_UPGRADES[cardId];
  if (!upgradedId) return;

  const piles = [run.player.hand, run.player.drawPile, run.player.discardPile];
  let replaced = false;
  for (const pile of piles) {
    const idx = pile.indexOf(cardId);
    if (idx !== -1) { pile[idx] = upgradedId; replaced = true; break; }
  }
  if (!replaced) return;

  const permIdx = state.meta.permanentDeck.indexOf(cardId);
  if (permIdx !== -1) {
    state.meta.permanentDeck[permIdx] = upgradedId;
  } else {
    const startIdx = state.meta.startingDeck.indexOf(cardId);
    if (startIdx !== -1) state.meta.startingDeck[startIdx] = upgradedId;
  }

  run.restedThisFloor = true;
  run.upgradeChoiceActive = false;
  addLog(state, 'You upgraded ' + CARDS[cardId].name + ' → ' + CARDS[upgradedId].name + '!');
  saveState(state); render();
}
