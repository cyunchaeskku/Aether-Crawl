# Rule of the Game

### 1. Character & Starting State
- **Stats**: Max HP 80, Starting Gold 99, Energy 3/turn.
- **Starting Relic**: `burning_blood` — Heal 6 HP at the end of every combat. If the character is 'IronClad'.
- **Starting Deck**: Strike (x5), Defend (x4), Bash (x1).
- **Progression**: Power scales via card collection, card upgrades (Smithing), and Relic acquisition.

### 2. Card Types & Mechanics
- **Attack**: Deals direct damage. Scaled by Strength.
- **Defend**: Provides Block to mitigate damage. Scaled by Dexterity.
- **Power**: Grants a permanent passive effect for the remainder of combat.
- **Skill**: Utility effects (energy gain, draw, debuffs, card manipulation).
  - Targeting: 'Targeted' (requires enemy selection) vs. 'Non-Targeted' (immediate trigger).

### 3. Stage & Progression Structure
- **Total**: 3 Acts × 15 floors = 45 floors.
- **Clear condition**: Defeat the Boss on Floor 15 of each Act.
- **Final victory**: Defeat the Act 3 Boss (Floor 45).
- **Act Transition**: Upon clearing an Act, the character's HP is restored to full.Upon clearing an Act, the character's HP is restored to full.

### 4. Map Nodes & Floor Logic
- **Floors 1–14**: Procedurally generated graph of nodes.
- **Floor 15 (Boss)**: Fixed encounter with the Stage Boss.
- **Node types**:
  1. Normal Enemy — Standard combat.
  2. Elite Enemy — Tougher combat, guaranteed Relic reward, higher Rare card chance.
  3. Rest Site — Choose 'Rest' (Heal 30% Max HP) or 'Smith' (Upgrade 1 card).
  4. Shop — Buy cards/relics/potions, Card Removal Service.
  5. Unknown (?) — Random event.
  6. Act Boss — Floor 15/30/45.

### 5. Unknown (?) Room Events
- Check below for details

### 6. Combat Engine Core Logic
- **Turn flow**: Start (3 Energy, draw 5 cards, reset Block to 0) → Actions → End (discard hand) → Enemy turn.
- **Calculation rule**: All values use `Math.floor()` (round down).
  - Dmg = Floor((Base + Strength) × Multipliers)
  - Block = Floor((Base + Dexterity) × Multipliers)
- **Card cycle**: Shuffle Discard into Draw Pile when empty. Max hand size: 10.

### 7. Status Effects
- **Vulnerable**: +50% damage taken.
- **Weak**: −25% damage dealt.
- **Frail**: −25% Block gained.
- **Strength**: Adds to Attack damage.
- **Dexterity**: Adds to Block gained.

### 8. Post-Combat Rewards
- Choose 1 of 3 cards (or Skip).
- Gold reward.
- Potions (random chance).
- Relics: Elite and Boss encounters only.
- HP Healing and Card Upgrades are NOT combat rewards — exclusive to Rest Sites.

### 9. Card Shop (Merchant)
- **Inventory**: 5–7 Cards, 3 Relics, 3 Potions.
- **Sale**: One random card is always 50% off.
- **Card Removal Service**: Available once per shop. Base cost 75 Gold, +25 Gold per subsequent use.

### 10. Game Balance & Difficulty Scaling
- **Multi-target balancing**: When facing multiple enemies, scale down individual HP and damage to prevent overwhelming alpha strikes.
  - Enemies in a group of 3 must have lower HP and damage than solo enemies or bosses.
  - Stagger heavy attacks and buffs among group members — no coordinated alpha strikes.
- **Fairness**: Total potential enemy damage in one turn must not consistently exceed the player's reasonable blocking capability.

---

# Ironclad Card Catalog

## Starter (3)

| Card Name | Rarity | Type | Cost | Description |
|------------|--------|--------|------|-------------|
| Bash | Starter | Attack | 2 | Deal 8 damage. Apply 2 Vulnerable. |
| Strike | Starter | Attack | 1 | Deal 6 damage. |
| Defend | Starter | Skill | 1 | Gain 5 Block. |

