// src/ui/context.js — Shared UI state

export const uiContext = {
  state: null,
  onUpdate: null,
  dragState: {
    active: false,
    cardIdx: -1,
    startX: 0,
    startY: 0,
    moved: false,
    justDragged: false,
    suppressClickCardIdx: -1,
    showArrow: false,
    requiresTarget: false,
    dragGhost: null,
    dragSourceEl: null
  },
  arrowSvg: null,
  combatMapOpen: false,
  catalogOpen: false,
  render: null,
};
