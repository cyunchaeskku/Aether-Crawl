// src/engine/run.js — Run lifecycle

import { STARTER_DECK, SHOP_POOL, SHOP_REFRESH_COST } from '../data.js';
import { saveState } from '../state.js';
import { shuffle, addLog } from './helpers.js';
import { playerMaxHp, playerMaxEnergy } from './player.js';
import { generateMap } from './map.js';
import { generateRelicOffer } from './relics.js';
import { enterCombat } from './combat.js';

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
      removeCount: 0,
      shopRemovalUsed: false,
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
    run.shopRemovalUsed = false;
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
