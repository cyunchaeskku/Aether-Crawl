// src/data.js — All static game data

export const CARDS = {
  // ── Starter ──────────────────────────────────────────────
  strike: {
    id: 'strike', name: 'Strike', cost: 1, rarity: 'starter', type: 'attack',
    description: 'Deal 6 damage.',
    effect: { damage: 6 }
  },
  defend: {
    id: 'defend', name: 'Defend', cost: 1, rarity: 'starter', type: 'defense',
    description: 'Gain 5 block.',
    effect: { block: 5 }
  },

  // ── Common ───────────────────────────────────────────────
  heavy_strike: {
    id: 'heavy_strike', name: 'Heavy Strike', cost: 2, rarity: 'common', type: 'attack',
    description: 'Deal 14 damage.',
    effect: { damage: 14 }
  },
  quick_slash: {
    id: 'quick_slash', name: 'Quick Slash', cost: 1, rarity: 'common', type: 'attack',
    description: 'Deal 4 damage twice.',
    effect: { damage: 4, hits: 2 }
  },
  iron_shield: {
    id: 'iron_shield', name: 'Iron Shield', cost: 2, rarity: 'common', type: 'defense',
    description: 'Gain 12 block.',
    effect: { block: 12 }
  },
  parry: {
    id: 'parry', name: 'Parry', cost: 1, rarity: 'common', type: 'defense',
    description: 'Gain 3 block. Draw 1 card.',
    effect: { block: 3, draw: 1 }
  },

  // ── Uncommon ─────────────────────────────────────────────
  fireball: {
    id: 'fireball', name: 'Fireball', cost: 2, rarity: 'uncommon', type: 'magic',
    description: 'Deal 20 damage.',
    effect: { damage: 20 }
  },
  counter: {
    id: 'counter', name: 'Counter', cost: 2, rarity: 'uncommon', type: 'skill',
    description: 'Gain 6 block. Deal 6 damage.',
    effect: { block: 6, damage: 6 }
  },
  hex: {
    id: 'hex', name: 'Hex', cost: 1, rarity: 'uncommon', type: 'magic',
    description: 'Apply 2 Weak to enemy.',
    effect: { weak: 2 }
  },
  leeching_strike: {
    id: 'leeching_strike', name: 'Leeching Strike', cost: 2, rarity: 'uncommon', type: 'attack',
    description: 'Deal 10 damage. Heal 4 HP.',
    effect: { damage: 10, heal: 4 }
  },
  empower: {
    id: 'empower', name: 'Empower', cost: 1, rarity: 'uncommon', type: 'skill',
    description: 'Gain 2 Strength this run.',
    effect: { strength: 2 }
  },
  vulnerable_strike: {
    id: 'vulnerable_strike', name: 'Expose', cost: 1, rarity: 'uncommon', type: 'attack',
    description: 'Deal 5 damage. Apply 2 Vulnerable.',
    effect: { damage: 5, vulnerable: 2 }
  },

  // ── Rare ─────────────────────────────────────────────────
  berserker: {
    id: 'berserker', name: 'Berserker', cost: 2, rarity: 'rare', type: 'attack',
    description: 'Deal 8 damage. Gain 1 energy.',
    effect: { damage: 8, energy: 1 }
  },
  arcane_surge: {
    id: 'arcane_surge', name: 'Arcane Surge', cost: 3, rarity: 'rare', type: 'magic',
    description: 'Deal 35 damage.',
    effect: { damage: 35 }
  },
  bulwark: {
    id: 'bulwark', name: 'Bulwark', cost: 2, rarity: 'rare', type: 'defense',
    description: 'Gain 20 block. Draw 1 card.',
    effect: { block: 20, draw: 1 }
  },
  soul_drain: {
    id: 'soul_drain', name: 'Soul Drain', cost: 2, rarity: 'rare', type: 'magic',
    description: 'Deal 15 damage. Heal 8 HP.',
    effect: { damage: 15, heal: 8 }
  },
  whirlwind: {
    id: 'whirlwind', name: 'Whirlwind', cost: 0, rarity: 'rare', type: 'attack',
    description: 'Deal 5 damage for each energy spent (spends all remaining energy).',
    special: 'whirlwind',
    effect: {}
  }
};

export const STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend'
];

export const SHOP_POOL = [
  { id: 'heavy_strike', rarity: 'common' },
  { id: 'quick_slash',  rarity: 'common' },
  { id: 'iron_shield',  rarity: 'common' },
  { id: 'parry',        rarity: 'common' },
  { id: 'fireball',         rarity: 'uncommon' },
  { id: 'counter',          rarity: 'uncommon' },
  { id: 'hex',              rarity: 'uncommon' },
  { id: 'leeching_strike',  rarity: 'uncommon' },
  { id: 'empower',          rarity: 'uncommon' },
  { id: 'vulnerable_strike',rarity: 'uncommon' },
  { id: 'berserker',    rarity: 'rare' },
  { id: 'arcane_surge', rarity: 'rare' },
  { id: 'bulwark',      rarity: 'rare' },
  { id: 'soul_drain',   rarity: 'rare' },
  { id: 'whirlwind',    rarity: 'rare' }
];

export const CARD_COST = { starter: 0, common: 30, uncommon: 60, rare: 120 };

