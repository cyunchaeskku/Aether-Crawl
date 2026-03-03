// src/ui/hub.js — Hub panel rendering

import { CARDS, RELICS, META_UPGRADES, CARD_COST, CARD_UPGRADES } from '../data.js';
import { uiContext } from './context.js';
import { getEncounteredCards, metaUpgradeCost } from '../engine.js';
import { currentLanguage } from '../i18n.js';

const EFFECT_LABELS = {
  damage: 'Damage',
  block: 'Block',
  draw: 'Draw',
  strength: 'Strength',
  vulnerable: 'Vulnerable',
  weak: 'Weak',
  dexterity: 'Dexterity',
  energy: 'Energy',
  energyGain: 'Energy Gain',
  hpLoss: 'HP Loss',
  tempStrengthLoss: 'Temp Strength Loss',
  selfVulnerable: 'Self Vulnerable',
  brutality: 'Brutality Draw',
};

function getBaseCardId(cardId) {
  const entries = Object.entries(CARD_UPGRADES);
  for (let i = 0; i < entries.length; i += 1) {
    if (entries[i][1] === cardId) return entries[i][0];
  }
  return null;
}

function getUpgradePair(cardId) {
  if (CARD_UPGRADES[cardId]) return { baseId: cardId, upgradedId: CARD_UPGRADES[cardId] };
  const baseId = getBaseCardId(cardId);
  if (baseId) return { baseId, upgradedId: cardId };
  return null;
}

function renderUpgradeCardBlock(card, label, extraClass) {
  const badge = card.upgraded ? ' <span class="upgraded-badge">✦</span>' : '';
  return '<div class="catalog-detail-card card-' + card.type + ' rarity-' + card.rarity + (extraClass ? ' ' + extraClass : '') + '">' +
    '<div class="catalog-detail-label">' + label + '</div>' +
    '<div class="card-header"><span class="card-name">' + card.name + badge + '</span><span class="card-cost-badge">' + card.cost + '⚡</span></div>' +
    '<div class="card-desc">' + card.description + '</div>' +
    '<div class="card-footer"><span class="rarity-tag">' + card.rarity + '</span><span class="rarity-tag">' + card.type + '</span></div>' +
  '</div>';
}

function renderUpgradeDelta(base, upgraded) {
  const changes = [];
  if (typeof base.cost === 'number' && typeof upgraded.cost === 'number' && base.cost !== upgraded.cost) {
    changes.push('Cost: ' + base.cost + ' → ' + upgraded.cost);
  }

  const baseEff = base.effect || {};
  const upEff = upgraded.effect || {};
  const keys = Array.from(new Set([...Object.keys(baseEff), ...Object.keys(upEff)]));
  keys.forEach((key) => {
    if (typeof baseEff[key] !== 'number' && typeof upEff[key] !== 'number') return;
    const from = typeof baseEff[key] === 'number' ? baseEff[key] : 0;
    const to = typeof upEff[key] === 'number' ? upEff[key] : 0;
    if (from === to) return;
    const label = EFFECT_LABELS[key] || key;
    changes.push(label + ': ' + from + ' → ' + to);
  });

  if (changes.length === 0) {
    return '<div class="catalog-detail-delta">Description and card rules updated on upgrade.</div>';
  }
  return '<div class="catalog-detail-delta">' + changes.join('<br>') + '</div>';
}

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
  const ko = currentLanguage(uiContext.state) === 'ko';
  btn.textContent = inRun
    ? (ko ? '던전 진행 중...' : 'In Dungeon...')
    : (ko ? '던전 입장' : 'Enter Dungeon');
  btn.disabled = inRun;
  btn.className = 'btn btn-danger btn-full' + (inRun ? ' disabled' : '');
}

