// src/engine/combat.js — Combat flow

import {
  CARDS,
  CARD_UPGRADES,
  ENEMIES,
  FLOOR_ENEMIES,
  SHOP_POOL,
  COMBAT_GOLD_BASE,
  RUN_ESSENCE_BASE,
  RUN_ESSENCE_PER_FLOOR,
  TOTAL_FLOORS,
  POTIONS,
  POTION_DROP_CHANCE
} from '../data.js';
import { saveState } from '../state.js';
import { scheduleEffect, flushEffects } from './vfx.js';
import { playSFX } from './audio.js';
import { shuffle, addLog, hasRelic, markEncounteredCards } from './helpers.js';
import { generateRelicOffer, addCardToRun } from './relics.js';

const COMBAT_ONLY_STATUS_IDS = new Set(['wound', 'burn', 'dazed']);

function countCursesInDeck(run) {
  const all = [...run.player.drawPile, ...run.player.discardPile, ...run.player.hand];
  return all.filter(id => id === 'curse' || id === 'doubt').length;
}

function getPlayerPowers(run) {
  if (!run.player.powers) run.player.powers = {};
  return run.player.powers;
}

function cardNeedsTarget(card) {
  if (!card || !card.effect) return false;
  if (card.effect.target === 'enemy') return true;
  return (card.type === 'attack' || card.effect.weak || card.effect.vulnerable) && !card.effect.aoe;
}

function isPowerCardLocked(run, cardId) {
  if (!run || !cardId) return false;
  const used = run.relicState && run.relicState.powerCardsUsedThisCombat;
  return !!(used && used[cardId]);
}

function addBlock(state, amount) {
  const run = state.run;
  if (!run || amount <= 0) return;
  const { player } = run;
  let blockGain = Math.floor(amount + (player.dexterity || 0));
  if (player.status.frail > 0) blockGain = Math.floor(blockGain * 0.75);
  if (blockGain <= 0) return;
  player.armor += blockGain;

  const powers = getPlayerPowers(run);
  if ((powers.juggernaut || 0) > 0) {
    const alive = run.enemies.map((e, idx) => ({ e, idx })).filter(x => x.e.hp > 0);
    if (alive.length > 0) {
      const pick = alive[Math.floor(Math.random() * alive.length)];
      const dmg = powers.juggernaut * 5;
      dealDmgToEnemy(state, dmg, pick.idx, true);
      addLog(state, 'Juggernaut: dealt ' + dmg + ' damage.');
    }
  }
}

function canPlayCardNow(state, handIndex, card) {
  const run = state.run;
  if (!run || !card) return false;
  if (card.type === 'power' && isPowerCardLocked(run, card.id)) return false;
  if (card.special === 'clash') {
    const { hand } = run.player;
    for (let i = 0; i < hand.length; i++) {
      if (i === handIndex) continue;
      const id = hand[i];
      const c = CARDS[id];
      if (!c || c.type !== 'attack') return false;
    }
  }
  return true;
}

function getCardCost(run, idx, card) {
  const powers = getPlayerPowers(run);
  if ((powers.corruption || 0) > 0 && card.type === 'skill') return 0;
  if (run.player.handCosts && run.player.handCosts[idx] != null) return run.player.handCosts[idx];
  if (card.special === 'blood_for_blood') {
    const lost = run.relicState && run.relicState.hp_lost_combat ? run.relicState.hp_lost_combat : 0;
    return Math.max(0, card.cost - lost);
  }
  return card.cost;
}

function setHandCost(run, idx, cost) {
  if (!run.player.handCosts) run.player.handCosts = [];
  run.player.handCosts[idx] = cost;
}

function moveCardToHand(run, cardId) {
  const { player, relicState } = run;
  const piles = [player.drawPile, player.discardPile, player.hand];
  for (const pile of piles) {
    const idx = pile.indexOf(cardId);
    if (idx !== -1) {
      pile.splice(idx, 1);
      player.hand.push(cardId);
      let cost = null;
      if (relicState.confused) cost = Math.floor(Math.random() * 4);
      else if (CARDS[cardId].special !== 'blood_for_blood') cost = CARDS[cardId].cost;
      if (!player.handCosts) player.handCosts = [];
      player.handCosts.push(cost);
      return true;
    }
  }
  return false;
}

function losePlayerHpFromCard(state, amount) {
  if (!state.run || amount <= 0) return 0;
  const run = state.run;
  const actual = applyPlayerDamage(state, amount, -1);
  if (actual > 0) {
    const powers = getPlayerPowers(run);
    if ((powers.rupture || 0) > 0) {
      run.player.strength += powers.rupture;
      addLog(state, 'Rupture: gained ' + powers.rupture + ' Strength.');
    }
    addLog(state, 'Lost ' + actual + ' HP.');
  }
  return actual;
}

function purgeCombatOnlyStatuses(run) {
  if (!run || !run.player) return 0;
  const { player } = run;
  const piles = [player.hand, player.drawPile, player.discardPile, player.exhaustPile];
  let removed = 0;
  piles.forEach((pile) => {
    if (!Array.isArray(pile) || pile.length === 0) return;
    for (let i = pile.length - 1; i >= 0; i--) {
      if (COMBAT_ONLY_STATUS_IDS.has(pile[i])) {
        pile.splice(i, 1);
        removed++;
      }
    }
  });
  if (Array.isArray(player.handCosts) && player.handCosts.length > player.hand.length) {
    player.handCosts.length = player.hand.length;
  }
  return removed;
}

