// src/engine/relics.js — Relic helpers

import {
  CARDS,
  CARD_UPGRADES,
  SHOP_POOL,
  RELICS,
  RELIC_OFFER_COUNT,
  RELIC_RARITY_WEIGHTS,
  POTIONS,
  POTION_BASE_SLOTS
} from '../data.js';
import { saveState } from '../state.js';
import { shuffle, addLog, hasRelic, markEncounteredCards } from './helpers.js';

const RELIC_IDS = Object.keys(RELICS);
const RELIC_BY_RARITY = RELIC_IDS.reduce((acc, id) => {
  const r = RELICS[id];
  if (!acc[r.rarity]) acc[r.rarity] = [];
  acc[r.rarity].push(id);
  return acc;
}, {});

export function initRelicState(state) {
  ensureRelicCharges(state);
  return {
    akabeko_fired: false,
    kunai_counter: 0,
    shuriken_counter: 0,
    attack_counter_turn: 0,
    skill_counter_turn: 0,
    nunchaku_counter: 0,
    ink_bottle_counter: 0,
    pen_nib_counter: 0,
    happy_flower_counter: 0,
    sundial_counter: 0,
    art_of_war_no_attack: true,
    next_turn_energy_bonus: 0,
    next_turn_draw_bonus: 0,
    pocketwatch_pending: false,
    centennial_used: false,
    helix_active: hasRelic(state, 'fossilized_helix'),
    lizard_tail_used: false,
    wing_boots_uses: hasRelic(state, 'wing_boots') ? 3 : 0,
    maw_bank_active: true,
    cards_played_turn: 0,
    turn: 0,
    confused: hasRelic(state, 'snecko_eye'),
    bottled_ready: true,
    tiny_chest_counter: 0,
    tea_set_charged: false,
  };
}

export function relicPotionSlots(state) {
  const belt = hasRelic(state, 'potion_belt') ? 2 : 0;
  const bonus = state.meta.potionSlotBonus || 0;
  return POTION_BASE_SLOTS + belt + bonus;
}

export function ensureRelicCharges(state) {
  if (!state.meta.relicCharges) state.meta.relicCharges = {};
  if (state.meta.relics && state.meta.relics.includes('omamori') && state.meta.relicCharges.omamori == null) {
    state.meta.relicCharges.omamori = 2;
  }
  if (state.meta.relics && state.meta.relics.includes('matryoshka') && state.meta.relicCharges.matryoshka == null) {
    state.meta.relicCharges.matryoshka = 2;
  }
}

function weightedPick(pool, weights, count) {
  const result = [];
  const available = [...pool];
  while (result.length < count && available.length > 0) {
    const weighted = available.map(id => ({ id, w: weights[RELICS[id].rarity] || 1 }));
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    let picked = weighted[0].id;
    for (const item of weighted) {
      r -= item.w;
      if (r <= 0) { picked = item.id; break; }
    }
    result.push(picked);
    available.splice(available.indexOf(picked), 1);
  }
  return result;
}

export function generateRelicOffer(state, options = {}) {
  const owned = new Set(state.meta.relics || []);
  const count = options.count || RELIC_OFFER_COUNT;
  const source = options.source || 'reward';

  if (source === 'boss') {
    const pool = (RELIC_BY_RARITY.boss || []).filter(id => !owned.has(id));
    return shuffle(pool).slice(0, count);
  }
  if (source === 'shop') {
    const pool = (RELIC_BY_RARITY.shop || []).filter(id => !owned.has(id));
    return shuffle(pool).slice(0, count);
  }

  const pool = RELIC_IDS.filter(id => !owned.has(id) && ['common','uncommon','rare'].includes(RELICS[id].rarity));
  return weightedPick(pool, RELIC_RARITY_WEIGHTS, count);
}

export function gainRelic(state, render, relicId, opts = {}) {
  if (!RELICS[relicId]) return;
  if (!state.meta.relics.includes(relicId)) state.meta.relics.push(relicId);
  ensureRelicCharges(state);
  applyRelicPickup(state, relicId);
  if (!opts.silent) addLog(state, 'You obtained: ' + RELICS[relicId].name + '!');
  saveState(state); if (render) render();
}