---

## Common (20)

| Card Name | Rarity | Type | Cost | Description |
|------------|--------|--------|------|-------------|
| Anger | Common | Attack | 0 | Deal 6 damage. Add a copy to discard pile. |
| Armaments | Common | Skill | 1 | Gain 5 Block. Upgrade a card in hand this combat. |
| Body Slam | Common | Attack | 1 | Deal damage equal to your current Block. |
| Clash | Common | Attack | 0 | Play only if hand contains only Attacks. Deal 14 damage. |
| Cleave | Common | Attack | 1 | Deal 8 damage to ALL enemies. |
| Clothesline | Common | Attack | 2 | Deal 12 damage. Apply 2 Weak. |
| Flex | Common | Skill | 0 | Gain 2 Strength. Lose 2 Strength at end of turn. |
| Havoc | Common | Skill | 1 | Play top card of draw pile. Exhaust it. |
| Headbutt | Common | Attack | 1 | Deal 9 damage. Put a card from discard on top of draw pile. |
| Heavy Blade | Common | Attack | 2 | Deal 14 damage. Strength is applied 3 times. |
| Iron Wave | Common | Attack | 1 | Gain 5 Block. Deal 5 damage. |
| Perfected Strike | Common | Attack | 2 | Deal 6 damage (+2 per Strike card in deck). |
| Pommel Strike | Common | Attack | 1 | Deal 9 damage. Draw 1 card. |
| Shrug It Off | Common | Skill | 1 | Gain 8 Block. Draw 1 card. |
| Sword Boomerang | Common | Attack | 1 | Deal 3 damage to random enemy 3 times. |
| Thunderclap | Common | Attack | 1 | Deal 4 damage and apply 1 Vulnerable to ALL enemies. |
| True Grit | Common | Skill | 1 | Gain 7 Block. Exhaust a random card in hand. |
| Twin Strike | Common | Attack | 1 | Deal 5 damage twice. |
| Warcry | Common | Skill | 0 | Draw 1 card. Put a card from hand on top of draw pile. Exhaust. |
| Wild Strike | Common | Attack | 1 | Deal 12 damage. Shuffle a Wound into draw pile. |

---

## Uncommon (32)

