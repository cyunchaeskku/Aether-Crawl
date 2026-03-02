// game.js — Aether Crawl (single-file, no ES modules)

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════

const CARDS = {
  strike:      { id:'strike',      name:'Strike',          cost:1, rarity:'starter',  type:'attack',  description:'Deal 6 damage.',                     effect:{damage:6} },
  defend:      { id:'defend',      name:'Defend',          cost:1, rarity:'starter',  type:'defense', description:'Gain 5 block.',                       effect:{block:5} },
  heavy_strike:{ id:'heavy_strike',name:'Heavy Strike',    cost:2, rarity:'common',   type:'attack',  description:'Deal 14 damage.',                    effect:{damage:14} },
  quick_slash: { id:'quick_slash', name:'Quick Slash',     cost:1, rarity:'common',   type:'attack',  description:'Deal 4 damage twice.',               effect:{damage:4, hits:2} },
  iron_shield: { id:'iron_shield', name:'Iron Shield',     cost:2, rarity:'common',   type:'defense', description:'Gain 12 block.',                     effect:{block:12} },
  parry:       { id:'parry',       name:'Parry',           cost:1, rarity:'common',   type:'defense', description:'Gain 3 block. Draw 1 card.',          effect:{block:3, draw:1} },
  fireball:    { id:'fireball',    name:'Fireball',        cost:2, rarity:'uncommon', type:'magic',   description:'Deal 20 damage.',                    effect:{damage:20} },
  counter:     { id:'counter',     name:'Counter',         cost:2, rarity:'uncommon', type:'skill',   description:'Gain 6 block. Deal 6 damage.',        effect:{block:6, damage:6} },
  hex:         { id:'hex',         name:'Hex',             cost:1, rarity:'uncommon', type:'magic',   description:'Apply 2 Weak to enemy.',             effect:{weak:2} },
  leeching_strike:{ id:'leeching_strike',name:'Leeching Strike',cost:2,rarity:'uncommon',type:'attack',description:'Deal 10 damage. Heal 4 HP.',       effect:{damage:10, heal:4} },
  empower:     { id:'empower',     name:'Empower',         cost:1, rarity:'uncommon', type:'skill',   description:'Gain 2 Strength.',                   effect:{strength:2} },
  expose:      { id:'expose',      name:'Expose',          cost:1, rarity:'uncommon', type:'attack',  description:'Deal 5 damage. Apply 2 Vulnerable.',  effect:{damage:5, vulnerable:2} },
  berserker:   { id:'berserker',   name:'Berserker',       cost:2, rarity:'rare',     type:'attack',  description:'Deal 8 damage. Gain 1 energy.',       effect:{damage:8, energy:1} },
  arcane_surge:{ id:'arcane_surge',name:'Arcane Surge',    cost:3, rarity:'rare',     type:'magic',   description:'Deal 35 damage.',                    effect:{damage:35} },
  bulwark:     { id:'bulwark',     name:'Bulwark',         cost:2, rarity:'rare',     type:'defense', description:'Gain 20 block. Draw 1 card.',         effect:{block:20, draw:1} },
  soul_drain:  { id:'soul_drain',  name:'Soul Drain',      cost:2, rarity:'rare',     type:'magic',   description:'Deal 15 damage. Heal 8 HP.',          effect:{damage:15, heal:8} },
  whirlwind:   { id:'whirlwind',   name:'Whirlwind',       cost:0, rarity:'rare',     type:'attack',  description:'Deal 5 damage per remaining energy (spends all).', special:'whirlwind', effect:{} },
  // Upgraded variants (via floor reward upgrade choice)
  strike_plus:       { id:'strike_plus',       name:'Strike+',          cost:1, rarity:'starter',  type:'attack',  upgraded:true, description:'Deal 9 damage.',                             effect:{damage:9} },
  defend_plus:       { id:'defend_plus',       name:'Defend+',          cost:1, rarity:'starter',  type:'defense', upgraded:true, description:'Gain 8 block.',                              effect:{block:8} },
  heavy_strike_plus: { id:'heavy_strike_plus', name:'Heavy Strike+',    cost:2, rarity:'common',   type:'attack',  upgraded:true, description:'Deal 20 damage.',                            effect:{damage:20} },
  quick_slash_plus:  { id:'quick_slash_plus',  name:'Quick Slash+',     cost:1, rarity:'common',   type:'attack',  upgraded:true, description:'Deal 6 damage twice.',                       effect:{damage:6, hits:2} },
  iron_shield_plus:  { id:'iron_shield_plus',  name:'Iron Shield+',     cost:2, rarity:'common',   type:'defense', upgraded:true, description:'Gain 16 block.',                             effect:{block:16} },
  parry_plus:        { id:'parry_plus',        name:'Parry+',           cost:1, rarity:'common',   type:'defense', upgraded:true, description:'Gain 5 block. Draw 2 cards.',                effect:{block:5, draw:2} },
  fireball_plus:     { id:'fireball_plus',     name:'Fireball+',        cost:2, rarity:'uncommon', type:'magic',   upgraded:true, description:'Deal 28 damage.',                            effect:{damage:28} },
  counter_plus:      { id:'counter_plus',      name:'Counter+',         cost:2, rarity:'uncommon', type:'skill',   upgraded:true, description:'Gain 9 block. Deal 9 damage.',               effect:{block:9, damage:9} },
  hex_plus:          { id:'hex_plus',          name:'Hex+',             cost:1, rarity:'uncommon', type:'magic',   upgraded:true, description:'Apply 3 Weak to enemy.',                     effect:{weak:3} },
  leeching_strike_plus:{ id:'leeching_strike_plus',name:'Leeching Strike+',cost:2,rarity:'uncommon',type:'attack',upgraded:true,description:'Deal 14 damage. Heal 6 HP.',                effect:{damage:14, heal:6} },
  empower_plus:      { id:'empower_plus',      name:'Empower+',         cost:1, rarity:'uncommon', type:'skill',   upgraded:true, description:'Gain 3 Strength.',                           effect:{strength:3} },
  expose_plus:       { id:'expose_plus',       name:'Expose+',          cost:1, rarity:'uncommon', type:'attack',  upgraded:true, description:'Deal 8 damage. Apply 3 Vulnerable.',          effect:{damage:8, vulnerable:3} },
  berserker_plus:    { id:'berserker_plus',    name:'Berserker+',       cost:2, rarity:'rare',     type:'attack',  upgraded:true, description:'Deal 12 damage. Gain 1 energy.',              effect:{damage:12, energy:1} },
  arcane_surge_plus: { id:'arcane_surge_plus', name:'Arcane Surge+',    cost:3, rarity:'rare',     type:'magic',   upgraded:true, description:'Deal 50 damage.',                            effect:{damage:50} },
  bulwark_plus:      { id:'bulwark_plus',      name:'Bulwark+',         cost:2, rarity:'rare',     type:'defense', upgraded:true, description:'Gain 26 block. Draw 2 cards.',               effect:{block:26, draw:2} },
  soul_drain_plus:   { id:'soul_drain_plus',   name:'Soul Drain+',      cost:2, rarity:'rare',     type:'magic',   upgraded:true, description:'Deal 20 damage. Heal 12 HP.',                effect:{damage:20, heal:12} },
  whirlwind_plus:    { id:'whirlwind_plus',    name:'Whirlwind+',       cost:0, rarity:'rare',     type:'attack',  upgraded:true, description:'Deal 8 damage per remaining energy (spends all).', special:'whirlwind_plus', effect:{} },
};

const CARD_UPGRADES = {
  strike:'strike_plus', defend:'defend_plus', heavy_strike:'heavy_strike_plus',
  quick_slash:'quick_slash_plus', iron_shield:'iron_shield_plus', parry:'parry_plus',
  fireball:'fireball_plus', counter:'counter_plus', hex:'hex_plus',
  leeching_strike:'leeching_strike_plus', empower:'empower_plus', expose:'expose_plus',
  berserker:'berserker_plus', arcane_surge:'arcane_surge_plus', bulwark:'bulwark_plus',
  soul_drain:'soul_drain_plus', whirlwind:'whirlwind_plus',
};

