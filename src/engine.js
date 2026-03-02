// src/engine.js — All game logic: idle, buildings, meta upgrades, run/combat/map

import {
  CARDS, CARD_UPGRADES, STARTER_DECK, BUILDINGS, META_UPGRADES,
  ENEMIES, FLOOR_ENEMIES, RELICS, RELIC_OFFER_COUNT,
  TOTAL_FLOORS, MAP_WIDTH,
  COMBAT_GOLD_BASE, RUN_ESSENCE_BASE, RUN_ESSENCE_PER_FLOOR,
  CARD_COST, SHOP_POOL, SHOP_REFRESH_COST,
  SFX_ATTACK, SFX_DEATH, SFX_SHIELD, SFX_ENEMY_DEATH, SFX_ENEMY_ATTACK, BGM_PATH
} from './data.js';
import { saveState, pickShopCards } from './state.js';

// ─── Audio ────────────────────────────────────────────────────────────────────

let bgmPlaylist = [];
let currentBgmIndex = 0;
let bgmPlayer = null;
let audioInitialized = false;

export function playSFX(type) {
  let file = '';
  if (type === 'attack') {
    file = SFX_ATTACK[Math.floor(Math.random() * SFX_ATTACK.length)];
  } else if (type === 'death') {
    file = SFX_DEATH;
  } else if (type === 'shield') {
    file = SFX_SHIELD;
  } else if (type === 'enemy_death') {
    file = SFX_ENEMY_DEATH[Math.floor(Math.random() * SFX_ENEMY_DEATH.length)];
  } else if (type === 'enemy_attack') {
    file = SFX_ENEMY_ATTACK;
  }
  if (!file) return;
  const sfx = new Audio(file);
  sfx.volume = 0.325;
  sfx.play().catch(() => {});
}

export async function initAudio() {
  if (audioInitialized) return;
  audioInitialized = true;
  try {
    const response = await fetch(BGM_PATH + 'list.json');
    bgmPlaylist = await response.json();
    currentBgmIndex = Math.floor(Math.random() * bgmPlaylist.length);
    playNextTrack();
  } catch (err) {
    console.error('Failed to load BGM list:', err);
  }
}

function playNextTrack() {
  if (!bgmPlaylist.length) return;
  if (bgmPlayer) {
    bgmPlayer.pause();
    bgmPlayer.removeEventListener('ended', playNextTrack);
  }
  const trackName = bgmPlaylist[currentBgmIndex];
  bgmPlayer = new Audio(BGM_PATH + encodeURIComponent(trackName));
  bgmPlayer.volume = 0.4;
  bgmPlayer.play().catch(() => console.log('Autoplay prevented. Click to play.'));
  bgmPlayer.addEventListener('ended', () => {
    currentBgmIndex = (currentBgmIndex + 1) % bgmPlaylist.length;
    playNextTrack();
  });
}

// ─── VFX ─────────────────────────────────────────────────────────────────────

const pendingEffects = [];

export function scheduleEffect(type, value) {
  pendingEffects.push({ type, value });
}

export function flushEffects() {
  while (pendingEffects.length > 0) {
    const { type, value } = pendingEffects.shift();
    if (type === 'hit-enemy') {
      const target = '#enemy-unit-' + value.targetIdx;
      shakeElement(target.substring(1), 'shake-hit');
      spawnFloatingNumber(target, value.amount, 'float-dmg');
    } else if (type === 'big-hit-enemy') {
      const target = '#enemy-unit-' + value.targetIdx;
      shakeElement(target.substring(1), 'shake-big-hit');
      spawnFloatingNumber(target, value.amount, 'float-dmg-big');
      spawnBigHitLabel(target);
      spawnScreenFlash();
    } else if (type === 'hit-player') {
      shakeElement('dungeon-panel', 'shake-player-hit');
      spawnFloatingNumber('.player-section', value, 'float-dmg-player');
    } else if (type === 'enemy-attack') {
      shakeElement('enemy-unit-' + value, 'enemy-lunge');
    } else if (type === 'block-success-enemy') {
      spawnBlockEffect('#enemy-unit-' + value.targetIdx, value.amount);
    } else if (type === 'block-success') {
      spawnBlockEffect('.player-section', value);
    } else if (type === 'play-card') {
      spawnCardPlayEffect(value.card, value.rect);
    }
  }
}