export function pickRelic(state, render, relicId) {
  const run = state.run;
  if (!run || !run.relicOffer || !run.relicOffer.includes(relicId)) return;
  if (!state.meta.relics.includes(relicId)) state.meta.relics.push(relicId);
  ensureRelicCharges(state);
  applyRelicPickup(state, relicId);
  addLog(state, 'You obtained: ' + RELICS[relicId].name + '!');
  if (run.relicOfferQueue && run.relicOfferQueue.length > 0) {
    run.relicOffer = run.relicOfferQueue.shift();
  } else {
    run.relicOffer = null;
  }
  saveState(state); render();
}

export function startRelicSelection(state, mode, filter, relicId) {
  const run = state.run;
  if (!run) return;
  const deck = getRunDeck(state);
  const eligible = deck.filter(id => {
    const c = CARDS[id];
    if (!c) return false;
    if (filter === 'any') return true;
    return c.type === filter;
  });
  if (eligible.length === 0) {
    addLog(state, RELICS[relicId].name + ': no valid card to select.');
    return;
  }
  run.relicSelect = { mode, filter, relicId, returnPhase: run.phase };
  run.phase = 'relic_select';
  saveState(state);
}

export function confirmRelicSelection(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'relic_select' || !run.relicSelect) return;
  const { mode, relicId } = run.relicSelect;
  if (mode === 'bottle') {
    if (!state.meta.relicBindings) state.meta.relicBindings = {};
    state.meta.relicBindings[relicId] = cardId;
    const c = CARDS[cardId];
    addLog(state, RELICS[relicId].name + ': bottled ' + (c ? c.name : cardId) + '.');
  } else if (mode === 'mirror') {
    const added = addCardToRun(state, cardId);
    const c = CARDS[added];
    addLog(state, 'Dolly\'s Mirror: duplicated ' + (c ? c.name : added) + '.');
  }
  const returnPhase = run.relicSelect.returnPhase || 'reward';
  run.relicSelect = null;
  run.phase = returnPhase;
  saveState(state); render();
}

export function cancelRelicSelection(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'relic_select') return;
  const returnPhase = run.relicSelect && run.relicSelect.returnPhase ? run.relicSelect.returnPhase : 'reward';
  run.relicSelect = null;
  run.phase = returnPhase;
  saveState(state); render();
}

export function addCardToRun(state, cardId, opts = {}) {
  const run = state.run;
  if (!run || !CARDS[cardId]) return cardId;
  let id = cardId;
  const card = CARDS[cardId];
  if (card && CARD_UPGRADES[cardId]) {
    if (card.type === 'attack' && hasRelic(state, 'molten_egg')) id = CARD_UPGRADES[cardId];
    if ((card.type === 'skill' || card.type === 'defend') && hasRelic(state, 'toxic_egg')) id = CARD_UPGRADES[cardId];
    if (card.type === 'power' && hasRelic(state, 'frozen_egg')) id = CARD_UPGRADES[cardId];
  }
  markEncounteredCards(state, [id]);
  if (opts.toDiscard !== false) run.player.discardPile.push(id);
  if (hasRelic(state, 'ceramic_fish')) {
    state.idle.gold += 9;
    addLog(state, 'Ceramic Fish: gained 9 Gold.');
  }
  return id;
}

