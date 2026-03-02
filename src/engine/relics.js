// src/engine/relics.js — Relic helpers

import { RELICS, RELIC_OFFER_COUNT } from '../data.js';
import { saveState } from '../state.js';
import { shuffle, addLog } from './helpers.js';

export function generateRelicOffer(state) {
  const owned = new Set(state.meta.relics);
  const pool = Object.keys(RELICS).filter(id => !owned.has(id));
  return shuffle([...pool]).slice(0, RELIC_OFFER_COUNT);
}

export function pickRelic(state, render, relicId) {
  const run = state.run;
  if (!run || !run.relicOffer || !run.relicOffer.includes(relicId)) return;
  if (!state.meta.relics.includes(relicId)) state.meta.relics.push(relicId);
  run.relicOffer = null;
  addLog(state, 'You obtained: ' + RELICS[relicId].name + '!');
  saveState(state); render();
}
