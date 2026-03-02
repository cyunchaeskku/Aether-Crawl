// src/ui/hub.js — Hub panel rendering

import { CARDS, RELICS, META_UPGRADES, CARD_COST } from '../data.js';
import { uiContext } from './context.js';
import { metaUpgradeCost } from '../engine.js';

export function renderShop() {
  const shopEl = document.getElementById('shop-cards');
  if (!shopEl) return;
  shopEl.innerHTML = uiContext.state.shop.available.map((cardId) => {
    const card = CARDS[cardId];
    if (!card) return '';
    const cost = CARD_COST[card.rarity];
    const canBuy = uiContext.state.idle.gold >= cost;
    return '<div class="shop-card card-' + card.type + ' rarity-' + card.rarity + '" ' +
      'onmouseenter="showTooltip(event, \'card\', \'' + cardId + '\')" ' +
      'onmouseleave="hideTooltip()" ' +
      'onmousemove="showTooltip(event, \'card\', \'' + cardId + '\')">' +
      '<div class="card-header">' +
        '<span class="card-name">' + card.name + '</span>' +
        '<span class="card-cost-badge">' + card.cost + '⚡</span>' +
      '</div>' +
      '<div class="card-desc">' + card.description + '</div>' +
      '<div class="card-footer">' +
        '<span class="rarity-tag">' + card.rarity + '</span>' +
        '<button class="btn btn-gold btn-small' + (canBuy ? '' : ' disabled') + '" ' + (canBuy ? '' : 'disabled ') +
          'onclick="window._ui.buyCard(\'' + cardId + '\')">⚜ ' + cost + '</button>' +
      '</div>' +
    '</div>';
  }).join('');

  const canRefresh = uiContext.state.idle.gold >= uiContext.state.shop.refreshCost;
  const rb = document.getElementById('shop-refresh');
  rb.innerHTML = 'Refresh ⚜ ' + uiContext.state.shop.refreshCost;
  rb.disabled = !canRefresh;
  rb.className = 'btn btn-small' + (canRefresh ? '' : ' disabled');
}

export function renderMetaUpgrades() {
  document.getElementById('meta-upgrades-list').innerHTML = META_UPGRADES.map(def => {
    const lv = uiContext.state.meta.upgrades[def.id];
    const maxed = lv >= def.maxLevel;
    const cost = metaUpgradeCost(uiContext.state, def.id);
    const canBuy = !maxed && uiContext.state.idle.essence >= cost;
    return '<div class="meta-card' + (maxed ? ' maxed' : '') + '">' +
      '<div class="meta-info">' +
        '<span class="meta-name">' + def.name + '</span>' +
        '<span class="meta-level">' + lv + '/' + def.maxLevel + '</span>' +
        '<span class="meta-desc">' + def.description + '</span>' +
      '</div>' +
      '<button class="btn btn-essence' + (canBuy ? '' : ' disabled') + '" ' + (canBuy ? '' : 'disabled ') +
        'onclick="window._ui.buyMetaUpgrade(\'' + def.id + '\')">' +
        (maxed ? 'MAX' : '◈ ' + cost) +
      '</button>' +
    '</div>';
  }).join('');
}

export function renderDeck() {
  const run = uiContext.state.run;
  const all = run && run.player
    ? [...run.player.drawPile, ...run.player.discardPile, ...run.player.hand]
    : [...(uiContext.state.meta.startingDeck || []), ...(uiContext.state.meta.permanentDeck || [])];
  const counts = {};
  all.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  document.getElementById('deck-list').innerHTML =
    '<span class="deck-count">' + all.length + ' cards</span>' +
    Object.keys(counts).map(id => {
      const card = CARDS[id], n = counts[id];
      if (!card) return '';
      const badge = card.upgraded ? '<span class="upgraded-badge">✦</span>' : '';
      return '<span class="deck-pill card-' + card.type + '" ' +
        'onmouseenter="showTooltip(event, \'card\', \'' + id + '\')" ' +
        'onmouseleave="hideTooltip()" ' +
        'onmousemove="showTooltip(event, \'card\', \'' + id + '\')">' +
        card.name + badge + (n > 1 ? ' ×' + n : '') + ' <span class="deck-pill-cost">' + card.cost + '⚡</span>' +
      '</span>';
    }).join('');
}

export function renderRelics() {
  const el = document.getElementById('relics-list');
  if (!el) return;
  const relics = uiContext.state.meta.relics || [];
  if (relics.length === 0) {
    el.innerHTML = '<div class="relics-empty">No relics yet. Earn them from floor 2 and 4 rewards.</div>';
    return;
  }
  const rarityColor = { common:'var(--common-gray)', uncommon:'var(--uncommon-green)', rare:'var(--rare-gold)' };
  el.innerHTML = relics.map(rid => {
    const r = RELICS[rid];
    if (!r) return '';
    return '<div class="relic-pill" ' +
      'onmouseenter="showTooltip(event, \'relic\', \'' + rid + '\')" ' +
      'onmouseleave="hideTooltip()" ' +
      'onmousemove="showTooltip(event, \'relic\', \'' + rid + '\')">' +
      '<span class="relic-pill-icon">' + r.icon + '</span>' +
      '<span class="relic-pill-name" style="color:' + rarityColor[r.rarity] + '">' + r.name + '</span>' +
    '</div>';
  }).join('');
}

export function renderRunBtn() {
  const btn = document.getElementById('run-btn');
  const inRun = !!uiContext.state.run;
  btn.textContent = inRun ? 'In Dungeon...' : 'Enter Dungeon';
  btn.disabled = inRun;
  btn.className = 'btn btn-danger btn-full' + (inRun ? ' disabled' : '');
}
