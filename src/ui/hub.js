// src/ui/hub.js — Hub panel rendering

import { CARDS, RELICS, META_UPGRADES, CARD_COST } from '../data.js';
import { uiContext } from './context.js';
import { getEncounteredCards, metaUpgradeCost } from '../engine.js';

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
  const rarityColor = { common:'var(--common-gray)', uncommon:'var(--uncommon-green)', rare:'var(--rare-gold)', boss:'var(--rare-gold)', shop:'var(--rare-gold)', starter:'var(--common-gray)' };
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

export function renderCatalog() {
  const previewEl = document.getElementById('catalog-preview');
  const modalEl = document.getElementById('catalog-modal-list');
  const overlayEl = document.getElementById('catalog-overlay');
  const toggleBtn = document.getElementById('catalog-toggle-btn');
  if (!previewEl || !modalEl || !overlayEl || !toggleBtn) return;

  const run = uiContext.state.run;
  const encountered = run ? getEncounteredCards(uiContext.state).filter(id => !!CARDS[id]) : [];
  const recent = encountered.slice(-10).reverse();

  if (!run) uiContext.catalogOpen = false;

  toggleBtn.textContent = uiContext.catalogOpen ? 'Fold Catalog' : 'View Catalog';
  toggleBtn.disabled = !run;
  toggleBtn.className = 'btn btn-small' + (run ? '' : ' disabled');

  if (!run) {
    previewEl.innerHTML = '<p class="catalog-empty">Start a run to build your encounter catalog.</p>';
    modalEl.innerHTML = '<p class="catalog-empty">No active run.</p>';
    overlayEl.className = 'catalog-overlay';
    return;
  }

  previewEl.innerHTML = encountered.length === 0
    ? '<p class="catalog-empty">No cards encountered yet.</p>'
    : '<div class="catalog-count">Seen ' + encountered.length + ' card(s)</div>' +
      recent.map((id) => {
        const c = CARDS[id];
        const badge = c.upgraded ? '<span class="upgraded-badge">✦</span>' : '';
        return '<span class="deck-pill card-' + c.type + '" ' +
          'onmouseenter="showTooltip(event, \'card\', \'' + id + '\')" ' +
          'onmouseleave="hideTooltip()" ' +
          'onmousemove="showTooltip(event, \'card\', \'' + id + '\')">' +
          c.name + badge + ' <span class="deck-pill-cost">' + c.cost + '⚡</span>' +
        '</span>';
      }).join('');

  modalEl.innerHTML = encountered.length === 0
    ? '<p class="catalog-empty">No cards encountered yet.</p>'
    : encountered.map((id, idx) => {
      const c = CARDS[id];
      const badge = c.upgraded ? ' <span class="upgraded-badge">✦</span>' : '';
      return '<div class="catalog-card card-' + c.type + ' rarity-' + c.rarity + '" ' +
        'onmouseenter="showTooltip(event, \'card\', \'' + id + '\')" ' +
        'onmouseleave="hideTooltip()" ' +
        'onmousemove="showTooltip(event, \'card\', \'' + id + '\')">' +
        '<div class="catalog-card-order">#' + (idx + 1) + '</div>' +
        '<div class="card-header"><span class="card-name">' + c.name + badge + '</span><span class="card-cost-badge">' + c.cost + '⚡</span></div>' +
        '<div class="card-desc">' + c.description + '</div>' +
        '<div class="card-footer"><span class="rarity-tag">' + c.rarity + '</span><span class="rarity-tag">' + c.type + '</span></div>' +
      '</div>';
    }).join('');

  overlayEl.className = 'catalog-overlay' + (uiContext.catalogOpen ? ' open' : '');
}
