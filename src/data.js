// src/data.js — All static game data

export const CARDS = {
  // Starter
  bash:              { id:'bash',              name:'Bash',             cost:2, rarity:'starter',  type:'attack', description:'Deal 8 damage. Apply 2 Vulnerable.',                              effect:{damage:8, vulnerable:2} },
  strike:            { id:'strike',            name:'Strike',           cost:1, rarity:'starter',  type:'attack', description:'Deal 6 damage.',                                                 effect:{damage:6} },
  defend:            { id:'defend',            name:'Defend',           cost:1, rarity:'starter',  type:'defend', description:'Gain 5 Block.',                                                 effect:{block:5} },

  // Common
  anger:             { id:'anger',             name:'Anger',            cost:0, rarity:'common',   type:'attack', description:'Deal 6 damage. Add a copy to discard pile.',                         effect:{damage:6}, special:'anger' },
  armaments:         { id:'armaments',         name:'Armaments',        cost:1, rarity:'common',   type:'skill',  description:'Gain 5 Block. Upgrade a card in hand this combat.',               effect:{block:5}, special:'armaments' },
  body_slam:         { id:'body_slam',         name:'Body Slam',        cost:1, rarity:'common',   type:'attack', description:'Deal damage equal to your current Block.',                       effect:{}, special:'body_slam' },
  clash:             { id:'clash',             name:'Clash',            cost:0, rarity:'common',   type:'attack', description:'Play only if hand contains only Attacks. Deal 14 damage.',        effect:{damage:14}, special:'clash' },
  cleave:            { id:'cleave',            name:'Cleave',           cost:1, rarity:'common',   type:'attack', description:'Deal 8 damage to ALL enemies.',                                   effect:{damage:8, aoe:true} },
  clothesline:       { id:'clothesline',       name:'Clothesline',      cost:2, rarity:'common',   type:'attack', description:'Deal 12 damage. Apply 2 Weak.',                                   effect:{damage:12, weak:2} },
  flex:              { id:'flex',              name:'Flex',             cost:0, rarity:'common',   type:'skill',  description:'Gain 2 Strength. Lose 2 Strength at end of turn.',                  effect:{}, special:'flex' },
  havoc:             { id:'havoc',             name:'Havoc',            cost:1, rarity:'common',   type:'skill',  description:'Play top card of draw pile. Exhaust it.',                             effect:{}, special:'havoc' },
  headbutt:          { id:'headbutt',          name:'Headbutt',         cost:1, rarity:'common',   type:'attack', description:'Deal 9 damage. Put a card from discard on top of draw pile.',      effect:{damage:9}, special:'headbutt' },
  heavy_blade:       { id:'heavy_blade',       name:'Heavy Blade',      cost:2, rarity:'common',   type:'attack', description:'Deal 14 damage. Strength is applied 3 times.',                    effect:{damage:14}, special:'heavy_blade' },
  iron_wave:         { id:'iron_wave',         name:'Iron Wave',        cost:1, rarity:'common',   type:'attack', description:'Gain 5 Block. Deal 5 damage.',                                   effect:{damage:5, block:5} },
  perfected_strike:  { id:'perfected_strike',  name:'Perfected Strike', cost:2, rarity:'common',   type:'attack', description:'Deal 6 damage (+2 per Strike card in deck).',                     effect:{}, special:'perfected_strike' },
  pommel_strike:     { id:'pommel_strike',     name:'Pommel Strike',    cost:1, rarity:'common',   type:'attack', description:'Deal 9 damage. Draw 1 card.',                                      effect:{damage:9, draw:1} },
  shrug_it_off:      { id:'shrug_it_off',      name:'Shrug It Off',     cost:1, rarity:'common',   type:'skill',  description:'Gain 8 Block. Draw 1 card.',                                      effect:{block:8, draw:1} },
  sword_boomerang:   { id:'sword_boomerang',   name:'Sword Boomerang',  cost:1, rarity:'common',   type:'attack', description:'Deal 3 damage to random enemy 3 times.',                            effect:{}, special:'sword_boomerang' },
  thunderclap:       { id:'thunderclap',       name:'Thunderclap',      cost:1, rarity:'common',   type:'attack', description:'Deal 4 damage and apply 1 Vulnerable to ALL enemies.',             effect:{damage:4, vulnerable:1, aoe:true} },
  true_grit:         { id:'true_grit',         name:'True Grit',        cost:1, rarity:'common',   type:'skill',  description:'Gain 7 Block. Exhaust a random card in hand.',                       effect:{block:7}, special:'true_grit' },
  twin_strike:       { id:'twin_strike',       name:'Twin Strike',      cost:1, rarity:'common',   type:'attack', description:'Deal 5 damage twice.',                                             effect:{damage:5, hits:2} },
  warcry:            { id:'warcry',            name:'Warcry',           cost:0, rarity:'common',   type:'skill',  exhaust:true, description:'Draw 1 card. Put a card from hand on top of draw pile. Exhaust.', effect:{draw:1}, special:'warcry' },
  wild_strike:       { id:'wild_strike',       name:'Wild Strike',      cost:1, rarity:'common',   type:'attack', description:'Deal 12 damage. Shuffle a Wound into draw pile.',                    effect:{damage:12}, special:'wild_strike' },

  // Uncommon
  battle_trance:     { id:'battle_trance',     name:'Battle Trance',    cost:0, rarity:'uncommon', type:'skill',  description:'Draw 3 cards. Cannot draw additional cards this turn.',              effect:{draw:3}, special:'battle_trance' },
  blood_for_blood:   { id:'blood_for_blood',   name:'Blood for Blood',  cost:4, rarity:'uncommon', type:'attack', description:'Deal 18 damage. Costs 1 less for each HP lost this combat.',          effect:{damage:18}, special:'blood_for_blood' },
  bloodletting:      { id:'bloodletting',      name:'Bloodletting',     cost:0, rarity:'uncommon', type:'skill',  description:'Lose 3 HP. Gain 2 Energy.',                                       effect:{}, special:'bloodletting' },
  burning_pact:      { id:'burning_pact',      name:'Burning Pact',     cost:1, rarity:'uncommon', type:'skill',  description:'Exhaust a card. Draw 2 cards.',                                  effect:{draw:2}, special:'burning_pact' },
  carnage:           { id:'carnage',           name:'Carnage',          cost:2, rarity:'uncommon', type:'attack', ethereal:true, description:'Ethereal. Deal 20 damage.',                                     effect:{damage:20} },
  combust:           { id:'combust',           name:'Combust',          cost:1, rarity:'uncommon', type:'power',  description:'End of turn: lose 1 HP, deal 5 damage to ALL enemies.',               effect:{}, special:'power_combust' },
  dark_embrace:      { id:'dark_embrace',      name:'Dark Embrace',     cost:2, rarity:'uncommon', type:'power',  description:'Whenever a card is Exhausted, draw 1 card.',                          effect:{}, special:'power_dark_embrace' },
  disarm:            { id:'disarm',            name:'Disarm',           cost:1, rarity:'uncommon', type:'skill',  exhaust:true, description:'Enemy loses 2 Strength. Exhaust.',                                effect:{target:'enemy'}, special:'disarm' },
  dropkick:          { id:'dropkick',          name:'Dropkick',         cost:1, rarity:'uncommon', type:'attack', description:'If enemy is Vulnerable, deal 5 damage, gain 1 Energy and draw 1 card.', effect:{damage:5}, special:'dropkick' },
  dual_wield:        { id:'dual_wield',        name:'Dual Wield',       cost:1, rarity:'uncommon', type:'skill',  description:'Create a copy of an Attack or Power in hand.',                        effect:{}, special:'dual_wield' },
  entrench:          { id:'entrench',          name:'Entrench',         cost:2, rarity:'uncommon', type:'skill',  description:'Double your current Block.',                                     effect:{}, special:'entrench' },
  evolve:            { id:'evolve',            name:'Evolve',           cost:1, rarity:'uncommon', type:'power',  description:'When drawing a Status card, draw 1 card.',                            effect:{}, special:'power_evolve' },
  feel_no_pain:      { id:'feel_no_pain',      name:'Feel No Pain',     cost:1, rarity:'uncommon', type:'power',  description:'When a card is Exhausted, gain 3 Block.',                             effect:{}, special:'power_feel_no_pain' },
  flame_barrier:     { id:'flame_barrier',     name:'Flame Barrier',    cost:2, rarity:'uncommon', type:'skill',  description:'Gain 12 Block. When attacked, deal 4 damage back.',                   effect:{block:12}, special:'flame_barrier' },
  ghostly_armor:     { id:'ghostly_armor',     name:'Ghostly Armor',    cost:1, rarity:'uncommon', type:'skill',  ethereal:true, description:'Ethereal. Gain 10 Block.',                                       effect:{block:10} },
  hemokinesis:       { id:'hemokinesis',       name:'Hemokinesis',      cost:1, rarity:'uncommon', type:'attack', description:'Lose 2 HP. Deal 15 damage.',                                      effect:{damage:15}, special:'hemokinesis' },
  infernal_blade:    { id:'infernal_blade',    name:'Infernal Blade',   cost:1, rarity:'uncommon', type:'skill',  exhaust:true, description:'Add a random Attack to hand. It costs 0 this turn. Exhaust.',      effect:{}, special:'infernal_blade' },
  inflame:           { id:'inflame',           name:'Inflame',          cost:1, rarity:'uncommon', type:'power',  description:'Gain 2 Strength.',                                               effect:{strength:2} },
  intimidate:        { id:'intimidate',        name:'Intimidate',       cost:0, rarity:'uncommon', type:'skill',  exhaust:true, description:'Apply 1 Weak to ALL enemies. Exhaust.',                          effect:{weak:1, aoe:true} },
  metallicize:       { id:'metallicize',       name:'Metallicize',      cost:1, rarity:'uncommon', type:'power',  description:'End of turn: gain 3 Block.',                                     effect:{}, special:'power_metallicize' },
  power_through:     { id:'power_through',     name:'Power Through',    cost:1, rarity:'uncommon', type:'skill',  description:'Gain 15 Block. Add 2 Wounds to hand.',                              effect:{block:15}, special:'power_through' },
  pummel:            { id:'pummel',            name:'Pummel',           cost:1, rarity:'uncommon', type:'attack', exhaust:true, description:'Deal 2 damage 4 times. Exhaust.',                                effect:{damage:2, hits:4} },
  rampage:           { id:'rampage',           name:'Rampage',          cost:1, rarity:'uncommon', type:'attack', description:'Deal 8 damage. Increases by 5 each time played this combat.',        effect:{}, special:'rampage' },
  reckless_charge:   { id:'reckless_charge',   name:'Reckless Charge',  cost:0, rarity:'uncommon', type:'attack', description:'Deal 7 damage. Shuffle a Dazed into draw pile.',                     effect:{damage:7}, special:'reckless_charge' },
  rupture:           { id:'rupture',           name:'Rupture',          cost:1, rarity:'uncommon', type:'power',  description:'When you lose HP from a card, gain 1 Strength.',                     effect:{}, special:'power_rupture' },
  searing_blow:      { id:'searing_blow',      name:'Searing Blow',     cost:2, rarity:'uncommon', type:'attack', description:'Deal 12 damage. Can be upgraded multiple times.',                    effect:{damage:12} },
  second_wind:       { id:'second_wind',       name:'Second Wind',      cost:1, rarity:'uncommon', type:'skill',  description:'Exhaust all non-Attack cards. Gain 5 Block each.',                   effect:{}, special:'second_wind' },
  seeing_red:        { id:'seeing_red',        name:'Seeing Red',       cost:1, rarity:'uncommon', type:'skill',  exhaust:true, description:'Gain 2 Energy. Exhaust.',                                         effect:{energy:2} },
  sentinel:          { id:'sentinel',          name:'Sentinel',         cost:1, rarity:'uncommon', type:'skill',  description:'Gain 5 Block. If Exhausted, gain 2 Energy.',                          effect:{block:5}, special:'sentinel' },
  sever_soul:        { id:'sever_soul',        name:'Sever Soul',       cost:2, rarity:'uncommon', type:'attack', description:'Exhaust all non-Attack cards in hand. Deal 16 damage.',               effect:{damage:16}, special:'sever_soul' },
  spot_weakness:     { id:'spot_weakness',     name:'Spot Weakness',    cost:1, rarity:'uncommon', type:'skill',  description:'If enemy intends to attack, gain 3 Strength.',                         effect:{target:'enemy'}, special:'spot_weakness' },
  uppercut:          { id:'uppercut',          name:'Uppercut',         cost:2, rarity:'uncommon', type:'attack', description:'Deal 13 damage. Apply 1 Weak and 1 Vulnerable.',                      effect:{damage:13, weak:1, vulnerable:1} },
  whirlwind:         { id:'whirlwind',         name:'Whirlwind',        cost:0, rarity:'uncommon', type:'attack', description:'Deal 5 damage to ALL enemies X times.',                               effect:{}, special:'whirlwind' },

  // Rare
  barricade:         { id:'barricade',         name:'Barricade',        cost:3, rarity:'rare',     type:'power',  description:'Block is not removed at end of turn.',                                 effect:{}, special:'power_barricade' },
  berserk:           { id:'berserk',           name:'Berserk',          cost:0, rarity:'rare',     type:'power',  description:'Gain 1 Vulnerable. Start turns with +1 Energy.',                       effect:{}, special:'power_berserk' },
  bludgeon:          { id:'bludgeon',          name:'Bludgeon',         cost:3, rarity:'rare',     type:'attack', description:'Deal 32 damage.',                                                effect:{damage:32} },
  brutality:         { id:'brutality',         name:'Brutality',        cost:0, rarity:'rare',     type:'power',  description:'Start of turn: lose 1 HP, draw 1 card.',                                effect:{}, special:'power_brutality' },
  corruption:        { id:'corruption',        name:'Corruption',       cost:3, rarity:'rare',     type:'power',  description:'Skills cost 0. Playing a Skill Exhausts it.',                           effect:{}, special:'power_corruption' },
  demon_form:        { id:'demon_form',        name:'Demon Form',       cost:3, rarity:'rare',     type:'power',  description:'Start of turn: gain 2 Strength.',                                       effect:{}, special:'power_demon_form' },
  double_tap:        { id:'double_tap',        name:'Double Tap',       cost:1, rarity:'rare',     type:'skill',  description:'Your next Attack is played twice.',                                      effect:{}, special:'double_tap' },
  exhume:            { id:'exhume',            name:'Exhume',           cost:1, rarity:'rare',     type:'skill',  exhaust:true, description:'Put an Exhausted card into hand. Exhaust.',                          effect:{}, special:'exhume' },
  feed:              { id:'feed',              name:'Feed',             cost:1, rarity:'rare',     type:'attack', exhaust:true, description:'Deal 10 damage. If fatal, gain 3 Max HP. Exhaust.',                  effect:{damage:10}, special:'feed' },
  fiend_fire:        { id:'fiend_fire',        name:'Fiend Fire',       cost:2, rarity:'rare',     type:'attack', description:'Exhaust all cards in hand. Deal 7 damage per card.',               effect:{}, special:'fiend_fire' },
  immolate:          { id:'immolate',          name:'Immolate',         cost:2, rarity:'rare',     type:'attack', description:'Deal 21 damage to ALL enemies. Add a Burn to discard.',              effect:{damage:21, aoe:true}, special:'immolate' },
  impervious:        { id:'impervious',        name:'Impervious',       cost:2, rarity:'rare',     type:'skill',  exhaust:true, description:'Gain 30 Block. Exhaust.',                                            effect:{block:30} },
  juggernaut:        { id:'juggernaut',        name:'Juggernaut',       cost:2, rarity:'rare',     type:'power',  description:'When you gain Block, deal 5 damage to random enemy.',                   effect:{}, special:'power_juggernaut' },
  limit_break:       { id:'limit_break',       name:'Limit Break',      cost:1, rarity:'rare',     type:'skill',  exhaust:true, description:'Double your Strength. Exhaust.',                                      effect:{}, special:'limit_break' },
  offering:          { id:'offering',          name:'Offering',         cost:0, rarity:'rare',     type:'skill',  exhaust:true, description:'Lose 6 HP. Gain 2 Energy. Draw 3 cards. Exhaust.',                  effect:{draw:3, energy:2}, special:'offering' },
  reaper:            { id:'reaper',            name:'Reaper',           cost:2, rarity:'rare',     type:'attack', exhaust:true, description:'Deal 4 damage to ALL enemies. Heal equal to unblocked damage. Exhaust.', effect:{damage:4, aoe:true}, special:'reaper' },
  shockwave:         { id:'shockwave',         name:'Shockwave',        cost:2, rarity:'rare',     type:'skill',  exhaust:true, description:'Apply 3 Weak and 3 Vulnerable to ALL enemies. Exhaust.',             effect:{weak:3, vulnerable:3, aoe:true} },

  // Upgraded starter variants
  strike_plus:       { id:'strike_plus',       name:'Strike+',          cost:1, rarity:'starter',  type:'attack', upgraded:true, description:'Deal 9 damage.', effect:{damage:9} },
  defend_plus:       { id:'defend_plus',       name:'Defend+',          cost:1, rarity:'starter',  type:'defend', upgraded:true, description:'Gain 8 Block.', effect:{block:8} },
  bash_plus:         { id:'bash_plus',         name:'Bash+',            cost:2, rarity:'starter',  type:'attack', upgraded:true, description:'Deal 10 damage. Apply 3 Vulnerable.', effect:{damage:10, vulnerable:3} },

  // Utility / Status
  miracle:           { id:'miracle',           name:'Miracle',          cost:0, rarity:'special',  type:'skill',  exhaust:true, description:'Gain 1 Energy. Exhaust.', effect:{energy:1} },
  curse:             { id:'curse',             name:'Curse',            cost:0, rarity:'curse',    type:'curse',  unplayable:true, description:'Unplayable.', effect:{} },
  doubt:             { id:'doubt',             name:'Doubt',            cost:0, rarity:'curse',    type:'curse',  unplayable:true, description:'Unplayable.', effect:{} },
  wound:             { id:'wound',             name:'Wound',            cost:0, rarity:'status',   type:'status', unplayable:true, description:'Unplayable.', effect:{} },
  dazed:             { id:'dazed',             name:'Dazed',            cost:0, rarity:'status',   type:'status', unplayable:true, ethereal:true, description:'Unplayable. Ethereal.', effect:{} },
  burn:              { id:'burn',              name:'Burn',             cost:0, rarity:'status',   type:'status', unplayable:true, description:'Unplayable. When drawn, lose 2 HP.', effect:{} },
};

