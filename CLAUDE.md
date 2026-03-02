# Project Rules

## Boundary Constraint — CRITICAL

**This session is strictly confined to the project directory:**
`/Users/yunchae/Desktop/Careers/sideProject/white_paper/`

- Do NOT read, edit, create, or delete any file outside this directory.
- Do NOT modify global configs such as `~/.claude/`, `~/.zshrc`, `~/.gitconfig`, or any other user-level settings.
- If a task seems to require touching files outside this boundary, STOP and ask the user instead of proceeding.

This rule overrides all other instructions.

---

# Project: Aether Crawl

## Concept
Frontend-only incremental + roguelike card game. Users stay long via:
- **Idle loop**: Resources accumulate passively. Reason to keep tab open.
- **Deckbuilding**: Spend gold to buy/add cards to permanent deck.
- **Dungeon runs**: Turn-based card combat, 5 floors, roguelike feel.
- **Meta-progression**: Essence (earned from runs) → permanent upgrades.

## File Structure
```
white_paper/
├── index.html        # Entry point, HTML skeleton
├── style.css         # Dark fantasy theme, all styles
├── game.js           # ALL game logic — single file, no modules
├── CLAUDE.md
└── src/              # 더 이상 사용 안 함 (참고용으로 존재)
    ├── data.js
    ├── state.js
    ├── engine.js
    └── ui.js
```

**중요**: `game.js`가 유일한 실제 코드 파일. `src/`는 초기 모듈 분리 시도 잔재.

