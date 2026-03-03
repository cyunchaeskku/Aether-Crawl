# Project Rules

## Number 1 Priority — Rulebook Compliance

**Following `rulebook.md` is the number 1 priority for this project.**

- Always follow every rule documented in `rulebook.md`.
- Do not add any logic that violates those rules.
- If any violating logic is found, revise it immediately to comply with `rulebook.md`.

---

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




## VFX & SFX
- **SFX**: `sword_hit_` for attacks, `death_sfx.wav` for enemy death.
- **BGM**: Dynamic rotation from `assets/soundtracks/list.json`.
- **VFX**: Floating numbers, screen shake, screen flash (big hits).