export const CARD_UPGRADES = {
  strike:'strike_plus',
  defend:'defend_plus',
  bash:'bash_plus',
};

const AUTO_UPGRADE_EXCLUDED_RARITIES = new Set(['curse', 'status', 'special']);

function createAutoUpgradeCard(baseCard, upgradedId) {
  const upgraded = {
    ...baseCard,
    id: upgradedId,
    name: baseCard.name + '+',
    upgraded: true,
    effect: { ...(baseCard.effect || {}) },
  };

  const effectDelta = {
    damage: 3,
    block: 3,
    weak: 1,
    vulnerable: 1,
    strength: 1,
    dexterity: 1,
    draw: 1,
    energy: 1,
    hits: 1,
  };

  let improved = false;
  Object.keys(effectDelta).forEach((key) => {
    if (typeof upgraded.effect[key] === 'number') {
      upgraded.effect[key] += effectDelta[key];
      improved = true;
    }
  });

  if (!improved && typeof upgraded.cost === 'number' && upgraded.cost > 0) {
    upgraded.cost -= 1;
    improved = true;
  }

  if (improved && typeof upgraded.description === 'string') {
    upgraded.description = upgraded.description + ' (Upgraded)';
  }

  return upgraded;
}

function addAutoCardUpgrades() {
  const baseIds = Object.keys(CARDS);
  baseIds.forEach((id) => {
    const card = CARDS[id];
    if (!card || card.upgraded) return;
    if (AUTO_UPGRADE_EXCLUDED_RARITIES.has(card.rarity)) return;
    if (CARD_UPGRADES[id]) return;

    const upgradedId = id + '_plus';
    if (!CARDS[upgradedId]) {
      CARDS[upgradedId] = createAutoUpgradeCard(card, upgradedId);
    }
    CARD_UPGRADES[id] = upgradedId;
  });
}