export function enterCombat(state, render) {
  const run = state.run;
  if (!run) return;

  run.phase = 'combat';
  if (run.player.strength > 0) addLog(state, 'Your Strength fades as you enter a new battle.');
  run.player.strength = 0;
  run.player.status = { weak:0, frail:0, vulnerable:0, artifact:0, intangible:0, thorns:0, noDraw:false, flameBarrier:0 };
  run.player.powers = {};

  const pool = FLOOR_ENEMIES[run.floor] || FLOOR_ENEMIES[1];
  let count = 1;
  if (run.currentNodeType === 'boss') count = 1;
  else if (run.floor >= 4) count = Math.random() > 0.8 ? 3 : 2;
  else if (run.floor >= 2) count = Math.random() > 0.75 ? 2 : 1;

  run.enemies = [];
  const groupScale = (count >= 3)
    ? { hp: 0.58, dmg: 0.5 }
    : (count === 2 ? { hp: 0.72, dmg: 0.62 } : { hp: 1, dmg: 1 });
  const eliteScale = (run.currentNodeType === 'elite' && hasRelic(state, 'preserved_insect')) ? 0.75 : 1;
  for (let i = 0; i < count; i++) {
    const enemyId = pool[Math.floor(Math.random() * pool.length)];
    const def = ENEMIES[enemyId];
    if (def) {
      const hp = Math.max(1, Math.floor(def.maxHp * groupScale.hp * eliteScale));
      run.enemies.push({
        id: enemyId,
        hp,
        maxHp: hp,
        armor: 0,
        patternIndex: i % def.pattern.length,
        dmgScale: groupScale.dmg,
        status: { weak:0, regen:0, strength:0, vulnerable:0 },
      });
    }
  }

  run.log = [];
  run.relicState.akabeko_fired = false;
  run.relicState.kunai_counter = 0;
  run.relicState.shuriken_counter = 0;
  run.relicState.attack_counter_turn = 0;
  run.relicState.skill_counter_turn = 0;
  run.relicState.nunchaku_counter = 0;
  run.relicState.ink_bottle_counter = 0;
  run.relicState.pen_nib_counter = 0;
  run.relicState.happy_flower_counter = 0;
  run.relicState.sundial_counter = 0;
  run.relicState.art_of_war_no_attack = true;
  run.relicState.next_turn_energy_bonus = 0;
  run.relicState.next_turn_draw_bonus = 0;
  run.relicState.pocketwatch_pending = false;
  run.relicState.centennial_used = false;
  run.relicState.helix_active = hasRelic(state, 'fossilized_helix');
  run.relicState.cards_played_turn = 0;
  run.relicState.turn = 0;
  run.relicState.confused = hasRelic(state, 'snecko_eye');
  run.relicState.turnPlayedTypes = { attack:false, skill:false, power:false };
  run.relicState.bottled_ready = true;
  run.relicState.lightning = hasRelic(state, 'cracked_core') ? 1 : 0;
  run.relicState.hp_lost_combat = 0;
  run.relicState.temp_strength_loss = 0;
  run.relicState.double_tap = 0;
  run.relicState.rampage_bonus = 0;
  run.relicState.powerCardsUsedThisCombat = {};
  purgeCombatOnlyStatuses(run);
  run.player.handCosts = [];

  if (hasRelic(state, 'blood_vial')) {
    const h = Math.min(2, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Blood Vial: healed ' + h + ' HP.'); }
  }
  if (hasRelic(state, 'oddly_smooth_stone')) {
    run.player.dexterity += 1;
    addLog(state, 'Oddly Smooth Stone: gain 1 Dexterity.');
  }
  if (hasRelic(state, 'vajra')) { run.player.strength += 1; addLog(state, 'Vajra: gain 1 Strength.'); }
  if (hasRelic(state, 'anchor')) { run.player.armor += 10; addLog(state, 'Anchor: gained 10 Block.'); }
  if (hasRelic(state, 'bronze_scales')) { run.player.status.thorns += 3; addLog(state, 'Bronze Scales: gain 3 Thorns.'); }
  if (hasRelic(state, 'clockwork_souvenir')) { run.player.status.artifact += 1; addLog(state, 'Clockwork Souvenir: gained 1 Artifact.'); }
  if (hasRelic(state, 'philosophers_stone')) {
    run.enemies.forEach(e => { e.status.strength += 1; });
    addLog(state, 'Philosopher\'s Stone: enemies gain 1 Strength.');
  }
  if (hasRelic(state, 'du_vu_doll')) {
    const c = countCursesInDeck(run);
    if (c > 0) { run.player.strength += c; addLog(state, 'Du-Vu Doll: gained ' + c + ' Strength.'); }
  }

  if (hasRelic(state, 'bag_of_marbles')) {
    run.enemies.forEach(e => { if (e.status) e.status.vulnerable += 1; });
    addLog(state, 'Bag of Marbles: enemies are Vulnerable!');
  }

  startPlayerTurn(state, render);
}

function startPlayerTurn(state, render) {
  const run = state.run;
  const { player, enemies } = run;
  const powers = getPlayerPowers(run);
  if ((powers.barricade || 0) > 0) {
    if (hasRelic(state, 'calipers')) player.armor = Math.max(0, player.armor - 15);
  } else if (hasRelic(state, 'calipers')) player.armor = Math.max(0, player.armor - 15);
  else player.armor = 0;
  player.status.noDraw = false;
  player.status.flameBarrier = 0;

  run.relicState.turn++;
  run.relicState.attack_counter_turn = 0;
  run.relicState.skill_counter_turn = 0;
  run.relicState.cards_played_turn = 0;
  run.relicState.art_of_war_no_attack = true;
  run.relicState.turnPlayedTypes = { attack:false, skill:false, power:false };

  let energy = player.maxEnergy;
  if (hasRelic(state, 'ice_cream')) {
    energy = Math.min(player.maxEnergy * 2, player.energy + player.maxEnergy);
  }
  if (run.relicState.next_turn_energy_bonus > 0) {
    energy += run.relicState.next_turn_energy_bonus;
    run.relicState.next_turn_energy_bonus = 0;
  }
  if (hasRelic(state, 'lantern') && run.relicState.turn === 1) energy += 1;
  if (hasRelic(state, 'happy_flower') && run.relicState.turn % 3 === 0) energy += 1;
  if (run.relicState.tea_set_charged) {
    energy += 2;
    run.relicState.tea_set_charged = false;
  }
  if ((powers.berserk || 0) > 0) energy += powers.berserk;
  player.energy = energy;

  if ((powers.demon_form || 0) > 0) {
    player.strength += powers.demon_form;
    addLog(state, 'Demon Form: gained ' + powers.demon_form + ' Strength.');
  }
  if ((powers.brutality || 0) > 0) {
    losePlayerHpFromCard(state, powers.brutality);
    drawCards(state, powers.brutality);
    addLog(state, 'Brutality triggers.');
  }

  if (hasRelic(state, 'captains_wheel') && run.relicState.turn === 3) {
    player.armor += 18;
    addLog(state, 'Captain\'s Wheel: gained 18 Block.');
  }
  if (hasRelic(state, 'incense_burner') && run.relicState.turn % 6 === 0) {
    player.status.intangible += 1;
    addLog(state, 'Incense Burner: gained 1 Intangible.');
  }
  if (run.relicState.lightning > 0) {
    const alive = enemies.map((e, idx) => ({ e, idx })).filter(x => x.e.hp > 0);
    if (alive.length > 0) {
      const pick = alive[Math.floor(Math.random() * alive.length)];
      const dealt = dealDmgToEnemy(state, 3, pick.idx, false);
      addLog(state, 'Cracked Core: lightning dealt ' + dealt + ' damage.');
    }
  }

  if (run.relicState.turn === 1 && run.relicState.bottled_ready) {
    const bindings = state.meta.relicBindings || {};
    Object.keys(bindings).forEach((rid) => {
      moveCardToHand(run, bindings[rid]);
    });
    run.relicState.bottled_ready = false;
  }

  let drawBonus = 0;
  if (run.relicState.turn === 1) {
    if (hasRelic(state, 'ring_of_the_snake')) drawBonus += 2;
    if (hasRelic(state, 'bag_of_preparation')) drawBonus += 2;
  }
  if (hasRelic(state, 'snecko_eye')) drawBonus += 2;
  if (run.relicState.next_turn_draw_bonus > 0) {
    drawBonus += run.relicState.next_turn_draw_bonus;
    run.relicState.next_turn_draw_bonus = 0;
  }

  drawCards(state, 5 + drawBonus - player.hand.length);

  if (hasRelic(state, 'pure_water') && run.relicState.turn === 1) {
    if (player.hand.length < 10) {
      player.hand.push('miracle');
      player.handCosts.push(0);
      addLog(state, 'Pure Water: added Miracle to your hand.');
    }
  }

  addLog(state, '--- Your turn ---');
  enemies.forEach((enemy, idx) => {
    if (enemy.hp > 0) {
      addLog(state, ENEMIES[enemy.id].name + ' (' + (idx + 1) + ') intends: ' + enemyIntent(state, idx));
    }
  });
}

function drawCards(state, count) {
  const run = state.run;
  const { player } = run;
  if (count <= 0) return;
  if (player.status.noDraw) {
    addLog(state, 'Cannot draw cards this turn.');
    return;
  }
  for (let i = 0; i < count; i++) {
    if (player.hand.length >= 10) break;
    if (player.status.noDraw) break;
    if (player.drawPile.length === 0) {
      if (player.discardPile.length === 0) break;
      player.drawPile = shuffle([...player.discardPile]);
      player.discardPile = [];
      addLog(state, 'Reshuffled discard pile.');
      if (hasRelic(state, 'sundial')) {
        state.run.relicState.sundial_counter++;
        if (state.run.relicState.sundial_counter % 3 === 0) {
          player.energy += 2;
          addLog(state, 'Sundial: gained 2 Energy.');
        }
      }
    }
    const next = player.drawPile.shift();
    player.hand.push(next);
    if (!player.handCosts) player.handCosts = [];
    if (run.relicState.confused) {
      player.handCosts.push(Math.floor(Math.random() * 4));
    } else if (CARDS[next].special === 'blood_for_blood') {
      player.handCosts.push(null);
    } else {
      player.handCosts.push(CARDS[next].cost);
    }

    const card = CARDS[next];
    const powers = getPlayerPowers(run);
    if (next === 'burn') losePlayerHpFromCard(state, 2);
    if (card && card.type === 'status' && (powers.evolve || 0) > 0) {
      drawCards(state, powers.evolve);
      addLog(state, 'Evolve: drew ' + powers.evolve + ' card(s).');
    }
  }
}

function enemyIntent(state, idx) {
  const run = state.run;
  if (hasRelic(state, 'runic_dome')) return '???';
  const enemy = run.enemies[idx];
  const def = ENEMIES[enemy.id];
  const action = def.pattern[enemy.patternIndex % def.pattern.length];
  if (action.type === 'attack') return '⚔ ' + action.value + (enemy.status.strength > 0 ? '(+' + enemy.status.strength + ')' : '');
  if (action.type === 'block')  return '🛡 ' + action.value;
  if (action.type === 'buff')   return '✨ ' + action.label;
  return '...';
}

export function enemyNextAction(state, idx) {
  const enemy = state.run.enemies[idx];
  const def = ENEMIES[enemy.id];
  return def.pattern[enemy.patternIndex % def.pattern.length];
}

// selectedCardIdx tracks which card is selected for multi-enemy targeting
export let selectedCardIdx = -1;
export let selectedPotionIdx = -1;

export function setSelectedCardIdx(val) {
  selectedCardIdx = val;
  if (val !== -1) selectedPotionIdx = -1;
}

export function setSelectedPotionIdx(val) {
  selectedPotionIdx = val;
}

function clearTargetSelectionPrompt(run) {
  if (!run || !Array.isArray(run.log) || run.log.length === 0) return;
  const last = run.log[run.log.length - 1];
  if (typeof last === 'string' && last.startsWith('Select a target for ')) {
    run.log.pop();
  }
}

function hideTooltipIfAny() {
  if (typeof window !== 'undefined' && typeof window.hideTooltip === 'function') {
    window.hideTooltip();
  }
}

export function usePotion(state, render, potionIndex, targetIdx = -1) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return;
  const potionId = run.potions[potionIndex];
  const potion = POTIONS[potionId];
  if (!potion) return;
  if (potion.target === 'enemy' && targetIdx === -1) {
    if (selectedPotionIdx === potionIndex) {
      selectedPotionIdx = -1;
      clearTargetSelectionPrompt(run);
      hideTooltipIfAny();
      render(); return;
    }
    selectedPotionIdx = potionIndex;
    selectedCardIdx = -1;
    clearTargetSelectionPrompt(run);
    addLog(state, 'Select a target for ' + potion.name + '.');
    hideTooltipIfAny();
    render(); return;
  }

  clearTargetSelectionPrompt(run);
  if (potion.effect.heal) {
    const h = Math.min(potion.effect.heal, run.player.maxHp - run.player.hp);
    run.player.hp += h;
    addLog(state, potion.name + ': healed ' + h + ' HP.');
  }
  if (potion.effect.energy) {
    run.player.energy += potion.effect.energy;
    addLog(state, potion.name + ': gained ' + potion.effect.energy + ' Energy.');
  }
  if (potion.effect.strength) {
    run.player.strength += potion.effect.strength;
    addLog(state, potion.name + ': gained ' + potion.effect.strength + ' Strength.');
  }
  if (potion.effect.dexterity) {
    run.player.dexterity += potion.effect.dexterity;
    addLog(state, potion.name + ': gained ' + potion.effect.dexterity + ' Dexterity.');
  }
  if (potion.effect.damage && targetIdx !== -1) {
    const dealt = dealDmgToEnemy(state, potion.effect.damage, targetIdx, true);
    addLog(state, potion.name + ': dealt ' + dealt + ' damage.');
  }
  if (hasRelic(state, 'toy_ornithopter')) {
    const h = Math.min(5, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Toy Ornithopter: healed ' + h + ' HP.'); }
  }

  run.potions.splice(potionIndex, 1);
  selectedPotionIdx = -1;
  hideTooltipIfAny();
  checkCombatEnd(state, render);
  saveState(state); render();
}

export function playCard(state, render, handIndex, targetIdx = -1) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return;
  const { player } = run;
  const cardId = player.hand[handIndex];
  if (!cardId || !CARDS[cardId]) return;
  const card = CARDS[cardId];
  const cost = getCardCost(run, handIndex, card);
  if (player.energy < cost) return;
  if (hasRelic(state, 'velvet_choker') && run.relicState.cards_played_turn >= 6) {
    addLog(state, 'Velvet Choker: card limit reached.');
    return;
  }
  if (!canPlayCardNow(state, handIndex, card)) {
    if (card.type === 'power' && isPowerCardLocked(run, card.id)) {
      addLog(state, card.name + ' is already used this combat.');
      return;
    }
    addLog(state, card.name + ' cannot be played now.');
    return;
  }

  if (card.unplayable) {
    const isCurse = card.type === 'curse';
    const isStatus = card.type === 'status';
    const canPlayCurse = isCurse && hasRelic(state, 'blue_candle');
    const canPlayStatus = isStatus && hasRelic(state, 'medical_kit');
    if (!canPlayCurse && !canPlayStatus) return;
  }

  const needsTarget = cardNeedsTarget(card);

  if (needsTarget && targetIdx === -1) {
    if (selectedCardIdx === handIndex) {
      selectedCardIdx = -1;
      clearTargetSelectionPrompt(run);
    } else {
      selectedCardIdx = handIndex;
      clearTargetSelectionPrompt(run);
      addLog(state, 'Select a target for ' + card.name + '.');
    }
    render(); return;
  }

  clearTargetSelectionPrompt(run);
  selectedCardIdx = -1;

  const handEls = document.querySelectorAll('.hand-card');
  if (handEls[handIndex]) {
    const rect = handEls[handIndex].getBoundingClientRect();
    scheduleEffect('play-card', { card, rect });
  }

  player.energy -= cost;
  player.hand.splice(handIndex, 1);
  if (player.handCosts) player.handCosts.splice(handIndex, 1);

  if (card.type === 'attack') playSFX('attack');
  if (card.type === 'defend') playSFX('shield');
  if (card.type === 'power') {
    if (!run.relicState.powerCardsUsedThisCombat) run.relicState.powerCardsUsedThisCombat = {};
    run.relicState.powerCardsUsedThisCombat[card.id] = true;
  }

  run.relicState.cards_played_turn++;
  if (card.type === 'attack') run.relicState.turnPlayedTypes.attack = true;
  if (card.type === 'skill' || card.type === 'defend') run.relicState.turnPlayedTypes.skill = true;
  if (card.type === 'power') run.relicState.turnPlayedTypes.power = true;

  if (run.relicState.turnPlayedTypes.attack &&
      run.relicState.turnPlayedTypes.skill &&
      run.relicState.turnPlayedTypes.power &&
      hasRelic(state, 'orange_pellets')) {
    if (player.status) {
      player.status.weak = 0; player.status.frail = 0; player.status.vulnerable = 0;
      addLog(state, 'Orange Pellets: removed debuffs.');
    }
  }

  let exhaustCard = false;
  if (card.unplayable) {
    if (card.type === 'curse' && hasRelic(state, 'blue_candle')) {
      losePlayerHpFromCard(state, 1);
      addLog(state, 'Blue Candle: lose 1 HP.');
      exhaustCard = true;
    } else if (card.type === 'status' && hasRelic(state, 'medical_kit')) {
      addLog(state, 'Medical Kit: exhausted a status.');
      exhaustCard = true;
    }
  }
  if (card.type === 'power') exhaustCard = true;
  if (card.exhaust) exhaustCard = true;
  if ((getPlayerPowers(run).corruption || 0) > 0 && card.type === 'skill') exhaustCard = true;

  if (card.special === 'whirlwind') {
    const rs = run.relicState;
    const akabonus = (rs && hasRelic(state, 'akabeko') && !rs.akabeko_fired) ? 8 : 0;
    if (akabonus > 0) { rs.akabeko_fired = true; addLog(state, 'Akabeko: +8 bonus damage!'); }
    const bonusX = hasRelic(state, 'chemical_x') ? 2 : 0;
    const dmgPerEnergy = (card.effect.damage || 5) + player.strength + akabonus;
    const energySpent = player.energy;
    player.energy = 0;
    if (energySpent > 0) {
      let total = 0;
      const totalHits = energySpent + bonusX;
      const hitDelayMs = 200;
      for (let i = 0; i < totalHits; i++) {
        setTimeout(() => {
          if (!state.run || state.run.phase !== 'combat') return;
          run.enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, dmgPerEnergy, idx, true); });
          if (i === totalHits - 1) {
            checkCombatEnd(state, render);
            saveState(state); render();
          }
        }, i * hitDelayMs);
      }
      addLog(state, 'You play ' + card.name + ' — ' + dmgPerEnergy + ' damage × ' + (energySpent + bonusX) + ' to ALL enemies!');
    } else {
      addLog(state, 'You play ' + card.name + ' — but you have no energy left!');
    }
  } else {
    applyEffect(state, card, targetIdx);
  }

  if (card.type === 'attack' && run.relicState.double_tap > 0) {
    run.relicState.double_tap--;
    addLog(state, 'Double Tap: played again.');
    if (card.special === 'whirlwind') {
      const bonusX = hasRelic(state, 'chemical_x') ? 2 : 0;
      const dmgPerEnergy = (card.effect.damage || 5) + player.strength;
      const totalHits = Math.max(0, bonusX);
      let total = 0;
      for (let i = 0; i < totalHits; i++) {
        run.enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, dmgPerEnergy, idx, true); });
      }
      if (totalHits > 0) addLog(state, 'You play ' + card.name + ' again — dealt ' + total + ' damage.');
    } else {
      applyEffect(state, card, targetIdx);
    }
  }

  if (card.type === 'attack' && run.relicState) {
    const rs = run.relicState;
    rs.attack_counter_turn++;
    rs.nunchaku_counter++;
    rs.pen_nib_counter++;
    rs.art_of_war_no_attack = false;
    if (hasRelic(state, 'shuriken') && rs.attack_counter_turn % 3 === 0) {
      player.strength++; addLog(state, 'Shuriken: gained 1 Strength!');
    }
    if (hasRelic(state, 'kunai') && rs.attack_counter_turn % 3 === 0) {
      player.dexterity++; addLog(state, 'Kunai: gained 1 Dexterity!');
    }
    if (hasRelic(state, 'ornamental_fan') && rs.attack_counter_turn % 3 === 0) {
      player.armor += 4; addLog(state, 'Ornamental Fan: gained 4 Block.');
    }
    if (hasRelic(state, 'nunchaku') && rs.nunchaku_counter >= 10) {
      rs.nunchaku_counter -= 10; player.energy++; addLog(state, 'Nunchaku: gained 1 Energy.');
    }
    if (hasRelic(state, 'pen_nib') && rs.pen_nib_counter >= 10) {
      rs.pen_nib_counter = 0; rs.pen_nib_active = true; addLog(state, 'Pen Nib: next Attack deals double damage.');
    }
  }
  if ((card.type === 'skill' || card.type === 'defend') && run.relicState) {
    const rs = run.relicState;
    rs.skill_counter_turn++;
    if (hasRelic(state, 'letter_opener') && rs.skill_counter_turn % 3 === 0) {
      let total = 0;
      run.enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, 5, idx, true); });
      addLog(state, 'Letter Opener: dealt ' + total + ' damage to ALL enemies.');
    }
  }
  if (card.type === 'power') {
    if (hasRelic(state, 'mummified_hand')) {
      if (player.hand.length > 0) {
        const idx = Math.floor(Math.random() * player.hand.length);
        setHandCost(run, idx, 0);
        addLog(state, 'Mummified Hand: a card now costs 0 this turn.');
      }
    }
    if (hasRelic(state, 'bird_faced_urn')) {
      const h = Math.min(2, player.maxHp - player.hp);
      if (h > 0) { player.hp += h; addLog(state, 'Bird-Faced Urn: healed ' + h + ' HP.'); }
    }
  }

  if (hasRelic(state, 'ink_bottle')) {
    run.relicState.ink_bottle_counter++;
    if (run.relicState.ink_bottle_counter >= 10) {
      run.relicState.ink_bottle_counter = 0;
      drawCards(state, 1);
      addLog(state, 'Ink Bottle: drew a card.');
    }
  }

  if (!exhaustCard) player.discardPile.push(cardId);
  else {
    moveCardToExhaustPile(state, cardId);
  }
  checkCombatEnd(state, render);

  if (player.hand.length === 0 && hasRelic(state, 'unceasing_top') && player.energy > 0) {
    drawCards(state, 1);
    addLog(state, 'Unceasing Top: drew a card.');
  }

  saveState(state); render();
}

