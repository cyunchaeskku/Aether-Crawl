// src/engine/rest.js — Rest site actions

import { CARDS, CARD_UPGRADES } from '../data.js';
import { saveState } from '../state.js';
import { addLog, hasRelic } from './helpers.js';
import { generateRelicOffer } from './relics.js';
import { pickCardReward } from './combat.js';

export function restAndHeal(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  if (hasRelic(state, 'coffee_dripper')) {
    addLog(state, 'Coffee Dripper: you cannot Rest.');
    return;
  }
  const healAmt = Math.floor(run.player.maxHp * 0.3);
  const bonus = hasRelic(state, 'regal_pillow') ? 15 : 0;
  run.player.hp = Math.min(run.player.maxHp, run.player.hp + healAmt + bonus);
  run.restedThisFloor = true;
  run.upgradeChoiceActive = false;
  run.removeChoiceActive = false;
  run.digChoiceActive = false;
  if (hasRelic(state, 'dream_catcher')) {
    run.cardOffer = pickCardReward(state);
    run.phase = 'card_reward';
  }
  saveState(state); render();
}

export function showUpgradeChoice(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  if (hasRelic(state, 'fusion_hammer')) {
    addLog(state, 'Fusion Hammer: cannot Smith.');
    return;
  }
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
  if (hasRelic(state, 'fusion_hammer')) return;
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

export function showRemoveChoice(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  if (!hasRelic(state, 'peace_pipe')) return;
  run.removeChoiceActive = true;
  run.upgradeChoiceActive = false;
  saveState(state); render();
}

export function hideRemoveChoice(state, render) {
  const run = state.run;
  if (!run) return;
  run.removeChoiceActive = false;
  saveState(state); render();
}

export function removeCardAtRest(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  if (!hasRelic(state, 'peace_pipe')) return;
  const piles = [run.player.hand, run.player.drawPile, run.player.discardPile];
  let removed = false;
  for (const pile of piles) {
    const idx = pile.indexOf(cardId);
    if (idx !== -1) { pile.splice(idx, 1); removed = true; break; }
  }
  if (!removed) return;
  run.restedThisFloor = true;
  run.removeChoiceActive = false;
  addLog(state, 'Peace Pipe: removed ' + CARDS[cardId].name + '.');
  saveState(state); render();
}

export function digForRelic(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  if (!hasRelic(state, 'shovel')) return;
  run.restedThisFloor = true;
  run.digChoiceActive = false;
  run.relicOffer = generateRelicOffer(state, { source: 'reward' });
  addLog(state, 'Shovel: you dig up a Relic!');
  saveState(state); render();
}
