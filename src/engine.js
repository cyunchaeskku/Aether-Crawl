// src/engine.js — Game logic: idle tick, combat, dungeon

import {
  CARDS, STARTER_DECK, BUILDINGS, META_UPGRADES,
  ENEMIES, FLOOR_ENEMIES, TOTAL_FLOORS,
  COMBAT_GOLD_BASE, RUN_ESSENCE_BASE, RUN_ESSENCE_PER_FLOOR,
  CARD_COST, SHOP_POOL
} from './data.js';
import { saveState, pickShopCards } from './state.js';

// ─── Idle ────────────────────────────────────────────────────────────────────

// Call every 100ms. Accumulates fractional resources.
export function idleTick(state, dtSeconds) {
  recomputeRates(state);
  state.idle.gold    += state.idle.goldRate    * dtSeconds;
  state.idle.mana    += state.idle.manaRate    * dtSeconds;
  state.idle.essence += state.idle.essenceRate * dtSeconds;
}

export function recomputeRates(state) {
  let gold = 0, mana = 0, essence = 0;
  state.buildings.forEach((b, i) => {
    if (b.level === 0) return;
    const def = BUILDINGS[i];
    const rate = def.baseRate * b.level;
    if (def.resource === 'gold')    gold    += rate;
    if (def.resource === 'mana')    mana    += rate;
    if (def.resource === 'essence') essence += rate;
  });
  state.idle.goldRate    = gold;
  state.idle.manaRate    = mana;
  state.idle.essenceRate = essence;
}

// ─── Buildings ───────────────────────────────────────────────────────────────

export function getBuildingUpgradeCost(state, buildingIndex) {
  const def = BUILDINGS[buildingIndex];
  const level = state.buildings[buildingIndex].level;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, level));
}

export function canUpgradeBuilding(state, buildingIndex) {
  const def = BUILDINGS[buildingIndex];
  const b = state.buildings[buildingIndex];
  if (b.level >= def.maxLevel) return false;
  return state.idle.gold >= getBuildingUpgradeCost(state, buildingIndex);
}

export function upgradeBuilding(state, buildingIndex) {
  if (!canUpgradeBuilding(state, buildingIndex)) return false;
  const cost = getBuildingUpgradeCost(state, buildingIndex);
  state.idle.gold -= cost;
  state.buildings[buildingIndex].level++;
  recomputeRates(state);
  return true;
}

// ─── Shop ─────────────────────────────────────────────────────────────────────

export function canBuyCard(state, cardId) {
  const card = CARDS[cardId];
  return state.idle.gold >= CARD_COST[card.rarity];
}

export function buyCard(state, cardId) {
  if (!canBuyCard(state, cardId)) return false;
  const card = CARDS[cardId];
  state.idle.gold -= CARD_COST[card.rarity];
  state.meta.permanentDeck.push(cardId);
  // Remove from shop slot and replace with new card
  const idx = state.shop.available.indexOf(cardId);
  if (idx !== -1) {
    const remaining = SHOP_POOL.filter(c =>
      !state.shop.available.includes(c.id) || c.id === cardId
    );
    const replacement = remaining.filter(c => c.id !== cardId);
    if (replacement.length > 0) {
      const pick = replacement[Math.floor(Math.random() * replacement.length)];
      state.shop.available[idx] = pick.id;
    } else {
      state.shop.available.splice(idx, 1);
    }
  }
  return true;
}

export function canRefreshShop(state) {
  return state.idle.gold >= state.shop.refreshCost;
}

export function refreshShop(state) {
  if (!canRefreshShop(state)) return false;
  state.idle.gold -= state.shop.refreshCost;
  state.shop.available = pickShopCards();
  return true;
}

// ─── Meta Upgrades ───────────────────────────────────────────────────────────

export function getMetaUpgradeCost(state, upgradeId) {
  const def = META_UPGRADES.find(u => u.id === upgradeId);
  const level = state.meta.upgrades[upgradeId];
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, level));
}

export function canBuyMetaUpgrade(state, upgradeId) {
  const def = META_UPGRADES.find(u => u.id === upgradeId);
  const level = state.meta.upgrades[upgradeId];
  if (level >= def.maxLevel) return false;
  return state.idle.essence >= getMetaUpgradeCost(state, upgradeId);
}

export function buyMetaUpgrade(state, upgradeId) {
  if (!canBuyMetaUpgrade(state, upgradeId)) return false;
  const cost = getMetaUpgradeCost(state, upgradeId);
  state.idle.essence -= cost;
  state.meta.upgrades[upgradeId]++;
  return true;
}

// ─── Dungeon / Run ───────────────────────────────────────────────────────────

export function getPlayerMaxHp(state) {
  return 50 + (state.meta.upgrades.max_hp * 10);
}

export function getPlayerMaxEnergy(state) {
  return 3 + state.meta.upgrades.extra_energy;
}

export function buildRunDeck(state) {
  return [...STARTER_DECK, ...state.meta.permanentDeck];
}