| Card Name | Rarity | Type | Cost | Description |
|------------|--------|--------|------|-------------|
| Battle Trance | Uncommon | Skill | 0 | Draw 3 cards. Cannot draw additional cards this turn. |
| Blood for Blood | Uncommon | Attack | 4 | Deal 18 damage. Costs 1 less for each HP lost this combat. |
| Bloodletting | Uncommon | Skill | 0 | Lose 3 HP. Gain 2 Energy. |
| Burning Pact | Uncommon | Skill | 1 | Exhaust a card. Draw 2 cards. |
| Carnage | Uncommon | Attack | 2 | Ethereal. Deal 20 damage. |
| Combust | Uncommon | Power | 1 | End of turn: lose 1 HP, deal 5 damage to ALL enemies. |
| Dark Embrace | Uncommon | Power | 2 | Whenever a card is Exhausted, draw 1 card. |
| Disarm | Uncommon | Skill | 1 | Enemy loses 2 Strength. Exhaust. |
| Dropkick | Uncommon | Attack | 1 | If enemy is Vulnerable, deal 5 damage, gain 1 Energy and draw 1 card. |
| Dual Wield | Uncommon | Skill | 1 | Create a copy of an Attack or Power in hand. |
| Entrench | Uncommon | Skill | 2 | Double your current Block. |
| Evolve | Uncommon | Power | 1 | When drawing a Status card, draw 1 card. |
| Feel No Pain | Uncommon | Power | 1 | When a card is Exhausted, gain 3 Block. |
| Flame Barrier | Uncommon | Skill | 2 | Gain 12 Block. When attacked, deal 4 damage back. |
| Ghostly Armor | Uncommon | Skill | 1 | Ethereal. Gain 10 Block. |
| Hemokinesis | Uncommon | Attack | 1 | Lose 2 HP. Deal 15 damage. |
| Infernal Blade | Uncommon | Skill | 1 | Add a random Attack to hand. It costs 0 this turn. Exhaust. |
| Inflame | Uncommon | Power | 1 | Gain 2 Strength. |
| Intimidate | Uncommon | Skill | 0 | Apply 1 Weak to ALL enemies. Exhaust. |
| Metallicize | Uncommon | Power | 1 | End of turn: gain 3 Block. |
| Power Through | Uncommon | Skill | 1 | Gain 15 Block. Add 2 Wounds to hand. |
| Pummel | Uncommon | Attack | 1 | Deal 2 damage 4 times. Exhaust. |
| Rampage | Uncommon | Attack | 1 | Deal 8 damage. Increases by 5 each time played this combat. |
| Reckless Charge | Uncommon | Attack | 0 | Deal 7 damage. Shuffle a Dazed into draw pile. |
| Rupture | Uncommon | Power | 1 | When you lose HP from a card, gain 1 Strength. |
| Searing Blow | Uncommon | Attack | 2 | Deal 12 damage. Can be upgraded multiple times. |
| Second Wind | Uncommon | Skill | 1 | Exhaust all non-Attack cards. Gain 5 Block each. |
| Seeing Red | Uncommon | Skill | 1 | Gain 2 Energy. Exhaust. |
| Sentinel | Uncommon | Skill | 1 | Gain 5 Block. If Exhausted, gain 2 Energy. |
| Sever Soul | Uncommon | Attack | 2 | Exhaust all non-Attack cards in hand. Deal 16 damage. |
| Spot Weakness | Uncommon | Skill | 1 | If enemy intends to attack, gain 3 Strength. |
| Uppercut | Uncommon | Attack | 2 | Deal 13 damage. Apply 1 Weak and 1 Vulnerable. |
| Whirlwind | Uncommon | Attack | X | Deal 5 damage to ALL enemies X times. |

---

## Rare (20)

| Card Name | Rarity | Type | Cost | Description |
|------------|--------|--------|------|-------------|
| Barricade | Rare | Power | 3 | Block is not removed at end of turn. |
| Berserk | Rare | Power | 0 | Gain 1 Vulnerable. Start turns with +1 Energy. |
| Bludgeon | Rare | Attack | 3 | Deal 32 damage. |
| Brutality | Rare | Power | 0 | Start of turn: lose 1 HP, draw 1 card. |
| Corruption | Rare | Power | 3 | Skills cost 0. Playing a Skill Exhausts it. |
| Demon Form | Rare | Power | 3 | Start of turn: gain 2 Strength. |
| Double Tap | Rare | Skill | 1 | Your next Attack is played twice. |
| Exhume | Rare | Skill | 1 | Put an Exhausted card into hand. Exhaust. |
| Feed | Rare | Attack | 1 | Deal 10 damage. If fatal, gain 3 Max HP. Exhaust. |
| Fiend Fire | Rare | Attack | 2 | Exhaust all cards in hand. Deal 7 damage per card. |
| Immolate | Rare | Attack | 2 | Deal 21 damage to ALL enemies. Add a Burn to discard. |
| Impervious | Rare | Skill | 2 | Gain 30 Block. Exhaust. |
| Juggernaut | Rare | Power | 2 | When you gain Block, deal 5 damage to random enemy. |
| Limit Break | Rare | Skill | 1 | Double your Strength. Exhaust. |
| Offering | Rare | Skill | 0 | Lose 6 HP. Gain 2 Energy. Draw 3 cards. Exhaust. |
| Reaper | Rare | Attack | 2 | Deal 4 damage to ALL enemies. Heal equal to unblocked damage. Exhaust. |
| Shockwave | Rare | Skill | 2 | Apply 3 Weak and 3 Vulnerable to ALL enemies. Exhaust. |


# Relic Catalog