const RELICS = {
  burning_blood:    { id:'burning_blood',    name:'Burning Blood',      rarity:'common',   icon:'🩸', description:'End of combat: heal 6 HP.' },
  akabeko:          { id:'akabeko',          name:'Akabeko',            rarity:'common',   icon:'🐂', description:'Your first Attack each combat deals +8 damage.' },
  bag_of_marbles:   { id:'bag_of_marbles',   name:'Bag of Marbles',     rarity:'common',   icon:'🔮', description:'Combat start: apply 1 Vulnerable to the enemy.' },
  vajra:            { id:'vajra',            name:'Vajra',              rarity:'common',   icon:'⚡', description:'Combat start: gain 1 Strength.' },
  shuriken:         { id:'shuriken',         name:'Shuriken',           rarity:'uncommon', icon:'🌟', description:'Every 3rd Attack you play in a turn, gain 1 Strength.' },
  kunai:            { id:'kunai',            name:'Kunai',              rarity:'uncommon', icon:'🗡️', description:'Every 3rd Attack you play in a turn, gain 1 Energy.' },
  meat_on_the_bone: { id:'meat_on_the_bone', name:'Meat on the Bone',   rarity:'uncommon', icon:'🍖', description:'End of combat: if HP ≤ 50%, heal 12 HP.' },
  ice_cream:        { id:'ice_cream',        name:'Ice Cream',          rarity:'rare',     icon:'🍦', description:'Unspent Energy carries over to your next turn.' },
  fossilized_helix: { id:'fossilized_helix', name:'Fossilized Helix',   rarity:'rare',     icon:'🐚', description:'Negate the first hit you take each combat.' },
  unceasing_top:    { id:'unceasing_top',    name:'Unceasing Top',      rarity:'rare',     icon:'🌀', description:'Whenever your hand is empty during your turn, draw 1 card.' },
};

const RELIC_OFFER_FLOORS = [2, 4]; // floors after which 3 relics are offered
const RELIC_OFFER_COUNT = 3;

function hasRelic(id) {
  return state.meta.relics && state.meta.relics.includes(id);
}

function generateRelicOffer() {
  const owned = new Set(state.meta.relics);
  const pool = Object.keys(RELICS).filter(id => !owned.has(id));
  return shuffle([...pool]).slice(0, RELIC_OFFER_COUNT);
}

const STARTER_DECK = ['strike','strike','strike','strike','strike','defend','defend','defend','defend'];

const SHOP_POOL = [
  {id:'heavy_strike',rarity:'common'},{id:'quick_slash',rarity:'common'},
  {id:'iron_shield',rarity:'common'},{id:'parry',rarity:'common'},
  {id:'fireball',rarity:'uncommon'},{id:'counter',rarity:'uncommon'},
  {id:'hex',rarity:'uncommon'},{id:'leeching_strike',rarity:'uncommon'},
  {id:'empower',rarity:'uncommon'},{id:'expose',rarity:'uncommon'},
  {id:'berserker',rarity:'rare'},{id:'arcane_surge',rarity:'rare'},
  {id:'bulwark',rarity:'rare'},{id:'soul_drain',rarity:'rare'},{id:'whirlwind',rarity:'rare'},
];

const CARD_COST = {starter:0, common:30, uncommon:60, rare:120};
const SHOP_SLOTS = 4;
const SHOP_REFRESH_COST = 20;

const ENEMIES = {
  rat:          {id:'rat',          name:'Sewer Rat',      maxHp:12,  floor:1, pattern:[{type:'attack',value:3,label:'Gnaw'}]},
  goblin:       {id:'goblin',       name:'Goblin Scout',   maxHp:22,  floor:1, pattern:[{type:'attack',value:5,label:'Stab'},{type:'attack',value:5,label:'Stab'},{type:'block',value:6,label:'Dodge'}]},
  bandit:       {id:'bandit',       name:'Bandit',         maxHp:32,  floor:2, pattern:[{type:'attack',value:7,label:'Slash'},{type:'attack',value:7,label:'Slash'},{type:'attack',value:13,label:'Power Strike'}]},
  skeleton:     {id:'skeleton',     name:'Skeleton',       maxHp:28,  floor:2, pattern:[{type:'block',value:8,label:'Raise Shield'},{type:'attack',value:8,label:'Bone Strike'},{type:'attack',value:8,label:'Bone Strike'}]},
  orc:          {id:'orc',          name:'Orc Warrior',    maxHp:48,  floor:3, pattern:[{type:'attack',value:9,label:'Cleave'},{type:'attack',value:9,label:'Cleave'},{type:'attack',value:16,label:'Crushing Blow'},{type:'block',value:10,label:'Brace'}]},
  mushroom:     {id:'mushroom',     name:'Spore Mushroom', maxHp:38,  floor:3, pattern:[{type:'attack',value:7,label:'Spore Burst'},{type:'buff',buffType:'regen',value:4,label:'Regenerate'},{type:'attack',value:7,label:'Spore Burst'}]},
  dark_knight:  {id:'dark_knight',  name:'Dark Knight',    maxHp:62,  floor:4, pattern:[{type:'block',value:12,label:'Iron Guard'},{type:'attack',value:11,label:'Dark Slash'},{type:'attack',value:11,label:'Dark Slash'},{type:'attack',value:18,label:'Void Strike'}]},
  necromancer:  {id:'necromancer',  name:'Necromancer',    maxHp:52,  floor:4, pattern:[{type:'attack',value:9,label:'Death Touch'},{type:'buff',buffType:'strength',value:2,label:'Dark Ritual'},{type:'attack',value:9,label:'Death Touch'},{type:'attack',value:14,label:'Soul Rend'}]},
  goblin_king:  {id:'goblin_king',  name:'Goblin King',    maxHp:120, floor:5, isBoss:true, pattern:[{type:'attack',value:12,label:'Royal Slash'},{type:'attack',value:12,label:'Royal Slash'},{type:'attack',value:22,label:'Throne Smash'},{type:'buff',buffType:'strength',value:3,label:'War Cry'}]},
  lich:         {id:'lich',         name:'Ancient Lich',   maxHp:100, floor:5, isBoss:true, pattern:[{type:'attack',value:10,label:'Bone Shard'},{type:'buff',buffType:'regen',value:5,label:'Undying'},{type:'attack',value:18,label:'Death Ray'},{type:'buff',buffType:'strength',value:2,label:'Power Surge'},{type:'attack',value:10,label:'Bone Shard'}]},
};

const FLOOR_ENEMIES = {1:['rat','goblin'],2:['bandit','skeleton'],3:['orc','mushroom'],4:['dark_knight','necromancer'],5:['goblin_king','lich']};
const TOTAL_FLOORS = 5;

const BUILDINGS = [
  {id:'gold_mine',    name:'Gold Mine',      description:'Generates gold over time.',    resource:'gold',    baseRate:1,    baseCost:50,  costMultiplier:3, maxLevel:5},
  {id:'mana_well',    name:'Mana Well',      description:'Generates mana over time.',    resource:'mana',    baseRate:0.5,  baseCost:100, costMultiplier:3, maxLevel:5},
  {id:'essence_shrine',name:'Essence Shrine',description:'Slowly generates essence.',   resource:'essence', baseRate:0.05, baseCost:500, costMultiplier:5, maxLevel:3},
];

