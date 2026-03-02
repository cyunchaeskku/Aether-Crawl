// src/engine/combat.js — Combat flow

import {
  CARDS,
  ENEMIES,
  FLOOR_ENEMIES,
  SHOP_POOL,
  COMBAT_GOLD_BASE,
  RUN_ESSENCE_BASE,
  RUN_ESSENCE_PER_FLOOR,
  TOTAL_FLOORS
} from '../data.js';
import { saveState } from '../state.js';
import { scheduleEffect, flushEffects } from './vfx.js';
import { playSFX } from './audio.js';
import { shuffle, addLog, hasRelic } from './helpers.js';
import { generateRelicOffer } from './relics.js';

export function enterCombat(state, render) {
  const run = state.run;
  if (!run) return;

  run.phase = 'combat';
  if (run.player.strength > 0) addLog(state, 'Your Strength fades as you enter a new battle.');
  run.player.strength = 0;

  const pool = FLOOR_ENEMIES[run.floor] || FLOOR_ENEMIES[1];
  let count = 1;
  if (run.floor === 5) count = 1;
  else if (run.floor >= 4) count = Math.random() > 0.5 ? 3 : 2;
  else if (run.floor >= 2) count = Math.random() > 0.6 ? 2 : 1;

  run.enemies = [];
  const groupScale = (count >= 3)
    ? { hp: 0.7, dmg: 0.7 }
    : (count === 2 ? { hp: 0.8, dmg: 0.8 } : { hp: 1, dmg: 1 });
  for (let i = 0; i < count; i++) {
    const enemyId = pool[Math.floor(Math.random() * pool.length)];
    const def = ENEMIES[enemyId];
    if (def) {
      run.enemies.push({
        id: enemyId,
        hp: Math.max(1, Math.floor(def.maxHp * groupScale.hp)),
        maxHp: Math.max(1, Math.floor(def.maxHp * groupScale.hp)),
        armor: 0,
        patternIndex: i % def.pattern.length,
        dmgScale: groupScale.dmg,
        status: { weak:0, regen:0, strength:0, vulnerable:0 },
      });
    }
  }

  run.log = [];
  run.relicState = {
    akabeko_fired: false,
    kunai_counter: 0,
    shuriken_counter: 0,
    helix_active: hasRelic(state, 'fossilized_helix')
  };

  if (hasRelic(state, 'bag_of_marbles')) {
    run.enemies.forEach(e => { if (e.status) e.status.vulnerable += 1; });
    addLog(state, 'Bag of Marbles: enemies are Vulnerable!');
  }
  if (hasRelic(state, 'vajra')) { run.player.strength += 1; addLog(state, 'Vajra: gain 1 Strength.'); }

  startPlayerTurn(state, render);
}

function startPlayerTurn(state, render) {
  const run = state.run;
  const { player, enemies } = run;
  player.armor = 0;
  if (hasRelic(state, 'ice_cream')) {
    player.energy = Math.min(player.maxEnergy * 2, player.energy + player.maxEnergy);
  } else {
    player.energy = player.maxEnergy;
  }
  if (run.relicState) { run.relicState.kunai_counter = 0; run.relicState.shuriken_counter = 0; }
  drawCards(state, 5 - player.hand.length);
  addLog(state, '--- Your turn ---');
  enemies.forEach((enemy, idx) => {
    if (enemy.hp > 0) {
      addLog(state, ENEMIES[enemy.id].name + ' (' + (idx + 1) + ') intends: ' + enemyIntent(state, idx));
    }
  });
}

function drawCards(state, count) {
  const { player } = state.run;
  for (let i = 0; i < count; i++) {
    if (player.hand.length >= 10) break;
    if (player.drawPile.length === 0) {
      if (player.discardPile.length === 0) break;
      player.drawPile = shuffle([...player.discardPile]);
      player.discardPile = [];
      addLog(state, 'Reshuffled discard pile.');
    }
    player.hand.push(player.drawPile.shift());
  }
}