addAutoCardUpgrades();

export const RELICS = {
  // Starter
  burning_blood:      { id:'burning_blood',      name:'Burning Blood',       rarity:'starter', icon:'🩸', description:'At the end of combat, heal 6 HP.' },
  ring_of_the_snake:  { id:'ring_of_the_snake',  name:'Ring of the Snake',   rarity:'starter', icon:'🐍', description:'At the start of each combat, draw 2 additional cards.' },
  cracked_core:       { id:'cracked_core',       name:'Cracked Core',        rarity:'starter', icon:'⚡', description:'At the start of each combat, Channel 1 Lightning.' },
  pure_water:         { id:'pure_water',         name:'Pure Water',          rarity:'starter', icon:'💧', description:'At the start of each combat, add a Miracle into your hand.' },

  // Common
  akabeko:            { id:'akabeko',            name:'Akabeko',             rarity:'common',  icon:'🐂', description:'Your first Attack each combat deals 8 additional damage.' },
  anchor:             { id:'anchor',             name:'Anchor',              rarity:'common',  icon:'⚓', description:'Start each combat with 10 Block.' },
  ancient_tea_set:    { id:'ancient_tea_set',    name:'Ancient Tea Set',     rarity:'common',  icon:'🍵', description:'Whenever you enter a Rest Site, start the next combat with 2 extra Energy.' },
  art_of_war:         { id:'art_of_war',         name:'Art of War',          rarity:'common',  icon:'🎯', description:'If you do not play any Attacks during your turn, gain an additional Energy next turn.' },
  bag_of_marbles:     { id:'bag_of_marbles',     name:'Bag of Marbles',      rarity:'common',  icon:'🔮', description:'At the start of each combat, apply 1 Vulnerable to ALL enemies.' },
  bag_of_preparation: { id:'bag_of_preparation', name:'Bag of Preparation',  rarity:'common',  icon:'🎒', description:'At the start of each combat, draw 2 additional cards.' },
  blood_vial:         { id:'blood_vial',         name:'Blood Vial',          rarity:'common',  icon:'🧪', description:'At the start of each combat, heal 2 HP.' },
  bronze_scales:      { id:'bronze_scales',      name:'Bronze Scales',       rarity:'common',  icon:'🛡️', description:'Start each combat with 3 Thorns.' },
  centennial_puzzle:  { id:'centennial_puzzle',  name:'Centennial Puzzle',   rarity:'common',  icon:'🧩', description:'The first time you lose HP each combat, draw 3 cards.' },
  ceramic_fish:       { id:'ceramic_fish',       name:'Ceramic Fish',        rarity:'common',  icon:'🐟', description:'Whenever you add a card to your deck, gain 9 Gold.' },
  dream_catcher:      { id:'dream_catcher',      name:'Dream Catcher',       rarity:'common',  icon:'🪶', description:'Whenever you Rest, you may add a card to your deck.' },
  happy_flower:       { id:'happy_flower',       name:'Happy Flower',        rarity:'common',  icon:'🌼', description:'Every 3 turns, gain 1 Energy.' },
  juzu_bracelet:      { id:'juzu_bracelet',      name:'Juzu Bracelet',       rarity:'common',  icon:'📿', description:'Regular enemy combats are no longer encountered in ? rooms.' },
  lantern:            { id:'lantern',            name:'Lantern',             rarity:'common',  icon:'🏮', description:'Gain 1 Energy on the first turn of each combat.' },
  maw_bank:           { id:'maw_bank',           name:'Maw Bank',            rarity:'common',  icon:'🏦', description:'Whenever you climb a floor, gain 12 Gold. (Deactivates if you spend Gold at a shop).' },
  meal_ticket:        { id:'meal_ticket',        name:'Meal Ticket',         rarity:'common',  icon:'🍽️', description:'Whenever you enter a shop, heal 15 HP.' },
  nunchaku:           { id:'nunchaku',           name:'Nunchaku',            rarity:'common',  icon:'🥋', description:'Every time you play 10 Attacks, gain 1 Energy.' },
  oddly_smooth_stone: { id:'oddly_smooth_stone', name:'Oddly Smooth Stone',  rarity:'common',  icon:'🪨', description:'At the start of each combat, gain 1 Dexterity.' },
  omamori:            { id:'omamori',            name:'Omamori',             rarity:'common',  icon:'🧿', description:'Negate the next 2 Curses you obtain.' },
  orichalcum:         { id:'orichalcum',         name:'Orichalcum',          rarity:'common',  icon:'🛡️', description:'If you end your turn without Block, gain 6 Block.' },
  pen_nib:            { id:'pen_nib',            name:'Pen Nib',             rarity:'common',  icon:'🖋️', description:'Every 10th Attack you play deals double damage.' },
  potion_belt:        { id:'potion_belt',        name:'Potion Belt',         rarity:'common',  icon:'🧴', description:'Upon pickup, gain 2 Potion slots.' },
  preserved_insect:   { id:'preserved_insect',   name:'Preserved Insect',    rarity:'common',  icon:'🪲', description:'Enemies in Elite combats have 25% less HP.' },
  regal_pillow:       { id:'regal_pillow',       name:'Regal Pillow',        rarity:'common',  icon:'🛏️', description:'Whenever you Rest, heal an additional 15 HP.' },
  smiling_mask:       { id:'smiling_mask',       name:'Smiling Mask',        rarity:'common',  icon:'🎭', description:'The merchant\'s card removal service now always costs 50 Gold.' },
  strawberry:         { id:'strawberry',         name:'Strawberry',          rarity:'common',  icon:'🍓', description:'Upon pickup, raise your Max HP by 7.' },
  the_boot:           { id:'the_boot',           name:'The Boot',            rarity:'common',  icon:'🥾', description:'Whenever you would deal 4 or less unblocked Attack damage, increase it to 5.' },
  tiny_chest:         { id:'tiny_chest',         name:'Tiny Chest',          rarity:'common',  icon:'🧰', description:'Every 4th ? room is a Treasure room.' },
  toy_ornithopter:    { id:'toy_ornithopter',    name:'Toy Ornithopter',     rarity:'common',  icon:'🦅', description:'Whenever you use a potion, heal 5 HP.' },
  vajra:              { id:'vajra',              name:'Vajra',               rarity:'common',  icon:'⚡', description:'At the start of each combat, gain 1 Strength.' },
  war_paint:          { id:'war_paint',          name:'War Paint',           rarity:'common',  icon:'🎨', description:'Upon pickup, Upgrade 2 random Skills.' },
  whetstone:          { id:'whetstone',          name:'Whetstone',           rarity:'common',  icon:'🪓', description:'Upon pickup, Upgrade 2 random Attacks.' },

  // Uncommon
  blue_candle:        { id:'blue_candle',        name:'Blue Candle',         rarity:'uncommon', icon:'🕯️', description:'Unplayable Curse cards can now be played. Whenever you play a Curse, lose 1 HP and Exhaust it.' },
  bottled_flame:      { id:'bottled_flame',      name:'Bottled Flame',       rarity:'uncommon', icon:'🔥', description:'Upon pickup, choose an Attack card. Start each combat with this card in your hand.' },
  bottled_lightning:  { id:'bottled_lightning',  name:'Bottled Lightning',   rarity:'uncommon', icon:'⚡', description:'Upon pickup, choose a Skill card. Start each combat with this card in your hand.' },
  bottled_tornado:    { id:'bottled_tornado',    name:'Bottled Tornado',     rarity:'uncommon', icon:'🌪️', description:'Upon pickup, choose a Power card. Start each combat with this card in your hand.' },
  eternal_feather:    { id:'eternal_feather',    name:'Eternal Feather',     rarity:'uncommon', icon:'🪶', description:'For every 5 cards in your deck, heal 3 HP whenever you enter a Rest Site.' },
  frozen_egg:         { id:'frozen_egg',         name:'Frozen Egg',          rarity:'uncommon', icon:'🥚', description:'Whenever you add a Power card to your deck, Upgrade it.' },
  molten_egg:         { id:'molten_egg',         name:'Molten Egg',          rarity:'uncommon', icon:'🥚', description:'Whenever you add an Attack card to your deck, Upgrade it.' },
  toxic_egg:          { id:'toxic_egg',          name:'Toxic Egg',           rarity:'uncommon', icon:'🥚', description:'Whenever you add a Skill card to your deck, Upgrade it.' },
  gremlin_horn:       { id:'gremlin_horn',       name:'Gremlin Horn',        rarity:'uncommon', icon:'📯', description:'Whenever an enemy dies, gain 1 Energy and draw 1 card.' },
  ink_bottle:         { id:'ink_bottle',         name:'Ink Bottle',          rarity:'uncommon', icon:'🧪', description:'Whenever you play 10 cards, draw 1 card.' },
  kunai:              { id:'kunai',              name:'Kunai',               rarity:'uncommon', icon:'🗡️', description:'Every time you play 3 Attacks in a single turn, gain 1 Dexterity.' },
  shuriken:           { id:'shuriken',           name:'Shuriken',            rarity:'uncommon', icon:'🌟', description:'Every time you play 3 Attacks in a single turn, gain 1 Strength.' },
  letter_opener:      { id:'letter_opener',      name:'Letter Opener',       rarity:'uncommon', icon:'✉️', description:'Every time you play 3 Skills in a single turn, deal 5 damage to ALL enemies.' },
  matryoshka:         { id:'matryoshka',         name:'Matryoshka',          rarity:'uncommon', icon:'🪆', description:'The next 2 non-boss chests you open contain 2 Relics.' },
  mummified_hand:     { id:'mummified_hand',     name:'Mummified Hand',      rarity:'uncommon', icon:'🖐️', description:'Whenever you play a Power card, a random card in your hand costs 0 that turn.' },
  ornamental_fan:     { id:'ornamental_fan',     name:'Ornamental Fan',      rarity:'uncommon', icon:'🪭', description:'Every time you play 3 Attacks in a single turn, gain 4 Block.' },
  paper_phrog:        { id:'paper_phrog',        name:'Paper Phrog',         rarity:'uncommon', icon:'🐸', description:'Vulnerable now deals 75% more damage instead of 50%.' },
  question_card:      { id:'question_card',      name:'Question Card',       rarity:'uncommon', icon:'❓', description:'On card reward screens, choose from 4 cards instead of 3.' },
  singing_bowl:       { id:'singing_bowl',       name:'Singing Bowl',        rarity:'uncommon', icon:'🥣', description:'When adding a card to your deck, you may instead raise your Max HP by 2.' },
  strike_dummy:       { id:'strike_dummy',       name:'Strike Dummy',        rarity:'uncommon', icon:'🎯', description:'Cards with "Strike" in their name deal 3 additional damage.' },
  sundial:            { id:'sundial',            name:'Sundial',             rarity:'uncommon', icon:'⏳', description:'Every 3 times you shuffle your deck, gain 2 Energy.' },
  white_beast_statue: { id:'white_beast_statue', name:'White Beast Statue',  rarity:'uncommon', icon:'🦁', description:'Potions always drop after combat.' },

  // Rare
  bird_faced_urn:     { id:'bird_faced_urn',     name:'Bird-Faced Urn',      rarity:'rare', icon:'🪦', description:'Whenever you play a Power card, heal 2 HP.' },
  calipers:           { id:'calipers',           name:'Calipers',            rarity:'rare', icon:'📏', description:'At the start of your turn, lose 15 Block rather than all of it.' },
  captains_wheel:     { id:'captains_wheel',     name:'Captain\'s Wheel',     rarity:'rare', icon:'🛞', description:'At the start of your 3rd turn, gain 18 Block.' },
  dead_branch:        { id:'dead_branch',        name:'Dead Branch',         rarity:'rare', icon:'🌿', description:'Whenever you Exhaust a card, add a random card to your hand.' },
  du_vu_doll:         { id:'du_vu_doll',         name:'Du-Vu Doll',          rarity:'rare', icon:'🪆', description:'For each Curse in your deck, start each combat with 1 Strength.' },
  fossilized_helix:   { id:'fossilized_helix',   name:'Fossilized Helix',    rarity:'rare', icon:'🐚', description:'Prevent the first time you would lose HP each combat.' },
  ginger:             { id:'ginger',             name:'Ginger',              rarity:'rare', icon:'🫚', description:'You can no longer become Weak.' },
  ice_cream:          { id:'ice_cream',          name:'Ice Cream',           rarity:'rare', icon:'🍦', description:'Energy is no longer lost at the end of your turn.' },
  incense_burner:     { id:'incense_burner',     name:'Incense Burner',      rarity:'rare', icon:'🧨', description:'Every 6 turns, gain 1 Intangible.' },
  lizard_tail:        { id:'lizard_tail',        name:'Lizard Tail',         rarity:'rare', icon:'🦎', description:'When you would die, heal to 50% of your Max HP instead (Works once).' },
  old_coin:           { id:'old_coin',           name:'Old Coin',            rarity:'rare', icon:'🪙', description:'Upon pickup, gain 300 Gold.' },
  peace_pipe:         { id:'peace_pipe',         name:'Peace Pipe',          rarity:'rare', icon:'🪈', description:'You can now remove cards from your deck at Rest Sites.' },
  pocketwatch:        { id:'pocketwatch',        name:'Pocketwatch',         rarity:'rare', icon:'⌚', description:'Whenever you play 3 or fewer cards in a turn, draw 3 additional cards at the start of your next turn.' },
  shovel:             { id:'shovel',             name:'Shovel',              rarity:'rare', icon:'⛏️', description:'You can now dig for relics at Rest Sites.' },
  torii:              { id:'torii',              name:'Torii',               rarity:'rare', icon:'⛩️', description:'Whenever you would receive 5 or less unblocked Attack damage, reduce it to 1.' },
  tungsten_rod:       { id:'tungsten_rod',       name:'Tungsten Rod',        rarity:'rare', icon:'🪓', description:'Whenever you would lose HP, lose 1 less.' },
  turnip:             { id:'turnip',             name:'Turnip',              rarity:'rare', icon:'🫛', description:'You can no longer become Frail.' },
  unceasing_top:      { id:'unceasing_top',      name:'Unceasing Top',       rarity:'rare', icon:'🌀', description:'Whenever you have no cards in hand during your turn, draw a card.' },
  wing_boots:         { id:'wing_boots',         name:'Wing Boots',          rarity:'rare', icon:'🥾', description:'You may ignore paths when choosing the next room to travel to 3 times.' },

  // Boss
  astrolabe:          { id:'astrolabe',          name:'Astrolabe',           rarity:'boss', icon:'🔭', description:'Upon pickup, Transform and Upgrade 3 cards.' },
  black_blood:        { id:'black_blood',        name:'Black Blood',         rarity:'boss', icon:'🩸', description:'Replaces Burning Blood. At the end of combat, heal 12 HP.' },
  black_star:         { id:'black_star',         name:'Black Star',          rarity:'boss', icon:'⭐', description:'Elites drop 2 Relics when defeated.' },
  busted_crown:       { id:'busted_crown',       name:'Busted Crown',        rarity:'boss', icon:'👑', description:'Gain 1 Energy at the start of your turn. Future card rewards have 2 fewer cards to choose from.' },
  coffee_dripper:     { id:'coffee_dripper',     name:'Coffee Dripper',      rarity:'boss', icon:'☕', description:'Gain 1 Energy at the start of your turn. You can no longer Rest at Rest Sites.' },
  cursed_key:         { id:'cursed_key',         name:'Cursed Key',          rarity:'boss', icon:'🗝️', description:'Gain 1 Energy at the start of your turn. Whenever you open a non-boss chest, obtain a Curse.' },
  fusion_hammer:      { id:'fusion_hammer',      name:'Fusion Hammer',       rarity:'boss', icon:'🔨', description:'Gain 1 Energy at the start of your turn. You can no longer Smith at Rest Sites.' },
  pandoras_box:       { id:'pandoras_box',       name:'Pandora\'s Box',       rarity:'boss', icon:'📦', description:'Upon pickup, Transform all Strikes and Defends.' },
  philosophers_stone: { id:'philosophers_stone', name:'Philosopher\'s Stone', rarity:'boss', icon:'🪨', description:'Gain 1 Energy at the start of your turn. ALL enemies start with 1 Strength.' },
  runic_dome:         { id:'runic_dome',         name:'Runic Dome',          rarity:'boss', icon:'🧿', description:'Gain 1 Energy at the start of your turn. You can no longer see enemy Intent.' },
  runic_pyramid:      { id:'runic_pyramid',      name:'Runic Pyramid',       rarity:'boss', icon:'🔺', description:'At the end of your turn, you no longer discard your hand.' },
  snecko_eye:         { id:'snecko_eye',         name:'Snecko Eye',          rarity:'boss', icon:'👁️', description:'Draw 2 additional cards each turn. Start each combat Confused (Randomize card costs).' },
  sozu:               { id:'sozu',               name:'Sozu',                rarity:'boss', icon:'🍶', description:'Gain 1 Energy at the start of your turn. You can no longer obtain potions.' },
  tiny_house:         { id:'tiny_house',         name:'Tiny House',          rarity:'boss', icon:'🏠', description:'Upon pickup, gain 50 Gold, 5 Max HP, 1 Potion, 1 Card, and Upgrade 1 random card.' },
  velvet_choker:      { id:'velvet_choker',      name:'Velvet Choker',       rarity:'boss', icon:'📿', description:'Gain 1 Energy at the start of your turn. You cannot play more than 6 cards per turn.' },

  // Shop
  chemical_x:         { id:'chemical_x',         name:'Chemical X',          rarity:'shop', icon:'🧪', description:'The effects of your cost X cards are increased by 2.' },
  clockwork_souvenir: { id:'clockwork_souvenir', name:'Clockwork Souvenir',  rarity:'shop', icon:'⏱️', description:'Start each combat with 1 Artifact.' },
  dollys_mirror:      { id:'dollys_mirror',      name:'Dolly\'s Mirror',     rarity:'shop', icon:'🪞', description:'Upon pickup, choose a card in your deck and add a copy of it to your deck.' },
  frozen_eye:         { id:'frozen_eye',         name:'Frozen Eye',          rarity:'shop', icon:'🧿', description:'You can now see the order of cards in your Draw Pile.' },
  medical_kit:        { id:'medical_kit',        name:'Medical Kit',         rarity:'shop', icon:'🩹', description:'Unplayable Status cards can now be played. Whenever you play a Status card, Exhaust it.' },
  membership_card:    { id:'membership_card',    name:'Membership Card',     rarity:'shop', icon:'💳', description:'50% discount on all items in shops.' },
  orange_pellets:     { id:'orange_pellets',     name:'Orange Pellets',      rarity:'shop', icon:'🍊', description:'Whenever you play a Power, Attack, and Skill in the same turn, remove all of your Debuffs.' },
};