function moveCardToExhaustPile(state, cardId) {
  const run = state.run;
  const { player } = run;
  player.exhaustPile = player.exhaustPile || [];
  player.exhaustPile.push(cardId);

  const powers = getPlayerPowers(run);
  if ((powers.feel_no_pain || 0) > 0) {
    addBlock(state, powers.feel_no_pain);
    addLog(state, 'Feel No Pain: gained ' + powers.feel_no_pain + ' Block.');
  }
  if ((powers.dark_embrace || 0) > 0) {
    drawCards(state, powers.dark_embrace);
    addLog(state, 'Dark Embrace: drew ' + powers.dark_embrace + ' card(s).');
  }
  if (cardId === 'sentinel') {
    player.energy += 2;
    addLog(state, 'Sentinel: gained 2 Energy.');
  }
  if (hasRelic(state, 'dead_branch')) {
    const random = pickCardReward(state)[0];
    if (random) {
      player.hand.push(random);
      const cost = run.relicState.confused ? Math.floor(Math.random() * 4) : CARDS[random].cost;
      setHandCost(run, player.hand.length - 1, cost);
      addLog(state, 'Dead Branch: added a random card.');
    }
  }
}

function exhaustHandCardAt(state, handIndex) {
  const run = state.run;
  const { player } = run;
  if (handIndex < 0 || handIndex >= player.hand.length) return null;
  const [cardId] = player.hand.splice(handIndex, 1);
  if (player.handCosts) player.handCosts.splice(handIndex, 1);
  moveCardToExhaustPile(state, cardId);
  return cardId;
}

