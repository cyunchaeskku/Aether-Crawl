Original prompt: skill 카드 선택할 때(예시: defend) 한 번 클릭하면 사용 안 되고 두 번 클릭해야 사용됨. 이는 아마 공격 카드의 로직 때문인 거 같아. 공격카드는 (1) 클릭 후 적 클릭으로 선택 (2) 클릭 드래그해 적에게 커서 내려놓아 적에게 공격 선택. 이 두 가지를 할 수 있는데 이 로직때문에 클릭 한 번 할 시 바로 사용이 안 되는듯함. 대상이 필요없는 skill 카드일 때는 클릭 드래그 해서 대강 적에게 있는 부분에 내려놓으면 사용되도록 로직 가능해?

- 2026-03-03: Investigating click/drag combat input. Found drag suppression (`justDragged`) globally consumes next click, likely causing two-click issue after dragging target cards.
- 2026-03-03: Updated drag UX so arrow only appears for target-required cards. Non-target skill/defend cards still support drag-drop play onto enemies without showing targeting arrow.
- 2026-03-03: Added drag ghost card following mouse during card drag.
- 2026-03-03: Added relaxed drop rule for non-target cards: dropping near enemy (expanded hit area) plays card without exact target click.
- 2026-03-03: Kept exact target requirement for target-needed cards; arrow behavior unchanged for those cards.
- 2026-03-03: Non-target card drop trigger changed from enemy-near heuristic to full `.enemy-section` area.
- 2026-03-03: Added source-hand visual feedback during drag (`.hand-card.drag-source`: transparent + dashed border).
- 2026-03-03: Implemented `?` room resolution flow in run logic. Entering an `event` node now rolls dynamic outcomes (`monster` / `shop` / `treasure` / `event`) with per-act stateful probabilities.
- 2026-03-03: Added relic interactions for `?` rooms: `juzu_bracelet` prevents `monster` outcome, and `tiny_chest` guarantees `treasure` every 4th `?` room.
- 2026-03-03: Added Act 1 random event pool for `?` rooms (`Big Fish`, `Cleric`, `Golden Idol`, `Living Wall`, `Scrap Ooze`, `Shining Light`, `The Ssssserpent`, `World of Goop`, `Dead Adventurer`, `Hypnotizing Colored Mushrooms`, `Wing Statue`) with reward/combat/deck-mod effects.
- 2026-03-03: Fixed a bug where entering a 'monster' from a '?' room didn't trigger a render, causing the game to stay on the map.
- 2026-03-03: Refactored '?' room event system to use interactive choice-based logic instead of random auto-resolution.
- 2026-03-03: Implemented Act 2 events (Ancient Writing, Augmenter, Council of Ghosts, Cursed Tome, Forgotten Altar, Library, Masked Bandits, Vampires) and integrated Shared events into Act 2 pool.
- 2026-03-03: Updated UI to support a new 'event' phase with descriptions and choice buttons.
- 2026-03-03: Verified and ensured the dynamic probability (Pity Scaling) and per-Act reset logic for '?' rooms aligns with rulebook.md.