export function startRun(state) {
  if (state.run) return false; // already in run
  const maxHp = getPlayerMaxHp(state);
  const maxEnergy = getPlayerMaxEnergy(state);
  const deck = buildRunDeck(state);
  const startGold = state.meta.upgrades.start_gold * 50;
  if (startGold > 0) state.idle.gold += startGold;

  state.run = {
    floor: 1,
    phase: 'explore',  // explore | combat | reward | victory | death
    player: {
      hp: maxHp, maxHp,
      armor: 0,
      energy: maxEnergy, maxEnergy,
      strength: 0,
      deck,
      hand: [],
      drawPile: shuffle([...deck]),
      discardPile: []
    },
    enemy: null,
    goldEarned: startGold,
    log: []
  };

  // Immediately enter first combat
  enterCombat(state);
  return true;
}

export function enterCombat(state) {
  const run = state.run;
  run.phase = 'combat';
  const enemyPool = FLOOR_ENEMIES[run.floor];
  const enemyId = enemyPool[Math.floor(Math.random() * enemyPool.length)];
  const def = ENEMIES[enemyId];

  run.enemy = {
    id: enemyId,
    hp: def.maxHp,
    maxHp: def.maxHp,
    armor: 0,
    patternIndex: 0,
    status: { weak: 0, regen: 0, strength: 0, vulnerable: 0 }
  };

  run.log = [];
  startPlayerTurn(state);
}

function startPlayerTurn(state) {
  const { player, enemy } = state.run;
  // Reset player armor at start of turn
  player.armor = 0;
  // Restore energy
  player.energy = player.maxEnergy;
  // Draw up to 5 cards
  drawCards(state, 5 - player.hand.length);
  // Log
  addLog(state, `--- Your turn ---`);
  if (enemy) addLog(state, `${ENEMIES[enemy.id].name} intends: ${getEnemyIntent(enemy)}`);
}

function drawCards(state, count) {
  const { player } = state.run;
  for (let i = 0; i < count; i++) {
    if (player.drawPile.length === 0) {
      // Reshuffle discard
      if (player.discardPile.length === 0) break;
      player.drawPile = shuffle([...player.discardPile]);
      player.discardPile = [];
      addLog(state, 'Reshuffled discard pile.');
    }
    const card = player.drawPile.shift();
    player.hand.push(card);
  }
}

export function getEnemyIntent(enemy) {
  const def = ENEMIES[enemy.id];
  const action = def.pattern[enemy.patternIndex % def.pattern.length];
  return action.label;
}

export function getEnemyNextAction(enemy) {
  const def = ENEMIES[enemy.id];
  return def.pattern[enemy.patternIndex % def.pattern.length];
}

// ─── Card Playing ─────────────────────────────────────────────────────────────

export function canPlayCard(state, handIndex) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return false;
  const cardId = run.player.hand[handIndex];
  const card = CARDS[cardId];
  return run.player.energy >= card.cost;
}

export function playCard(state, handIndex) {
  if (!canPlayCard(state, handIndex)) return false;
  const run = state.run;
  const { player, enemy } = run;
  const cardId = player.hand[handIndex];
  const card = CARDS[cardId];

  // Deduct energy
  player.energy -= card.cost;

  // Remove from hand
  player.hand.splice(handIndex, 1);

  // Apply effect
  if (card.special === 'whirlwind') {
    const dmg = 5 * player.energy;
    player.energy = 0;
    if (dmg > 0) dealDamageToEnemy(state, dmg);
    addLog(state, `You play Whirlwind — deal ${dmg} damage!`);
  } else {
    applyCardEffect(state, card.effect, cardId);
  }

  // Move to discard
  player.discardPile.push(cardId);

  // Check if enemy died
  if (enemy && enemy.hp <= 0) {
    handleEnemyDeath(state);
  }

  return true;
}

function applyCardEffect(state, effect, cardId) {
  const { player, enemy } = state.run;
  const card = CARDS[cardId];
  const msgs = [];

  if (effect.damage) {
    const hits = effect.hits || 1;
    let totalDmg = 0;
    for (let i = 0; i < hits; i++) {
      const dmg = dealDamageToEnemy(state, effect.damage + player.strength);
      totalDmg += dmg;
    }
    msgs.push(`deal ${totalDmg} damage`);
  }

  if (effect.block) {
    player.armor += effect.block;
    msgs.push(`gain ${effect.block} block`);
  }

  if (effect.heal) {
    const actual = Math.min(effect.heal, player.maxHp - player.hp);
    player.hp += actual;
    msgs.push(`heal ${actual} HP`);
  }

  if (effect.draw) {
    drawCards(state, effect.draw);
    msgs.push(`draw ${effect.draw} card(s)`);
  }

  if (effect.energy) {
    player.energy += effect.energy;
    msgs.push(`gain ${effect.energy} energy`);
  }

  if (effect.weak && enemy) {
    enemy.status.weak += effect.weak;
    msgs.push(`apply ${effect.weak} Weak`);
  }

  if (effect.vulnerable && enemy) {
    enemy.status.vulnerable += effect.vulnerable;
    msgs.push(`apply ${effect.vulnerable} Vulnerable`);
  }

  if (effect.strength) {
    player.strength += effect.strength;
    msgs.push(`gain ${effect.strength} Strength`);
  }

  addLog(state, `You play ${card.name} — ${msgs.join(', ')}.`);
}