**Starter Relics**
- Burning Blood (Ironclad): At the end of combat, heal 6 HP.
- Ring of the Snake (Silent): At the start of each combat, draw 2 additional cards.
- Cracked Core (Defect): At the start of each combat, Channel 1 Lightning.
- Pure Water (Watcher): At the start of each combat, add a Miracle into your hand.

**Common Relics**
- Akabeko: Your first Attack each combat deals 8 additional damage.
- Anchor: Start each combat with 10 Block.
- Ancient Tea Set: Whenever you enter a Rest Site, start the next combat with 2 extra Energy.
- Art of War: If you do not play any Attacks during your turn, gain an additional Energy next turn.
- Bag of Marbles: At the start of each combat, apply 1 Vulnerable to ALL enemies.
- Bag of Preparation: At the start of each combat, draw 2 additional cards.
- Blood Vial: At the start of each combat, heal 2 HP.
- Bronze Scales: Start each combat with 3 Thorns.
- Centennial Puzzle: The first time you lose HP each combat, draw 3 cards.
- Ceramic Fish: Whenever you add a card to your deck, gain 9 Gold.
- Dream Catcher: Whenever you Rest, you may add a card to your deck.
- Happy Flower: Every 3 turns, gain 1 Energy.
- Juzu Bracelet: Regular enemy combats are no longer encountered in ? rooms.
- Lantern: Gain 1 Energy on the first turn of each combat.
- Maw Bank: Whenever you climb a floor, gain 12 Gold. (Deactivates if you spend Gold at a shop).
- Meal Ticket: Whenever you enter a shop, heal 15 HP.
- Nunchaku: Every time you play 10 Attacks, gain 1 Energy.
- Oddly Smooth Stone: At the start of each combat, gain 1 Dexterity.
- Omamori: Negate the next 2 Curses you obtain.
- Orichalcum: If you end your turn without Block, gain 6 Block.
- Pen Nib: Every 10th Attack you play deals double damage.
- Potion Belt: Upon pickup, gain 2 Potion slots.
- Preserved Insect: Enemies in Elite combats have 25% less HP.
- Regal Pillow: Whenever you Rest, heal an additional 15 HP.
- Smiling Mask: The merchant's card removal service now always costs 50 Gold.
- Strawberry: Upon pickup, raise your Max HP by 7.
- The Boot: Whenever you would deal 4 or less unblocked Attack damage, increase it to 5.
- Tiny Chest: Every 4th ? room is a Treasure room.
- Toy Ornithopter: Whenever you use a potion, heal 5 HP.
- Vajra: At the start of each combat, gain 1 Strength.
- War Paint: Upon pickup, Upgrade 2 random Skills.
- Whetstone: Upon pickup, Upgrade 2 random Attacks.

**Uncommon Relics**
- Blue Candle: Unplayable Curse cards can now be played. Whenever you play a Curse, lose 1 HP and Exhaust it.
- Bottled Flame: Upon pickup, choose an Attack card. Start each combat with this card in your hand.
- Bottled Lightning: Upon pickup, choose a Skill card. Start each combat with this card in your hand.
- Bottled Tornado: Upon pickup, choose a Power card. Start each combat with this card in your hand.
- Eternal Feather: For every 5 cards in your deck, heal 3 HP whenever you enter a Rest Site.
- Frozen Egg: Whenever you add a Power card to your deck, Upgrade it.
- Molten Egg: Whenever you add an Attack card to your deck, Upgrade it.
- Toxic Egg: Whenever you add a Skill card to your deck, Upgrade it.
- Gremlin Horn: Whenever an enemy dies, gain 1 Energy and draw 1 card.
- Ink Bottle: Whenever you play 10 cards, draw 1 card.
- Kunai: Every time you play 3 Attacks in a single turn, gain 1 Dexterity.
- Shuriken: Every time you play 3 Attacks in a single turn, gain 1 Strength.
- Letter Opener: Every time you play 3 Skills in a single turn, deal 5 damage to ALL enemies.
- Matryoshka: The next 2 non-boss chests you open contain 2 Relics.
- Mummified Hand: Whenever you play a Power card, a random card in your hand costs 0 that turn.
- Ornamental Fan: Every time you play 3 Attacks in a single turn, gain 4 Block.
- Paper Phrog (Ironclad): Vulnerable now deals 75% more damage instead of 50%.
- Question Card: On card reward screens, choose from 4 cards instead of 3.
- Singing Bowl: When adding a card to your deck, you may instead raise your Max HP by 2.
- Strike Dummy: Cards with "Strike" in their name deal 3 additional damage.
- Sundial: Every 3 times you shuffle your deck, gain 2 Energy.
- White Beast Statue: Potions always drop after combat.

