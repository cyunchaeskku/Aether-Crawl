// src/ui/context.js — Shared UI state

export const uiContext = {
  state: null,
  onUpdate: null,
  dragState: { active: false, cardIdx: -1, startX: 0, startY: 0, moved: false, justDragged: false },
  arrowSvg: null,
  combatMapOpen: false,
  render: null,
};