export function renderCatalog() {
  const previewEl = document.getElementById('catalog-preview');
  const modalEl = document.getElementById('catalog-modal-list');
  const detailEl = document.getElementById('catalog-modal-detail');
  const overlayEl = document.getElementById('catalog-overlay');
  const toggleBtn = document.getElementById('catalog-toggle-btn');
  if (!previewEl || !modalEl || !detailEl || !overlayEl || !toggleBtn) return;

  const run = uiContext.state.run;
  const ko = currentLanguage(uiContext.state) === 'ko';
  const encountered = run ? getEncounteredCards(uiContext.state).filter(id => !!CARDS[id]) : [];
  const recent = encountered.slice(-10).reverse();

  if (!run) uiContext.catalogOpen = false;

  toggleBtn.textContent = uiContext.catalogOpen
    ? (ko ? '도감 접기' : 'Fold Catalog')
    : (ko ? '도감 보기' : 'View Catalog');
  toggleBtn.disabled = !run;
  toggleBtn.className = 'btn btn-small' + (run ? '' : ' disabled');

  if (!run) {
    uiContext.catalogSelectedCardId = null;
    previewEl.innerHTML = '<p class="catalog-empty">' + (ko ? '런을 시작하면 조우 카드 도감이 채워집니다.' : 'Start a run to build your encounter catalog.') + '</p>';
    modalEl.innerHTML = '<p class="catalog-empty">' + (ko ? '진행 중인 런이 없습니다.' : 'No active run.') + '</p>';
    detailEl.innerHTML = '<p class="catalog-empty">' + (ko ? '카드를 선택하세요.' : 'No card selected.') + '</p>';
    overlayEl.className = 'catalog-overlay';
    return;
  }

  if (encountered.length === 0) {
    uiContext.catalogSelectedCardId = null;
  } else if (!uiContext.catalogSelectedCardId || !encountered.includes(uiContext.catalogSelectedCardId)) {
    uiContext.catalogSelectedCardId = encountered[encountered.length - 1];
  }

  previewEl.innerHTML = encountered.length === 0
    ? ('<p class="catalog-empty">' + (ko ? '아직 조우한 카드가 없습니다.' : 'No cards encountered yet.') + '</p>')
    : '<div class="catalog-count">' + (ko ? ('확인한 카드 ' + encountered.length + '장') : ('Seen ' + encountered.length + ' card(s)')) + '</div>' +
      recent.map((id) => {
        const c = CARDS[id];
        const badge = c.upgraded ? '<span class="upgraded-badge">✦</span>' : '';
        return '<span class="deck-pill catalog-preview-pill card-' + c.type + '" onclick="window._ui.openCatalogCard(\'' + id + '\')" ' +
          'onmouseenter="showTooltip(event, \'card\', \'' + id + '\')" ' +
          'onmouseleave="hideTooltip()" ' +
          'onmousemove="showTooltip(event, \'card\', \'' + id + '\')">' +
          c.name + badge + ' <span class="deck-pill-cost">' + c.cost + '⚡</span>' +
        '</span>';
      }).join('');

  modalEl.innerHTML = encountered.length === 0
    ? ('<p class="catalog-empty">' + (ko ? '아직 조우한 카드가 없습니다.' : 'No cards encountered yet.') + '</p>')
    : encountered.map((id, idx) => {
      const c = CARDS[id];
      const badge = c.upgraded ? ' <span class="upgraded-badge">✦</span>' : '';
      const selected = uiContext.catalogSelectedCardId === id ? ' selected' : '';
      return '<div class="catalog-card card-' + c.type + ' rarity-' + c.rarity + selected + '" ' +
        'onclick="window._ui.selectCatalogCard(\'' + id + '\')" ' +
        'onmouseenter="showTooltip(event, \'card\', \'' + id + '\')" ' +
        'onmouseleave="hideTooltip()" ' +
        'onmousemove="showTooltip(event, \'card\', \'' + id + '\')">' +
        '<div class="catalog-card-order">#' + (idx + 1) + '</div>' +
        '<div class="card-header"><span class="card-name">' + c.name + badge + '</span><span class="card-cost-badge">' + c.cost + '⚡</span></div>' +
        '<div class="card-desc">' + c.description + '</div>' +
        '<div class="card-footer"><span class="rarity-tag">' + c.rarity + '</span><span class="rarity-tag">' + c.type + '</span></div>' +
      '</div>';
    }).join('');

  const selectedCard = uiContext.catalogSelectedCardId ? CARDS[uiContext.catalogSelectedCardId] : null;
  if (!selectedCard) {
    detailEl.innerHTML = '<p class="catalog-empty">' + (ko ? '카드를 선택하세요.' : 'No card selected.') + '</p>';
  } else {
    const pair = getUpgradePair(uiContext.catalogSelectedCardId);
    if (!pair || !CARDS[pair.baseId] || !CARDS[pair.upgradedId]) {
      detailEl.innerHTML =
        '<div class="catalog-detail-title">' + selectedCard.name + '</div>' +
        '<p class="catalog-empty">' + (ko ? '이 카드는 현재 데이터에 업그레이드 변형이 없습니다.' : 'This card has no upgrade variant in the current data.') + '</p>' +
        renderUpgradeCardBlock(selectedCard, ko ? '선택 카드' : 'Selected Card');
    } else {
      const baseCard = CARDS[pair.baseId];
      const upgradedCard = CARDS[pair.upgradedId];
      detailEl.innerHTML =
        '<div class="catalog-detail-title">' + (ko ? '업그레이드 미리보기' : 'Upgrade Preview') + '</div>' +
        '<div class="catalog-detail-cards">' +
          renderUpgradeCardBlock(baseCard, ko ? '기본' : 'Base') +
          '<div class="catalog-detail-arrow">→</div>' +
          renderUpgradeCardBlock(upgradedCard, ko ? '강화' : 'Upgraded') +
        '</div>' +
        renderUpgradeDelta(baseCard, upgradedCard);
    }
  }

  overlayEl.className = 'catalog-overlay' + (uiContext.catalogOpen ? ' open' : '');
}