const META_UPGRADES = [
  {id:'max_hp',        name:'Vitality',       description:'+10 max HP per level.',              baseCost:5,  costMultiplier:2, maxLevel:5},
  {id:'start_gold',    name:'Treasure Hunter',description:'Start each run with +50 gold.',      baseCost:3,  costMultiplier:2, maxLevel:5},
  {id:'extra_energy',  name:'Focus',          description:'+1 energy per turn (max +2).',       baseCost:10, costMultiplier:3, maxLevel:2},
  {id:'better_rewards',name:'Bounty Hunter',  description:'+20% gold from combat per level.',   baseCost:4,  costMultiplier:2, maxLevel:3},
];

const COMBAT_GOLD_BASE = 15;
const RUN_ESSENCE_BASE = 10;
const RUN_ESSENCE_PER_FLOOR = 5;
const MANA_SURGE_COST = 20;
const SAVE_KEY = 'aether_crawl_save';

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

function pickShopCards() {
  return shuffle([...SHOP_POOL]).slice(0, SHOP_SLOTS).map(c => c.id);
}

function createDefaultState() {
  const upgrades = {};
  META_UPGRADES.forEach(u => { upgrades[u.id] = 0; });
  return {
    idle: { gold:0, mana:0, essence:0, goldRate:0, manaRate:0, essenceRate:0 },
    buildings: BUILDINGS.map(b => ({id:b.id, level:0})),
    meta: { upgrades, startingDeck:[...STARTER_DECK], permanentDeck:[], relics:[], totalRuns:0, bestFloor:0, bestGold:0 },
    shop: { available: pickShopCards(), refreshCost: SHOP_REFRESH_COST },
    run: null,
  };
}

function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) { console.warn('Save failed:', e); }
}

function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])
        && target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return deepMerge(createDefaultState(), saved);
  } catch(e) { return null; }
}

// ═══════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════

function shuffle(arr) {
  for (let i = arr.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function addLog(msg) {
  if (!state.run) return;
  state.run.log.push(msg);
  if (state.run.log.length > 30) state.run.log.shift();
}

// ── Idle ──────────────────────────────────────────────────────────

function recomputeRates() {
  let gold=0, mana=0, essence=0;
  state.buildings.forEach((b,i) => {
    if (b.level===0) return;
    const def = BUILDINGS[i];
    const rate = def.baseRate * b.level;
    if (def.resource==='gold')    gold    += rate;
    if (def.resource==='mana')    mana    += rate;
    if (def.resource==='essence') essence += rate;
  });
  state.idle.goldRate=gold; state.idle.manaRate=mana; state.idle.essenceRate=essence;
}

function idleTick(dt) {
  state.idle.gold    += state.idle.goldRate    * dt;
  state.idle.mana    += state.idle.manaRate    * dt;
  state.idle.essence += state.idle.essenceRate * dt;
}

// ── Buildings ─────────────────────────────────────────────────────

function buildingUpgradeCost(i) {
  const def = BUILDINGS[i];
  const lv = state.buildings[i].level;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, lv));
}

function upgradeBuilding(i) {
  const def = BUILDINGS[i];
  const b = state.buildings[i];
  if (b.level >= def.maxLevel) return;
  const cost = buildingUpgradeCost(i);
  if (state.idle.gold < cost) return;
  state.idle.gold -= cost;
  b.level++;
  recomputeRates();
  saveState(); render();
}

// ── Shop ──────────────────────────────────────────────────────────

function buyCard(cardId) {
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
      ? next[Math.floor(Math.random()*next.length)].id
      : (SHOP_POOL.find(c=>c.id!==cardId)||SHOP_POOL[0]).id;
  }
  saveState(); render();
}

function refreshShop() {
  if (state.idle.gold < state.shop.refreshCost) return;
  state.idle.gold -= state.shop.refreshCost;
  state.shop.available = pickShopCards();
  // Escalate refresh cost (capped at 100)
  state.shop.refreshCost = Math.min(100, Math.floor(state.shop.refreshCost * 1.5));
  saveState(); render();
}

// ── Meta upgrades ─────────────────────────────────────────────────

function metaUpgradeCost(id) {
  const def = META_UPGRADES.find(u => u.id===id);
  const lv = state.meta.upgrades[id];
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, lv));
}

function buyMetaUpgrade(id) {
  const def = META_UPGRADES.find(u => u.id===id);
  const lv = state.meta.upgrades[id];
  if (lv >= def.maxLevel) return;
  const cost = metaUpgradeCost(id);
  if (state.idle.essence < cost) return;
  state.idle.essence -= cost;
  state.meta.upgrades[id]++;
  saveState(); render();
}

// ── Dungeon ───────────────────────────────────────────────────────

function playerMaxHp()     { return 50 + state.meta.upgrades.max_hp * 10; }
function playerMaxEnergy() { return 3  + state.meta.upgrades.extra_energy; }

function startRun() {
  if (state.run) return;
  try {
    const maxHp = playerMaxHp();
    const maxEnergy = playerMaxEnergy();
    const sDeck = Array.isArray(state.meta.startingDeck) ? state.meta.startingDeck : STARTER_DECK;
    const pDeck = Array.isArray(state.meta.permanentDeck) ? state.meta.permanentDeck : [];
    const deck = [...sDeck, ...pDeck];
    
    const startGoldBonus = (state.meta.upgrades.start_gold || 0) * 50;
    if (startGoldBonus > 0) state.idle.gold += startGoldBonus;

    state.run = {
      floor: 1,
      phase: 'combat',
      player: {
        hp: maxHp, maxHp: maxHp,
        armor: 0,
        energy: maxEnergy, maxEnergy: maxEnergy,
        strength: 0,
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
      relicState: {},
      log: [],
    };
    enterCombat();
    saveState(); render();
  } catch (e) {
    console.error('Failed to start run:', e);
    alert('Failed to start dungeon run.');
  }
}

function enterCombat() {
  const run = state.run;
  if (!run) return;
  
  run.phase = 'combat';
  if (run.player.strength > 0) addLog('Your Strength fades as you enter a new battle.');
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
        status: {weak:0, regen:0, strength:0, vulnerable:0},
      });
    }
  }

  run.log = [];
  run.relicState = { 
    akabeko_fired: false, 
    kunai_counter: 0, 
    shuriken_counter: 0, 
    helix_active: hasRelic('fossilized_helix') 
  };
  
  if (hasRelic('bag_of_marbles')) {
    run.enemies.forEach(e => { if(e.status) e.status.vulnerable += 1; });
    addLog('Bag of Marbles: enemies are Vulnerable!');
  }
  if (hasRelic('vajra')) { run.player.strength += 1; addLog('Vajra: gain 1 Strength.'); }
  
  startPlayerTurn();
}

function startPlayerTurn() {
  const run = state.run;
  const {player, enemies} = run;
  player.armor = 0;
  if (hasRelic('ice_cream')) {
    player.energy = Math.min(player.maxEnergy * 2, player.energy + player.maxEnergy);
  } else {
    player.energy = player.maxEnergy;
  }
  if (run.relicState) { run.relicState.kunai_counter = 0; run.relicState.shuriken_counter = 0; }
  drawCards(5 - player.hand.length);
  addLog('--- Your turn ---');
  enemies.forEach((enemy, idx) => {
    if (enemy.hp > 0) {
      addLog(ENEMIES[enemy.id].name + ' (' + (idx+1) + ') intends: ' + enemyIntent(idx));
    }
  });
}

function drawCards(count) {
  const {player} = state.run;
  for (let i=0; i<count; i++) {
    if (player.drawPile.length === 0) {
      if (player.discardPile.length === 0) break;
      player.drawPile = shuffle([...player.discardPile]);
      player.discardPile = [];
      addLog('Reshuffled discard pile.');
    }
    player.hand.push(player.drawPile.shift());
  }
}

function enemyIntent(idx) {
  const run = state.run;
  const enemy = run.enemies[idx];
  const def = ENEMIES[enemy.id];
  const action = def.pattern[enemy.patternIndex % def.pattern.length];
  if (action.type === 'attack') return '⚔ ' + action.value + (enemy.status.strength > 0 ? '(+' + enemy.status.strength + ')' : '');
  if (action.type === 'block')  return '🛡 ' + action.value;
  if (action.type === 'buff')   return '✨ ' + action.label;
  return '...';
}

