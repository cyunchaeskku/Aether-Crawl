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
  usePotion,
  endTurn,
  selectRewardCard,
  skipCardReward,
  chooseSingingBowl,
  pickRelic,
  confirmRelicSelection,
  cancelRelicSelection,
  proceedAfterReward,
  restAndHeal,
  showUpgradeChoice,
  hideUpgradeChoice,
  upgradeCard,
  showRemoveChoice,
  hideRemoveChoice,
  removeCardAtRest,
  digForRelic,
  buyRunCard,
  removeRunCard,
  buyRunRelic,
  buyRunPotion,
  leaveShop,
  abandonRun,
  setSelectedCardIdx
} from '../engine.js';
import { uiContext } from './context.js';
import { cardNeedsTarget, createDragGhost, hideArrow, showArrow } from './interaction.js';

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
    toggleCatalog() {
      uiContext.catalogOpen = !uiContext.catalogOpen;
      uiContext.render();
    },
    closeCatalogFromBackdrop(ev) {
      if (ev && ev.target !== ev.currentTarget) return;
      uiContext.catalogOpen = false;
      uiContext.render();
    },
    enterMapNode(y, i) {
      enterMapNode(uiContext.state, uiContext.render, y, i);
    },
    playCard(handIndex, targetIdx) {
      playCard(uiContext.state, uiContext.render, handIndex, targetIdx !== undefined ? targetIdx : -1);
    },
    onCardClick(ev, handIndex) {
      if (uiContext.dragState.justDragged && uiContext.dragState.suppressClickCardIdx === handIndex) {
        uiContext.dragState.justDragged = false;
        uiContext.dragState.suppressClickCardIdx = -1;
        return;
      }
      uiContext.dragState.justDragged = false;
      uiContext.dragState.suppressClickCardIdx = -1;
      playCard(uiContext.state, uiContext.render, handIndex, -1);
    },
    startCardDrag(ev, handIndex) {
      if (!ev || ev.button !== 0) return;
      const run = uiContext.state.run;
      if (!run || run.phase !== 'combat') return;
      const cardId = run.player.hand[handIndex];
      const card = CARDS[cardId];
      if (!card) return;
      const powerLocked = card.type === 'power' && !!(run.relicState && run.relicState.powerCardsUsedThisCombat && run.relicState.powerCardsUsedThisCombat[card.id]);
      if (powerLocked) return;
      const cost = (run.player.handCosts && run.player.handCosts[handIndex] != null) ? run.player.handCosts[handIndex] : card.cost;
      if (run.player.energy < cost) return;
      const el = ev.currentTarget;
      if (!el || !el.getBoundingClientRect) return;
      if (uiContext.dragState.dragSourceEl && uiContext.dragState.dragSourceEl.classList) {
        uiContext.dragState.dragSourceEl.classList.remove('drag-source');
      }
      const rect = el.getBoundingClientRect();
      const shouldShowArrow = cardNeedsTarget(card);
      uiContext.dragState = {
        active: true,
        cardIdx: handIndex,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        moved: false,
        justDragged: false,
        suppressClickCardIdx: -1,
        showArrow: shouldShowArrow,
        requiresTarget: shouldShowArrow,
        dragGhost: null,
        dragSourceEl: el
      };
      el.classList.add('drag-source');
      createDragGhost(el, ev.clientX, ev.clientY);
      if (shouldShowArrow) {
        setSelectedCardIdx(handIndex);
        uiContext.render();
        showArrow(uiContext.dragState.startX, uiContext.dragState.startY, ev.clientX, ev.clientY);
      } else {
        hideArrow();
      }
      ev.preventDefault();
    },
    endTurn() {
      endTurn(uiContext.state, uiContext.render);
    },
    usePotion(potionIndex) {
      usePotion(uiContext.state, uiContext.render, potionIndex, -1);
    },
    usePotionTarget(potionIndex, targetIdx) {
      usePotion(uiContext.state, uiContext.render, potionIndex, targetIdx);
    },
    selectRewardCard(cardId) {
      selectRewardCard(uiContext.state, uiContext.render, cardId);
    },
    skipCardReward() {
      skipCardReward(uiContext.state, uiContext.render);
    },
    chooseSingingBowl() {
      chooseSingingBowl(uiContext.state, uiContext.render);
    },
    pickRelic(relicId) {
      pickRelic(uiContext.state, uiContext.render, relicId);
    },
    confirmRelicSelection(cardId) {
      confirmRelicSelection(uiContext.state, uiContext.render, cardId);
    },
    cancelRelicSelection() {
      cancelRelicSelection(uiContext.state, uiContext.render);
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
    showRemoveChoice() {
      showRemoveChoice(uiContext.state, uiContext.render);
    },
    hideRemoveChoice() {
      hideRemoveChoice(uiContext.state, uiContext.render);
    },
    removeCardAtRest(cardId) {
      removeCardAtRest(uiContext.state, uiContext.render, cardId);
    },
    digForRelic() {
      digForRelic(uiContext.state, uiContext.render);
    },
    buyRunCard(cardId) {
      buyRunCard(uiContext.state, uiContext.render, cardId);
    },
    removeRunCard(cardId) {
      removeRunCard(uiContext.state, uiContext.render, cardId);
    },
    buyRunRelic(relicId) {
      buyRunRelic(uiContext.state, uiContext.render, relicId);
    },
    buyRunPotion(potionId) {
      buyRunPotion(uiContext.state, uiContext.render, potionId);
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