function applyEffect(state, card, targetIdx) {
  const run = state.run;
  const { player, enemies } = run;
  const eff = card.effect;
  const msgs = [];
  const powers = getPlayerPowers(run);
  let handledDamage = false;
  let deferNoDraw = false;

  if (card.special === 'anger') {
    player.discardPile.push(card.id);
    msgs.push('add a copy to discard');
  } else if (card.special === 'armaments') {
    const upg = player.hand.map((id, idx) => ({ id, idx })).filter(x => CARD_UPGRADES[x.id]);
    if (upg.length > 0) {
      const pick = upg[Math.floor(Math.random() * upg.length)];
      const next = CARD_UPGRADES[pick.id];
      player.hand[pick.idx] = next;
      if (player.handCosts) player.handCosts[pick.idx] = getCardCost(run, pick.idx, CARDS[next]);
      msgs.push('upgrade a card in hand');
    }
  } else if (card.special === 'body_slam') {
    const dealt = dealDmgToEnemy(state, player.armor, targetIdx, true);
    msgs.push('deal ' + dealt + ' damage');
    handledDamage = true;
  } else if (card.special === 'flex') {
    const gain = (typeof eff.strength === 'number') ? eff.strength : 2;
    const loss = (typeof eff.tempStrengthLoss === 'number') ? eff.tempStrengthLoss : gain;
    player.strength += gain;
    run.relicState.temp_strength_loss += loss;
    msgs.push('gain ' + gain + ' Strength this turn');
  } else if (card.special === 'havoc') {
    const top = player.drawPile.shift();
    if (top && CARDS[top]) {
      const topCard = CARDS[top];
      const autoTarget = cardNeedsTarget(topCard)
        ? enemies.findIndex(e => e.hp > 0)
        : -1;
      if (topCard.unplayable) {
        moveCardToExhaustPile(state, top);
        msgs.push('exhaust top card');
      } else {
        applyEffect(state, topCard, autoTarget);
        moveCardToExhaustPile(state, top);
        msgs.push('play top card and exhaust it');
      }
    }
  } else if (card.special === 'headbutt') {
    if (player.discardPile.length > 0) {
      const idx = Math.floor(Math.random() * player.discardPile.length);
      const [picked] = player.discardPile.splice(idx, 1);
      player.drawPile.unshift(picked);
      msgs.push('put a discard card on top of draw pile');
    }
  } else if (card.special === 'heavy_blade') {
    let base = (eff.damage || 14) + player.strength * 3;
    if (player.status.weak > 0) base = Math.floor(base * 0.75);
    const dealt = dealDmgToEnemy(state, base, targetIdx, true);
    msgs.push('deal ' + dealt + ' damage');
    handledDamage = true;
  } else if (card.special === 'perfected_strike') {
    const all = [...player.hand, ...player.drawPile, ...player.discardPile, ...player.exhaustPile];
    const strikes = all.filter(id => CARDS[id] && CARDS[id].name && CARDS[id].name.includes('Strike')).length;
    const dealt = dealDmgToEnemy(state, 6 + strikes * 2 + player.strength, targetIdx, true);
    msgs.push('deal ' + dealt + ' damage');
    handledDamage = true;
  } else if (card.special === 'sword_boomerang') {
    let total = 0;
    for (let i = 0; i < 3; i++) {
      const alive = enemies.map((e, idx) => ({ e, idx })).filter(x => x.e.hp > 0);
      if (alive.length === 0) break;
      const pick = alive[Math.floor(Math.random() * alive.length)].idx;
      let base = 3 + player.strength;
      if (player.status.weak > 0) base = Math.floor(base * 0.75);
      total += dealDmgToEnemy(state, base, pick, true);
    }
    msgs.push('deal ' + total + ' damage');
    handledDamage = true;
  } else if (card.special === 'true_grit') {
    if (player.hand.length > 0) {
      const idx = Math.floor(Math.random() * player.hand.length);
      exhaustHandCardAt(state, idx);
      msgs.push('exhaust 1 random card');
    }
  } else if (card.special === 'warcry') {
    if (player.hand.length > 0) {
      const idx = Math.floor(Math.random() * player.hand.length);
      const [picked] = player.hand.splice(idx, 1);
      if (player.handCosts) player.handCosts.splice(idx, 1);
      player.drawPile.unshift(picked);
      msgs.push('put 1 card from hand on top of draw pile');
    }
  } else if (card.special === 'wild_strike') {
    player.drawPile.push('wound');
    msgs.push('shuffle a Wound into draw pile');
  } else if (card.special === 'battle_trance') {
    deferNoDraw = true;
  } else if (card.special === 'bloodletting') {
    const hpLoss = (typeof eff.hpLoss === 'number') ? eff.hpLoss : 3;
    const energyGain = (typeof eff.energyGain === 'number') ? eff.energyGain : 2;
    losePlayerHpFromCard(state, hpLoss);
    player.energy += energyGain;
    msgs.push('gain ' + energyGain + ' energy');
  } else if (card.special === 'burning_pact') {
    if (player.hand.length > 0) {
      const idx = Math.floor(Math.random() * player.hand.length);
      exhaustHandCardAt(state, idx);
      msgs.push('exhaust 1 card');
    }
  } else if (card.special === 'power_combust') {
    powers.combust = (powers.combust || 0) + 1;
    msgs.push('gain Combust');
  } else if (card.special === 'power_dark_embrace') {
    powers.dark_embrace = (powers.dark_embrace || 0) + 1;
    msgs.push('gain Dark Embrace');
  } else if (card.special === 'disarm') {
    if (targetIdx !== -1 && enemies[targetIdx] && enemies[targetIdx].hp > 0) {
      enemies[targetIdx].status.strength = Math.max(0, enemies[targetIdx].status.strength - 2);
      msgs.push('enemy loses 2 Strength');
    }
  } else if (card.special === 'dropkick') {
    if (targetIdx !== -1 && enemies[targetIdx] && enemies[targetIdx].status.vulnerable > 0) {
      player.energy += 1;
      drawCards(state, 1);
      msgs.push('gain 1 energy and draw 1');
    }
  } else if (card.special === 'dual_wield') {
    const eligible = player.hand.filter(id => CARDS[id] && (CARDS[id].type === 'attack' || CARDS[id].type === 'power'));
    if (eligible.length > 0 && player.hand.length < 10) {
      const picked = eligible[Math.floor(Math.random() * eligible.length)];
      player.hand.push(picked);
      setHandCost(run, player.hand.length - 1, getCardCost(run, -1, CARDS[picked]));
      msgs.push('create a copy in hand');
    }
  } else if (card.special === 'entrench') {
    player.armor *= 2;
    msgs.push('double block');
  } else if (card.special === 'power_evolve') {
    powers.evolve = (powers.evolve || 0) + 1;
    msgs.push('gain Evolve');
  } else if (card.special === 'power_feel_no_pain') {
    powers.feel_no_pain = (powers.feel_no_pain || 0) + 3;
    msgs.push('gain Feel No Pain');
  } else if (card.special === 'flame_barrier') {
    player.status.flameBarrier += 4;
    msgs.push('gain Flame Barrier');
  } else if (card.special === 'hemokinesis') {
    losePlayerHpFromCard(state, 2);
  } else if (card.special === 'infernal_blade') {
    const attacks = Object.keys(CARDS).filter(id => CARDS[id].type === 'attack' && !CARDS[id].upgraded);
    if (attacks.length > 0 && player.hand.length < 10) {
      const picked = attacks[Math.floor(Math.random() * attacks.length)];
      player.hand.push(picked);
      setHandCost(run, player.hand.length - 1, 0);
      msgs.push('add a random Attack that costs 0 this turn');
    }
  } else if (card.special === 'power_metallicize') {
    powers.metallicize = (powers.metallicize || 0) + 3;
    msgs.push('gain Metallicize');
  } else if (card.special === 'power_through') {
    for (let i = 0; i < 2 && player.hand.length < 10; i++) {
      player.hand.push('wound');
      setHandCost(run, player.hand.length - 1, 0);
    }
    msgs.push('add 2 Wounds to hand');
  } else if (card.special === 'rampage') {
    const bonus = run.relicState.rampage_bonus || 0;
    const dealt = dealDmgToEnemy(state, 8 + bonus + player.strength, targetIdx, true);
    run.relicState.rampage_bonus = bonus + 5;
    msgs.push('deal ' + dealt + ' damage');
    handledDamage = true;
  } else if (card.special === 'reckless_charge') {
    player.drawPile.push('dazed');
    msgs.push('shuffle a Dazed into draw pile');
  } else if (card.special === 'power_rupture') {
    powers.rupture = (powers.rupture || 0) + 1;
    msgs.push('gain Rupture');
  } else if (card.special === 'second_wind') {
    let exhausted = 0;
    for (let i = player.hand.length - 1; i >= 0; i--) {
      const hid = player.hand[i];
      const hc = CARDS[hid];
      if (hc && hc.type !== 'attack') {
        exhaustHandCardAt(state, i);
        exhausted++;
      }
    }
    if (exhausted > 0) addBlock(state, exhausted * 5);
    msgs.push('exhaust ' + exhausted + ' non-Attack cards');
  } else if (card.special === 'sever_soul') {
    for (let i = player.hand.length - 1; i >= 0; i--) {
      const hid = player.hand[i];
      const hc = CARDS[hid];
      if (hc && hc.type !== 'attack') exhaustHandCardAt(state, i);
    }
    msgs.push('exhaust all non-Attack cards');
  } else if (card.special === 'spot_weakness') {
    if (targetIdx !== -1 && enemies[targetIdx] && enemies[targetIdx].hp > 0) {
      const intent = enemyNextAction(state, targetIdx);
      const gain = (typeof eff.spotWeaknessStrength === 'number') ? eff.spotWeaknessStrength : 3;
      if (intent.type === 'attack') {
        player.strength += gain;
        msgs.push('gain ' + gain + ' Strength');
      } else {
        msgs.push('no effect');
      }
    }
  } else if (card.special === 'power_barricade') {
    powers.barricade = 1;
    msgs.push('Block no longer expires');
  } else if (card.special === 'power_berserk') {
    const selfVulnerable = (typeof eff.selfVulnerable === 'number') ? eff.selfVulnerable : 1;
    powers.berserk = (powers.berserk || 0) + 1;
    player.status.vulnerable += selfVulnerable;
    msgs.push((selfVulnerable > 0 ? 'gain ' + selfVulnerable + ' Vulnerable, ' : '') + 'gain +1 Energy each turn');
  } else if (card.special === 'power_brutality') {
    const brutalityGain = (typeof eff.brutality === 'number') ? eff.brutality : 1;
    powers.brutality = (powers.brutality || 0) + brutalityGain;
    msgs.push('gain Brutality');
  } else if (card.special === 'power_corruption') {
    powers.corruption = 1;
    msgs.push('Skills cost 0 and Exhaust');
  } else if (card.special === 'power_demon_form') {
    powers.demon_form = (powers.demon_form || 0) + 2;
    msgs.push('gain Demon Form');
  } else if (card.special === 'double_tap') {
    run.relicState.double_tap = (run.relicState.double_tap || 0) + 1;
    msgs.push('next Attack is played twice');
  } else if (card.special === 'exhume') {
    if (player.exhaustPile.length > 0 && player.hand.length < 10) {
      const idx = Math.floor(Math.random() * player.exhaustPile.length);
      const [picked] = player.exhaustPile.splice(idx, 1);
      player.hand.push(picked);
      setHandCost(run, player.hand.length - 1, CARDS[picked].cost);
      msgs.push('return a card from Exhaust pile');
    }
  } else if (card.special === 'feed') {
    const enemy = targetIdx !== -1 ? enemies[targetIdx] : null;
    const before = enemy ? enemy.hp : 0;
    if (enemy) {
      const dealt = dealDmgToEnemy(state, (eff.damage || 10) + player.strength, targetIdx, true);
      msgs.push('deal ' + dealt + ' damage');
      if (before > 0 && enemy.hp <= 0) {
        player.maxHp += 3;
        player.hp += 3;
        msgs.push('gain 3 Max HP');
      }
    }
    handledDamage = true;
  } else if (card.special === 'fiend_fire') {
    const count = player.hand.length;
    while (player.hand.length > 0) exhaustHandCardAt(state, 0);
    if (count > 0) {
      const dealt = dealDmgToEnemy(state, (7 + player.strength) * count, targetIdx, true);
      msgs.push('deal ' + dealt + ' damage');
    }
    handledDamage = true;
  } else if (card.special === 'immolate') {
    player.discardPile.push('burn');
    msgs.push('add a Burn to discard');
  } else if (card.special === 'power_juggernaut') {
    powers.juggernaut = (powers.juggernaut || 0) + 1;
    msgs.push('gain Juggernaut');
  } else if (card.special === 'limit_break') {
    player.strength *= 2;
    msgs.push('double Strength');
  } else if (card.special === 'offering') {
    losePlayerHpFromCard(state, 6);
  } else if (card.special === 'reaper') {
    const total = enemies.reduce((sum, _, idx) => sum + dealDmgToEnemy(state, (eff.damage || 4) + player.strength, idx, true), 0);
    const heal = Math.min(total, player.maxHp - player.hp);
    player.hp += heal;
    msgs.push('deal ' + total + ' damage to all');
    msgs.push('heal ' + heal + ' HP');
    handledDamage = true;
  }

  if (eff.damage && !handledDamage) {
    const hits = eff.hits || 1;
    let total = 0;
    const rs = state.run.relicState;
    const akabonus = (rs && hasRelic(state, 'akabeko') && !rs.akabeko_fired) ? 8 : 0;
    if (akabonus > 0) { rs.akabeko_fired = true; addLog(state, 'Akabeko: +8 bonus damage!'); }
    let base = eff.damage + player.strength;
    if (player.status.weak > 0) base = Math.floor(base * 0.75);
    if (hasRelic(state, 'strike_dummy') && card.name && card.name.includes('Strike')) base += 3;
    if (rs && rs.pen_nib_active) {
      base = Math.floor(base * 2);
      rs.pen_nib_active = false;
      addLog(state, 'Pen Nib: double damage!');
    }

    for (let i = 0; i < hits; i++) {
      const hitBase = base + (i === 0 ? akabonus : 0);
      if (eff.aoe) {
        enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, hitBase, idx, true); });
      } else {
        total += dealDmgToEnemy(state, hitBase, targetIdx, true);
      }
    }
    msgs.push('deal ' + total + ' damage' + (eff.aoe ? ' to all' : ''));
  }

  if (eff.block) {
    let blockGain = Math.floor(eff.block + (player.dexterity || 0));
    if (player.status.frail > 0) blockGain = Math.floor(blockGain * 0.75);
    addBlock(state, eff.block);
    msgs.push('gain ' + blockGain + ' block');
  }
  if (eff.heal)     { const a = Math.min(eff.heal, player.maxHp - player.hp); player.hp += a; msgs.push('heal ' + a + ' HP'); }
  if (eff.draw)     { drawCards(state, eff.draw); msgs.push('draw ' + eff.draw + ' card(s)'); }
  if (eff.energy)   { player.energy += eff.energy; msgs.push('gain ' + eff.energy + ' energy'); }
  if (eff.strength) { player.strength += eff.strength; msgs.push('gain ' + eff.strength + ' Strength'); }

  if (eff.weak) {
    if (eff.aoe) enemies.forEach(e => { if (e.hp > 0) e.status.weak += eff.weak; });
    else if (targetIdx !== -1) enemies[targetIdx].status.weak += eff.weak;
    msgs.push('apply ' + eff.weak + ' Weak');
  }
  if (deferNoDraw) player.status.noDraw = true;
  if (eff.vulnerable) {
    if (eff.aoe) enemies.forEach(e => { if (e.hp > 0) e.status.vulnerable += eff.vulnerable; });
    else if (targetIdx !== -1) enemies[targetIdx].status.vulnerable += eff.vulnerable;
    msgs.push('apply ' + eff.vulnerable + ' Vulnerable');
  }

  if (msgs.length === 0) msgs.push('no effect');
  addLog(state, 'You play ' + card.name + ' — ' + msgs.join(', ') + '.');
}