function enemyNextAction(idx) {
  const enemy = state.run.enemies[idx];
  const def = ENEMIES[enemy.id];
  return def.pattern[enemy.patternIndex % def.pattern.length];
}

// ── Combat ────────────────────────────────────────────────────────

let selectedCardIdx = -1;

function playCard(handIndex, targetIdx = -1) {
  const run = state.run;
  if (!run || run.phase !== 'combat') return;
  const {player} = run;
  const cardId = player.hand[handIndex];
  if (!cardId || !CARDS[cardId]) return;
  const card = CARDS[cardId];
  if (player.energy < card.cost) return;

  // Targeting logic: if multiple enemies and card is single-target attack/debuff
  const aliveEnemies = run.enemies.filter(e => e.hp > 0);
  const needsTarget = (card.type === 'attack' || card.effect.weak || card.effect.vulnerable) && !card.effect.aoe;

  if (needsTarget && aliveEnemies.length > 1 && targetIdx === -1) {
    if (selectedCardIdx === handIndex) {
      selectedCardIdx = -1; // Deselect
    } else {
      selectedCardIdx = handIndex;
      addLog('Select a target for ' + card.name + '.');
    }
    render(); return;
  }

  // If only one enemy, auto-target it
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

  if (card.special === 'whirlwind' || card.special === 'whirlwind_plus') {
    const rs = run.relicState;
    const akabonus = (rs && hasRelic('akabeko') && !rs.akabeko_fired) ? 8 : 0;
    if (akabonus > 0) { rs.akabeko_fired = true; addLog('Akabeko: +8 bonus damage!'); }
    const dmgPerEnergy = (card.special === 'whirlwind_plus' ? 8 : 5) + player.strength + akabonus;
    const totalDmg = dmgPerEnergy * player.energy;
    player.energy = 0;
    if (totalDmg > 0) {
      run.enemies.forEach((_, idx) => dealDmgToEnemy(totalDmg, idx));
      addLog('You play ' + card.name + ' — deal ' + totalDmg + ' damage to ALL enemies!');
      checkCombatEnd();
    } else {
      addLog('You play ' + card.name + ' — but you have no energy left!');
    }
  } else {
    applyEffect(card, targetIdx);
  }

  // Shuriken / Kunai
  if (card.type === 'attack' && run.relicState) {
    const rs = run.relicState;
    if (hasRelic('shuriken')) {
      rs.shuriken_counter++;
      if (rs.shuriken_counter % 3 === 0) { player.strength++; addLog('Shuriken: gained 1 Strength!'); }
    }
    if (hasRelic('kunai')) {
      rs.kunai_counter++;
      if (rs.kunai_counter % 3 === 0) { player.energy++; addLog('Kunai: gained 1 Energy!'); }
    }
  }

  player.discardPile.push(cardId);
  checkCombatEnd();

  // Unceasing Top
  if (player.hand.length === 0 && hasRelic('unceasing_top') && player.energy > 0) {
    drawCards(1);
    addLog('Unceasing Top: drew a card.');
  }

  saveState(); render();
}

function applyEffect(card, targetIdx) {
  const {player, enemies} = state.run;
  const eff = card.effect;
  const msgs = [];

  if (eff.damage) {
    const hits = eff.hits || 1;
    let total = 0;
    const rs = state.run.relicState;
    const akabonus = (rs && hasRelic('akabeko') && !rs.akabeko_fired) ? 8 : 0;
    if (akabonus > 0) { rs.akabeko_fired = true; addLog('Akabeko: +8 bonus damage!'); }
    
    for (let i=0; i<hits; i++) {
      const base = eff.damage + player.strength + (i===0 ? akabonus : 0);
      if (eff.aoe) {
        enemies.forEach((_, idx) => total += dealDmgToEnemy(base, idx));
      } else {
        total += dealDmgToEnemy(base, targetIdx);
      }
    }
    msgs.push('deal ' + total + ' damage' + (eff.aoe ? ' to all' : ''));
  }
  
  if (eff.block)  { player.armor += eff.block; msgs.push('gain ' + eff.block + ' block'); }
  if (eff.heal)   { const a = Math.min(eff.heal, player.maxHp-player.hp); player.hp+=a; msgs.push('heal '+a+' HP'); }
  if (eff.draw)   { drawCards(eff.draw); msgs.push('draw '+eff.draw+' card(s)'); }
  if (eff.energy) { player.energy += eff.energy; msgs.push('gain '+eff.energy+' energy'); }
  if (eff.strength) { player.strength += eff.strength; msgs.push('gain '+eff.strength+' Strength'); }
  
  // Status effects
  if (eff.weak) {
    if (eff.aoe) enemies.forEach(e => { if(e.hp>0) e.status.weak += eff.weak; });
    else if (targetIdx !== -1) enemies[targetIdx].status.weak += eff.weak;
    msgs.push('apply ' + eff.weak + ' Weak');
  }
  if (eff.vulnerable) {
    if (eff.aoe) enemies.forEach(e => { if(e.hp>0) e.status.vulnerable += eff.vulnerable; });
    else if (targetIdx !== -1) enemies[targetIdx].status.vulnerable += eff.vulnerable;
    msgs.push('apply ' + eff.vulnerable + ' Vulnerable');
  }

  addLog('You play ' + card.name + ' — ' + msgs.join(', ') + '.');
}

function dealDmgToEnemy(baseDmg, targetIdx) {
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

function endTurn() {
  const run = state.run;
  if (!run || run.phase !== 'combat') return;
  const {player} = run;
  
  selectedCardIdx = -1;
  addLog('--- Enemies\' turn ---');

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

      const action = enemyNextAction(idx);
      if (action.type === 'attack') {
        scheduleEffect('enemy-attack', idx);
        let atk = action.value + enemy.status.strength;
        if (enemy.status.weak > 0) atk = Math.floor(atk * 0.75);
        
        const absorbed = Math.min(atk, player.armor);
        player.armor -= absorbed;
        let actual = Math.max(0, atk - absorbed);
        
        if (actual > 0 && run.relicState && run.relicState.helix_active) {
          run.relicState.helix_active = false;
          addLog('Fossilized Helix: negated ' + actual + ' damage!');
          actual = 0;
        }
        
        player.hp = Math.max(0, player.hp - actual);
        if (actual > 0) scheduleEffect('hit-player', actual);
        else if (absorbed > 0) scheduleEffect('block-success', absorbed);
        addLog(ENEMIES[enemy.id].name + ' deals ' + actual + ' damage.');
      } else if (action.type === 'block') {
        enemy.armor += action.value;
        addLog(ENEMIES[enemy.id].name + ' gains ' + action.value + ' block.');
      } else if (action.type === 'buff') {
        enemy.status[action.buffType] += action.value;
        addLog(ENEMIES[enemy.id].name + ' uses ' + action.label + '!');
      }

      enemy.patternIndex++;
      render();
      if (player.hp <= 0) playerDied();
    }, delay);
    delay += 600;
  });

  setTimeout(() => {
    if (state.run && state.run.phase === 'combat' && player.hp > 0) {
      run.enemies.forEach(e => {
        if (e.status.weak > 0) e.status.weak--;
        if (e.status.vulnerable > 0) e.status.vulnerable--;
      });
      startPlayerTurn();
      saveState(); render();
    }
  }, delay + 200);
}

function checkCombatEnd() {
  const run = state.run;
  if (run.enemies.every(e => e.hp <= 0)) {
    setTimeout(victory, 800);
  }
}