export const RELIC_OFFER_FLOORS = [2, 4];
export const RELIC_OFFER_COUNT = 3;
export const RELIC_RARITY_WEIGHTS = { common: 60, uncommon: 30, rare: 10 };
export const RELIC_SHOP_COST = 150;

export const POTIONS = {
  health_potion:   { id:'health_potion',   name:'Health Potion',   description:'Heal 20 HP.',                       target:'self', effect:{heal:20} },
  energy_potion:   { id:'energy_potion',   name:'Energy Potion',   description:'Gain 2 Energy.',                    target:'self', effect:{energy:2} },
  strength_potion: { id:'strength_potion', name:'Strength Potion', description:'Gain 2 Strength.',                  target:'self', effect:{strength:2} },
  dex_potion:      { id:'dex_potion',      name:'Dex Potion',      description:'Gain 2 Dexterity.',                target:'self', effect:{dexterity:2} },
  fire_potion:     { id:'fire_potion',     name:'Fire Potion',     description:'Deal 20 damage to a target enemy.', target:'enemy', effect:{damage:20} },
};
export const POTION_DROP_CHANCE = 0.3;
export const POTION_BASE_SLOTS = 3;

export const STARTER_DECK = ['strike','strike','strike','strike','strike','defend','defend','defend','defend','bash'];

