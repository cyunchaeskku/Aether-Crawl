// src/engine/run.js — Run lifecycle

import { STARTER_DECK, SHOP_POOL, SHOP_REFRESH_COST, POTIONS } from '../data.js';
import { saveState } from '../state.js';
import { shuffle, addLog, markEncounteredCards } from './helpers.js';
import { playerMaxHp, playerMaxEnergy } from './player.js';
import { generateMap } from './map.js';
import { generateRelicOffer, initRelicState, relicPotionSlots } from './relics.js';
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
        status: { weak:0, frail:0, vulnerable:0, artifact:0, intangible:0, thorns:0, noDraw:false, flameBarrier:0 },
        powers: {},
        hand: [],
        handCosts: [],
        drawPile: shuffle([...deck]),
        discardPile: [],
        exhaustPile: [],
      },
      enemies: [],
      goldEarned: 0,
      totalDamage: 0,
      essenceGained: 0,
      restedThisFloor: false,
      upgradeChoiceActive: false,
      removeChoiceActive: false,
      digChoiceActive: false,
      relicOffer: null,
      relicOfferQueue: [],
      relicSelect: null,
      relicState: initRelicState(state),
      potions: [],
      potionSlots: relicPotionSlots(state),
      log: [],
      encounteredCards: [],
    };
    markEncounteredCards(state, deck);
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
    const connected = currentNode.connections.includes(node.id);
    const canIgnore = !connected && run.relicState && run.relicState.wing_boots_uses > 0 && y === run.currentMapNode.y + 1;
    if (!connected && !canIgnore) return;
    if (canIgnore) {
      run.relicState.wing_boots_uses -= 1;
      addLog(state, 'Wing Boots: ignored path (' + run.relicState.wing_boots_uses + ' left).');
    }
  } else if (y !== 0) return;

  run.currentMapNode = { y, i };
  run.floor = y + 1;
  run.currentNodeType = node.type;

  if (run.relicState && run.relicState.maw_bank_active && state.meta.relics.includes('maw_bank')) {
    state.idle.gold += 12;
    addLog(state, 'Maw Bank: gained 12 Gold.');
  }

  if (node.type === 'monster' || node.type === 'boss' || node.type === 'elite') {
    enterCombat(state, render);
  } else if (node.type === 'rest') {
    run.phase = 'reward';
    run.rewardType = 'rest';
    run.restedThisFloor = false;
    run.upgradeChoiceActive = false;
    run.removeChoiceActive = false;
    run.digChoiceActive = false;
    if (state.meta.relics.includes('ancient_tea_set')) {
      run.relicState.tea_set_charged = true;
      addLog(state, 'Ancient Tea Set: next combat +2 Energy.');
    }
    if (state.meta.relics.includes('eternal_feather')) {
      const deckSize = run.player.drawPile.length + run.player.discardPile.length + run.player.hand.length;
      const heal = Math.floor(deckSize / 5) * 3;
      if (heal > 0) {
        run.player.hp = Math.min(run.player.maxHp, run.player.hp + heal);
        addLog(state, 'Eternal Feather: healed ' + heal + ' HP.');
      }
    }
  } else if (node.type === 'treasure') {
    run.phase = 'reward';
    run.rewardType = 'treasure';
    run.relicOffer = generateRelicOffer(state, { source: 'reward' });
    if (state.meta.relics.includes('cursed_key')) {
      addCurseToDeck(state);
    }
    if (state.meta.relics.includes('matryoshka') && state.meta.relicCharges && state.meta.relicCharges.matryoshka > 0) {
      run.relicOfferQueue = run.relicOfferQueue || [];
      run.relicOfferQueue.push(generateRelicOffer(state, { source: 'reward' }));
      state.meta.relicCharges.matryoshka -= 1;
    }
    addLog(state, 'You found a Treasure Chest!');
  } else if (node.type === 'shop') {
    addLog(state, 'A traveling merchant appears!');
    const shopCount = 5 + Math.floor(Math.random() * 3);
    run.shopCards = shuffle([...SHOP_POOL]).slice(0, shopCount).map(c => c.id);
    markEncounteredCards(state, run.shopCards);
    run.shopSaleCard = run.shopCards[Math.floor(Math.random() * run.shopCards.length)];
    run.shopRemovalUsed = false;
    run.shopRelics = generateRelicOffer(state, { source: 'shop', count: 3 });
    run.shopPotions = shuffle(Object.keys(POTIONS)).slice(0, 3);
    if (state.meta.relics.includes('meal_ticket')) {
      run.player.hp = Math.min(run.player.maxHp, run.player.hp + 15);
      addLog(state, 'Meal Ticket: healed 15 HP.');
    }
    run.phase = 'shop';
  } else {
    if (node.type === 'event' && state.meta.relics.includes('tiny_chest')) {
      run.relicState.tiny_chest_counter = (run.relicState.tiny_chest_counter || 0) + 1;
      if (run.relicState.tiny_chest_counter % 4 === 0) {
        run.phase = 'reward';
        run.rewardType = 'treasure';
        run.relicOffer = generateRelicOffer(state, { source: 'reward' });
        if (state.meta.relics.includes('cursed_key')) {
          addCurseToDeck(state);
        }
        addLog(state, 'Tiny Chest: a Treasure appears!');
      } else {
        addLog(state, 'Something mysterious happens...');
        run.phase = 'reward';
      }
    } else {
      addLog(state, 'Something mysterious happens...');
      run.phase = 'reward';
    }
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

function addCurseToDeck(state) {
  const run = state.run;
  if (!run) return;
  if (state.meta.relicCharges && state.meta.relicCharges.omamori > 0) {
    state.meta.relicCharges.omamori -= 1;
    addLog(state, 'Omamori: blocked a Curse.');
    return;
  }
  run.player.discardPile.push('curse');
  addLog(state, 'You obtained a Curse.');
}