function victory() {
  flushEffects();
  const run = state.run;
  if (!run) return;

  // Discard remaining hand
  run.player.discardPile.push(...run.player.hand);
  run.player.hand = [];
  
  const mult = 1 + (state.meta.upgrades.better_rewards || 0) * 0.2;
  let gold = Math.floor(COMBAT_GOLD_BASE * run.floor * mult);
  
  // Apply start gold bonus to first combat
  if (run.startGoldBonus > 0) {
    gold += run.startGoldBonus;
    run.startGoldBonus = 0;
  }
  
  run.goldEarned += gold;
  state.idle.gold += gold;
  addLog('Victory! Gained ⚜ ' + gold + ' gold.');

  // ON_COMBAT_END relics
  if (hasRelic('burning_blood')) {
    const h = Math.min(6, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog('Burning Blood: healed ' + h + ' HP.'); }
  }
  if (hasRelic('meat_on_the_bone') && run.player.hp <= run.player.maxHp * 0.5) {
    const h = Math.min(12, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog('Meat on the Bone: healed ' + h + ' HP!'); }
  }

  // Final floor victory
  if (run.floor === 5) {
    const ess = RUN_ESSENCE_BASE + RUN_ESSENCE_PER_FLOOR * 4;
    run.essenceGained = ess;
    state.idle.essence += ess;
    run.phase = 'victory';
    addLog('You conquered the dungeon! Earned ' + ess + ' essence!');
  } else {
    // Generate relic offer for milestone floors (Floor 2 and 4)
    if (RELIC_OFFER_FLOORS.includes(run.floor)) {
      const offer = generateRelicOffer();
      if (offer.length > 0) run.relicOffer = offer;
    }
    run.phase = 'reward';
  }
  saveState(); render();
}

function enemyDied() {
  // Flush kill-blow floating numbers now — combat DOM still exists before render() replaces it
  flushEffects();
  const run = state.run;
  // Discard remaining hand so cards don't persist into next combat's starting hand
  run.player.discardPile.push(...run.player.hand);
  run.player.hand = [];
  addLog(ENEMIES[run.enemy.id].name + ' is defeated!');
  const mult = 1 + state.meta.upgrades.better_rewards * 0.2;
  let gold = Math.floor(COMBAT_GOLD_BASE * run.floor * mult);
  // Apply start gold bonus to first combat of a run
  if (run.startGoldBonus > 0) {
    gold += run.startGoldBonus;
    run.startGoldBonus = 0;
  }
  run.goldEarned += gold;
  state.idle.gold += gold;
  addLog('You gain ' + gold + ' gold.');
  // ON_COMBAT_END relics
  if (hasRelic('burning_blood')) {
    const h = Math.min(6, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog('Burning Blood: healed ' + h + ' HP.'); }
  }
  if (hasRelic('meat_on_the_bone') && run.player.hp <= run.player.maxHp * 0.5) {
    const h = Math.min(12, run.player.maxHp - run.player.hp);
    if (h > 0) { run.player.hp += h; addLog('Meat on the Bone: healed ' + h + ' HP (low health bonus)!'); }
  }
  // Generate relic offer for milestone floors
  if (RELIC_OFFER_FLOORS.includes(run.floor)) {
    const offer = generateRelicOffer();
    if (offer.length > 0) run.relicOffer = offer;
  }
  run.phase = 'reward';
  saveState(); render();
}

function playerDied() {
  const run = state.run;
  addLog('You have been slain...');
  run.phase = 'death';
  if (run.floor > state.meta.bestFloor) state.meta.bestFloor = run.floor;
  if (run.goldEarned > state.meta.bestGold) state.meta.bestGold = run.goldEarned;
  state.meta.totalRuns++;
  const ess = Math.max(3, Math.floor(run.floor * RUN_ESSENCE_PER_FLOOR * 0.6));
  run.essenceGained = ess;
  state.idle.essence += ess;
  addLog('You earned ' + ess + ' essence from the dungeon.');
  saveState(); render();
}

function proceedAfterReward() {
  const run = state.run;
  if (!run || run.phase !== 'reward') return;
  if (run.floor >= TOTAL_FLOORS) {
    runVictory();
  } else {
    run.floor++;
    run.restedThisFloor = false;
    run.upgradeChoiceActive = false;
    enterCombat();
    saveState(); render();
  }
}

function restAndHeal() {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  const healAmt = Math.floor(run.player.maxHp * 0.3);
  run.player.hp = Math.min(run.player.maxHp, run.player.hp + healAmt);
  run.restedThisFloor = true;
  run.upgradeChoiceActive = false;
  saveState(); render();
}

function showUpgradeChoice() {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  run.upgradeChoiceActive = true;
  saveState(); render();
}

function hideUpgradeChoice() {
  const run = state.run;
  if (!run) return;
  run.upgradeChoiceActive = false;
  saveState(); render();
}

function pickRelic(relicId) {
  const run = state.run;
  if (!run || !run.relicOffer || !run.relicOffer.includes(relicId)) return;
  if (!state.meta.relics.includes(relicId)) state.meta.relics.push(relicId);
  run.relicOffer = null;
  addLog('You obtained: ' + RELICS[relicId].name + '!');
  saveState(); render();
}

function upgradeCard(cardId) {
  const run = state.run;
  if (!run || run.phase !== 'reward' || run.restedThisFloor) return;
  const upgradedId = CARD_UPGRADES[cardId];
  if (!upgradedId) return;

  // Replace first occurrence in current run piles
  const piles = [run.player.hand, run.player.drawPile, run.player.discardPile];
  let replaced = false;
  for (const pile of piles) {
    const idx = pile.indexOf(cardId);
    if (idx !== -1) { pile[idx] = upgradedId; replaced = true; break; }
  }
  if (!replaced) return;

  // Persist upgrade: check permanentDeck (shop cards) first, then startingDeck (starter cards)
  const permIdx = state.meta.permanentDeck.indexOf(cardId);
  if (permIdx !== -1) {
    state.meta.permanentDeck[permIdx] = upgradedId;
  } else {
    const startIdx = state.meta.startingDeck.indexOf(cardId);
    if (startIdx !== -1) state.meta.startingDeck[startIdx] = upgradedId;
  }

  run.restedThisFloor = true;
  run.upgradeChoiceActive = false;
  addLog('You upgraded ' + CARDS[cardId].name + ' → ' + CARDS[upgradedId].name + '!');
  saveState(); render();
}

function runVictory() {
  const run = state.run;
  run.phase = 'victory';
  state.meta.totalRuns++;
  if (run.floor > state.meta.bestFloor) state.meta.bestFloor = run.floor;
  if (run.goldEarned > state.meta.bestGold) state.meta.bestGold = run.goldEarned;
  const ess = RUN_ESSENCE_BASE + RUN_ESSENCE_PER_FLOOR * (run.floor-1);
  run.essenceGained = ess;
  state.idle.essence += ess;
  addLog('You conquered the dungeon! Earned ' + ess + ' essence!');
  saveState(); render();
}

function exitRun() {
  state.run = null;
  state.shop.refreshCost = SHOP_REFRESH_COST; // reset refresh cost after each run
  saveState(); render();
}

// ═══════════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════════

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'k';
  return n.toString();
}

function fmtDec(n) {
  return n.toFixed(1);
}

function renderRelics() {
  const el = document.getElementById('relics-list');
  if (!el) return;
  const relics = state.meta.relics || [];
  if (relics.length === 0) {
    el.innerHTML = '<div class="relics-empty">No relics yet. Earn them from floor 2 and 4 rewards.</div>';
    return;
  }
  const rarityColor = { common:'var(--common-gray)', uncommon:'var(--uncommon-green)', rare:'var(--rare-gold)' };
  el.innerHTML = relics.map(rid => {
    const r = RELICS[rid];
    if (!r) return '';
    return '<div class="relic-pill" '+
      'onmouseenter="showTooltip(event, \'relic\', \''+rid+'\')" '+
      'onmouseleave="hideTooltip()" '+
      'onmousemove="showTooltip(event, \'relic\', \''+rid+'\')">'+
      '<span class="relic-pill-icon">'+r.icon+'</span>'+
      '<span class="relic-pill-name" style="color:'+rarityColor[r.rarity]+'">'+r.name+'</span>'+
    '</div>';
  }).join('');
}