export const SHOP_POOL = [
  {id:'anger',rarity:'common'},{id:'armaments',rarity:'common'},{id:'body_slam',rarity:'common'},
  {id:'clash',rarity:'common'},{id:'cleave',rarity:'common'},{id:'clothesline',rarity:'common'},
  {id:'flex',rarity:'common'},{id:'havoc',rarity:'common'},{id:'headbutt',rarity:'common'},
  {id:'heavy_blade',rarity:'common'},{id:'iron_wave',rarity:'common'},{id:'perfected_strike',rarity:'common'},
  {id:'pommel_strike',rarity:'common'},{id:'shrug_it_off',rarity:'common'},{id:'sword_boomerang',rarity:'common'},
  {id:'thunderclap',rarity:'common'},{id:'true_grit',rarity:'common'},{id:'twin_strike',rarity:'common'},
  {id:'warcry',rarity:'common'},{id:'wild_strike',rarity:'common'},

  {id:'battle_trance',rarity:'uncommon'},{id:'blood_for_blood',rarity:'uncommon'},{id:'bloodletting',rarity:'uncommon'},
  {id:'burning_pact',rarity:'uncommon'},{id:'carnage',rarity:'uncommon'},{id:'combust',rarity:'uncommon'},
  {id:'dark_embrace',rarity:'uncommon'},{id:'disarm',rarity:'uncommon'},{id:'dropkick',rarity:'uncommon'},
  {id:'dual_wield',rarity:'uncommon'},{id:'entrench',rarity:'uncommon'},{id:'evolve',rarity:'uncommon'},
  {id:'feel_no_pain',rarity:'uncommon'},{id:'flame_barrier',rarity:'uncommon'},{id:'ghostly_armor',rarity:'uncommon'},
  {id:'hemokinesis',rarity:'uncommon'},{id:'infernal_blade',rarity:'uncommon'},{id:'inflame',rarity:'uncommon'},
  {id:'intimidate',rarity:'uncommon'},{id:'metallicize',rarity:'uncommon'},{id:'power_through',rarity:'uncommon'},
  {id:'pummel',rarity:'uncommon'},{id:'rampage',rarity:'uncommon'},{id:'reckless_charge',rarity:'uncommon'},
  {id:'rupture',rarity:'uncommon'},{id:'searing_blow',rarity:'uncommon'},{id:'second_wind',rarity:'uncommon'},
  {id:'seeing_red',rarity:'uncommon'},{id:'sentinel',rarity:'uncommon'},{id:'sever_soul',rarity:'uncommon'},
  {id:'spot_weakness',rarity:'uncommon'},{id:'uppercut',rarity:'uncommon'},{id:'whirlwind',rarity:'uncommon'},

  {id:'barricade',rarity:'rare'},{id:'berserk',rarity:'rare'},{id:'bludgeon',rarity:'rare'},
  {id:'brutality',rarity:'rare'},{id:'corruption',rarity:'rare'},{id:'demon_form',rarity:'rare'},
  {id:'double_tap',rarity:'rare'},{id:'exhume',rarity:'rare'},{id:'feed',rarity:'rare'},
  {id:'fiend_fire',rarity:'rare'},{id:'immolate',rarity:'rare'},{id:'impervious',rarity:'rare'},
  {id:'juggernaut',rarity:'rare'},{id:'limit_break',rarity:'rare'},{id:'offering',rarity:'rare'},
  {id:'reaper',rarity:'rare'},{id:'shockwave',rarity:'rare'},
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
