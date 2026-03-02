# Project Rules

## Boundary Constraint — CRITICAL

**This session is strictly confined to the project directory:**
`/Users/yunchae/Desktop/Careers/sideProject/white_paper/`

- Do NOT read, edit, create, or delete any file outside this directory.
- Do NOT modify global configs.
- If a task seems to require touching files outside this boundary, STOP and ask the user.

---

# Project: Aether Crawl (Slay the Spire Clone)

## Concept: The Ironclad's Ascent
A faithful "Slay the Spire" clone with incremental elements.
- **3 Acts, 45 Floors Total**: Each Act is 15 floors with a Boss at the end.
- **Ironclad Focus**: Max HP 80, 99 Gold, 'Burning Blood' Relic (Heal 6 HP after combat).
- **Core Loop**: Combat -> Rewards/Nodes -> Deck Building -> Boss -> Next Act.

## File Structure
- `index.html`: Entry point.
- `style.css`: Dark fantasy theme & VFX.
- `game.js`: ALL game logic (Single file, no ES modules to avoid CORS).
- `assets/`: SFX, Soundtracks, Sprites.

## Technical Constraints
- Single file `game.js` to avoid CORS.
- `localStorage` persistence (key: `aether_crawl_save`).
- Deep merge state for forward compatibility.

---

# Mistakes & Lessons
- 실수를 저지르면 CLAUDE.md에 그 내용을 저장하고 다시는 그 실수를 반복하지 말아라.
- **파일 구조 확인 필수**: `index.html`이 실제로 로드하는 파일을 먼저 확인한 후 수정하라. 이 프로젝트는 `game.js`가 아닌 `src/main.js`(ES module)를 로드한다. 코드 수정 전 반드시 `index.html`의 `<script>` 태그를 확인할 것.

---

# Number 1 rule of the game
- Must follow these rules.
- Strictly follow these rules.
- Don't ever go out of these 1~10 rules

## Rule book

### 1. Character & Starting State
- **Stats**: Max HP 80, Starting Gold 99, Energy 3/turn.
- **Starting Relic**: `burning_blood` — Heal 6 HP at the end of every combat.
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
- **Pity system**: Monster (10%+), Treasure (2%+), Shop (3%+), Elite (20%+), Narrative Event (fallback).
- **Event examples**: Golden Idol, Dead Adventurer, Living Wall, Serpent's Deal.

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

## VFX & SFX
- **SFX**: `sword_hit_` for attacks, `death_sfx.wav` for enemy death.
- **BGM**: Dynamic rotation from `assets/soundtracks/list.json`.
- **VFX**: Floating numbers, screen shake, screen flash (big hits).
