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
    saveState(state); render();
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

  // Handle Events
  run.phase = 'event';
  const act1Events = [
    { id: 'big_fish', name: 'Big Fish' },
    { id: 'cleric', name: 'The Cleric' },
    { id: 'dead_adventurer', name: 'Dead Adventurer' },
    { id: 'golden_idol', name: 'Golden Idol' },
    { id: 'mushrooms', name: 'Mushrooms' },
    { id: 'living_wall', name: 'Living Wall' },
    { id: 'scrap_ooze', name: 'Scrap Ooze' },
    { id: 'shining_light', name: 'Shining Light' },
    { id: 'sssserpent', name: 'The Ssssserpent' },
    { id: 'world_of_goop', name: 'World of Goop' },
    { id: 'wing_statue', name: 'Wing Statue' }
  ];

  const act2Events = [
    { id: 'ancient_writing', name: 'Ancient Writing' },
    { id: 'augmenter', name: 'Augmenter' },
    { id: 'council_of_ghosts', name: 'Council of Ghosts' },
    { id: 'cursed_tome', name: 'Cursed Tome' },
    { id: 'forgotten_altar', name: 'Forgotten Altar' },
    { id: 'library', name: 'The Library' },
    { id: 'masked_bandits', name: 'Masked Bandits' },
    { id: 'vampires', name: 'Vampires' }
  ];

  const sharedEvents = [
    { id: 'face_trader', name: 'Face Trader' },
    { id: 'upgrade_shrine', name: 'Upgrade Shrine' },
    { id: 'purifier', name: 'Purifier' },
    { id: 'transmogrifier', name: 'Transmogrifier' },
    { id: 'golden_shrine', name: 'Golden Shrine' },
    { id: 'lab', name: 'The Lab' },
    { id: 'match_and_keep', name: 'Match and Keep' },
    { id: 'wheel_of_change', name: 'Wheel of Change' }
  ];

  let pool = [];
  if (act === 1) pool = [...act1Events, ...sharedEvents];
  else if (act === 2) pool = [...act2Events, ...sharedEvents];
  else pool = [...sharedEvents]; // Act 3 placeholder or shared

  const event = pool[Math.floor(Math.random() * pool.length)];

  setupEvent(state, event.id);
  saveState(state); render();
}