function dealDmgToEnemy(state, baseDmg, targetIdx, isAttack) {
  const enemy = state.run.enemies[targetIdx];
  if (!enemy || enemy.hp <= 0) return 0;

  let dmg = baseDmg;
  if (enemy.status.vulnerable > 0) {
    dmg = Math.floor(dmg * (hasRelic(state, 'paper_phrog') ? 1.75 : 1.5));
  }

  const absorbed = Math.min(dmg, enemy.armor);
  enemy.armor -= absorbed;
  let actual = Math.max(0, dmg - absorbed);
  if (isAttack && hasRelic(state, 'the_boot') && actual > 0 && actual < 5) actual = 5;

  const prevHp = enemy.hp;
  enemy.hp = Math.max(0, enemy.hp - actual);

  if (state.run) state.run.totalDamage = (state.run.totalDamage || 0) + actual;
  if (actual > 0) scheduleEffect(actual >= 20 ? 'big-hit-enemy' : 'hit-enemy', { amount: actual, targetIdx });
  else if (absorbed > 0) scheduleEffect('block-success-enemy', { amount: absorbed, targetIdx });

  if (prevHp > 0 && enemy.hp <= 0 && hasRelic(state, 'gremlin_horn')) {
    state.run.player.energy += 1;
    drawCards(state, 1);
    addLog(state, 'Gremlin Horn: gained 1 Energy and drew 1 card.');
  }

  return actual;
}

