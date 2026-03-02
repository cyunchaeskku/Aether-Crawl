// src/data.js — All static game data

export const CARDS = {
  strike:      { id:'strike',      name:'Strike',          cost:1, rarity:'starter',  type:'attack',  description:'Deal 6 damage.',                     effect:{damage:6} },
  defend:      { id:'defend',      name:'Defend',          cost:1, rarity:'starter',  type:'defend', description:'Gain 5 block.',                       effect:{block:5} },
  heavy_strike:{ id:'heavy_strike',name:'Heavy Strike',    cost:2, rarity:'common',   type:'attack',  description:'Deal 14 damage.',                    effect:{damage:14} },
  quick_slash: { id:'quick_slash', name:'Quick Slash',     cost:1, rarity:'common',   type:'attack',  description:'Deal 4 damage twice.',               effect:{damage:4, hits:2} },
  iron_shield: { id:'iron_shield', name:'Iron Shield',     cost:2, rarity:'common',   type:'defend', description:'Gain 12 block.',                     effect:{block:12} },
  parry:       { id:'parry',       name:'Parry',           cost:1, rarity:'common',   type:'defend', description:'Gain 3 block. Draw 1 card.',          effect:{block:3, draw:1} },
  fireball:    { id:'fireball',    name:'Fireball',        cost:2, rarity:'uncommon', type:'attack',  description:'Deal 20 damage.',                    effect:{damage:20} },
  counter:     { id:'counter',     name:'Counter',         cost:2, rarity:'uncommon', type:'skill',   description:'Gain 6 block. Deal 6 damage.',        effect:{block:6, damage:6} },
  hex:         { id:'hex',         name:'Hex',             cost:1, rarity:'uncommon', type:'skill',   description:'Apply 2 Weak to enemy.',             effect:{weak:2} },
  leeching_strike:{ id:'leeching_strike',name:'Leeching Strike',cost:2,rarity:'uncommon',type:'attack',description:'Deal 10 damage. Heal 4 HP.',       effect:{damage:10, heal:4} },
  empower:     { id:'empower',     name:'Empower',         cost:1, rarity:'uncommon', type:'skill',   description:'Gain 2 Strength.',                   effect:{strength:2} },
  expose:      { id:'expose',      name:'Expose',          cost:1, rarity:'uncommon', type:'attack',  description:'Deal 5 damage. Apply 2 Vulnerable.',  effect:{damage:5, vulnerable:2} },
  berserker:   { id:'berserker',   name:'Berserker',       cost:2, rarity:'rare',     type:'attack',  description:'Deal 8 damage. Gain 1 energy.',       effect:{damage:8, energy:1} },
  arcane_surge:{ id:'arcane_surge',name:'Arcane Surge',    cost:3, rarity:'rare',     type:'attack',  description:'Deal 35 damage.',                    effect:{damage:35} },
  bulwark:     { id:'bulwark',     name:'Bulwark',         cost:2, rarity:'rare',     type:'defend', description:'Gain 20 block. Draw 1 card.',         effect:{block:20, draw:1} },
  soul_drain:  { id:'soul_drain',  name:'Soul Drain',      cost:2, rarity:'rare',     type:'attack',  description:'Deal 15 damage. Heal 8 HP.',          effect:{damage:15, heal:8} },
  whirlwind:   { id:'whirlwind',   name:'Whirlwind',       cost:0, rarity:'rare',     type:'attack',  description:'Deal 5 damage per remaining energy (spends all).', special:'whirlwind', effect:{} },
  // Upgraded variants
  strike_plus:       { id:'strike_plus',       name:'Strike+',          cost:1, rarity:'starter',  type:'attack',  upgraded:true, description:'Deal 9 damage.',                             effect:{damage:9} },
  defend_plus:       { id:'defend_plus',       name:'Defend+',          cost:1, rarity:'starter',  type:'defend', upgraded:true, description:'Gain 8 block.',                              effect:{block:8} },
  heavy_strike_plus: { id:'heavy_strike_plus', name:'Heavy Strike+',    cost:2, rarity:'common',   type:'attack',  upgraded:true, description:'Deal 20 damage.',                            effect:{damage:20} },
  quick_slash_plus:  { id:'quick_slash_plus',  name:'Quick Slash+',     cost:1, rarity:'common',   type:'attack',  upgraded:true, description:'Deal 6 damage twice.',                       effect:{damage:6, hits:2} },
  iron_shield_plus:  { id:'iron_shield_plus',  name:'Iron Shield+',     cost:2, rarity:'common',   type:'defend', upgraded:true, description:'Gain 16 block.',                             effect:{block:16} },
  parry_plus:        { id:'parry_plus',        name:'Parry+',           cost:1, rarity:'common',   type:'defend', upgraded:true, description:'Gain 5 block. Draw 2 cards.',                effect:{block:5, draw:2} },
  fireball_plus:     { id:'fireball_plus',     name:'Fireball+',        cost:2, rarity:'uncommon', type:'attack',  upgraded:true, description:'Deal 28 damage.',                            effect:{damage:28} },
  counter_plus:      { id:'counter_plus',      name:'Counter+',         cost:2, rarity:'uncommon', type:'skill',   upgraded:true, description:'Gain 9 block. Deal 9 damage.',               effect:{block:9, damage:9} },
  hex_plus:          { id:'hex_plus',          name:'Hex+',             cost:1, rarity:'uncommon', type:'skill',   upgraded:true, description:'Apply 3 Weak to enemy.',                     effect:{weak:3} },
  leeching_strike_plus:{ id:'leeching_strike_plus',name:'Leeching Strike+',cost:2,rarity:'uncommon',type:'attack',upgraded:true,description:'Deal 14 damage. Heal 6 HP.',                effect:{damage:14, heal:6} },
  empower_plus:      { id:'empower_plus',      name:'Empower+',         cost:1, rarity:'uncommon', type:'skill',   upgraded:true, description:'Gain 3 Strength.',                           effect:{strength:3} },
  expose_plus:       { id:'expose_plus',       name:'Expose+',          cost:1, rarity:'uncommon', type:'attack',  upgraded:true, description:'Deal 8 damage. Apply 3 Vulnerable.',          effect:{damage:8, vulnerable:3} },
  berserker_plus:    { id:'berserker_plus',    name:'Berserker+',       cost:2, rarity:'rare',     type:'attack',  upgraded:true, description:'Deal 12 damage. Gain 1 energy.',              effect:{damage:12, energy:1} },
  arcane_surge_plus: { id:'arcane_surge_plus', name:'Arcane Surge+',    cost:3, rarity:'rare',     type:'attack',  upgraded:true, description:'Deal 50 damage.',                            effect:{damage:50} },
  bulwark_plus:      { id:'bulwark_plus',      name:'Bulwark+',         cost:2, rarity:'rare',     type:'defend', upgraded:true, description:'Gain 26 block. Draw 2 cards.',               effect:{block:26, draw:2} },
  soul_drain_plus:   { id:'soul_drain_plus',   name:'Soul Drain+',      cost:2, rarity:'rare',     type:'attack',  upgraded:true, description:'Deal 20 damage. Heal 12 HP.',                effect:{damage:20, heal:12} },
  whirlwind_plus:    { id:'whirlwind_plus',    name:'Whirlwind+',       cost:0, rarity:'rare',     type:'attack',  upgraded:true, description:'Deal 8 damage per remaining energy (spends all).', special:'whirlwind_plus', effect:{} },
  bash:              { id:'bash',              name:'Bash',             cost:2, rarity:'starter',  type:'attack',  description:'Deal 8 damage. Apply 2 Vulnerable.',              effect:{damage:8, vulnerable:2} },
  bash_plus:         { id:'bash_plus',         name:'Bash+',            cost:2, rarity:'starter',  type:'attack',  upgraded:true, description:'Deal 10 damage. Apply 3 Vulnerable.',        effect:{damage:10, vulnerable:3} },
};