function enemyIntent(state, idx) {
  const run = state.run;
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

export function setSelectedCardIdx(val) {
  selectedCardIdx = val;
}

export function playCard(state, render, handIndex, targetIdx = -1) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return;
  const { player } = run;
  const cardId = player.hand[handIndex];
  if (!cardId || !CARDS[cardId]) return;
  const card = CARDS[cardId];
  if (player.energy < card.cost) return;

  const aliveEnemies = run.enemies.filter(e => e.hp > 0);
  const needsTarget = (card.type === 'attack' || card.effect.weak || card.effect.vulnerable) && !card.effect.aoe;

  if (needsTarget && targetIdx === -1) {
    if (selectedCardIdx === handIndex) {
      selectedCardIdx = -1;
    } else {
      selectedCardIdx = handIndex;
      addLog(state, 'Select a target for ' + card.name + '.');
    }
    render(); return;
  }

  selectedCardIdx = -1;

  const handEls = document.querySelectorAll('.hand-card');
  if (handEls[handIndex]) {
    const rect = handEls[handIndex].getBoundingClientRect();
    scheduleEffect('play-card', { card, rect });
  }

  player.energy -= card.cost;
  player.hand.splice(handIndex, 1);

  if (card.type === 'attack') playSFX('attack');
  if (card.type === 'defend') playSFX('shield');

  if (card.special === 'whirlwind' || card.special === 'whirlwind_plus') {
    const rs = run.relicState;
    const akabonus = (rs && hasRelic(state, 'akabeko') && !rs.akabeko_fired) ? 8 : 0;
    if (akabonus > 0) { rs.akabeko_fired = true; addLog(state, 'Akabeko: +8 bonus damage!'); }
    const dmgPerEnergy = (card.special === 'whirlwind_plus' ? 8 : 5) + player.strength + akabonus;
    const energySpent = player.energy;
    player.energy = 0;
    if (energySpent > 0) {
      let total = 0;
      const hitDelayMs = 200;
      for (let i = 0; i < energySpent; i++) {
        setTimeout(() => {
          if (!state.run || state.run.phase !== 'combat') return;
          run.enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, dmgPerEnergy, idx); });
          if (i === energySpent - 1) {
            checkCombatEnd(state, render);
            saveState(state); render();
          }
        }, i * hitDelayMs);
      }
      addLog(state, 'You play ' + card.name + ' — ' + dmgPerEnergy + ' damage × ' + energySpent + ' to ALL enemies!');
    } else {
      addLog(state, 'You play ' + card.name + ' — but you have no energy left!');
    }
  } else {
    applyEffect(state, card, targetIdx);
  }

  if (card.type === 'attack' && run.relicState) {
    const rs = run.relicState;
    if (hasRelic(state, 'shuriken')) {
      rs.shuriken_counter++;
      if (rs.shuriken_counter % 3 === 0) { player.strength++; addLog(state, 'Shuriken: gained 1 Strength!'); }
    }
    if (hasRelic(state, 'kunai')) {
      rs.kunai_counter++;
      if (rs.kunai_counter % 3 === 0) { player.energy++; addLog(state, 'Kunai: gained 1 Energy!'); }
    }
  }

  player.discardPile.push(cardId);
  checkCombatEnd(state, render);

  if (player.hand.length === 0 && hasRelic(state, 'unceasing_top') && player.energy > 0) {
    drawCards(state, 1);
    addLog(state, 'Unceasing Top: drew a card.');
  }

  saveState(state); render();
}