function dealDamageToEnemy(state, baseDmg) {
  const { enemy } = state.run;
  if (!enemy) return 0;
  let dmg = baseDmg;
  if (enemy.status.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
  const absorbed = Math.min(dmg, enemy.armor);
  enemy.armor = Math.max(0, enemy.armor - dmg);
  const actual = Math.max(0, dmg - absorbed);
  enemy.hp = Math.max(0, enemy.hp - actual);
  return actual;
}

// ─── End Turn ────────────────────────────────────────────────────────────────

export function endTurn(state) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return false;
  const { player, enemy } = run;

  addLog(state, `--- Enemy turn: ${ENEMIES[enemy.id].name} ---`);

  // Discard hand
  player.discardPile.push(...player.hand);
  player.hand = [];

  // Regen: enemy heals
  if (enemy.status.regen > 0) {
    const heal = enemy.status.regen;
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
    addLog(state, `${ENEMIES[enemy.id].name} regenerates ${heal} HP.`);
  }

  // Enemy action
  const action = getEnemyNextAction(enemy);

  if (action.type === 'attack') {
    let atk = action.value + enemy.status.strength;
    if (enemy.status.weak > 0) atk = Math.floor(atk * 0.75);
    const absorbed = Math.min(atk, player.armor);
    player.armor = Math.max(0, player.armor - atk);
    const actual = Math.max(0, atk - absorbed);
    player.hp = Math.max(0, player.hp - actual);
    addLog(state, `${ENEMIES[enemy.id].name} uses ${action.label} — deals ${actual} damage (${absorbed} blocked).`);
  } else if (action.type === 'block') {
    enemy.armor += action.value;
    addLog(state, `${ENEMIES[enemy.id].name} uses ${action.label} — gains ${action.value} block.`);
  } else if (action.type === 'buff') {
    enemy.status[action.buffType] += action.value;
    addLog(state, `${ENEMIES[enemy.id].name} uses ${action.label}!`);
  }

  // Decrement status effects
  if (enemy.status.weak > 0) enemy.status.weak--;
  if (enemy.status.vulnerable > 0) enemy.status.vulnerable--;

  // Advance enemy pattern
  enemy.patternIndex++;

  // Check player death
  if (player.hp <= 0) {
    handlePlayerDeath(state);
    return true;
  }

  // Start next player turn
  startPlayerTurn(state);
  return true;
}

// ─── Combat Resolution ───────────────────────────────────────────────────────

function handleEnemyDeath(state) {
  const run = state.run;
  const enemyName = ENEMIES[run.enemy.id].name;
  addLog(state, `${enemyName} is defeated!`);

  const rewardMult = 1 + (state.meta.upgrades.better_rewards * 0.2);
  const gold = Math.floor(COMBAT_GOLD_BASE * run.floor * rewardMult);
  run.goldEarned += gold;
  state.idle.gold += gold;

  addLog(state, `You gain ${gold} gold.`);

  run.phase = 'reward';
}

function handlePlayerDeath(state) {
  const run = state.run;
  addLog(state, `You have been slain...`);
  run.phase = 'death';

  // Update meta stats
  if (run.floor > state.meta.bestFloor) {
    state.meta.bestFloor = run.floor;
  }
  state.meta.totalRuns++;

  // Grant partial essence based on floors reached
  const essenceGained = Math.max(1, Math.floor((run.floor - 1) * RUN_ESSENCE_PER_FLOOR));
  state.idle.essence += essenceGained;
  addLog(state, `You earned ${essenceGained} essence from the dungeon.`);
}

export function proceedAfterReward(state) {
  const run = state.run;
  if (!run || run.phase !== 'reward') return false;

  if (run.floor >= TOTAL_FLOORS) {
    // Victory!
    handleVictory(state);
  } else {
    run.floor++;
    enterCombat(state);
  }
  return true;
}

function handleVictory(state) {
  const run = state.run;
  addLog(state, `You have conquered the dungeon!`);
  run.phase = 'victory';

  state.meta.totalRuns++;
  if (run.floor > state.meta.bestFloor) state.meta.bestFloor = run.floor;

  const essence = RUN_ESSENCE_BASE + RUN_ESSENCE_PER_FLOOR * (run.floor - 1);
  state.idle.essence += essence;
  addLog(state, `You earned ${essence} essence!`);
}

export function endRun(state) {
  state.run = null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function addLog(state, msg) {
  state.run.log.push(msg);
  if (state.run.log.length > 30) state.run.log.shift();
}