function setupEvent(state, eventId) {
  const run = state.run;
  const p = run.player;
  const gold = state.idle.gold;

  if (eventId === 'ancient_writing') {
    run.eventData = {
      id: eventId,
      title: 'Ancient Writing',
      text: 'You discover ancient writings etched into stone.',
      choices: [
        { id: 'elegance', text: 'Elegance (Remove a card)', enabled: true },
        { id: 'simplicity', text: 'Simplicity (Upgrade all Strikes/Defends)', enabled: true }
      ]
    };
  } else if (eventId === 'augmenter') {
    run.eventData = {
      id: eventId,
      title: 'Augmenter',
      text: 'A mysterious figure offers experimental modifications.',
      choices: [
        { id: 'jax', text: 'Test J.A.X. (Gain J.A.X., Lose 3 Max HP)', enabled: p.maxHp > 3 },
        { id: 'mutagen', text: 'Become Test Subject (Gain Mutagenic Strength, Lose 3 Max HP)', enabled: p.maxHp > 3 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'council_of_ghosts') {
    run.eventData = {
      id: eventId,
      title: 'Council of Ghosts',
      text: 'Ghostly council offers immortality.',
      choices: [
        { id: 'accept', text: 'Accept (Lose 50% Max HP, Gain 5 Apparitions)', enabled: true },
        { id: 'refuse', text: 'Refuse', enabled: true }
      ]
    };
  } else if (eventId === 'cursed_tome') {
    run.eventData = {
      id: eventId,
      title: 'Cursed Tome',
      text: 'A large tome radiates dark power. Do you read it?',
      choices: [
        { id: 'read', text: 'Read (Lose 10 HP, Gain Necronomicon)', enabled: p.hp > 10 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'forgotten_altar') {
    run.eventData = {
      id: eventId,
      title: 'Forgotten Altar',
      text: 'A dark altar dedicated to an unknown deity.',
      choices: [
        { id: 'sacrifice', text: 'Sacrifice (Lose 10 HP, Gain 5 Max HP)', enabled: p.hp > 10 },
        { id: 'desecrate', text: 'Desecrate (Gain 100 Gold, Gain Decay)', enabled: true },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'library') {
    run.eventData = {
      id: eventId,
      title: 'The Library',
      text: 'A vast collection of books.',
      choices: [
        { id: 'read', text: 'Read (Choose 1 of 20 cards)', enabled: true },
        { id: 'sleep', text: 'Sleep (Heal 33% Max HP)', enabled: true }
      ]
    };
  } else if (eventId === 'masked_bandits') {
    run.eventData = {
      id: eventId,
      title: 'Masked Bandits',
      text: 'Bandits demand your gold!',
      choices: [
        { id: 'pay', text: 'Pay (Lose all Gold)', enabled: gold > 0 },
        { id: 'fight', text: 'Fight (Combat against Bandits)', enabled: true }
      ]
    };
  } else if (eventId === 'vampires') {
    run.eventData = {
      id: eventId,
      title: 'Vampires(?)',
      text: 'A group of vampires offer a trade.',
      choices: [
        { id: 'accept', text: 'Accept (Replace Strikes with Bites, Lose 30% Max HP)', enabled: true },
        { id: 'refuse', text: 'Refuse', enabled: true }
      ]
    };
  } else if (eventId === 'lab') {
    run.eventData = {
      id: eventId,
      title: 'The Lab',
      text: 'You discover a laboratory.',
      choices: [
        { id: 'search', text: 'Search (Gain 3 random potions)', enabled: true }
      ]
    };
  } else if (eventId === 'match_and_keep') {
    run.eventData = {
      id: eventId,
      title: 'Match and Keep',
      text: 'A strange jester offers a game.',
      choices: [
        { id: 'play', text: 'Play (Gain 2 random cards)', enabled: true }
      ]
    };
  } else if (eventId === 'wheel_of_change') {
    run.eventData = {
      id: eventId,
      title: 'Wheel of Change',
      text: 'A giant wheel stands before you.',
      choices: [
        { id: 'spin', text: 'Spin (Random outcome)', enabled: true }
      ]
    };
  } else if (eventId === 'big_fish') {
    run.eventData = {
      id: eventId,
      title: 'Big Fish',
      text: 'You find a strange fruit hanging from a ceiling.',
      choices: [
        { id: 'heal', text: 'Heal (Recover 1/3 Max HP)', enabled: true },
        { id: 'max_hp', text: 'Max HP (+10 Max HP)', enabled: true },
        { id: 'relic', text: 'Regret (Gain a Relic, Lose 10% Max HP)', enabled: true }
      ]
    };
  } else if (eventId === 'cleric') {
    run.eventData = {
      id: eventId,
      title: 'The Cleric',
      text: 'A strange cleric offers "purification" services.',
      choices: [
        { id: 'heal', text: 'Heal (Pay 50 Gold, Heal 35%)', enabled: gold >= 50 },
        { id: 'purify', text: 'Purify (Pay 75 Gold, Remove a Card)', enabled: gold >= 75 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'face_trader') {
    run.eventData = {
      id: eventId,
      title: 'Face Trader',
      text: 'A masked figure offers a trade of identity.',
      choices: [
        { id: 'trade', text: 'Trade (Lose HP, Gain random Face relic)', enabled: p.hp > 10 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'dead_adventurer') {
    run.eventData = {
      id: eventId,
      title: 'Dead Adventurer',
      text: 'A corpse of a fallen adventurer lies here. It looks like it might still have something valuable.',
      choices: [
        { id: 'search', text: 'Search (High chance of Elite fight, but high reward)', enabled: true },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'golden_idol') {
    run.eventData = {
      id: eventId,
      title: 'Golden Idol',
      text: 'You find a magnificent Golden Idol on a pedestal. It looks trapped.',
      choices: [
        { id: 'take', text: 'Take (Gain 125 Gold, Gain a Curse)', enabled: true },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'mushrooms') {
    run.eventData = {
      id: eventId,
      title: 'Mushrooms',
      text: 'Strange, colorful mushrooms emit weird spores.',
      choices: [
        { id: 'eat', text: 'Eat (Heal 15% or start Combat)', enabled: true },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'living_wall') {
    run.eventData = {
      id: eventId,
      title: 'Living Wall',
      text: 'A wall made of living stone offers you a choice.',
      choices: [
        { id: 'forget', text: 'Forget (Remove a Card)', enabled: true },
        { id: 'change', text: 'Change (Transform a Card)', enabled: true },
        { id: 'grow', text: 'Grow (Upgrade a Card)', enabled: true }
      ]
    };
  } else if (eventId === 'scrap_ooze') {
    run.eventData = {
      id: eventId,
      title: 'Scrap Ooze',
      text: 'A pile of scrap metal and slime. Something shiny is inside.',
      choices: [
        { id: 'reach', text: 'Reach Inside (Lose HP, chance for Relic)', enabled: p.hp > 5 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'shining_light') {
    run.eventData = {
      id: eventId,
      title: 'Shining Light',
      text: 'A radiant light shines upon you, but it feels burning.',
      choices: [
        { id: 'enter', text: 'Enter (Upgrade 2 random cards, Lose 15% Max HP)', enabled: p.hp > p.maxHp * 0.15 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'sssserpent') {
    run.eventData = {
      id: eventId,
      title: 'The Ssssserpent',
      text: '"Ssss... want gold? Take it... but pay the price..."',
      choices: [
        { id: 'agree', text: 'Agree (Gain 175 Gold, Gain Doubt)', enabled: true },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'world_of_goop') {
    run.eventData = {
      id: eventId,
      title: 'World of Goop',
      text: 'You fall into a pool of sticky goop. You find some gold, but it\'s hard to get out.',
      choices: [
        { id: 'gather', text: 'Gather (Gain Gold, Lose HP)', enabled: true },
        { id: 'leave', text: 'Leave (Lose small amount of Gold)', enabled: gold > 0 }
      ]
    };
  } else if (eventId === 'wing_statue') {
    run.eventData = {
      id: eventId,
      title: 'Wing Statue',
      text: 'A broken statue of a winged being. Gems are embedded in it.',
      choices: [
        { id: 'smash', text: 'Smash (Gain Gold, start Combat)', enabled: true },
        { id: 'pray', text: 'Pray (Remove a card, lose HP)', enabled: p.hp > 10 },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else if (eventId === 'upgrade_shrine') {
    run.eventData = {
      id: eventId,
      title: 'Upgrade Shrine',
      text: 'A holy shrine dedicated to improvement.',
      choices: [
        { id: 'upgrade', text: 'Upgrade (Upgrade a card)', enabled: true }
      ]
    };
  } else if (eventId === 'purifier') {
    run.eventData = {
      id: eventId,
      title: 'Purifier',
      text: 'A shrine that can cleanse your deck.',
      choices: [
        { id: 'remove', text: 'Remove (Remove a card)', enabled: true }
      ]
    };
  } else if (eventId === 'transmogrifier') {
    run.eventData = {
      id: eventId,
      title: 'Transmogrifier',
      text: 'A strange device that swaps cards.',
      choices: [
        { id: 'transform', text: 'Transform (Transform a card)', enabled: true }
      ]
    };
  } else if (eventId === 'golden_shrine') {
    run.eventData = {
      id: eventId,
      title: 'Golden Shrine',
      text: 'A golden statue stands before you.',
      choices: [
        { id: 'pray', text: 'Pray (Gain 100 Gold)', enabled: true },
        { id: 'desecrate', text: 'Desecrate (Gain 275 Gold, Gain Regret)', enabled: true },
        { id: 'leave', text: 'Leave', enabled: true }
      ]
    };
  } else {
    // Fallback
    run.eventData = {
      id: 'placeholder',
      title: 'Mysterious Encounter',
      text: 'Something mysterious happens, but you find nothing.',
      choices: [{ id: 'leave', text: 'Leave', enabled: true }]
    };
  }
}

export function handleEventChoice(state, render, choiceId) {
  const run = state.run;
  if (!run || run.phase !== 'event' || !run.eventData) return;

  const eventId = run.eventData.id;
  const p = run.player;
  addLog(state, 'Event: ' + run.eventData.title + ' -> ' + choiceId);

  let nextPhase = 'reward';
  run.rewardType = 'rest';

  if (eventId === 'ancient_writing') {
    if (choiceId === 'elegance') removeRandomCardFromDeck(state);
    else if (choiceId === 'simplicity') {
      const refs = collectDeckRefs(run, (id) => {
        const name = CARDS[id].name.toLowerCase();
        return (name.includes('strike') || name.includes('defend')) && !!CARD_UPGRADES[id];
      });
      refs.forEach(r => { r.pile[r.index] = CARD_UPGRADES[r.cardId]; });
    }
  } else if (eventId === 'augmenter') {
    if (choiceId === 'jax') {
      p.maxHp -= 3; p.hp = Math.min(p.hp, p.maxHp);
      p.discardPile.push('jax'); // Simplified card gain
    } else if (choiceId === 'mutagen') {
      p.maxHp -= 3; p.hp = Math.min(p.hp, p.maxHp);
      gainRelic(state, null, 'mutagenic_strength', { silent: true });
    } else nextPhase = 'map';
  } else if (eventId === 'council_of_ghosts') {
    if (choiceId === 'accept') {
      p.maxHp = Math.floor(p.maxHp * 0.5); p.hp = Math.min(p.hp, p.maxHp);
      for (let i = 0; i < 5; i++) p.discardPile.push('apparition');
    } else nextPhase = 'map';
  } else if (eventId === 'cursed_tome') {
    if (choiceId === 'read') {
      p.hp -= 10;
      gainRelic(state, null, 'necronomicon', { silent: true });
    } else nextPhase = 'map';
  } else if (eventId === 'forgotten_altar') {
    if (choiceId === 'sacrifice') {
      p.hp -= 10; p.maxHp += 5; p.hp += 5;
    } else if (choiceId === 'desecrate') {
      state.idle.gold += 100;
      p.discardPile.push('decay');
    } else nextPhase = 'map';
  } else if (eventId === 'library') {
    if (choiceId === 'read') {
      run.cardOffer = pickCardReward(state); // Simplified selection
      run.phase = 'card_reward';
      saveState(state); render();
      return;
    } else if (choiceId === 'sleep') {
      p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.33));
    }
  } else if (eventId === 'masked_bandits') {
    if (choiceId === 'pay') state.idle.gold = 0;
    else {
      run.currentNodeType = 'elite';
      enterCombat(state, render);
      saveState(state); render();
      return;
    }
  } else if (eventId === 'vampires') {
    if (choiceId === 'accept') {
      p.maxHp = Math.floor(p.maxHp * 0.7); p.hp = Math.min(p.hp, p.maxHp);
      // Replace strikes with bites (simplified logic)
      const refs = collectDeckRefs(run, (id) => CARDS[id].name.toLowerCase().includes('strike'));
      refs.forEach(r => { r.pile[r.index] = 'bite'; });
    } else nextPhase = 'map';
  } else if (eventId === 'lab') {
    for (let i = 0; i < 3; i++) {
      const pid = Object.keys(POTIONS)[Math.floor(Math.random() * Object.keys(POTIONS).length)];
      if (run.potions.length < run.potionSlots) run.potions.push(pid);
    }
  } else if (eventId === 'match_and_keep') {
    p.discardPile.push(randomShopCardId());
    p.discardPile.push(randomShopCardId());
  } else if (eventId === 'wheel_of_change') {
    const roll = Math.random();
    if (roll < 0.2) state.idle.gold += 100;
    else if (roll < 0.4) gainRelic(state, null, generateRelicOffer(state, { count: 1 })[0], { silent: true });
    else if (roll < 0.6) p.hp = Math.min(p.maxHp, p.hp + 20);
    else if (roll < 0.8) p.hp = Math.max(1, p.hp - 10);
    else p.discardPile.push('curse');
  } else if (eventId === 'big_fish') {
    if (choiceId === 'heal') {
      const heal = Math.floor(p.maxHp / 3);
      p.hp = Math.min(p.maxHp, p.hp + heal);
    } else if (choiceId === 'max_hp') {
      p.maxHp += 10;
      p.hp += 10;
    } else if (choiceId === 'relic') {
      const loss = Math.floor(p.maxHp * 0.1);
      p.maxHp = Math.max(1, p.maxHp - loss);
      p.hp = Math.min(p.hp, p.maxHp);
      const relic = generateRelicOffer(state, { source: 'reward', count: 1 })[0];
      if (relic) gainRelic(state, null, relic, { silent: true });
    }
  } else if (eventId === 'cleric') {
    if (choiceId === 'heal') {
      state.idle.gold -= 50;
      p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.35));
    } else if (choiceId === 'purify') {
      state.idle.gold -= 75;
      removeRandomCardFromDeck(state);
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'face_trader') {
    if (choiceId === 'trade') {
      p.hp -= 10;
      // Simplified: gain random relic
      const relic = generateRelicOffer(state, { source: 'reward', count: 1 })[0];
      if (relic) gainRelic(state, null, relic, { silent: true });
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'dead_adventurer') {
    if (choiceId === 'search') {
      if (Math.random() < 0.6) {
        run.currentNodeType = 'elite';
        enterCombat(state, render);
        saveState(state); render();
        return;
      } else {
        const relic = generateRelicOffer(state, { source: 'reward', count: 1 })[0];
        if (relic) gainRelic(state, null, relic, { silent: true });
      }
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'golden_idol') {
    if (choiceId === 'take') {
      state.idle.gold += 125;
      addCurseToDeck(state);
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'mushrooms') {
    if (choiceId === 'eat') {
      if (Math.random() < 0.5) {
        run.currentNodeType = 'monster';
        enterCombat(state, render);
        saveState(state); render();
        return;
      } else {
        p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.15));
      }
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'living_wall') {
    if (choiceId === 'forget') removeRandomCardFromDeck(state);
    else if (choiceId === 'change') transformRandomCardInDeck(state);
    else if (choiceId === 'grow') upgradeRandomCardInDeck(state);
  } else if (eventId === 'scrap_ooze') {
    if (choiceId === 'reach') {
      p.hp -= 5;
      if (Math.random() < 0.6) {
        const relic = generateRelicOffer(state, { source: 'reward', count: 1 })[0];
        if (relic) gainRelic(state, null, relic, { silent: true });
      } else {
        // Can retry or leave. For simplicity, we finish here.
        addLog(state, 'You found nothing this time.');
      }
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'shining_light') {
    if (choiceId === 'enter') {
      const loss = Math.floor(p.maxHp * 0.15);
      p.hp = Math.max(1, p.hp - loss);
      upgradeRandomCardInDeck(state);
      upgradeRandomCardInDeck(state);
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'sssserpent') {
    if (choiceId === 'agree') {
      state.idle.gold += 175;
      p.discardPile.push('doubt'); // Simplified
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'world_of_goop') {
    if (choiceId === 'gather') {
      state.idle.gold += 75;
      p.hp -= 11;
    } else {
      state.idle.gold = Math.max(0, state.idle.gold - 20);
      nextPhase = 'map';
    }
  } else if (eventId === 'wing_statue') {
    if (choiceId === 'smash') {
      state.idle.gold += 75;
      run.currentNodeType = 'monster';
      enterCombat(state, render);
      saveState(state); render();
      return;
    } else if (choiceId === 'pray') {
      p.hp -= 7;
      removeRandomCardFromDeck(state);
    } else {
      nextPhase = 'map';
    }
  } else if (eventId === 'upgrade_shrine') {
    upgradeRandomCardInDeck(state);
  } else if (eventId === 'purifier') {
    removeRandomCardFromDeck(state);
  } else if (eventId === 'transmogrifier') {
    transformRandomCardInDeck(state);
  } else if (eventId === 'golden_shrine') {
    if (choiceId === 'pray') state.idle.gold += 100;
    else if (choiceId === 'desecrate') {
      state.idle.gold += 275;
      p.discardPile.push('curse');
    } else {
      nextPhase = 'map';
    }
  } else {
    nextPhase = 'map';
  }

  run.phase = nextPhase;
  run.eventData = null;
  saveState(state); render();
}

function resolveAct1Event(state, render) {
  // This is now legacy, call it directly if needed but resolveQuestionRoom handles it.
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