function applyRelicPickup(state, relicId) {
  const run = state.run;
  if (relicId === 'strawberry') {
    addMaxHp(state, 7);
  } else if (relicId === 'old_coin') {
    state.idle.gold += 300;
  } else if (relicId === 'potion_belt') {
    state.meta.potionSlotBonus = (state.meta.potionSlotBonus || 0) + 2;
    if (run) run.potionSlots = relicPotionSlots(state);
  } else if (relicId === 'war_paint') {
    upgradeRandomCardsByType(state, 'skill', 2);
  } else if (relicId === 'whetstone') {
    upgradeRandomCardsByType(state, 'attack', 2);
  } else if (relicId === 'black_blood') {
    // no-op here, handled in combat victory
  } else if (relicId === 'pandoras_box') {
    transformStrikesAndDefends(state);
  } else if (relicId === 'astrolabe') {
    transformAndUpgradeRandom(state, 3);
  } else if (relicId === 'tiny_house') {
    state.idle.gold += 50;
    addMaxHp(state, 5);
    gainRandomPotion(state);
    addRandomCard(state);
    upgradeRandomCardsByType(state, null, 1);
  } else if (relicId === 'matryoshka') {
    state.meta.relicCharges.matryoshka = 2;
  } else if (relicId === 'omamori') {
    state.meta.relicCharges.omamori = 2;
  } else if (relicId === 'bottled_flame') {
    startRelicSelection(state, 'bottle', 'attack', relicId);
  } else if (relicId === 'bottled_lightning') {
    startRelicSelection(state, 'bottle', 'skill', relicId);
  } else if (relicId === 'bottled_tornado') {
    startRelicSelection(state, 'bottle', 'power', relicId);
  } else if (relicId === 'dollys_mirror') {
    startRelicSelection(state, 'mirror', 'any', relicId);
  }
}

function addMaxHp(state, amount) {
  state.meta.bonusMaxHp = (state.meta.bonusMaxHp || 0) + amount;
  if (state.run) {
    state.run.player.maxHp += amount;
    state.run.player.hp += amount;
  }
}

function getRunDeck(state) {
  const run = state.run;
  if (run) return [...run.player.drawPile, ...run.player.discardPile, ...run.player.hand];
  return [...(state.meta.startingDeck || []), ...(state.meta.permanentDeck || [])];
}

function collectCardRefs(state, filterFn) {
  const refs = [];
  const addRefs = (pile, key) => {
    for (let i = 0; i < pile.length; i++) {
      const id = pile[i];
      const c = CARDS[id];
      if (!c) continue;
      if (filterFn(id, c)) refs.push({ pile, index: i, id, key });
    }
  };
  addRefs(state.meta.startingDeck || [], 'meta_start');
  addRefs(state.meta.permanentDeck || [], 'meta_perm');
  if (state.run) {
    addRefs(state.run.player.drawPile, 'run_draw');
    addRefs(state.run.player.discardPile, 'run_discard');
    addRefs(state.run.player.hand, 'run_hand');
  }
  return refs;
}

function upgradeRandomCardsByType(state, type, count) {
  const refs = collectCardRefs(state, (id, c) => {
    if (!CARD_UPGRADES[id]) return false;
    if (!type) return true;
    if (type === 'skill') return c.type === 'skill' || c.type === 'defend';
    return c.type === type;
  });
  const picks = shuffle(refs).slice(0, count);
  picks.forEach(ref => { ref.pile[ref.index] = CARD_UPGRADES[ref.id]; });
}

function transformStrikesAndDefends(state) {
  const refs = collectCardRefs(state, (id) => id === 'strike' || id === 'defend');
  refs.forEach(ref => { ref.pile[ref.index] = randomCardId(); });
}

function transformAndUpgradeRandom(state, count) {
  const refs = collectCardRefs(state, () => true);
  const picks = shuffle(refs).slice(0, count);
  picks.forEach(ref => {
    const next = randomCardId();
    ref.pile[ref.index] = CARD_UPGRADES[next] || next;
  });
}

function randomCardId() {
  const ids = SHOP_POOL.map(c => c.id);
  if (ids.length === 0) return 'strike';
  return ids[Math.floor(Math.random() * ids.length)];
}

function addRandomCard(state) {
  const run = state.run;
  if (!run) return;
  const cardId = randomCardId();
  addCardToRun(state, cardId);
}

function gainRandomPotion(state) {
  if (hasRelic(state, 'sozu')) return;
  const ids = Object.keys(POTIONS);
  if (ids.length === 0) return;
  const run = state.run;
  if (!run) return;
  run.potions = run.potions || [];
  if (run.potions.length >= run.potionSlots) return;
  run.potions.push(ids[Math.floor(Math.random() * ids.length)]);
}