function shakeElement(id, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 400);
}

function spawnFloatingNumber(selector, value, cls) {
  const anchor = document.querySelector(selector);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'floating-num ' + cls;
  el.textContent = '-' + value;
  el.style.left = (rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4) + 'px';
  el.style.top  = (rect.top  + rect.height * (0.15 + Math.random() * 0.4)) + 'px';
  document.body.appendChild(el);
  const dur = cls === 'float-dmg-big' ? 1200 : 900;
  setTimeout(() => el.remove(), dur);
}

function spawnBigHitLabel(selector) {
  const anchor = document.querySelector(selector);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'floating-num float-big-label';
  el.textContent = '💥 HEAVY HIT!';
  el.style.left = (rect.left + rect.width * 0.1 + Math.random() * rect.width * 0.3) + 'px';
  el.style.top  = (rect.top + rect.height * 0.05) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function spawnScreenFlash() {
  const el = document.createElement('div');
  el.className = 'big-hit-flash';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

function spawnBlockEffect(selector, absorbed) {
  const anchor = document.querySelector(selector);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const label = document.createElement('div');
  label.className = 'floating-num float-block-label';
  label.textContent = '🛡 BLOCKED!';
  label.style.left = (rect.left + rect.width * 0.15 + Math.random() * rect.width * 0.25) + 'px';
  label.style.top  = (rect.top + rect.height * 0.1) + 'px';
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 900);
  if (absorbed > 0) {
    const num = document.createElement('div');
    num.className = 'floating-num float-block-num';
    num.textContent = absorbed;
    num.style.left = (rect.left + rect.width * 0.5 + Math.random() * rect.width * 0.2) + 'px';
    num.style.top  = (rect.top + rect.height * 0.25) + 'px';
    document.body.appendChild(num);
    setTimeout(() => num.remove(), 800);
  }
}

function spawnCardPlayEffect(card, rect) {
  const el = document.createElement('div');
  el.className = 'hand-card card-' + card.type + ' playing-card-anim';
  el.innerHTML =
    '<div class="hc-cost">'+card.cost+'⚡</div>'+
    '<div class="hc-name">'+card.name+'</div>'+
    '<div class="hc-desc">'+card.description+'</div>'+
    '<div class="hc-type">'+card.type+'</div>';
  el.style.position = 'fixed';
  el.style.left = rect.left + 'px';
  el.style.top = rect.top + 'px';
  el.style.width = rect.width + 'px';
  el.style.height = rect.height + 'px';
  el.style.zIndex = 9999;
  el.style.margin = 0;
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  const panel = document.getElementById('dungeon-panel');
  const panelRect = panel
    ? panel.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
  const targetX = panelRect.left + panelRect.width / 2 - rect.width / 2;
  const targetY = panelRect.top + panelRect.height / 3 - rect.height / 2;
  requestAnimationFrame(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(1.3)`;
    el.style.opacity = '0';
    el.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
  });
  setTimeout(() => el.remove(), 500);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// state is passed in — state.run must exist
function addLog(state, msg) {
  if (!state.run) return;
  state.run.log.push(msg);
  if (state.run.log.length > 30) state.run.log.shift();
}

function hasRelic(state, id) {
  return state.meta.relics && state.meta.relics.includes(id);
}

// ─── Idle ─────────────────────────────────────────────────────────────────────

export function idleTick(state, dtSeconds) {
  state.idle.gold    += state.idle.goldRate    * dtSeconds;
  state.idle.essence += state.idle.essenceRate * dtSeconds;
}

export function recomputeRates(state) {
  let gold = 0, essence = 0;
  state.buildings.forEach((b, i) => {
    if (b.level === 0) return;
    const def = BUILDINGS[i];
    const rate = def.baseRate * b.level;
    if (def.resource === 'gold')    gold    += rate;
    if (def.resource === 'essence') essence += rate;
  });
  state.idle.goldRate    = gold;
  state.idle.essenceRate = essence;
}

// ─── Buildings ────────────────────────────────────────────────────────────────

export function buildingUpgradeCost(state, i) {
  const def = BUILDINGS[i];
  const lv = state.buildings[i].level;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, lv));
}

export function upgradeBuilding(state, render, i) {
  const def = BUILDINGS[i];
  const b = state.buildings[i];
  if (b.level >= def.maxLevel) return;
  const cost = buildingUpgradeCost(state, i);
  if (state.idle.gold < cost) return;
  state.idle.gold -= cost;
  b.level++;
  recomputeRates(state);
  saveState(state); render();
}

// ─── Shop (hub) ───────────────────────────────────────────────────────────────

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

// ─── Meta Upgrades ────────────────────────────────────────────────────────────

export function metaUpgradeCost(state, id) {
  const def = META_UPGRADES.find(u => u.id === id);
  const lv = state.meta.upgrades[id];
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, lv));
}

export function buyMetaUpgrade(state, render, id) {
  const def = META_UPGRADES.find(u => u.id === id);
  const lv = state.meta.upgrades[id];
  if (lv >= def.maxLevel) return;
  const cost = metaUpgradeCost(state, id);
  if (state.idle.essence < cost) return;
  state.idle.essence -= cost;
  state.meta.upgrades[id]++;
  saveState(state); render();
}

// ─── Player stat helpers ───────────────────────────────────────────────────────

export function playerMaxHp(state) {
  return 80 + (state.meta.upgrades.max_hp || 0) * 10;
}

export function playerMaxEnergy(state) {
  return 3 + (state.meta.upgrades.extra_energy || 0);
}

// ─── Map Generation ───────────────────────────────────────────────────────────

export function generateMap() {
  const map = [];
  for (let y = 0; y < TOTAL_FLOORS; y++) {
    const actFloor = (y % 15) + 1;
    const isBossFloor = (actFloor === 15);
    const nodesInRow = isBossFloor ? 1 : 2 + Math.floor(Math.random() * 2);
    const row = [];

    for (let i = 0; i < nodesInRow; i++) {
      let type = 'monster';
      if (isBossFloor) type = 'boss';
      else if (actFloor === 1) type = 'monster';
      else if (actFloor === 8) type = 'treasure';
      else if (actFloor === 14) type = 'rest';
      else {
        const r = Math.random();
        if (r < 0.15) type = 'shop';
        else if (r < 0.30) type = 'rest';
        else if (r < 0.45) type = 'event';
        else if (r < 0.60) type = 'elite';
        else type = 'monster';
      }
      row.push({
        id: `node_${y}_${i}`,
        type,
        x: (MAP_WIDTH / (nodesInRow + 1)) * (i + 1),
        y,
        connections: [],
        completed: false
      });
    }
    map.push(row);
  }

  for (let y = 0; y < TOTAL_FLOORS - 1; y++) {
    const currentRow = map[y];
    const nextRow = map[y + 1];
    currentRow.forEach((node, i) => {
      const targetIdx = Math.min(i, nextRow.length - 1);
      node.connections.push(nextRow[targetIdx].id);
      if (Math.random() > 0.5 && nextRow[targetIdx + 1]) node.connections.push(nextRow[targetIdx + 1].id);
      if (Math.random() > 0.5 && i > 0 && nextRow[i - 1]) node.connections.push(nextRow[i - 1].id);
    });
  }
  return map;
}

// ─── Relic helpers ────────────────────────────────────────────────────────────

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

// ─── Run ──────────────────────────────────────────────────────────────────────

export function startRun(state, render) {
  if (state.run) return;
  try {
    const maxHp = playerMaxHp(state);
    const maxEnergy = playerMaxEnergy(state);
    const sDeck = Array.isArray(state.meta.startingDeck) ? state.meta.startingDeck : STARTER_DECK;
    const pDeck = Array.isArray(state.meta.permanentDeck) ? state.meta.permanentDeck : [];
    const deck = [...sDeck, ...pDeck];

    state.idle.gold += 99;
    const startGoldBonus = (state.meta.upgrades.start_gold || 0) * 50;
    if (startGoldBonus > 0) state.idle.gold += startGoldBonus;

    const map = generateMap();

    state.run = {
      floor: 0,
      phase: 'map',
      map: map,
      currentMapNode: null,
      player: {
        hp: maxHp, maxHp: maxHp,
        armor: 0,
        energy: maxEnergy, maxEnergy: maxEnergy,
        strength: 0,
        dexterity: 0,
        hand: [],
        drawPile: shuffle([...deck]),
        discardPile: [],
      },
      enemies: [],
      goldEarned: 0,
      totalDamage: 0,
      essenceGained: 0,
      restedThisFloor: false,
      upgradeChoiceActive: false,
      relicOffer: null,
      relicState: {
        akabeko_fired: false,
        kunai_counter: 0,
        shuriken_counter: 0,
        helix_active: true
      },
      log: [],
    };
    saveState(state); render();
  } catch (e) {
    console.error('Failed to start run:', e);
  }
}

export function enterMapNode(state, render, y, i) {
  const run = state.run;
  const node = run.map[y][i];

  if (run.currentMapNode) {
    const currentNode = run.map[run.currentMapNode.y][run.currentMapNode.i];
    if (!currentNode.connections.includes(node.id)) return;
  } else if (y !== 0) return;

  run.currentMapNode = { y, i };
  run.floor = y + 1;

  if (node.type === 'monster' || node.type === 'boss' || node.type === 'elite') {
    enterCombat(state, render);
  } else if (node.type === 'rest') {
    run.phase = 'reward';
    run.rewardType = 'rest';
    run.restedThisFloor = false;
    run.upgradeChoiceActive = false;
  } else if (node.type === 'treasure') {
    run.phase = 'reward';
    run.rewardType = 'treasure';
    run.relicOffer = generateRelicOffer(state);
    addLog(state, 'You found a Treasure Chest!');
  } else if (node.type === 'shop') {
    addLog(state, 'A traveling merchant appears!');
    const shopCount = 5 + Math.floor(Math.random() * 3);
    run.shopCards = shuffle([...SHOP_POOL]).slice(0, shopCount).map(c => c.id);
    run.shopSaleCard = run.shopCards[Math.floor(Math.random() * run.shopCards.length)];
    run.phase = 'shop';
  } else {
    addLog(state, 'Something mysterious happens...');
    run.phase = 'reward';
  }
  saveState(state); render();
}

export function proceedAfterReward(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'reward') return;
  run.phase = 'map';
  saveState(state); render();
}

export function exitRun(state, render) {
  state.run = null;
  state.shop.refreshCost = SHOP_REFRESH_COST;
  saveState(state); render();
}

// ─── Combat ───────────────────────────────────────────────────────────────────

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
  for (let i = 0; i < count; i++) {
    const enemyId = pool[Math.floor(Math.random() * pool.length)];
    const def = ENEMIES[enemyId];
    if (def) {
      run.enemies.push({
        id: enemyId,
        hp: def.maxHp, maxHp: def.maxHp,
        armor: 0,
        patternIndex: 0,
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

  if (needsTarget && aliveEnemies.length > 1 && targetIdx === -1) {
    if (selectedCardIdx === handIndex) {
      selectedCardIdx = -1;
    } else {
      selectedCardIdx = handIndex;
      addLog(state, 'Select a target for ' + card.name + '.');
    }
    render(); return;
  }

  if (needsTarget && aliveEnemies.length === 1 && targetIdx === -1) {
    targetIdx = run.enemies.indexOf(aliveEnemies[0]);
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
    const totalDmg = dmgPerEnergy * player.energy;
    player.energy = 0;
    if (totalDmg > 0) {
      run.enemies.forEach((_, idx) => dealDmgToEnemy(state, totalDmg, idx));
      addLog(state, 'You play ' + card.name + ' — deal ' + totalDmg + ' damage to ALL enemies!');
      checkCombatEnd(state, render);
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

// ─── Rest site ────────────────────────────────────────────────────────────────

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

// ─── Run shop ─────────────────────────────────────────────────────────────────

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

export function leaveShop(state, render) {
  const run = state.run;
  if (!run || run.phase !== 'shop') return;
  run.phase = 'map';
  saveState(state); render();
}