export const ENEMIES = {
  // Floor 1
  rat: {
    id: 'rat', name: 'Sewer Rat', maxHp: 12, floor: 1,
    pattern: [
      { type: 'attack', value: 3, label: 'Gnaw' }
    ]
  },
  goblin: {
    id: 'goblin', name: 'Goblin Scout', maxHp: 22, floor: 1,
    pattern: [
      { type: 'attack', value: 5, label: 'Stab' },
      { type: 'attack', value: 5, label: 'Stab' },
      { type: 'block',  value: 6, label: 'Dodge' }
    ]
  },
  // Floor 2
  bandit: {
    id: 'bandit', name: 'Bandit', maxHp: 32, floor: 2,
    pattern: [
      { type: 'attack', value: 7,  label: 'Slash' },
      { type: 'attack', value: 7,  label: 'Slash' },
      { type: 'attack', value: 13, label: 'Power Strike' }
    ]
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', maxHp: 28, floor: 2,
    pattern: [
      { type: 'block',  value: 8, label: 'Raise Shield' },
      { type: 'attack', value: 8, label: 'Bone Strike' },
      { type: 'attack', value: 8, label: 'Bone Strike' }
    ]
  },
  // Floor 3
  orc: {
    id: 'orc', name: 'Orc Warrior', maxHp: 48, floor: 3,
    pattern: [
      { type: 'attack', value: 9,  label: 'Cleave' },
      { type: 'attack', value: 9,  label: 'Cleave' },
      { type: 'attack', value: 16, label: 'Crushing Blow' },
      { type: 'block',  value: 10, label: 'Brace' }
    ]
  },
  mushroom: {
    id: 'mushroom', name: 'Spore Mushroom', maxHp: 38, floor: 3,
    pattern: [
      { type: 'attack', value: 7, label: 'Spore Burst' },
      { type: 'buff', buffType: 'regen', value: 4, label: 'Regenerate' },
      { type: 'attack', value: 7, label: 'Spore Burst' }
    ]
  },
  // Floor 4
  dark_knight: {
    id: 'dark_knight', name: 'Dark Knight', maxHp: 62, floor: 4,
    pattern: [
      { type: 'block',  value: 12, label: 'Iron Guard' },
      { type: 'attack', value: 11, label: 'Dark Slash' },
      { type: 'attack', value: 11, label: 'Dark Slash' },
      { type: 'attack', value: 18, label: 'Void Strike' }
    ]
  },
  necromancer: {
    id: 'necromancer', name: 'Necromancer', maxHp: 52, floor: 4,
    pattern: [
      { type: 'attack', value: 9, label: 'Death Touch' },
      { type: 'buff', buffType: 'strength', value: 2, label: 'Dark Ritual' },
      { type: 'attack', value: 9, label: 'Death Touch' },
      { type: 'attack', value: 14, label: 'Soul Rend' }
    ]
  },
  // Floor 5 (bosses)
  goblin_king: {
    id: 'goblin_king', name: 'Goblin King', maxHp: 120, floor: 5, isBoss: true,
    pattern: [
      { type: 'attack', value: 12, label: 'Royal Slash' },
      { type: 'attack', value: 12, label: 'Royal Slash' },
      { type: 'attack', value: 22, label: 'Throne Smash' },
      { type: 'buff', buffType: 'strength', value: 3, label: 'War Cry' }
    ]
  },
  lich: {
    id: 'lich', name: 'Ancient Lich', maxHp: 100, floor: 5, isBoss: true,
    pattern: [
      { type: 'attack', value: 10, label: 'Bone Shard' },
      { type: 'buff', buffType: 'regen', value: 5, label: 'Undying' },
      { type: 'attack', value: 18, label: 'Death Ray' },
      { type: 'buff', buffType: 'strength', value: 2, label: 'Power Surge' },
      { type: 'attack', value: 10, label: 'Bone Shard' }
    ]
  }
};

export const FLOOR_ENEMIES = {
  1: ['rat', 'goblin'],
  2: ['bandit', 'skeleton'],
  3: ['orc', 'mushroom'],
  4: ['dark_knight', 'necromancer'],
  5: ['goblin_king', 'lich']
};

export const TOTAL_FLOORS = 5;

export const BUILDINGS = [
  {
    id: 'gold_mine', name: 'Gold Mine',
    description: 'Generates gold over time.',
    resource: 'gold', baseRate: 1, baseCost: 50, costMultiplier: 3, maxLevel: 5
  },
  {
    id: 'mana_well', name: 'Mana Well',
    description: 'Generates mana over time.',
    resource: 'mana', baseRate: 0.5, baseCost: 100, costMultiplier: 3, maxLevel: 5
  },
  {
    id: 'essence_shrine', name: 'Essence Shrine',
    description: 'Slowly generates essence.',
    resource: 'essence', baseRate: 0.05, baseCost: 500, costMultiplier: 5, maxLevel: 3
  }
];

export const META_UPGRADES = [
  {
    id: 'max_hp', name: 'Vitality',
    description: '+10 max HP per level.',
    baseCost: 5, costMultiplier: 2, maxLevel: 5,
    apply: (state, level) => { /* handled in engine */ }
  },
  {
    id: 'start_gold', name: 'Treasure Hunter',
    description: 'Start each run with +50 gold.',
    baseCost: 3, costMultiplier: 2, maxLevel: 5
  },
  {
    id: 'extra_energy', name: 'Focus',
    description: '+1 energy per turn (max +2).',
    baseCost: 10, costMultiplier: 3, maxLevel: 2
  },
  {
    id: 'better_rewards', name: 'Bounty Hunter',
    description: '+20% gold from combat per level.',
    baseCost: 4, costMultiplier: 2, maxLevel: 3
  }
];

export const SHOP_REFRESH_COST = 20;
export const SHOP_SLOTS = 4;

// Gold reward per combat: BASE * floor
export const COMBAT_GOLD_BASE = 15;
// Essence per run = 10 + 5*(floorsCleared-1)
export const RUN_ESSENCE_BASE = 10;
export const RUN_ESSENCE_PER_FLOOR = 5;