export const CARD_UPGRADES = {
  strike:'strike_plus', defend:'defend_plus', heavy_strike:'heavy_strike_plus',
  quick_slash:'quick_slash_plus', iron_shield:'iron_shield_plus', parry:'parry_plus',
  fireball:'fireball_plus', counter:'counter_plus', hex:'hex_plus',
  leeching_strike:'leeching_strike_plus', empower:'empower_plus', expose:'expose_plus',
  berserker:'berserker_plus', arcane_surge:'arcane_surge_plus', bulwark:'bulwark_plus',
  soul_drain:'soul_drain_plus', whirlwind:'whirlwind_plus', bash:'bash_plus',
};

export const RELICS = {
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

export const RELIC_OFFER_FLOORS = [2, 4];
export const RELIC_OFFER_COUNT = 3;

export const STARTER_DECK = ['strike','strike','strike','strike','strike','defend','defend','defend','defend','bash'];

export const SHOP_POOL = [
  {id:'heavy_strike',rarity:'common'},{id:'quick_slash',rarity:'common'},
  {id:'iron_shield',rarity:'common'},{id:'parry',rarity:'common'},
  {id:'fireball',rarity:'uncommon'},{id:'counter',rarity:'uncommon'},
  {id:'hex',rarity:'uncommon'},{id:'leeching_strike',rarity:'uncommon'},
  {id:'empower',rarity:'uncommon'},{id:'expose',rarity:'uncommon'},
  {id:'berserker',rarity:'rare'},{id:'arcane_surge',rarity:'rare'},
  {id:'bulwark',rarity:'rare'},{id:'soul_drain',rarity:'rare'},{id:'whirlwind',rarity:'rare'},
];

export const CARD_COST = { starter:0, common:30, uncommon:60, rare:120 };
export const SHOP_SLOTS = 4;
export const SHOP_REFRESH_COST = 20;

export const ENEMIES = {
  rat:          {id:'rat',          name:'Sewer Rat',      maxHp:12,  floor:1, icon:'🐀', pattern:[{type:'attack',value:3,label:'Gnaw'}]},
  goblin:       {id:'goblin',       name:'Goblin Scout',   maxHp:22,  floor:1, icon:'👺', pattern:[{type:'attack',value:5,label:'Stab'},{type:'attack',value:5,label:'Stab'},{type:'block',value:6,label:'Dodge'}]},
  bandit:       {id:'bandit',       name:'Bandit',         maxHp:32,  floor:2, icon:'👤', pattern:[{type:'attack',value:7,label:'Slash'},{type:'attack',value:7,label:'Slash'},{type:'attack',value:13,label:'Power Strike'}]},
  skeleton:     {id:'skeleton',     name:'Skeleton',       maxHp:28,  floor:2, icon:'💀', sprite:'sprite-skeleton', pattern:[{type:'block',value:8,label:'Raise Shield'},{type:'attack',value:8,label:'Bone Strike'},{type:'attack',value:8,label:'Bone Strike'}]},
  orc:          {id:'orc',          name:'Orc Warrior',    maxHp:48,  floor:3, icon:'👹', pattern:[{type:'attack',value:9,label:'Cleave'},{type:'attack',value:9,label:'Cleave'},{type:'attack',value:16,label:'Crushing Blow'},{type:'block',value:10,label:'Brace'}]},
  mushroom:     {id:'mushroom',     name:'Spore Mushroom', maxHp:38,  floor:3, icon:'🍄', pattern:[{type:'attack',value:7,label:'Spore Burst'},{type:'buff',buffType:'regen',value:4,label:'Regenerate'},{type:'attack',value:7,label:'Spore Burst'}]},
  dark_knight:  {id:'dark_knight',  name:'Dark Knight',    maxHp:62,  floor:4, icon:'⚔️', pattern:[{type:'block',value:12,label:'Iron Guard'},{type:'attack',value:11,label:'Dark Slash'},{type:'attack',value:11,label:'Dark Slash'},{type:'attack',value:18,label:'Void Strike'}]},
  necromancer:  {id:'necromancer',  name:'Necromancer',    maxHp:52,  floor:4, icon:'🧙', pattern:[{type:'attack',value:9,label:'Death Touch'},{type:'buff',buffType:'strength',value:2,label:'Dark Ritual'},{type:'attack',value:9,label:'Death Touch'},{type:'attack',value:14,label:'Soul Rend'}]},
  goblin_king:  {id:'goblin_king',  name:'Goblin King',    maxHp:120, floor:5, isBoss:true, icon:'🤴', pattern:[{type:'attack',value:12,label:'Royal Slash'},{type:'attack',value:12,label:'Royal Slash'},{type:'attack',value:22,label:'Throne Smash'},{type:'buff',buffType:'strength',value:3,label:'War Cry'}]},
  lich:         {id:'lich',         name:'Ancient Lich',   maxHp:100, floor:5, isBoss:true, icon:'🧙‍♂️', pattern:[{type:'attack',value:10,label:'Bone Shard'},{type:'buff',buffType:'regen',value:5,label:'Undying'},{type:'attack',value:18,label:'Death Ray'},{type:'buff',buffType:'strength',value:2,label:'Power Surge'},{type:'attack',value:10,label:'Bone Shard'}]},
};

export const FLOOR_ENEMIES = {
  1:['rat','goblin'], 2:['rat','goblin'], 3:['bandit','skeleton'], 4:['bandit','skeleton'],
  5:['orc','mushroom'], 6:['orc','mushroom'], 7:['orc','mushroom'],
  8:['dark_knight','necromancer'], 9:['dark_knight','necromancer'], 10:['dark_knight','necromancer'],
  11:['dark_knight','necromancer'], 12:['dark_knight','necromancer'], 13:['dark_knight','necromancer'],
  14:['goblin_king','lich'], 15:['goblin_king','lich']
};

export const TOTAL_FLOORS = 45;
export const MAP_WIDTH = 4;

export const NODE_ICONS = {
  monster: '⚔️',
  rest: '🔥',
  treasure: '💎',
  shop: '💰',
  event: '❓',
  boss: '👑'
};

export const BUILDINGS = [
  {id:'gold_mine',    name:'Gold Mine',      description:'Generates gold over time.',    resource:'gold',    baseRate:1,    baseCost:50,  costMultiplier:3, maxLevel:5},
  {id:'essence_shrine',name:'Essence Shrine',description:'Slowly generates essence.',   resource:'essence', baseRate:0.05, baseCost:500, costMultiplier:5, maxLevel:3},
];

export const META_UPGRADES = [
  {id:'max_hp',        name:'Vitality',       description:'+10 max HP per level.',              baseCost:5,  costMultiplier:2, maxLevel:5},
  {id:'start_gold',    name:'Treasure Hunter',description:'Start each run with +50 gold.',      baseCost:3,  costMultiplier:2, maxLevel:5},
  {id:'extra_energy',  name:'Focus',          description:'+1 energy per turn (max +2).',       baseCost:10, costMultiplier:3, maxLevel:2},
  {id:'better_rewards',name:'Bounty Hunter',  description:'+20% gold from combat per level.',   baseCost:4,  costMultiplier:2, maxLevel:3},
];

export const COMBAT_GOLD_BASE = 15;
export const RUN_ESSENCE_BASE = 10;
export const RUN_ESSENCE_PER_FLOOR = 5;

export const BGM_PATH = 'assets/soundtracks/';
export const SFX_ATTACK = [
  'assets/SFX/sword_hit_1_sfx.mp3',
  'assets/SFX/sword_hit_2_sfx.mp3',
  'assets/SFX/sword_hit_3.wav',
  'assets/SFX/sword_hit_4.mp3'
];
export const SFX_DEATH = 'assets/SFX/death_sfx.wav';
export const SFX_SHIELD = 'assets/SFX/shield_sfx_1.wav';
export const SFX_ENEMY_DEATH = [
  'assets/SFX/enemy_death_sfx_1.wav',
  'assets/SFX/enemy_death_sfx_2.wav'
];
export const SFX_ENEMY_ATTACK = 'assets/SFX/enemy_attack_sfx_1.wav';