**Rare Relics**
- Bird-Faced Urn: Whenever you play a Power card, heal 2 HP.
- Calipers: At the start of your turn, lose 15 Block rather than all of it.
- Captain's Wheel: At the start of your 3rd turn, gain 18 Block.
- Dead Branch: Whenever you Exhaust a card, add a random card to your hand.
- Du-Vu Doll: For each Curse in your deck, start each combat with 1 Strength.
- Fossilized Helix: Prevent the first time you would lose HP each combat.
- Ginger: You can no longer become Weak.
- Ice Cream: Energy is no longer lost at the end of your turn.
- Incense Burner: Every 6 turns, gain 1 Intangible.
- Lizard Tail: When you would die, heal to 50% of your Max HP instead (Works once).
- Old Coin: Upon pickup, gain 300 Gold.
- Peace Pipe: You can now remove cards from your deck at Rest Sites.
- Pocketwatch: Whenever you play 3 or fewer cards in a turn, draw 3 additional cards at the start of your next turn.
- Shovel: You can now dig for relics at Rest Sites.
- Torii: Whenever you would receive 5 or less unblocked Attack damage, reduce it to 1.
- Tungsten Rod: Whenever you would lose HP, lose 1 less.
- Turnip: You can no longer become Frail.
- Unceasing Top: Whenever you have no cards in hand during your turn, draw a card.
- Wing Boots: You may ignore paths when choosing the next room to travel to 3 times.

**Boss Relics**
- Astrolabe: Upon pickup, Transform and Upgrade 3 cards.
- Black Blood (Ironclad): Replaces Burning Blood. At the end of combat, heal 12 HP.
- Black Star: Elites drop 2 Relics when defeated.
- Busted Crown: Gain 1 Energy at the start of your turn. Future card rewards have 2 fewer cards to choose from.
- Coffee Dripper: Gain 1 Energy at the start of your turn. You can no longer Rest at Rest Sites.
- Cursed Key: Gain 1 Energy at the start of your turn. Whenever you open a non-boss chest, obtain a Curse.
- Fusion Hammer: Gain 1 Energy at the start of your turn. You can no longer Smith at Rest Sites.
- Pandora's Box: Upon pickup, Transform all Strikes and Defends.
- Philosopher's Stone: Gain 1 Energy at the start of your turn. ALL enemies start with 1 Strength.
- Runic Dome: Gain 1 Energy at the start of your turn. You can no longer see enemy Intent.
- Runic Pyramid: At the end of your turn, you no longer discard your hand.
- Snecko Eye: Draw 2 additional cards each turn. Start each combat Confused (Randomize card costs).
- Sozu: Gain 1 Energy at the start of your turn. You can no longer obtain potions.
- Tiny House: Upon pickup, gain 50 Gold, 5 Max HP, 1 Potion, 1 Card, and Upgrade 1 random card.
- Velvet Choker: Gain 1 Energy at the start of your turn. You cannot play more than 6 cards per turn.

**Shop Relics**
- Chemical X: The effects of your cost X cards are increased by 2.
- Clockwork Souvenir: Start each combat with 1 Artifact.
- Dolly's Mirror: Upon pickup, choose a card in your deck and add a copy of it to your deck.
- Frozen Eye: You can now see the order of cards in your Draw Pile.
- Medical Kit: Unplayable Status cards can now be played. Whenever you play a Status card, Exhaust it.
- Membership Card: 50% discount on all items in shops.
- Orange Pellets: Whenever you play a Power, Attack, and Skill in the same turn, remove all of your Debuffs.