## Tech Decisions
- Vanilla JS, 단일 파일 `game.js` (ES modules 사용 안 함 — file:// CORS 방지)
- index.html에서 `<script src="game.js">` 로 단순 로드
- HTML onclick 속성 → 전역 함수 직접 호출 (e.g., `onclick="startRun()"`)
- localStorage for save/load (key: `aether_crawl_save`)
- `deepMerge(createDefaultState(), saved)` — 새 필드 forward-compatible 보장
- Google Fonts CDN: Cinzel (타이틀), Inter (본문)
- `setInterval(100ms)` for idle tick (리소스만 누적, 전체 render 아님)
- `setInterval(5000ms)` for periodic save
- Hub 버튼들은 `Math.floor(gold)` 또는 `Math.floor(essence)` 변경 시에만 재렌더 (hover flicker 방지)
- Visual effects: `pendingEffects[]` 큐 → `render()` 후 `requestAnimationFrame(flushEffects)` 호출

## game.js 섹션 구조
```
// DATA: CARDS (+_plus 17개 업그레이드 variants), CARD_UPGRADES,
//       RELICS (10개), RELIC_OFFER_FLOORS, ENEMIES, BUILDINGS, META_UPGRADES, FLOOR_ENEMIES
// HELPERS: hasRelic(), generateRelicOffer(), pickShopCards()
// STATE: createDefaultState(), saveState(), loadState(), deepMerge()
// ENGINE: idleTick(), upgradeBuilding(), buyCard(), refreshShop(), buyMetaUpgrade(),
//         startRun(), enterCombat(), startPlayerTurn(), drawCards(), playCard(),
//         applyEffect(), dealDmgToEnemy(), endTurn(), enemyDied(), playerDied(),
//         proceedAfterReward(), restAndHeal(), showUpgradeChoice(), hideUpgradeChoice(),
//         upgradeCard(), pickRelic(), runVictory(), exitRun(), manaSurge()
// UI: render(), renderResources(), renderBuildings(), renderShop(),
//     renderMetaUpgrades(), renderDeck(), renderRelics(), renderRunBtn(), renderDungeon(),
//     renderCombatHTML(), renderRewardHTML(), renderVictoryHTML(), renderDeathHTML()
// VISUAL EFFECTS: pendingEffects[], scheduleEffect(), flushEffects(),
//                 shakeElement(), spawnFloatingNumber(), spawnBigHitLabel(),
//                 spawnScreenFlash(), spawnBlockEffect()
// INIT: const state = loadState() || createDefaultState(); idle tick loop
```

## Game State Shape (현재 실제 구조)
```js
state = {
  idle: {
    gold: Number, mana: Number, essence: Number,
    goldRate: Number, manaRate: Number, essenceRate: Number
  },
  buildings: [{ id, level }],
  meta: {
    upgrades: { [id]: level },
    startingDeck: [cardId, ...],      // 시작 덱 (업그레이드 영구 반영됨, 기본 STARTER_DECK 복사)
    permanentDeck: [cardId, ...],     // 샵에서 구매한 카드 (영구)
    relics: [relicId, ...],           // 획득한 유물 목록 (영구)
    totalRuns: Number, bestFloor: Number, bestGold: Number
  },
  shop: {
    available: [cardId, ...],
    refreshCost: Number               // 20 시작, ×1.5/use, max 100, exitRun 시 리셋
  },
  run: null | {
    floor: Number,                    // 1-5
    phase: 'combat' | 'reward' | 'victory' | 'death',
    startGoldBonus: Number,           // 이미 적용됨 (항상 0)
    restedThisFloor: Boolean,         // 층 보상(heal/upgrade) 사용 여부
    upgradeChoiceActive: Boolean,     // 카드 업그레이드 picker 표시 여부
    relicOffer: [relicId,...] | null, // RELIC_OFFER_FLOORS에서 생성되는 유물 선택지
    relicState: {                     // 전투별 유물 카운터 (enterCombat에서 리셋)
      akabeko_fired: Boolean,
      kunai_counter: Number,
      shuriken_counter: Number,
      helix_active: Boolean
    },
    essenceGained: Number,
    goldEarned: Number,
    totalDamage: Number,
    player: {
      hp: Number, maxHp: Number, armor: Number,
      energy: Number, maxEnergy: Number,
      strength: Number,               // enterCombat에서 0으로 리셋
      hand: [cardId, ...],
      drawPile: [cardId, ...],
      discardPile: [cardId, ...]
    },
    enemy: null | {
      id: String, hp: Number, maxHp: Number, armor: Number,
      patternIndex: Number,
      status: { weak: Number, regen: Number, strength: Number, vulnerable: Number }
    },
    log: [String, ...]
  }
}
```

## Core Game Constants
- Starting deck: `state.meta.startingDeck` (기본 5× Strike + 4× Defend, 업그레이드 반영)
- `MANA_SURGE_COST = 20` — combat 중 20 mana → +2 energy
- `BIG_HIT_THRESHOLD = 20` — 이 이상 데미지 시 big hit 이펙트 발동
- `RELIC_OFFER_FLOORS = [2, 4]` — 이 층 클리어 후 유물 3개 선택지 제공
- Player base HP: 50 (+ max_hp meta × 10)
- Player base energy: 3/turn (+ extra_energy meta, max +2)
- Ice Cream relic: energy carry-over capped at maxEnergy × 2
- Floors per run: 5 (floor 5 = boss)
- Player armor resets at start of player's turn
- Enemy armor resets at start of enemy turn

## Card Effect Schema
```js
effect: {
  damage: Number,       // deal damage to enemy
  hits: Number,         // repeat damage N times (default 1)
  block: Number,        // gain armor
  heal: Number,         // restore HP
  draw: Number,         // draw N cards
  energy: Number,       // gain energy
  weak: Number,         // apply weak status to enemy (turns)
  vulnerable: Number,   // apply vulnerable to enemy (turns)
  strength: Number      // gain strength (lasts until floor ends)
}
```
Special card: `whirlwind` — 0 cost, deals `(5 + player.strength) × current energy`, then sets energy to 0.

## Status Effects
- **Weak** (enemy): -25% damage. Decremented at end of enemy turn.
- **Vulnerable** (enemy): takes +50% damage. Decremented at end of enemy turn.
- **Regen** (enemy): heals N HP at start of enemy turn. Decremented after applying.
- **Strength** (enemy): +N attack permanently until death.

## Damage Formula
```
// Player attacking enemy:
finalDmg = (card.damage + player.strength) * (enemy.vulnerable > 0 ? 1.5 : 1)
actualDmg = max(0, finalDmg - enemy.armor)
enemy.armor = max(0, enemy.armor - finalDmg)
enemy.hp -= actualDmg

// Enemy attacking player:
attackVal = action.value + enemy.status.strength
attackVal *= (enemy.status.weak > 0 ? 0.75 : 1)
actualDmg = max(0, attackVal - player.armor)
player.armor = max(0, player.armor - attackVal)
player.hp -= actualDmg
```

## Essence Formula
```js
// 사망 시: playerDied()
essenceGained = Math.max(3, Math.floor(run.floor * RUN_ESSENCE_PER_FLOOR * 0.6))
// 승리 시: runVictory()
essenceGained = RUN_ESSENCE_BASE + RUN_ESSENCE_PER_FLOOR * (run.floor - 1)
// 두 경우 모두 run.essenceGained에 저장 → renderDeathHTML/renderVictoryHTML에서 참조
```

## Buildings
| ID | Name | Max Lvl | Resource | Base Rate | Base Cost |
|---|---|---|---|---|---|
| gold_mine | Gold Mine | 5 | gold | 1/s | 50g |
| mana_well | Mana Well | 5 | mana | 0.5/s | 100g |
| essence_shrine | Essence Shrine | 3 | essence | 0.1/s | 500g |

Cost formula: `baseCost × (costMultiplier ^ currentLevel)`

## Meta Upgrades (cost: essence)
| ID | Effect | Max Lvl | Base Cost |
|---|---|---|---|
| max_hp | +10 max HP | 5 | 5 |
| start_gold | +50 gold at run start | 5 | 3 |
| extra_energy | +1 energy/turn | 2 | 10 |
| better_rewards | +20% gold from combat | 3 | 4 |

## Shop Cards
- 4 cards shown, Fisher-Yates shuffled from SHOP_POOL
- Refresh cost: 20g 시작, ×1.5 per use, max 100g, run 종료 시 리셋
- Card prices: common 30g, uncommon 60g, rare 120g

## Floor → Enemy Pool
- Floor 1: rat, goblin
- Floor 2: bandit, skeleton
- Floor 3: orc, mushroom
- Floor 4: dark_knight, necromancer
- Floor 5 (boss): goblin_king OR lich

## Rewards
- Combat win: `15g × floor × (1 + better_rewards × 0.2)`
- Run complete (5 floors): `RUN_ESSENCE_BASE + RUN_ESSENCE_PER_FLOOR × (floor-1)` essence
- Run death: `max(3, floor × RUN_ESSENCE_PER_FLOOR × 0.6)` essence
- Reward screen: "Rest & Heal" → heal 30% maxHP, once per floor

## Visual Design
- Background: #0a0a0f | Panel: #12121a | Border: #2a2a3a
- Gold: #f0c040 | Mana: #6060f0 | Essence: #c060e0
- HP: #e04040 | Energy: #40c0a0 | Armor: #a0c0e0
- Text: #e0e0f0 | Dimmed: #606070
- Fonts: Cinzel (titles), system-ui (body)
- Layout: top resource bar + two-column (hub left, dungeon right)

## CSS Animation Classes (style.css)
- `.shake-hit` — enemy 피격 시 화면 흔들림 (`@keyframes shakeHit`)
- `.shake-player-hit` — 플레이어 피격 시 (`@keyframes shakePlayerHit`)
- `.floating-num` — 공통 부동 숫자 스타일
- `.float-dmg` — 붉은 피해 숫자 (enemy hit)
- `.float-dmg-player` — 흰 피해 숫자 (player hit)
- `.btn-mana-surge` — Mana Surge 버튼
- `.mana-surge-hint` — 안내 텍스트
- `.combat-actions` — combat 하단 버튼 그룹
- `.btn-rest` / `.rest-used` — reward 화면 휴식 버튼
- `.float-block-label` — 청색 "🛡 BLOCKED!" 부동 텍스트 (`@keyframes blockShield`)
- `.float-block-num` — 흡수된 피해량 숫자 (armor-blue, `@keyframes blockNum`)

## Bug Fixes Applied (전체 누적)

### Round 1-2 기본 버그
- Enemy armor 무한 누적 → 매 적 턴 시작 시 `enemy.armor = 0` 리셋
- Enemy regen 영구 지속 → 적용 후 `enemy.status.regen--` 감소
- `player.strength` 층 간 유지 → `enterCombat()`에서 0으로 리셋 + 로그 출력
- start_gold exploit → `startGoldBonus`를 run에 저장, 즉시 idle.gold에 반영 안 함
- `addLog()` null guard 추가
- Hub 버튼 hover flicker → gold/essence floor 값 변경 시에만 재렌더

### Round 3-4 로직 버그
- `restedThisFloor` 층 간 리셋 누락 → `proceedAfterReward()`에서 false로 리셋
- `restedThisFloor` startRun() 초기화 누락 → 기본값 false 추가
- Shop refresh cost 리셋 안 됨 → `exitRun()`에서 `state.shop.refreshCost = 20` 리셋

### Round 5 심화 버그
- `pickShopCards()` 편향 셔플 → Fisher-Yates로 교체
- `restAndHeal()` 더블클릭 exploit → 함수 상단 `run.restedThisFloor` 체크 추가
- Whirlwind player.strength 무시 → `(5 + player.strength) × energy`로 수정
- Floor 1 사망 에센스 너무 적음 → `max(3, floor×5×0.6)` 공식으로 변경

### Round 6 수정 완료
- 사망/승리 에센스 표시 불일치 → `run.essenceGained` 필드에 저장, render 함수에서 참조

### Round 12: Block Success VFX
- `endTurn()`: `actual === 0 && absorbed > 0` 시 `scheduleEffect('block-success', absorbed)` 호출
- `flushEffects()`: `'block-success'` → `spawnBlockEffect('.player-section', value)`
- `spawnBlockEffect(selector, absorbed)`: "🛡 BLOCKED!" label + absorbed 숫자 동시 표시
- CSS: `@keyframes blockShield` (0.9s), `@keyframes blockNum` (0.8s), `.float-block-label`, `.float-block-num`

### Round 13: Custom Tooltip System
- `#game-tooltip` 전역 컨테이너 추가 및 `showTooltip`/`hideTooltip` 헬퍼 구현
- 마우스 위치 추적 및 화면 경계 감지 (Smart positioning) 기능 포함
- 유물(Relics), 샵 카드, 덱 목록에 이름/설명/등급이 포함된 고해상도 툴팁 적용
- `title` 속성 제거 및 `onmouseenter`/`onmouseleave`/`onmousemove` 기반 커스텀 UI로 교체

### Round 11: Relic System + Big Hit VFX
- **Relic System**: 10개 유물 구현 (RELICS 상수, meta.relics[] 영구 저장)
  - Floor 2, 4 클리어 후 3개 유물 선택지 제공 (RELIC_OFFER_FLOORS)
  - `run.relicOffer`, `run.relicState` 필드 추가
  - 구현 유물: burning_blood, akabeko, bag_of_marbles, vajra, shuriken, kunai,
    meat_on_the_bone, ice_cream, fossilized_helix, unceasing_top
  - 각 유물 훅: enterCombat (ON_COMBAT_START), startPlayerTurn (counter reset + ice_cream energy),
    applyEffect/playCard (akabeko/shuriken/kunai/unceasing_top), endTurn (fossilized_helix),
    enemyDied (burning_blood/meat_on_the_bone)
  - Hub에 🏺 Relics 섹션 추가 (index.html + renderRelics())
  - Reward 화면에 relic offer 카드 선택 UI 추가
- **Big Hit VFX** (`BIG_HIT_THRESHOLD = 20`): 데미지 ≥ 20 시 발동
  - `scheduleEffect('big-hit-enemy', value)` → `shake-big-hit` + `float-dmg-big` + `float-big-label` + `big-hit-flash`
  - `spawnBigHitLabel()`, `spawnScreenFlash()` 함수 추가
  - CSS: `@keyframes shakeHitBig`, `@keyframes floatBig`, `@keyframes floatLabel`, `@keyframes bigHitFlash`

### Round 10: Reward Screen Decision (Heal vs Upgrade Card) + Code Review Fixes
- 플로어 보상으로 Rest & Heal vs Upgrade Card 선택지 추가 (mutually exclusive)
- 17개 카드 전부 `_plus` 업그레이드 버전 추가 (CARDS 상수에 `upgraded:true` 플래그)
- `CARD_UPGRADES` 맵 추가: `{ cardId → upgradedCardId }`
- `meta.startingDeck` 추가 → starter 카드 업그레이드 영구 반영 (startRun에서 STARTER_DECK 대신 사용)
- `upgradeCard()`: permanentDeck 없으면 startingDeck에서 교체 (스타터 카드 영구 업그레이드)
- `state.run.upgradeChoiceActive` 필드 추가 (카드 선택 UI 토글)
- `showUpgradeChoice()` / `hideUpgradeChoice()` / `upgradeCard(cardId)` 함수 추가
- Back 버튼 inline state mutation → `hideUpgradeChoice()` 함수 호출로 교체 (saveState 포함)
- `enemyDied()`: 남은 hand 카드 discard (다음 전투 오염 방지)
- `proceedAfterReward()`: `upgradeChoiceActive = false` 리셋
- Upgrade picker: 카드 수 표시 (e.g. "Strike ×5 — upgrades one")
- Abandon Run confirm text 수정: "essence not awarded" → "Gold and essence kept. Run ends as defeat."
- `whirlwind_plus` special 처리: `8 dmg/energy`, log에 card.name 사용
- CSS: `.reward-choice`, `.choice-row`, `.choice-btn`, `.upgrade-picker`, `.upgrade-card`, `.uc-count` 추가

### Round 9 수정 완료
- `start_gold` 즉시 지급 → `startRun()`에서 `state.idle.gold`에 직접 추가 (UI가 exploit 방지)
- Reward 화면 "Abandon Run" 버튼 추가 → `playerDied()` 호출로 essence 지급 후 종료
- `saveState()` 에러 무시 → `console.warn('Save failed:', e)` 추가

### Round 8 수정 완료
- Whirlwind 로그 pre-armor 데미지 표시 → `dealDmgToEnemy()` 반환값(actual) 사용
- `essenceGained: 0` startRun() 초기화 누락 → 명시적 초기화 추가
- Multi-hit 카드 적 사망 후 추가 hit 방지 → 루프 내 `enemy.hp <= 0` 체크 추가

### Round 7 수정 완료
- `renderDeathHTML()` 잘못된 공식 수정 → `run.essenceGained || 0` 사용
- `renderVictoryHTML()` 중복 계산 제거 → `run.essenceGained || 0` 사용
- Killing blow floating number 소실 → `enemyDied()` 시작 시 `flushEffects()` 즉시 호출
- Multi-hit floating number Y 겹침 → Y position 랜덤 offset (15%~55%)
- Mana Surge hint → manaRate===0 && mana<20 시 완전히 숨김
- Combat log 자동 스크롤 → renderDungeon()에서 scrollTop=scrollHeight 설정
- Buff intent 힌트 없음 → `(+N buffType)` 표시 추가
- `playCard()` out-of-bounds handIndex guard 추가
- `recomputeRates()` idleTick에서 제거 (building 변경 시에만 호출)
- Reward screen title "Victory!" → "Floor N Cleared!"
- 첫 진입 튜토리얼 힌트 → goldRate===0일 때 Gold Mine 안내 표시
- Deck pills에 energy cost 표시 추가
- Combat log 텍스트 contrast 개선 (#808090)
- 플레이 가능 카드 resting glow 추가

## 트렌드 분석 요약 (2025-2026)
trend-analyst 조사 결과 핵심:

### 가장 중요한 요소
1. **중첩 루프 구조** — 코어(5-15분) + 메타(30-60분) + 프레스티지(수 시간) ✓ 구현됨
2. **Game Feel** — 시각/청각 피드백이 체류시간 20-30% 증가. 최우선 개선 영역
3. **스킬 > 운** — 적 패턴 예측 가능해야 함 ✓ 결정론적 패턴 사용 중
4. **난이도 확장** — 클리어 후 Ascension 모드 없으면 이탈 (미구현)

### 현재 포지셔닝
Aether Crawl은 2025-2026 최고 트렌드인 **Incremental + Roguelike + Deck-building 3중 하이브리드** 구조로 Balatro, Slay the Spire와 동일한 방향성

### 즉시 구현 권장 (ROI 최고)
1. 카드 플레이 애니메이션 (슬라이드 → 중앙 → 소멸)
2. 사운드 이펙트 (클릭, 피격, 힐)
3. Achievement 시스템 (초보 플레이어 가이드 역할)

### 중기 구현 권장
1. Ascension 모드 (클리어 후 난이도 수정자 추가)
2. 메타 업그레이드 4-6개 추가
3. 두 번째 캐릭터 (다른 시작 덱 + 다른 스케일링)

## Known Gaps / Future Improvements
- No card removal mechanic (deck only grows)
- No in-run card rewards after combat (cards only added via hub shop)
- No floor variety (events, rest sites, treasure rooms)
- No Ascension difficulty modes (post-clear difficulty modifiers)
- No achievement system
- No second character / class
- No sound effects
- No card play animations (slide → center → disappear)
- Relic combat display: owned relics not shown during combat (only in hub)
- Upgraded card visual badge missing in hub deck view (CARDS[id].upgraded not used in renderDeck)

## TODOs / Next Session Priorities
- [x] 1. **Relic combat tray** — show owned relics as small icons in the combat view (below energy gems), with fossilized_helix showing as "used" when helix_active=false
- [x] 2. **Upgraded card badge** — add ✦ indicator in renderDeck() when CARDS[id].upgraded === true
- [x] 3. **Card play animation** — card slides from hand to center, flashes, disappears (CSS keyframes)
4. **Sound effects** — short Web Audio API tones for: card play, hit, block, level up, relic pickup
5. **Achievement system** — track milestones (first run, first boss kill, all floors cleared, etc.)
6. **Ascension mode** — after first full clear, unlock harder modifier per run (+1 enemy stats, etc.)
- [x] 7. **Enemy attack animation** — visual telegraph (lunge forward) when an enemy deals damage to the player
8. **Damage Number Stacking** — visual improvement for multi-hit cards where damage numbers fan out or slightly offset randomly instead of stacking perfectly.