function render() {
  try {
    renderResources();
    renderBuildings();
    renderShop();
    renderMetaUpgrades();
    renderDeck();
    renderRelics();
    renderRunBtn();
    renderDungeon();
    // Fire queued visual effects after DOM is updated
    requestAnimationFrame(flushEffects);
  } catch (e) {
    console.error('Render error:', e);
  }
}

function renderResources() {
  const s = state.idle;
  const rate = (r) => r > 0 ? ' <span class="rate">(+'+fmtDec(r)+'/s)</span>' : '';
  document.getElementById('res-gold').innerHTML    = '⚜ '+fmt(s.gold)    + rate(s.goldRate);
  document.getElementById('res-mana').innerHTML    = '✦ '+fmt(s.mana)    + rate(s.manaRate);
  document.getElementById('res-essence').innerHTML = '◈ '+fmt(s.essence) + rate(s.essenceRate);
  document.getElementById('res-runs').textContent  =
    'Runs: '+state.meta.totalRuns+' | Best Floor: '+(state.meta.bestFloor||'—')+' | Best Gold: '+(state.meta.bestGold||'—');
}

function renderBuildings() {
  document.getElementById('buildings-list').innerHTML = BUILDINGS.map((def,i) => {
    const b = state.buildings[i];
    const cost = buildingUpgradeCost(i);
    const maxed = b.level >= def.maxLevel;
    const canBuy = !maxed && state.idle.gold >= cost;
    const rateNow = b.level > 0 ? (def.baseRate*b.level).toFixed(1)+'/s' : 'inactive';
    return '<div class="building-card'+(maxed?' maxed':'')+'">'+
      '<div class="building-info">'+
        '<span class="building-name">'+def.name+'</span>'+
        '<span class="building-level">Lv '+b.level+'/'+def.maxLevel+'</span>'+
        '<span class="building-rate">'+rateNow+'</span>'+
        '<span class="building-desc">'+def.description+'</span>'+
      '</div>'+
      '<button class="btn btn-gold'+(canBuy?'':' disabled')+'" '+(canBuy?'':'disabled ')+
        'onclick="upgradeBuilding('+i+')">'+
        (maxed?'MAX':'⚜ '+fmt(cost))+
      '</button>'+
    '</div>';
  }).join('');
}
function renderShop() {
  document.getElementById('shop-cards').innerHTML = state.shop.available.map((cardId) => {
    const card = CARDS[cardId];
    if (!card) return '';
    const cost = CARD_COST[card.rarity];
    const canBuy = state.idle.gold >= cost;
    return '<div class="shop-card card-'+card.type+' rarity-'+card.rarity+'" '+
      'onmouseenter="showTooltip(event, \'card\', \'' + cardId + '\')" ' +
      'onmouseleave="hideTooltip()" '+
      'onmousemove="showTooltip(event, \'card\', \'' + cardId + '\')">'+
      '<div class="card-header">'+
        '<span class="card-name">'+card.name+'</span>'+
        '<span class="card-cost-badge">'+card.cost+'⚡</span>'+
      '</div>'+
      '<div class="card-desc">'+card.description+'</div>'+
      '<div class="card-footer">'+
        '<span class="rarity-tag">'+card.rarity+'</span>'+
        '<button class="btn btn-gold btn-small'+(canBuy?'':' disabled')+'" '+(canBuy?'':'disabled ')+
          'onclick="buyCard(\''+cardId+'\')">⚜ '+cost+'</button>'+
      '</div>'+
    '</div>';
  }).join('');

  const canRefresh = state.idle.gold >= state.shop.refreshCost;
  const rb = document.getElementById('shop-refresh');
  rb.innerHTML = 'Refresh ⚜ '+state.shop.refreshCost;
  rb.disabled = !canRefresh;
  rb.className = 'btn btn-small'+(canRefresh?'':' disabled');
}

function renderMetaUpgrades() {
  document.getElementById('meta-upgrades-list').innerHTML = META_UPGRADES.map(def => {
    const lv = state.meta.upgrades[def.id];
    const maxed = lv >= def.maxLevel;
    const cost = metaUpgradeCost(def.id);
    const canBuy = !maxed && state.idle.essence >= cost;
    return '<div class="meta-card'+(maxed?' maxed':'')+'">'+
      '<div class="meta-info">'+
        '<span class="meta-name">'+def.name+'</span>'+
        '<span class="meta-level">'+lv+'/'+def.maxLevel+'</span>'+
        '<span class="meta-desc">'+def.description+'</span>'+
      '</div>'+
      '<button class="btn btn-essence'+(canBuy?'':' disabled')+'" '+(canBuy?'':'disabled ')+
        'onclick="buyMetaUpgrade(\''+def.id+'\')">'+
        (maxed?'MAX':'◈ '+cost)+
      '</button>'+
    '</div>';
  }).join('');
}

function renderDeck() {
  const all = [...(state.meta.startingDeck || []), ...(state.meta.permanentDeck || [])];
  const counts = {};
  all.forEach(id => { counts[id]=(counts[id]||0)+1; });
  document.getElementById('deck-list').innerHTML =
    '<span class="deck-count">'+all.length+' cards</span>' +
    Object.keys(counts).map(id => {
      const card=CARDS[id], n=counts[id];
      if (!card) return '';
      const badge = card.upgraded ? '<span class="upgraded-badge">✦</span>' : '';
      return '<span class="deck-pill card-'+card.type+'" ' +
        'onmouseenter="showTooltip(event, \'card\', \'' + id + '\')" ' +
        'onmouseleave="hideTooltip()" ' +
        'onmousemove="showTooltip(event, \'card\', \'' + id + '\')">' +
        card.name+badge+(n>1?' ×'+n:'')+' <span class="deck-pill-cost">'+card.cost+'⚡</span>'+
      '</span>';
    }).join('');
}

function renderRunBtn() {
  const btn = document.getElementById('run-btn');
  const inRun = !!state.run;
  btn.textContent = inRun ? 'In Dungeon...' : 'Enter Dungeon';
  btn.disabled = inRun;
  btn.className = 'btn btn-danger btn-full'+(inRun?' disabled':'');
}

function renderDungeon() {
  const run = state.run;
  const el = document.getElementById('dungeon-panel');
  if (!run) {
    el.innerHTML =
      '<div class="dungeon-idle">'+
        '<div class="dungeon-title">The Dungeon Awaits</div>'+
        (state.idle.goldRate === 0
          ? '<p class="dungeon-hint start-hint">→ Start by upgrading a <strong>Gold Mine</strong> on the left to earn gold.</p>'
          : '<p class="dungeon-hint">Build your deck in the hub. Enter the dungeon when ready.<br>5 floors of increasingly dangerous enemies await.</p>')+
        '<div class="dungeon-stats">'+
          '<div>Total Runs: <strong>'+state.meta.totalRuns+'</strong></div>'+
          '<div>Best Floor: <strong>'+(state.meta.bestFloor||'—')+'</strong></div>'+
        '</div>'+
      '</div>';
    return;
  }
  if (run.phase==='victory') { el.innerHTML = renderVictoryHTML(); return; }
  if (run.phase==='death')   { el.innerHTML = renderDeathHTML();   return; }
  if (run.phase==='reward')  { el.innerHTML = renderRewardHTML();  return; }
  if (run.phase==='combat')  {
    el.innerHTML = renderCombatHTML();
    const log = el.querySelector('.combat-log');
    if (log) log.scrollTop = log.scrollHeight;
  }
}

