// src/ui/handlers.js — window._ui handlers

import { CARDS } from '../data.js';
import {
  buyCard,
  refreshShop,
  buyMetaUpgrade,
  toggleBGM,
  startRun,
  exitRun,
  enterMapNode,
  playCard,
  endTurn,
  selectRewardCard,
  skipCardReward,
  pickRelic,
  proceedAfterReward,
  restAndHeal,
  showUpgradeChoice,
  hideUpgradeChoice,
  upgradeCard,
  buyRunCard,
  removeRunCard,
  leaveShop,
  abandonRun,
  setSelectedCardIdx
} from '../engine.js';
import { uiContext } from './context.js';
import { cardNeedsTarget, showArrow } from './interaction.js';

export function initUIHandlers() {
  window._ui = {
    buyCard(cardId) {
      buyCard(uiContext.state, uiContext.render, cardId);
    },
    refreshShop() {
      refreshShop(uiContext.state, uiContext.render);
    },
    buyMetaUpgrade(id) {
      buyMetaUpgrade(uiContext.state, uiContext.render, id);
    },
    toggleBGM() {
      toggleBGM(uiContext.state, uiContext.render);
    },
    startRun() {
      startRun(uiContext.state, uiContext.render);
    },
    toggleCombatMap() {
      uiContext.combatMapOpen = !uiContext.combatMapOpen;
      uiContext.render();
    },
    enterMapNode(y, i) {
      enterMapNode(uiContext.state, uiContext.render, y, i);
    },
    playCard(handIndex, targetIdx) {
      playCard(uiContext.state, uiContext.render, handIndex, targetIdx !== undefined ? targetIdx : -1);
    },
    onCardClick(ev, handIndex) {
      if (uiContext.dragState.justDragged) { uiContext.dragState.justDragged = false; return; }
      playCard(uiContext.state, uiContext.render, handIndex, -1);
    },
    startCardDrag(ev, handIndex) {
      if (!ev || ev.button !== 0) return;
      const run = uiContext.state.run;
      if (!run || run.phase !== 'combat') return;
      const cardId = run.player.hand[handIndex];
      const card = CARDS[cardId];
      if (!card) return;
      if (run.player.energy < card.cost) return;
      if (!cardNeedsTarget(card)) return;
      const el = ev.currentTarget;
      if (!el || !el.getBoundingClientRect) return;
      const rect = el.getBoundingClientRect();
      uiContext.dragState = {
        active: true,
        cardIdx: handIndex,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        moved: false,
        justDragged: false
      };
      setSelectedCardIdx(handIndex);
      uiContext.render();
      showArrow(uiContext.dragState.startX, uiContext.dragState.startY, ev.clientX, ev.clientY);
      ev.preventDefault();
    },
    endTurn() {
      endTurn(uiContext.state, uiContext.render);
    },
    selectRewardCard(cardId) {
      selectRewardCard(uiContext.state, uiContext.render, cardId);
    },
    skipCardReward() {
      skipCardReward(uiContext.state, uiContext.render);
    },
    pickRelic(relicId) {
      pickRelic(uiContext.state, uiContext.render, relicId);
    },
    proceedAfterReward() {
      proceedAfterReward(uiContext.state, uiContext.render);
    },
    restAndHeal() {
      restAndHeal(uiContext.state, uiContext.render);
    },
    showUpgradeChoice() {
      showUpgradeChoice(uiContext.state, uiContext.render);
    },
    hideUpgradeChoice() {
      hideUpgradeChoice(uiContext.state, uiContext.render);
    },
    upgradeCard(cardId) {
      upgradeCard(uiContext.state, uiContext.render, cardId);
    },
    buyRunCard(cardId) {
      buyRunCard(uiContext.state, uiContext.render, cardId);
    },
    removeRunCard(cardId) {
      removeRunCard(uiContext.state, uiContext.render, cardId);
    },
    leaveShop() {
      leaveShop(uiContext.state, uiContext.render);
    },
    abandonRun() {
      abandonRun(uiContext.state, uiContext.render);
    },
    exitRun() {
      exitRun(uiContext.state, uiContext.render);
    },
  };
}