---

# Slay the Spire — Card Rarity Generation Logic

## 1. Base Rarity Probabilities

### 1.1 Normal Combat Reward
For each card slot in the reward (3 independent rolls):

Common:   60%
Uncommon: 37%
Rare:      3%  (modified by rareOffset, see below)

---

### 1.2 Elite Combat Reward

Common:   50%
Uncommon: 40%
Rare:     10% (modified by rareOffset)

---

### 1.3 Boss Combat Reward

All 3 cards are guaranteed Rare.
No probability roll.

---

### 1.4 Shop Cards (per card slot)

Common:   54%
Uncommon: 37%
Rare:      9%

Shop generation does NOT use rareOffset from combat rewards.

---

## 2. Rare Offset Mechanism (Combat Rewards Only)

Rare chance is NOT static.
It uses a persistent modifier called `rareOffset`.

### 2.1 Initial State

At the start of a run:
rareOffset = -5%

This effectively reduces early Rare probability.

---

### 2.2 Effective Rare Chance

effectiveRareChance = baseRareChance + rareOffset

Where:
baseRareChance = 3% (normal combat)
baseRareChance = 10% (elite combat)

Clamp:
effectiveRareChance >= 0%

---

### 2.3 On Card Roll (Per Card Slot)

For each reward card slot:

1. Roll rarity using effectiveRareChance.
2. If result == Rare:
       rareOffset = -5%
   Else if result == Common:
       rareOffset += 1%
       rareOffset = min(rareOffset, +40%)
   Else (Uncommon):
       rareOffset unchanged

Important:
- This logic runs per card slot (3 times per reward).
- rareOffset persists between combats.
- rareOffset only affects combat rewards (not shops, not events).

---

## 3. Maximum Offset

rareOffset maximum = +40%

So:
maximumRareChance = baseRareChance + 40%

Example (Normal combat):
3% + 40% = 43% max Rare chance

---

## 4. Upgrade Chance (Separate System)

Upgrade chance is rolled AFTER rarity is determined.

Act 1:
    0% chance for upgraded cards

Act 2:
    25% chance (12.5% on Ascension 12+)

Act 3:
    50% chance (25% on Ascension 12+)

Rule:
Rare cards from normal combat rewards CANNOT spawn upgraded.

---

## 5. Pseudocode Implementation

```
state:
    rareOffset = -0.05

function generateCombatReward(baseRareChance):
    cards = []

    for i in 1..3:
        effectiveRare = max(0, baseRareChance + rareOffset)

        roll = random(0,1)

        if roll < effectiveRare:
            rarity = RARE
            rareOffset = -0.05
        else if roll < effectiveRare + uncommonChance:
            rarity = UNCOMMON
            // no offset change
        else:
            rarity = COMMON
            rareOffset = min(rareOffset + 0.01, 0.40)

        cards.append(generateCardOf(rarity))

    return cards
```

Where:
- uncommonChance = 0.37 (normal)
- commonChance = remainder

---

## 6. Summary of Design Behavior

- The system creates "pity scaling" for Rare cards.
- Long streaks without Rare increase probability.
- Getting a Rare resets probability.
- Elite combats use higher baseRareChance.
- Boss rewards ignore the probability system entirely.
- Shops use fixed independent probabilities.


---

# Slay the Spire — "?" Room (Unknown Location) Generation Logic

This document defines the deterministic probability system
used to determine the outcome of a "?" room within an Act.

It describes:
- Encounter types
- Base probabilities
- Increment / reset rules
- State persistence model
- Pseudocode implementation

---

## 1. Encounter Types

A "?" room can resolve into exactly one of the following:

1. MONSTER
2. SHOP
3. TREASURE
4. EVENT

Only one result occurs per room.

---

## 2. Base Probabilities (Per Act Reset)

At the start of each Act:

monsterChanceBase  = 0.10   (10%)
shopChanceBase     = 0.03   (3%)
treasureChanceBase = 0.02   (2%)