function applyPlayerDamage(state, dmg, sourceIdx) {
  const run = state.run;
  const player = run.player;
  let actual = dmg;

  if (player.status.vulnerable > 0) actual = Math.floor(actual * 1.5);
  if (player.status.intangible > 0) actual = Math.min(actual, 1);
  if (hasRelic(state, 'torii') && actual > 0 && actual <= 5) actual = 1;
  if (hasRelic(state, 'tungsten_rod') && actual > 0) actual = Math.max(0, actual - 1);

  if (actual > 0 && run.relicState && run.relicState.helix_active) {
    run.relicState.helix_active = false;
    addLog(state, 'Fossilized Helix: negated ' + actual + ' damage!');
    actual = 0;
  }

  if (actual > 0) {
    player.hp = Math.max(0, player.hp - actual);
    run.relicState.hp_lost_combat = (run.relicState.hp_lost_combat || 0) + actual;
    if (hasRelic(state, 'centennial_puzzle') && !run.relicState.centennial_used) {
      run.relicState.centennial_used = true;
      drawCards(state, 3);
      addLog(state, 'Centennial Puzzle: drew 3 cards.');
    }
  }

  if (player.status.thorns > 0 && dmg > 0 && sourceIdx >= 0) {
    dealDmgToEnemy(state, player.status.thorns, sourceIdx, false);
    addLog(state, 'Thorns: dealt ' + player.status.thorns + ' damage.');
  }
  if (player.status.flameBarrier > 0 && dmg > 0 && sourceIdx >= 0) {
    dealDmgToEnemy(state, player.status.flameBarrier, sourceIdx, false);
    addLog(state, 'Flame Barrier: dealt ' + player.status.flameBarrier + ' damage.');
  }

  if (player.hp <= 0 && hasRelic(state, 'lizard_tail') && !run.relicState.lizard_tail_used) {
    run.relicState.lizard_tail_used = true;
    player.hp = Math.ceil(player.maxHp * 0.5);
    addLog(state, 'Lizard Tail: revived to ' + player.hp + ' HP.');
  }

  return actual;
}