function applyEffect(state, card, targetIdx) {
  const { player, enemies } = state.run;
  const eff = card.effect;
  const msgs = [];

  if (eff.damage) {
    const hits = eff.hits || 1;
    let total = 0;
    const rs = state.run.relicState;
    const akabonus = (rs && hasRelic(state, 'akabeko') && !rs.akabeko_fired) ? 8 : 0;
    if (akabonus > 0) { rs.akabeko_fired = true; addLog(state, 'Akabeko: +8 bonus damage!'); }

    for (let i = 0; i < hits; i++) {
      const base = eff.damage + player.strength + (i === 0 ? akabonus : 0);
      if (eff.aoe) {
        enemies.forEach((_, idx) => { total += dealDmgToEnemy(state, base, idx); });
      } else {
        total += dealDmgToEnemy(state, base, targetIdx);
      }
    }
    msgs.push('deal ' + total + ' damage' + (eff.aoe ? ' to all' : ''));
  }

  if (eff.block)    { const blockGain = Math.floor(eff.block + (player.dexterity || 0)); player.armor += blockGain; msgs.push('gain ' + blockGain + ' block'); }
  if (eff.heal)     { const a = Math.min(eff.heal, player.maxHp - player.hp); player.hp += a; msgs.push('heal ' + a + ' HP'); }
  if (eff.draw)     { drawCards(state, eff.draw); msgs.push('draw ' + eff.draw + ' card(s)'); }
  if (eff.energy)   { player.energy += eff.energy; msgs.push('gain ' + eff.energy + ' energy'); }
  if (eff.strength) { player.strength += eff.strength; msgs.push('gain ' + eff.strength + ' Strength'); }

  if (eff.weak) {
    if (eff.aoe) enemies.forEach(e => { if (e.hp > 0) e.status.weak += eff.weak; });
    else if (targetIdx !== -1) enemies[targetIdx].status.weak += eff.weak;
    msgs.push('apply ' + eff.weak + ' Weak');
  }
  if (eff.vulnerable) {
    if (eff.aoe) enemies.forEach(e => { if (e.hp > 0) e.status.vulnerable += eff.vulnerable; });
    else if (targetIdx !== -1) enemies[targetIdx].status.vulnerable += eff.vulnerable;
    msgs.push('apply ' + eff.vulnerable + ' Vulnerable');
  }

  addLog(state, 'You play ' + card.name + ' — ' + msgs.join(', ') + '.');
}

function dealDmgToEnemy(state, baseDmg, targetIdx) {
  const enemy = state.run.enemies[targetIdx];
  if (!enemy || enemy.hp <= 0) return 0;

  let dmg = baseDmg;
  if (enemy.status.vulnerable > 0) dmg = Math.floor(dmg * 1.5);

  const absorbed = Math.min(dmg, enemy.armor);
  enemy.armor -= absorbed;
  const actual = Math.max(0, dmg - absorbed);
  enemy.hp = Math.max(0, enemy.hp - actual);

  if (state.run) state.run.totalDamage = (state.run.totalDamage || 0) + actual;
  if (actual > 0) scheduleEffect(actual >= 20 ? 'big-hit-enemy' : 'hit-enemy', { amount: actual, targetIdx });
  else if (absorbed > 0) scheduleEffect('block-success-enemy', { amount: absorbed, targetIdx });

  return actual;
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

  selectedCardIdx = -1;
  addLog(state, '--- Enemies\' turn ---');

  player.discardPile.push(...player.hand);
  player.hand = [];

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

        if (actual > 0 && run.relicState && run.relicState.helix_active) {
          run.relicState.helix_active = false;
          addLog(state, 'Fossilized Helix: negated ' + actual + ' damage!');
          actual = 0;
        }

        player.hp = Math.max(0, player.hp - actual);
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

  const mult = 1 + (state.meta.upgrades.better_rewards || 0) * 0.2;
  let gold = Math.floor(COMBAT_GOLD_BASE * run.floor * mult);

  if (run.startGoldBonus > 0) {
    gold += run.startGoldBonus;
    run.startGoldBonus = 0;
  }

  run.goldEarned += gold;
  state.idle.gold += gold;
  addLog(state, 'Victory! Gained ⚜ ' + gold + ' gold.');

  if (hasRelic(state, 'burning_blood')) {
    const h = Math.min(6, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Burning Blood: healed ' + h + ' HP.'); }
  }
  if (hasRelic(state, 'meat_on_the_bone') && run.player.hp <= run.player.maxHp * 0.5) {
    const h = Math.min(12, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog(state, 'Meat on the Bone: healed ' + h + ' HP!'); }
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
      const offer = generateRelicOffer(state);
      if (offer.length > 0) run.relicOffer = offer;
    }
    run.cardOffer = pickCardReward();
    run.phase = 'card_reward';
  }
  saveState(state); render();
}

export function pickCardReward() {
  return shuffle([...SHOP_POOL]).slice(0, 3).map(c => c.id);
}

export function selectRewardCard(state, render, cardId) {
  const run = state.run;
  if (!run || run.phase !== 'card_reward') return;
  const card = CARDS[cardId];
  if (!card) return;
  run.player.discardPile.push(cardId);
  addLog(state, 'Added ' + card.name + ' to your deck!');
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