Event chance is calculated dynamically as:

eventChance = 1 - (monsterChance + shopChance + treasureChance)

Initial effective state at Act start:

monsterChance  = 0.10
shopChance     = 0.03
treasureChance = 0.02
eventChance    = 0.85

These values persist and evolve within the Act.

All values reset at the beginning of a new Act.

---

## 3. Probability Adjustment Mechanism

This system functions as a pity-scaling mechanism.

### 3.1 General Rule

When a "?" room resolves:

IF result == MONSTER:
    monsterChance  = monsterChanceBase
    shopChance    += shopChanceBase
    treasureChance+= treasureChanceBase

IF result == SHOP:
    shopChance     = shopChanceBase
    monsterChance += monsterChanceBase
    treasureChance+= treasureChanceBase

IF result == TREASURE:
    treasureChance = treasureChanceBase
    monsterChance += monsterChanceBase
    shopChance    += shopChanceBase

IF result == EVENT:
    monsterChance  += monsterChanceBase
    shopChance     += shopChanceBase
    treasureChance += treasureChanceBase

After updating those values:

eventChance = 1 - (monsterChance + shopChance + treasureChance)

Important:
- Event has no independent base value.
- Event probability is the remaining probability mass.

---

## 4. Constraints

- All probabilities must remain within [0, 1].
- Sum of all four probabilities must equal exactly 1.
- No individual probability may exceed 1.
- No negative values allowed.

If accumulation would exceed logical bounds,
values must be clamped safely.

---

## 5. Persistence Model

State variables are:

monsterChance
shopChance
treasureChance

eventChance is derived, not stored.

These variables:
- Persist between consecutive "?" rooms
- Reset when entering a new Act

They are not affected by:
- Combat rarity offset
- Card rewards
- Shop card probabilities
- Elite logic

This system is independent.

---

## 6. Resolution Algorithm

When entering a "?" room:

1. Compute eventChance:
   eventChance = 1 - (monsterChance + shopChance + treasureChance)

2. Generate a uniform random float r in [0,1).

3. Resolve in cumulative order:

   if r < monsterChance:
       result = MONSTER
   else if r < monsterChance + shopChance:
       result = SHOP
   else if r < monsterChance + shopChance + treasureChance:
       result = TREASURE
   else:
       result = EVENT

4. Apply probability adjustment rules (Section 3).

5. Persist updated state.

---

## 7. Example Progression

Act Start:
M=10%, S=3%, T=2%, E=85%

Room 1 → EVENT:
M=20%, S=6%, T=4%, E=70%

Room 2 → EVENT:
M=30%, S=9%, T=6%, E=55%

Room 3 → MONSTER:
M=10%, S=12%, T=8%, E=70%

Room 4 → SHOP:
M=20%, S=3%, T=10%, E=67%

This creates dynamic balancing over time.

---

## 8. Design Properties

This system ensures:

- Events are most common early in an Act.
- Long streaks without Shop/Treasure increase their likelihood.
- Outcomes trend toward distribution smoothing.
- Guaranteed eventual appearance of low-base events.

It is a stateful probability reinforcement system,
not an independent Bernoulli trial per room.

---

## 9. Minimal Implementation Skeleton

```
state per Act:
    monsterChance  = 0.10
    shopChance     = 0.03
    treasureChance = 0.02

function resolveQuestionRoom():
    eventChance = 1 - (monsterChance + shopChance + treasureChance)

    r = random()

    if r < monsterChance:
        result = MONSTER
        monsterChance = 0.10
        shopChance += 0.03
        treasureChance += 0.02

    else if r < monsterChance + shopChance:
        result = SHOP
        shopChance = 0.03
        monsterChance += 0.10
        treasureChance += 0.02

    else if r < monsterChance + shopChance + treasureChance:
        result = TREASURE
        treasureChance = 0.02
        monsterChance += 0.10
        shopChance += 0.03

    else:
        result = EVENT
        monsterChance += 0.10
        shopChance += 0.03
        treasureChance += 0.02

    return result
```