function renderCombatHTML() {
  const run = state.run;
  const {player, enemies} = run;

  const floorDots = Array.from({length:TOTAL_FLOORS},(_,i)=>i+1).map(f => {
    const cls = f<run.floor?'cleared':f===run.floor?'current':'';
    const label = f===run.floor?'⚔':f<run.floor?'✓':f;
    return '<div class="floor-dot '+cls+'">'+label+'</div>';
  }).join('');

  const energyGems = Array.from({length:player.maxEnergy},(_,i)=>
    '<span class="energy-gem '+(i<player.energy?'full':'empty')+'">⚡</span>'
  ).join('');

  const relicList = state.meta.relics || [];
  const relicTray = relicList.length > 0 ? '<div class="combat-relic-tray">' + relicList.map(rid => {
    const r = RELICS[rid];
    if (!r) return '';
    let usedClass = '';
    if (rid === 'fossilized_helix' && run.relicState && !run.relicState.helix_active) usedClass = ' relic-used';
    return '<span class="combat-relic-icon' + usedClass + '" title="' + r.name + '">' + r.icon + '</span>';
  }).join('') + '</div>' : '';

  const hand = player.hand.map((cardId,i) => {
    const card = CARDS[cardId];
    const canPlay = player.energy >= card.cost;
    const isSelected = (selectedCardIdx === i);
    return '<div class="hand-card card-'+card.type+' '+(canPlay?'playable':'unplayable')+(isSelected?' selected-card':'')+'" '+
      (canPlay?'onclick="playCard('+i+')"':'')+'>'+
      '<div class="hc-cost">'+card.cost+'⚡</div>'+
      '<div class="hc-name">'+card.name+'</div>'+
      '<div class="hc-desc">'+card.description+'</div>'+
      '<div class="hc-type">'+card.type+'</div>'+
    '</div>';
  }).join('');

  const logLines = run.log.slice(-8).map(l=>'<div class="log-line">'+l+'</div>').join('');

  const enemiesHtml = (enemies || []).map((enemy, idx) => {
    const def = ENEMIES[enemy.id];
    if (!def) return '';
    
    const action = enemyNextAction(idx);
    if (!action) return '';

    const intentVal = action.type==='attack'
      ? '('+Math.floor((action.value+(enemy.status.strength||0))*(enemy.status.weak>0?0.75:1))+' dmg)'
      : action.type==='block' ? '(+'+action.value+' block)'
      : action.type==='buff'  ? '(+'+action.value+' '+(action.buffType||'')+')' : '';
    
    const isTargetable = (selectedCardIdx !== -1 && enemy.hp > 0);
    const statusTags = [
      (enemy.status.weak||0)>0       ? '<span class="status-tag status-weak">Weak '+enemy.status.weak+'</span>' : '',
      (enemy.status.vulnerable||0)>0 ? '<span class="status-tag status-vuln">Vuln '+enemy.status.vulnerable+'</span>' : '',
      (enemy.status.regen||0)>0      ? '<span class="status-tag status-regen">Regen '+enemy.status.regen+'</span>' : '',
      (enemy.status.strength||0)>0   ? '<span class="status-tag status-strength">Str +'+enemy.status.strength+'</span>' : '',
    ].join('');

    return '<div id="enemy-unit-'+idx+'" class="enemy-unit '+(enemy.hp<=0?'dead':'')+(isTargetable?' targetable':'')+'" '+
      (isTargetable?'onclick="playCard('+selectedCardIdx+','+idx+')"':'')+'>'+
      '<div class="enemy-intent">Next: <strong>'+(action.label||'...')+'</strong> '+intentVal+'</div>'+
      '<div class="enemy-sprite">'+(def.icon||'❓')+'</div>'+
      '<div class="enemy-name">'+(def.isBoss?'👑 ':'')+def.name+'</div>'+
      '<div class="hp-bar-wrap">'+
        '<div class="hp-bar" style="width:'+Math.round(enemy.hp/enemy.maxHp*100)+'%"></div>'+
        '<span class="hp-text">'+enemy.hp+' / '+enemy.maxHp+'</span>'+
      '</div>'+
      (enemy.armor>0?'<div class="armor-display">🛡 '+enemy.armor+'</div>':'')+
      '<div class="enemy-status">'+statusTags+'</div>'+
    '</div>';
  }).join('');

  return '<div class="combat-view">'+
    '<div class="floor-bar">'+floorDots+'<span class="floor-label">Floor '+run.floor+'/'+TOTAL_FLOORS+'</span></div>'+
    '<div id="enemy-section" class="enemy-section">'+
      enemiesHtml +
    '</div>'+
    '<div class="player-section">'+
      '<div class="player-stats">'+
        '<div class="stat-block hp">'+
          '<div class="hp-bar-wrap">'+
            '<div class="hp-bar hp-player" style="width:'+Math.round(player.hp/player.maxHp*100)+'%"></div>'+
            '<span class="hp-text">'+player.hp+' / '+player.maxHp+'</span>'+
          '</div>'+
          (player.armor>0?'<span class="armor-display">🛡 '+player.armor+'</span>':'')+
        '</div>'+
        '<div class="energy-display">'+energyGems+
          '<span class="energy-text">'+player.energy+'/'+player.maxEnergy+'</span>'+
        '</div>'+
        (player.strength>0?'<div class="player-status"><span class="status-tag status-strength">Str +'+player.strength+'</span></div>':'')+
      '</div>'+
      relicTray+
      '<div class="combat-actions">'+
        '<div class="hand-label">Hand ('+player.drawPile.length+' draw | '+player.discardPile.length+' discard) &nbsp;⚜ '+fmt(state.idle.gold)+'</div>'+
        (state.idle.manaRate === 0 && state.idle.mana < MANA_SURGE_COST
          ? ''
          : state.idle.mana >= MANA_SURGE_COST
            ? '<button class="btn btn-mana-surge" onclick="manaSurge()">✦ Mana Surge ('+MANA_SURGE_COST+')</button>'
            : '<span class="mana-surge-hint">✦ Mana Surge needs '+MANA_SURGE_COST+' mana ('+Math.floor(state.idle.mana)+')</span>')+
      '</div>'+
      '<div class="hand">'+hand+'</div>'+
      '<button class="btn btn-end-turn" onclick="endTurn()">End Turn</button>'+
    '</div>'+
    '<div class="combat-log">'+logLines+'</div>'+
  '</div>';
}