function grantRandomPotion(state) {
  const run = state.run;
  const ids = Object.keys(POTIONS);
  if (!run || ids.length === 0) return;
  const pid = ids[Math.floor(Math.random() * ids.length)];
  run.potions.push(pid);
  addLog(state, 'Found potion: ' + POTIONS[pid].name + '.');
}

function checkCombatEnd(state, render) {
  const run = state.run;
  if (run.enemies.every(e => e.hp <= 0)) {
    playSFX('enemy_death');
    setTimeout(() => victory(state, render), 800);
  }
}

export function endTurn(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return;
  const { player } = run;
  const powers = getPlayerPowers(run);

  selectedCardIdx = -1;
  selectedPotionIdx = -1;
  clearTargetSelectionPrompt(run);
  addLog(state, '--- Enemies\' turn ---');

  if ((run.relicState.temp_strength_loss || 0) > 0) {
    player.strength = Math.max(0, player.strength - run.relicState.temp_strength_loss);
    run.relicState.temp_strength_loss = 0;
  }
  if ((powers.metallicize || 0) > 0) {
    addBlock(state, powers.metallicize);
    addLog(state, 'Metallicize: gained ' + powers.metallicize + ' Block.');
  }
  if ((powers.combust || 0) > 0) {
    const hpLoss = powers.combust;
    const dmg = powers.combust * 5;
    losePlayerHpFromCard(state, hpLoss);
    let total = 0;
    run.enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, dmg, idx, true); });
    addLog(state, 'Combust: dealt ' + total + ' damage to ALL enemies.');
  }

  if (run.enemies.every(e => e.hp <= 0)) {
    checkCombatEnd(state, render);
    saveState(state); render();
    return;
  }

  for (let i = player.hand.length - 1; i >= 0; i--) {
    const c = CARDS[player.hand[i]];
    if (c && c.ethereal) {
      exhaustHandCardAt(state, i);
    }
  }

  if (!hasRelic(state, 'runic_pyramid')) {
    player.discardPile.push(...player.hand);
    player.hand = [];
    player.handCosts = [];
  }

  if (hasRelic(state, 'orichalcum') && player.armor === 0) {
    player.armor += 6;
    addLog(state, 'Orichalcum: gained 6 Block.');
  }
  if (hasRelic(state, 'art_of_war') && run.relicState.art_of_war_no_attack) {
    run.relicState.next_turn_energy_bonus += 1;
    addLog(state, 'Art of War: +1 Energy next turn.');
  }
  if (hasRelic(state, 'pocketwatch') && run.relicState.cards_played_turn <= 3) {
    run.relicState.next_turn_draw_bonus += 3;
    addLog(state, 'Pocketwatch: draw 3 next turn.');
  }

  let delay = 0;
  run.enemies.forEach((enemy, idx) => {
    if (enemy.hp <= 0) return;

    setTimeout(() => {
      if (!state.run || state.run.phase !== 'combat') return;

      enemy.armor = 0;
      if (enemy.status.regen > 0) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.status.regen);
        enemy.status.regen--;
      }

      const action = enemyNextAction(state, idx);
      if (action.type === 'attack') {
        scheduleEffect('enemy-attack', idx);
        playSFX('enemy_attack');
        let atk = action.value + enemy.status.strength;
        if (enemy.status.weak > 0) atk = Math.floor(atk * 0.75);
        if (enemy.dmgScale && enemy.dmgScale !== 1) atk = Math.floor(atk * enemy.dmgScale);

        const absorbed = Math.min(atk, player.armor);
        player.armor -= absorbed;
        let actual = Math.max(0, atk - absorbed);
        actual = applyPlayerDamage(state, actual, idx);
        if (actual > 0) scheduleEffect('hit-player', actual);
        else if (absorbed > 0) scheduleEffect('block-success', absorbed);
        addLog(state, ENEMIES[enemy.id].name + ' deals ' + actual + ' damage.');
      } else if (action.type === 'block') {
        enemy.armor += action.value;
        addLog(state, ENEMIES[enemy.id].name + ' gains ' + action.value + ' block.');
      } else if (action.type === 'buff') {
        enemy.status[action.buffType] += action.value;
        addLog(state, ENEMIES[enemy.id].name + ' uses ' + action.label + '!');
      }

      enemy.patternIndex++;
      render();
      if (player.hp <= 0) playerDied(state, render);
    }, delay);
    delay += 600;
  });

  setTimeout(() => {
    if (state.run && state.run.phase === 'combat' && player.hp > 0) {
      run.enemies.forEach(e => {
        if (e.status.weak > 0) e.status.weak--;
        if (e.status.vulnerable > 0) e.status.vulnerable--;
      });
      if (player.status.weak > 0) player.status.weak--;
      if (player.status.frail > 0) player.status.frail--;
      if (player.status.vulnerable > 0) player.status.vulnerable--;
      if (player.status.intangible > 0) player.status.intangible--;
      startPlayerTurn(state, render);
      saveState(state); render();
    }
  }, delay + 200);
}

