// src/engine/run.js — Run lifecycle

import { STARTER_DECK, SHOP_POOL, SHOP_REFRESH_COST, POTIONS, CARDS, CARD_UPGRADES } from '../data.js';
import { saveState } from '../state.js';
import { shuffle, addLog, markEncounteredCards, hasRelic } from './helpers.js';
import { playerMaxHp, playerMaxEnergy } from './player.js';
import { generateMap } from './map.js';
import { generateRelicOffer, gainRelic, initRelicState, relicPotionSlots } from './relics.js';
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
      questionState: createQuestionState(1),
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
  } else if (node.type === 'event') {
    resolveQuestionRoom(state, render);
    return;
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

function currentAct(run) {
  return Math.floor(((run.floor || 1) - 1) / 15) + 1;
}

function createQuestionState(act) {
  return {
    act,
    monsterChance: 0.10,
    shopChance: 0.03,
    treasureChance: 0.02,
  };
}

function ensureQuestionState(run) {
  const act = currentAct(run);
  if (!run.questionState || run.questionState.act !== act) {
    run.questionState = createQuestionState(act);
  }
  return run.questionState;
}

function clampQuestionState(qs) {
  qs.monsterChance = Math.max(0, Math.min(1, qs.monsterChance));
  qs.shopChance = Math.max(0, Math.min(1, qs.shopChance));
  qs.treasureChance = Math.max(0, Math.min(1, qs.treasureChance));
  const sum = qs.monsterChance + qs.shopChance + qs.treasureChance;
  if (sum > 1) {
    const scale = 1 / sum;
    qs.monsterChance *= scale;
    qs.shopChance *= scale;
    qs.treasureChance *= scale;
  }
}

function rollQuestionResult(state) {
  const run = state.run;
  const qs = ensureQuestionState(run);
  const r = Math.random();
  const m = qs.monsterChance;
  const s = qs.shopChance;
  const t = qs.treasureChance;
  let result = 'event';
  if (r < m) result = 'monster';
  else if (r < m + s) result = 'shop';
  else if (r < m + s + t) result = 'treasure';

  if (hasRelic(state, 'juzu_bracelet') && result === 'monster') {
    result = 'event';
    addLog(state, 'Juzu Bracelet: avoided a monster in ? room.');
  }

  if (hasRelic(state, 'tiny_chest')) {
    run.relicState.tiny_chest_counter = (run.relicState.tiny_chest_counter || 0) + 1;
    if (run.relicState.tiny_chest_counter % 4 === 0) {
      result = 'treasure';
      addLog(state, 'Tiny Chest: a Treasure appears!');
    }
  }

  if (result === 'monster') {
    qs.monsterChance = 0.10;
    qs.shopChance += 0.03;
    qs.treasureChance += 0.02;
  } else if (result === 'shop') {
    qs.shopChance = 0.03;
    qs.monsterChance += 0.10;
    qs.treasureChance += 0.02;
  } else if (result === 'treasure') {
    qs.treasureChance = 0.02;
    qs.monsterChance += 0.10;
    qs.shopChance += 0.03;
  } else {
    qs.monsterChance += 0.10;
    qs.shopChance += 0.03;
    qs.treasureChance += 0.02;
  }
  clampQuestionState(qs);
  return result;
}

function resolveQuestionRoom(state, render) {
  const run = state.run;
  const act = currentAct(run);
  const result = rollQuestionResult(state);

  if (result === 'monster') {
    addLog(state, '? room: ambushed by monsters.');
    run.currentNodeType = 'monster';
    enterCombat(state, render);
    return;
  }

  if (result === 'shop') {
    addLog(state, '? room: you discover a hidden merchant.');
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
    saveState(state); render();
    return;
  }

  if (result === 'treasure') {
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
    addLog(state, '? room: hidden treasure!');
    saveState(state); render();
    return;
  }

  if (act === 1) {
    resolveAct1Event(state, render);
  } else {
    addLog(state, 'Something mysterious happens...');
    run.phase = 'reward';
    run.rewardType = 'rest';
  }

  saveState(state); render();
}

function resolveAct1Event(state, render) {
  const events = [
    eventBigFish,
    eventCleric,
    eventGoldenIdol,
    eventLivingWall,
    eventScrapOoze,
    eventShiningLight,
    eventSssserpent,
    eventWorldOfGoop,
    eventDeadAdventurer,
    eventMushrooms,
    eventWingStatue,
  ];
  const pick = events[Math.floor(Math.random() * events.length)];
  pick(state, render);
}

function eventBigFish(state) {
  const run = state.run;
  const roll = Math.random();
  addLog(state, 'Event: Big Fish');
  if (roll < 0.34) {
    const heal = Math.floor(run.player.maxHp / 3);
    run.player.hp = Math.min(run.player.maxHp, run.player.hp + heal);
    addLog(state, 'Big Fish: healed ' + heal + ' HP.');
  } else if (roll < 0.67) {
    run.player.maxHp += 10;
    run.player.hp += 10;
    state.meta.bonusMaxHp = (state.meta.bonusMaxHp || 0) + 10;
    addLog(state, 'Big Fish: Max HP +10.');
  } else {
    const loss = Math.max(1, Math.floor(run.player.maxHp * 0.1));
    run.player.maxHp = Math.max(1, run.player.maxHp - loss);
    run.player.hp = Math.min(run.player.hp, run.player.maxHp);
    state.meta.bonusMaxHp = Math.max(0, (state.meta.bonusMaxHp || 0) - loss);
    const relic = generateRelicOffer(state, { source: 'reward', count: 1 })[0];
    if (relic) gainRelic(state, null, relic, { silent: true });
    addLog(state, 'Big Fish: gained a relic, lost ' + loss + ' Max HP.');
  }
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventCleric(state) {
  const run = state.run;
  addLog(state, 'Event: The Cleric');
  if (state.idle.gold >= 50 && run.player.hp < run.player.maxHp * 0.75) {
    const heal = Math.floor(run.player.maxHp * 0.35);
    state.idle.gold -= 50;
    run.player.hp = Math.min(run.player.maxHp, run.player.hp + heal);
    addLog(state, 'Cleric: paid 50 Gold and healed ' + heal + ' HP.');
  } else if (state.idle.gold >= 75) {
    state.idle.gold -= 75;
    if (removeRandomCardFromDeck(state)) addLog(state, 'Cleric: purified one card for 75 Gold.');
    else addLog(state, 'Cleric: no removable card.');
  } else {
    addLog(state, 'Cleric: you leave.');
  }
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventDeadAdventurer(state, render) {
  const run = state.run;
  addLog(state, 'Event: Dead Adventurer');
  if (Math.random() < 0.6) {
    addLog(state, 'You search the corpse and trigger an Elite fight.');
    run.currentNodeType = 'elite';
    enterCombat(state, render);
  } else {
    addLog(state, 'You decide not to risk it.');
    run.phase = 'reward';
    run.rewardType = 'rest';
  }
}

function eventGoldenIdol(state) {
  const run = state.run;
  addLog(state, 'Event: Golden Idol');
  state.idle.gold += 125;
  addCurseToDeck(state);
  addLog(state, 'You take the idol: +125 Gold and a Curse.');
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventMushrooms(state, render) {
  const run = state.run;
  addLog(state, 'Event: Hypnotizing Colored Mushrooms');
  if (Math.random() < 0.5) {
    addLog(state, 'Spores turn hostile: combat starts.');
    run.currentNodeType = 'monster';
    enterCombat(state, render);
    return;
  }
  addLog(state, 'You safely walk away from the spores.');
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventLivingWall(state) {
  const run = state.run;
  addLog(state, 'Event: Living Wall');
  const roll = Math.random();
  if (roll < 0.34) {
    if (removeRandomCardFromDeck(state)) addLog(state, 'Living Wall: removed one card.');
    else addLog(state, 'Living Wall: nothing to remove.');
  } else if (roll < 0.67) {
    if (transformRandomCardInDeck(state)) addLog(state, 'Living Wall: transformed one card.');
    else addLog(state, 'Living Wall: transformation failed.');
  } else {
    if (upgradeRandomCardInDeck(state)) addLog(state, 'Living Wall: upgraded one card.');
    else addLog(state, 'Living Wall: no upgrade target.');
  }
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventScrapOoze(state) {
  const run = state.run;
  addLog(state, 'Event: Scrap Ooze');
  let hpLoss = 3;
  let attempts = 0;
  let found = false;
  while (attempts < 3 && run.player.hp > 1) {
    attempts += 1;
    run.player.hp = Math.max(1, run.player.hp - hpLoss);
    if (Math.random() < 0.45 + attempts * 0.15) {
      found = true;
      break;
    }
    hpLoss += 2;
  }
  if (found) {
    const relic = generateRelicOffer(state, { source: 'reward', count: 1 })[0];
    if (relic) gainRelic(state, null, relic, { silent: true });
    addLog(state, 'Scrap Ooze: found a relic after ' + attempts + ' attempt(s).');
  } else {
    addLog(state, 'Scrap Ooze: you stop searching.');
  }
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventShiningLight(state) {
  const run = state.run;
  addLog(state, 'Event: Shining Light');
  const hpLoss = Math.max(1, Math.floor(run.player.maxHp * 0.15));
  run.player.hp = Math.max(1, run.player.hp - hpLoss);
  let upgraded = 0;
  if (upgradeRandomCardInDeck(state)) upgraded += 1;
  if (upgradeRandomCardInDeck(state)) upgraded += 1;
  addLog(state, 'Shining Light: lost ' + hpLoss + ' HP, upgraded ' + upgraded + ' card(s).');
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventSssserpent(state) {
  const run = state.run;
  addLog(state, 'Event: The Ssssserpent');
  state.idle.gold += 175;
  run.player.discardPile.push('doubt');
  addLog(state, 'Ssssserpent: +175 Gold and added Doubt.');
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventWorldOfGoop(state) {
  const run = state.run;
  addLog(state, 'Event: World of Goop');
  const hpLoss = Math.max(1, Math.floor(run.player.maxHp * 0.12));
  const goldGain = 75 + Math.floor(Math.random() * 51);
  run.player.hp = Math.max(1, run.player.hp - hpLoss);
  state.idle.gold += goldGain;
  addLog(state, 'World of Goop: lost ' + hpLoss + ' HP, gained ' + goldGain + ' Gold.');
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function eventWingStatue(state, render) {
  const run = state.run;
  addLog(state, 'Event: Wing Statue');
  if (Math.random() < 0.5) {
    const goldGain = 60 + Math.floor(Math.random() * 41);
    state.idle.gold += goldGain;
    addLog(state, 'Wing Statue: + ' + goldGain + ' Gold, but monsters attack!');
    run.currentNodeType = 'monster';
    enterCombat(state, render);
    return;
  }
  addLog(state, 'Wing Statue: you leave it alone.');
  run.phase = 'reward';
  run.rewardType = 'rest';
}

function collectDeckRefs(run, filterFn) {
  const refs = [];
  const piles = [
    run.player.hand,
    run.player.drawPile,
    run.player.discardPile,
  ];
  piles.forEach((pile) => {
    for (let i = 0; i < pile.length; i++) {
      const cardId = pile[i];
      const card = CARDS[cardId];
      if (!card) continue;
      if (!filterFn(cardId, card)) continue;
      refs.push({ pile, index: i, cardId });
    }
  });
  return refs;
}

function randomShopCardId() {
  if (SHOP_POOL.length === 0) return 'strike';
  const pick = SHOP_POOL[Math.floor(Math.random() * SHOP_POOL.length)];
  return pick.id;
}

function removeRandomCardFromDeck(state) {
  const run = state.run;
  const refs = collectDeckRefs(run, (cardId) => cardId !== 'curse' && cardId !== 'doubt');
  if (refs.length === 0) return false;
  const pick = refs[Math.floor(Math.random() * refs.length)];
  pick.pile.splice(pick.index, 1);
  return true;
}

function transformRandomCardInDeck(state) {
  const run = state.run;
  const refs = collectDeckRefs(run, () => true);
  if (refs.length === 0) return false;
  const pick = refs[Math.floor(Math.random() * refs.length)];
  pick.pile[pick.index] = randomShopCardId();
  return true;
}

function upgradeRandomCardInDeck(state) {
  const run = state.run;
  const refs = collectDeckRefs(run, (cardId) => !!CARD_UPGRADES[cardId]);
  if (refs.length === 0) return false;
  const pick = refs[Math.floor(Math.random() * refs.length)];
  pick.pile[pick.index] = CARD_UPGRADES[pick.cardId];
  return true;
}