function renderRewardHTML() {
  const run = state.run;
  const isFinal = run.floor >= TOTAL_FLOORS;
  const healAmt = Math.floor(run.player.maxHp * 0.3);
  const {player} = run;

  // Build the mid-floor choice section
  let choiceSection = '';
  if (!isFinal) {
    if (run.restedThisFloor) {
      choiceSection = '<div class="rest-used">✓ Floor benefit used.</div>';
    } else if (run.upgradeChoiceActive) {
      // Show upgradeable cards from all piles
      const allCards = [...player.hand, ...player.drawPile, ...player.discardPile];
      const countMap = {};
      allCards.forEach(cid => { if (CARD_UPGRADES[cid]) countMap[cid] = (countMap[cid] || 0) + 1; });
      const upgradeable = Object.keys(countMap);
      const cardPicker = upgradeable.length === 0
        ? '<p class="upgrade-none">No upgradeable cards in deck.</p>'
        : upgradeable.map(cid => {
            const base = CARDS[cid];
            const upg = CARDS[CARD_UPGRADES[cid]];
            const count = countMap[cid];
            const countNote = count > 1 ? ' <span class="uc-count">(×'+count+' — upgrades one)</span>' : '';
            return '<div class="upgrade-card" onclick="upgradeCard(\''+cid+'\')">'+
              '<div class="uc-name">'+base.name+countNote+' → <strong>'+upg.name+'</strong></div>'+
              '<div class="uc-desc">'+base.description+' → '+upg.description+'</div>'+
            '</div>';
          }).join('');
      choiceSection =
        '<div class="upgrade-picker">'+
          '<div class="upgrade-picker-title">Choose a card to upgrade:</div>'+
          cardPicker+
          '<button class="btn btn-small" onclick="hideUpgradeChoice()">← Back</button>'+
        '</div>';
    } else {
      const hpFull = player.hp >= player.maxHp;
      const canUpgrade = [...player.hand, ...player.drawPile, ...player.discardPile].some(cid => CARD_UPGRADES[cid]);
      choiceSection =
        '<div class="reward-choice">'+
          '<div class="choice-label">Choose your floor reward:</div>'+
          '<div class="choice-row">'+
            '<button class="btn btn-rest choice-btn'+(hpFull?' choice-disabled':'')+'" '+
              (hpFull?'disabled':'onclick="restAndHeal()"')+'>'+
              '🔥 Rest &amp; Heal<br><small>Restore '+healAmt+' HP'+(hpFull?' (HP full)':'')+'</small>'+
            '</button>'+
            '<div class="choice-or">or</div>'+
            '<button class="btn choice-btn btn-upgrade'+(canUpgrade?'':' choice-disabled')+'" '+
              (canUpgrade?'onclick="showUpgradeChoice()"':'disabled')+'>'+
              '⚡ Upgrade Card<br><small>'+(canUpgrade?'Permanently improve one card':'No cards to upgrade')+'</small>'+
            '</button>'+
          '</div>'+
        '</div>';
    }
  }

  // Relic offer section
  let relicSection = '';
  if (run.relicOffer && run.relicOffer.length > 0) {
    const rarityColor = { common:'var(--common-gray)', uncommon:'var(--uncommon-green)', rare:'var(--rare-gold)' };
    relicSection =
      '<div class="relic-offer">'+
        '<div class="relic-offer-title">✦ Choose a Relic</div>'+
        run.relicOffer.map(rid => {
          const r = RELICS[rid];
          return '<div class="relic-offer-card" onclick="pickRelic(\''+rid+'\');hideTooltip()">'+
            '<span class="relic-icon">'+r.icon+'</span>'+
            '<div class="relic-info">'+
              '<div class="relic-name" style="color:'+rarityColor[r.rarity]+'">'+r.name+'</div>'+
              '<div class="relic-desc">'+r.description+'</div>'+
            '</div>'+
          '</div>';
        }).join('')+
      '</div>';
  }

  return '<div class="result-view reward-view">'+
    '<div class="result-title">⚔ Floor '+run.floor+' Cleared!</div>'+
    '<div class="reward-summary">'+
      '<div>Gold this run: <strong>'+run.goldEarned+'</strong></div>'+
      '<div class="player-hp-reward">HP: <strong>'+player.hp+' / '+player.maxHp+'</strong></div>'+
    '</div>'+
    relicSection+
    choiceSection+
    '<button class="btn btn-danger" onclick="proceedAfterReward()">'+
      (isFinal?'👑 Claim Victory!':'→ Floor '+(run.floor+1))+
    '</button>'+
    (!isFinal ? '<button class="btn btn-abandon" onclick="if(confirm(\'Abandon run? Gold and essence kept. Run ends as defeat.\'))playerDied()">Abandon Run</button>' : '')+
  '</div>';
}

function renderVictoryHTML() {
  const run = state.run;
  const ess = run.essenceGained || 0;
  return '<div class="result-view victory-view">'+
    '<div class="result-title">👑 Dungeon Conquered!</div>'+
    '<p>All '+TOTAL_FLOORS+' floors cleared. You are victorious.</p>'+
    '<div class="reward-summary">'+
      '<div>Gold earned: <strong>'+run.goldEarned+'</strong></div>'+
      '<div>Essence gained: <strong>◈ '+ess+'</strong></div>'+
      '<div>Total damage dealt: <strong>'+(run.totalDamage||0)+'</strong></div>'+
    '</div>'+
    '<button class="btn btn-danger" onclick="exitRun()">Return to Hub</button>'+
  '</div>';
}

function renderDeathHTML() {
  const run = state.run;
  const ess = run.essenceGained || 0;
  return '<div class="result-view death-view">'+
    '<div class="result-title">☠ Defeated</div>'+
    '<p>You fell on floor '+run.floor+'.</p>'+
    '<div class="reward-summary">'+
      '<div>Gold earned: <strong>'+run.goldEarned+'</strong></div>'+
      '<div>Essence gained: <strong>◈ '+ess+'</strong></div>'+
      '<div>Total damage dealt: <strong>'+(run.totalDamage||0)+'</strong></div>'+
    '</div>'+
    '<button class="btn btn-danger" onclick="exitRun()">Return to Hub</button>'+
  '</div>';
}

// ── Tooltip ────────────────────────────────────────────────────────

function showTooltip(e, type, id) {
  const el = document.getElementById('game-tooltip');
  if (!el) return;
  
  let title = '', desc = '', rarity = '';
  if (type === 'card') {
    const c = CARDS[id];
    if (!c) return;
    title = c.name; desc = c.description; rarity = c.rarity;
  } else if (type === 'relic') {
    const r = RELICS[id];
    if (!r) return;
    title = r.name; desc = r.description; rarity = r.rarity;
  }

  const rarColor = rarity ? (rarity==='common'?'#aaa':rarity==='uncommon'?'#50b070':'#f0a030') : '';
  el.innerHTML =
    '<span class="tooltip-title">' + title + '</span>' +
    '<span class="tooltip-desc">' + desc + '</span>' +
    (rarity ? '<span class="tooltip-rarity" style="color:'+rarColor+'">' + rarity + '</span>' : '');
  
  el.classList.add('visible');
  
  const move = (ev) => {
    const x = ev.clientX + 15;
    const y = ev.clientY + 15;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = (x + w > window.innerWidth) ? (ev.clientX - w - 10) : x;
    const top = (y + h > window.innerHeight) ? (ev.clientY - h - 10) : y;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  };
  move(e || window.event);
}

function hideTooltip() {
  const el = document.getElementById('game-tooltip');
  if (el) el.classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════════
// VISUAL EFFECTS
// ═══════════════════════════════════════════════════════════════════

// Queue of pending effects to fire after the next render()
const pendingEffects = [];

function scheduleEffect(type, value) {
  pendingEffects.push({ type, value });
}

function flushEffects() {
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
  const panelRect = panel ? panel.getBoundingClientRect() : {left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0};
  const targetX = panelRect.left + panelRect.width/2 - rect.width/2;
  const targetY = panelRect.top + panelRect.height/3 - rect.height/2;

  requestAnimationFrame(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(1.3)`;
    el.style.opacity = '0';
    el.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
  });

  setTimeout(() => el.remove(), 500);
}

function shakeElement(id, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove(cls);
  // Force reflow so removing and re-adding the class works
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
  // Floating "🛡 BLOCKED!" label
  const label = document.createElement('div');
  label.className = 'floating-num float-block-label';
  label.textContent = '🛡 BLOCKED!';
  label.style.left = (rect.left + rect.width * 0.15 + Math.random() * rect.width * 0.25) + 'px';
  label.style.top  = (rect.top + rect.height * 0.1) + 'px';
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 900);
  // Absorbed damage number
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

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════

const state = loadState() || createDefaultState();
recomputeRates();
render();

let lastTick = performance.now();
let lastHubGold = -1;
let lastHubEssence = -1;
setInterval(() => {
  const now = performance.now();
  idleTick((now - lastTick) / 1000);
  lastTick = now;
  renderResources();
  // Only re-render hub buttons when gold/essence floor value changes (avoids hover flicker)
  const curGold = Math.floor(state.idle.gold);
  const curEssence = Math.floor(state.idle.essence);
  if (curGold !== lastHubGold || curEssence !== lastHubEssence) {
    lastHubGold = curGold;
    lastHubEssence = curEssence;
    if (!state.run) {
      renderBuildings();
      renderShop();
      renderMetaUpgrades();
    }
  }
}, 100);

setInterval(() => { saveState(); }, 5000);