function victory(state, render) {
  flushEffects();
  const run = state.run;
  if (!run) return;

  run.player.discardPile.push(...run.player.hand);
  run.player.hand = [];
  const cleaned = purgeCombatOnlyStatuses(run);
  if (cleaned > 0) addLog(state, 'Temporary status cards vanished after combat.');

  const mult = 1 + (state.meta.upgrades.better_rewards || 0) * 0.2;
  let gold = Math.floor(COMBAT_GOLD_BASE * run.floor * mult);

  if (run.startGoldBonus > 0) {
    gold += run.startGoldBonus;
    run.startGoldBonus = 0;
  }

  run.goldEarned += gold;
  state.idle.gold += gold;
  addLog(state, 'Victory! Gained ⚜ ' + gold + ' gold.');

  if (hasRelic(state, 'black_blood')) {
    const h = Math.min(12, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Black Blood: healed ' + h + ' HP.'); }
  } else if (hasRelic(state, 'burning_blood')) {
    const h = Math.min(6, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Burning Blood: healed ' + h + ' HP.'); }
  }
  if (hasRelic(state, 'meat_on_the_bone') && run.player.hp <= run.player.maxHp * 0.5) {
    const h = Math.min(12, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Meat on the Bone: healed ' + h + ' HP!'); }
  }
  if (!hasRelic(state, 'sozu')) {
    const canGainPotion = run.potions && run.potions.length < run.potionSlots;
    if (canGainPotion) {
      const guaranteed = hasRelic(state, 'white_beast_statue');
      if (guaranteed || Math.random() < POTION_DROP_CHANCE) {
        grantRandomPotion(state);
      }
    }
  }

  if (run.floor >= TOTAL_FLOORS) {
    const ess = RUN_ESSENCE_BASE + RUN_ESSENCE_PER_FLOOR * 4;
    run.essenceGained = ess;
    state.idle.essence += ess;
    run.phase = 'victory';
    addLog(state, 'You conquered the dungeon! Earned ' + ess + ' essence!');
  } else {
    const node = run.currentMapNode ? run.map[run.currentMapNode.y][run.currentMapNode.i] : null;
    if (node && (node.type === 'elite' || node.type === 'boss')) {
      const source = node.type === 'boss' ? 'boss' : 'reward';
      const offer = generateRelicOffer(state, { source });
      if (offer.length > 0) run.relicOffer = offer;
      if (node.type === 'elite' && hasRelic(state, 'black_star')) {
        run.relicOfferQueue = run.relicOfferQueue || [];
        run.relicOfferQueue.push(generateRelicOffer(state, { source: 'reward' }));
      }
    }
    run.cardOffer = pickCardReward(state);
    markEncounteredCards(state, run.cardOffer);
    run.phase = 'card_reward';
  }
  saveState(state); render();
}

export function pickCardReward(state) {
  let count = 3;
  if (hasRelic(state, 'question_card')) count = 4;
  if (hasRelic(state, 'busted_crown')) count = Math.max(1, count - 2);
  return shuffle([...SHOP_POOL]).slice(0, count).map(c => c.id);
}

export function selectRewardCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'card_reward') return;
  const card = CARDS[cardId];
  if (!card) return;
  const added = addCardToRun(state, cardId);
  addLog(state, 'Added ' + CARDS[added].name + ' to your deck!');
  run.cardOffer = null;
  run.phase = 'map';
  saveState(state); render();
}

export function skipCardReward(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'card_reward') return;
  run.cardOffer = null;
  addLog(state, 'You skipped the card reward.');
  run.phase = 'map';
  saveState(state); render();
}

export function chooseSingingBowl(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'card_reward') return;
  state.meta.bonusMaxHp = (state.meta.bonusMaxHp || 0) + 2;
  run.player.maxHp += 2;
  run.player.hp += 2;
  run.cardOffer = null;
  addLog(state, 'Singing Bowl: Max HP +2.');
  run.phase = 'map';
  saveState(state); render();
}

function playerDied(state, render) {
  const run = state.run;
  addLog(state, 'You have been slain...');
  run.phase = 'death';
  if (run.floor > state.meta.bestFloor) state.meta.bestFloor = run.floor;
  if (run.goldEarned > state.meta.bestGold) state.meta.bestGold = run.goldEarned;
  state.meta.totalRuns++;
  const ess = Math.max(3, Math.floor(run.floor * RUN_ESSENCE_PER_FLOOR * 0.6));
  run.essenceGained = ess;
  state.idle.essence += ess;
  addLog(state, 'You earned ' + ess + ' essence from the dungeon.');
  saveState(state); render();
}

export function abandonRun(state, render) {
  playerDied(state, render);
}
