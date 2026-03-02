// src/ui/dungeon.js — Dungeon panel rendering

import {
  CARDS,
  CARD_UPGRADES,
  RELICS,
  ENEMIES,
  NODE_ICONS,
  TOTAL_FLOORS,
  MAP_WIDTH,
  CARD_COST
} from '../data.js';
import { saveState } from '../state.js';
import { uiContext } from './context.js';
import { fmt } from './utils.js';
import { enemyNextAction, selectedCardIdx } from '../engine.js';

export function renderDungeon() {
  const run = uiContext.state.run;
  const el = document.getElementById('dungeon-panel');
  if (!run) {
    el.innerHTML =
      '<div class="dungeon-idle">' +
        '<div class="dungeon-title">The Dungeon Awaits</div>' +
        '<p class="dungeon-hint">Build your deck in the hub. Enter the dungeon when ready.<br>15 floors of danger and mystery await.</p>' +
        '<div class="dungeon-stats">' +
          '<div>Total Runs: <strong>' + uiContext.state.meta.totalRuns + '</strong></div>' +
          '<div>Best Floor: <strong>' + (uiContext.state.meta.bestFloor || '—') + '</strong></div>' +
        '</div>' +
      '</div>';
    return;
  }

  if (!run.map) { uiContext.state.run = null; saveState(uiContext.state); uiContext.render(); return; }

  if (run.phase === 'victory')     { el.innerHTML = renderVictoryHTML();     return; }
  if (run.phase === 'death')       { el.innerHTML = renderDeathHTML();       return; }
  if (run.phase === 'card_reward') { el.innerHTML = renderCardRewardHTML();  return; }
  if (run.phase === 'reward')      { el.innerHTML = renderRewardHTML();      return; }
  if (run.phase === 'shop')        { el.innerHTML = renderShopNodeHTML();    return; }
  if (run.phase === 'map')         { el.innerHTML = renderMapHTML();         return; }
  if (run.phase === 'combat') {
    el.innerHTML = renderCombatHTML();
  }
}

// ─── Map ─────────────────────────────────────────────────────────────────────

function renderMapHTML() {
  const run = uiContext.state.run;
  const map = run.map;
  const currentNode = run.currentMapNode;

  const currentAct = Math.floor((run.floor || 0) / 15) + 1;
  const startRow = (currentAct - 1) * 15;
  const endRow = Math.min(startRow + 15, TOTAL_FLOORS);
  const actMap = map.slice(startRow, endRow);

  const actNames = ['', 'The Exordium', 'The City', 'The Beyond'];
  const actName = actNames[currentAct] || 'Unknown Realm';
  const rowHeight = 80;

  let linesHtml = '';
  for (let y = 0; y < actMap.length - 1; y++) {
    const globalY = startRow + y;
    const row = actMap[y];
    const nextRow = actMap[y + 1];

    row.forEach((node, i) => {
      node.connections.forEach(connId => {
        const targetNode = nextRow.find(n => n.id === connId);
        if (!targetNode) return;

        const x1 = (node.x / MAP_WIDTH) * 85 + 7.5;
        const y1 = (actMap.length - 1 - y) * rowHeight + 30;
        const x2 = (targetNode.x / MAP_WIDTH) * 85 + 7.5;
        const y2 = (actMap.length - 1 - (y + 1)) * rowHeight + 30;

        let lineClass = 'map-line-disabled';
        const isCurrentPath = currentNode && currentNode.y === globalY && currentNode.i === i;
        if (isCurrentPath || (!currentNode && globalY === startRow)) {
          lineClass = 'map-line-active';
        } else if (currentNode && globalY < currentNode.y) {
          lineClass = 'map-line-passed';
        }

        linesHtml += '<line class="' + lineClass + '" x1="' + x1 + '%" y1="' + y1 + '" x2="' + x2 + '%" y2="' + y2 + '" />';
      });
    });
  }

  let rowsHtml = '';
  for (let y = actMap.length - 1; y >= 0; y--) {
    const globalY = startRow + y;
    const row = actMap[y];
    let nodesInRow = '';
    row.forEach((node, i) => {
      let statusClass = '';
      const isStartRow = (globalY === startRow && !currentNode);
      const isConnected = currentNode && map[currentNode.y][currentNode.i].connections.includes(node.id);
      const isCurrent = currentNode && currentNode.y === globalY && currentNode.i === i;
      const isPassed = currentNode && globalY < currentNode.y;

      if (isCurrent) statusClass = 'node-current';
      else if (isStartRow || isConnected) statusClass = 'node-active';
      else if (isPassed) statusClass = 'node-passed';
      else statusClass = 'node-disabled';

      const onclick = (isStartRow || isConnected) ? 'onclick="window._ui.enterMapNode(' + globalY + ', ' + i + ')"' : '';

      nodesInRow +=
        '<div class="map-node ' + statusClass + ' type-' + node.type + '" ' + onclick +
             'title="' + node.type.toUpperCase() + '" ' +
             'style="left: ' + ((node.x / MAP_WIDTH) * 85 + 7.5) + '%">' +
          '<span class="node-icon">' + NODE_ICONS[node.type] + '</span>' +
        '</div>';
    });
    rowsHtml += '<div class="map-row">' + nodesInRow + '</div>';
  }

  const totalMapHeight = actMap.length * rowHeight;

  return '<div class="map-view">' +
      '<div class="map-header">' +
        '<div class="map-title">ACT ' + currentAct + ': ' + actName + '</div>' +
        '<p class="map-subtitle">Floor ' + run.floor + ' / ' + TOTAL_FLOORS + '</p>' +
      '</div>' +
      '<div class="map-scroll-container">' +
        '<div class="map-grid" style="height: ' + totalMapHeight + 'px">' +
          '<svg class="map-svg" width="100%" height="' + totalMapHeight + '">' +
            linesHtml +
          '</svg>' +
          rowsHtml +
        '</div>' +
      '</div>' +
      '<div class="map-footer">' +
        '<button class="btn btn-abandon" onclick="if(confirm(\'Abandon run?\'))window._ui.abandonRun()">Abandon Run</button>' +
      '</div>' +
    '</div>';
}

function renderMapMiniHTML() {
  const run = uiContext.state.run;
  const map = run.map;
  const currentNode = run.currentMapNode;

  const currentAct = Math.floor((run.floor || 0) / 15) + 1;
  const startRow = (currentAct - 1) * 15;
  const endRow = Math.min(startRow + 15, TOTAL_FLOORS);
  const actMap = map.slice(startRow, endRow);

  const actNames = ['', 'The Exordium', 'The City', 'The Beyond'];
  const actName = actNames[currentAct] || 'Unknown Realm';
  const rowHeight = 56;

  let linesHtml = '';
  for (let y = 0; y < actMap.length - 1; y++) {
    const globalY = startRow + y;
    const row = actMap[y];
    const nextRow = actMap[y + 1];

    row.forEach((node, i) => {
      node.connections.forEach(connId => {
        const targetNode = nextRow.find(n => n.id === connId);
        if (!targetNode) return;

        const x1 = (node.x / MAP_WIDTH) * 85 + 7.5;
        const y1 = (actMap.length - 1 - y) * rowHeight + 24;
        const x2 = (targetNode.x / MAP_WIDTH) * 85 + 7.5;
        const y2 = (actMap.length - 1 - (y + 1)) * rowHeight + 24;

        let lineClass = 'map-line-disabled';
        const isCurrentPath = currentNode && currentNode.y === globalY && currentNode.i === i;
        if (isCurrentPath || (!currentNode && globalY === startRow)) {
          lineClass = 'map-line-active';
        } else if (currentNode && globalY < currentNode.y) {
          lineClass = 'map-line-passed';
        }

        linesHtml += '<line class="' + lineClass + '" x1="' + x1 + '%" y1="' + y1 + '" x2="' + x2 + '%" y2="' + y2 + '" />';
      });
    });
  }

  let rowsHtml = '';
  for (let y = actMap.length - 1; y >= 0; y--) {
    const globalY = startRow + y;
    const row = actMap[y];
    let nodesInRow = '';
    row.forEach((node, i) => {
      let statusClass = '';
      const isStartRow = (globalY === startRow && !currentNode);
      const isConnected = currentNode && map[currentNode.y][currentNode.i].connections.includes(node.id);
      const isCurrent = currentNode && currentNode.y === globalY && currentNode.i === i;
      const isPassed = currentNode && globalY < currentNode.y;

      if (isCurrent) statusClass = 'node-current';
      else if (isStartRow || isConnected) statusClass = 'node-active';
      else if (isPassed) statusClass = 'node-passed';
      else statusClass = 'node-disabled';

      nodesInRow +=
        '<div class="map-node ' + statusClass + ' type-' + node.type + '" ' +
             'title="' + node.type.toUpperCase() + '" ' +
             'style="left: ' + ((node.x / MAP_WIDTH) * 85 + 7.5) + '%">' +
          '<span class="node-icon">' + NODE_ICONS[node.type] + '</span>' +
        '</div>';
    });
    rowsHtml += '<div class="map-row">' + nodesInRow + '</div>';
  }

  const totalMapHeight = actMap.length * rowHeight;

  return '<div class="map-view map-view-mini">' +
      '<div class="map-header">' +
        '<div class="map-title">ACT ' + currentAct + ': ' + actName + '</div>' +
        '<p class="map-subtitle">Floor ' + run.floor + ' / ' + TOTAL_FLOORS + '</p>' +
      '</div>' +
      '<div class="map-scroll-container">' +
        '<div class="map-grid" style="height: ' + totalMapHeight + 'px">' +
          '<svg class="map-svg" width="100%" height="' + totalMapHeight + '">' +
            linesHtml +
          '</svg>' +
          rowsHtml +
        '</div>' +
      '</div>' +
    '</div>';
}

// ─── Combat ─────────────────────────────────────────────────────────────────-

function renderCombatHTML() {
  const run = uiContext.state.run;
  const { player, enemies } = run;

  const currentAct = Math.floor((run.floor - 1) / 15) + 1;
  const startFloor = (currentAct - 1) * 15 + 1;
  const actFloors = Array.from({ length: 15 }, (_, i) => startFloor + i);

  const floorDots = actFloors.map(f => {
    const cls = f < run.floor ? 'cleared' : f === run.floor ? 'current' : '';
    const label = f === run.floor ? '⚔' : f < run.floor ? '✓' : (f % 15 === 0 ? '👑' : f);
    return '<div class="floor-dot ' + cls + '">' + label + '</div>';
  }).join('');

  const energyGems = Array.from({ length: player.maxEnergy }, (_, i) =>
    '<span class="energy-gem ' + (i < player.energy ? 'full' : 'empty') + '">⚡</span>'
  ).join('');

  const relicList = uiContext.state.meta.relics || [];
  const relicTray = relicList.length > 0 ? '<div class="combat-relic-tray">' + relicList.map(rid => {
    const r = RELICS[rid];
    if (!r) return '';
    let usedClass = '';
    if (rid === 'fossilized_helix' && run.relicState && !run.relicState.helix_active) usedClass = ' relic-used';
    return '<span class="combat-relic-icon' + usedClass + '" onmouseenter="showTooltip(event, \'relic\', \'' + rid + '\')" onmouseleave="hideTooltip()" onmousemove="showTooltip(event, \'relic\', \'' + rid + '\')">' + r.icon + '</span>';
  }).join('') + '</div>' : '';

  const hand = player.hand.map((cardId, i) => {
    const card = CARDS[cardId];
    const canPlay = player.energy >= card.cost;
    const isSelected = (selectedCardIdx === i);
    return '<div class="hand-card card-' + card.type + ' ' + (canPlay ? 'playable' : 'unplayable') + (isSelected ? ' selected-card' : '') + '" ' +
      (canPlay ? 'onclick="window._ui.onCardClick(event,' + i + ')" onmousedown="window._ui.startCardDrag(event,' + i + ')"' : '') + '>' +
      '<div class="hc-cost">' + card.cost + '⚡</div>' +
      '<div class="hc-name">' + card.name + '</div>' +
      '<div class="hc-desc">' + card.description + '</div>' +
      '<div class="hc-type">' + card.type + '</div>' +
    '</div>';
  }).join('');

  const enemiesHtml = (enemies || []).map((enemy, idx) => {
    const def = ENEMIES[enemy.id];
    if (!def) return '';

    const action = enemyNextAction(uiContext.state, idx);
    if (!action) return '';

    const intentVal = action.type === 'attack'
      ? '(' + Math.floor((action.value + (enemy.status.strength || 0)) * (enemy.status.weak > 0 ? 0.75 : 1)) + ' dmg)'
      : action.type === 'block' ? '(+' + action.value + ' block)'
      : action.type === 'buff'  ? '(+' + action.value + ' ' + (action.buffType || '') + ')' : '';

    const isTargetable = (selectedCardIdx !== -1 && enemy.hp > 0);
    const statusTags = [
      (enemy.status.weak || 0) > 0       ? '<span class="status-tag status-weak">Weak ' + enemy.status.weak + '</span>' : '',
      (enemy.status.vulnerable || 0) > 0 ? '<span class="status-tag status-vuln">Vuln ' + enemy.status.vulnerable + '</span>' : '',
      (enemy.status.regen || 0) > 0      ? '<span class="status-tag status-regen">Regen ' + enemy.status.regen + '</span>' : '',
      (enemy.status.strength || 0) > 0   ? '<span class="status-tag status-strength">Str +' + enemy.status.strength + '</span>' : '',
    ].join('');

    const spriteHtml = def.sprite
      ? '<div class="enemy-sprite-img ' + def.sprite + '"></div>'
      : '<div class="enemy-sprite-emoji">' + (def.icon || '❓') + '</div>';

    return '<div id="enemy-unit-' + idx + '" class="enemy-unit ' + (enemy.hp <= 0 ? 'dead' : '') + (isTargetable ? ' targetable' : '') + '" ' +
      (isTargetable ? 'onclick="window._ui.playCard(' + selectedCardIdx + ', ' + idx + ')"' : '') + '>' +
      '<div class="enemy-intent">Next: <strong>' + (action.label || '...') + '</strong> ' + intentVal + '</div>' +
      '<div class="enemy-sprite">' + spriteHtml + '</div>' +
      '<div class="enemy-name">' + (def.isBoss ? '👑 ' : '') + def.name + '</div>' +
      '<div class="hp-bar-wrap">' +
        '<div class="hp-bar" style="width:' + Math.round(enemy.hp / enemy.maxHp * 100) + '%"></div>' +
        '<span class="hp-text">' + enemy.hp + ' / ' + enemy.maxHp + '</span>' +
      '</div>' +
      (enemy.armor > 0 ? '<div class="armor-display">🛡 ' + enemy.armor + '</div>' : '') +
      '<div class="enemy-status">' + statusTags + '</div>' +
    '</div>';
  }).join('');

  const mapPanel = '<div class="combat-map-panel ' + (uiContext.combatMapOpen ? 'open' : 'closed') + '">' +
    '<button class="btn btn-small combat-map-toggle" onclick="window._ui.toggleCombatMap()">' +
      (uiContext.combatMapOpen ? 'Hide Map' : 'Show Map') +
    '</button>' +
    '<div class="combat-map-inner">' + (uiContext.combatMapOpen ? renderMapMiniHTML() : '') + '</div>' +
  '</div>';

  return '<div class="combat-layout">' +
    '<div class="combat-view">' +
    '<div class="floor-bar">' + floorDots + '<span class="floor-label">ACT ' + currentAct + ' - Floor ' + run.floor + '/' + TOTAL_FLOORS + '</span></div>' +
    '<div id="enemy-section" class="enemy-section">' +
      enemiesHtml +
    '</div>' +
    '<div class="player-section">' +
      '<div class="player-stats">' +
        '<div class="stat-block hp">' +
          '<div class="hp-bar-wrap">' +
            '<div class="hp-bar hp-player" style="width:' + Math.round(player.hp / player.maxHp * 100) + '%"></div>' +
            '<span class="hp-text">' + player.hp + ' / ' + player.maxHp + '</span>' +
          '</div>' +
          (player.armor > 0 ? '<span class="armor-display">🛡 ' + player.armor + '</span>' : '') +
        '</div>' +
        '<div class="energy-display">' + energyGems +
          '<span class="energy-text">' + player.energy + '/' + player.maxEnergy + '</span>' +
        '</div>' +
        (player.strength > 0 ? '<div class="player-status"><span class="status-tag status-strength">Str +' + player.strength + '</span></div>' : '') +
      '</div>' +
      relicTray +
      '<div class="combat-actions">' +
        '<div class="hand-label">Hand (' + player.drawPile.length + ' draw | ' + player.discardPile.length + ' discard) &nbsp;⚜ ' + fmt(uiContext.state.idle.gold) + '</div>' +
      '</div>' +
      '<div class="hand">' + hand + '</div>' +
      '<button class="btn btn-end-turn" onclick="window._ui.endTurn()">End Turn</button>' +
    '</div>' +
  '</div>' +
  mapPanel +
  '</div>';
}

// ─── Card Reward ─────────────────────────────────────────────────────────────-

function renderCardRewardHTML() {
  const run = uiContext.state.run;
  const cardOffer = run.cardOffer || [];
  const rarityColor = { common:'var(--common-gray)', uncommon:'var(--uncommon-green)', rare:'var(--rare-gold)' };

  const cardsHtml = cardOffer.map(cardId => {
    const card = CARDS[cardId];
    if (!card) return '';
    return '<div class="reward-card card-' + card.type + ' rarity-' + card.rarity + '" ' +
      'onclick="hideTooltip();window._ui.selectRewardCard(\'' + cardId + '\')" ' +
      'onmouseenter="showTooltip(event,\'card\',\'' + cardId + '\')" ' +
      'onmouseleave="hideTooltip()" ' +
      'onmousemove="showTooltip(event,\'card\',\'' + cardId + '\')">' +
      '<div class="card-header"><span class="card-name">' + card.name + '</span><span class="card-cost-badge">' + card.cost + '⚡</span></div>' +
      '<div class="card-desc">' + card.description + '</div>' +
      '<div class="card-footer"><span class="rarity-tag" style="color:' + rarityColor[card.rarity] + '">' + card.rarity + '</span></div>' +
    '</div>';
  }).join('');

  let relicSection = '';
  if (run.relicOffer && run.relicOffer.length > 0) {
    relicSection = renderRelicOfferHTML(run.relicOffer);
  }

  return '<div class="result-view card-reward-view">' +
    '<div class="result-title">⚔ Victory! Choose a Card</div>' +
    '<p class="reward-hint">Add one card to your deck for this run, or skip.</p>' +
    relicSection +
    '<div class="reward-cards">' + cardsHtml + '</div>' +
    '<button class="btn btn-small btn-skip" onclick="hideTooltip();window._ui.skipCardReward()">Skip reward</button>' +
  '</div>';
}

// ─── Reward (rest / treasure) ───────────────────────────────────────────────-

function renderRewardHTML() {
  const run = uiContext.state.run;
  const rewardType = run.rewardType || 'rest';
  const { player } = run;

  const title = rewardType === 'treasure' ? '💎 Treasure Found!' : '🔥 Rest Site';

  let choiceSection = '';
  if (rewardType === 'rest') {
    const healAmt = Math.floor(player.maxHp * 0.3);
    if (run.restedThisFloor) {
      choiceSection = '<div class="rest-used">✓ Floor benefit used.</div>';
    } else if (run.upgradeChoiceActive) {
      const allCards = [...player.hand, ...player.drawPile, ...player.discardPile];
      const countMap = {};
      allCards.forEach(cid => { if (CARD_UPGRADES[cid]) countMap[cid] = (countMap[cid] || 0) + 1; });
      const upgradeable = Object.keys(countMap);
      const cardPicker = upgradeable.length === 0
        ? '<p class="upgrade-none">No upgradeable cards in deck.</p>'
        : upgradeable.map(cid => {
            const base = CARDS[cid];
            const upg = CARDS[CARD_UPGRADES[cid]];
            const count = countMap[cid];
            const countNote = count > 1 ? ' <span class="uc-count">(×' + count + ' — upgrades one)</span>' : '';
            return '<div class="upgrade-card" onclick="window._ui.upgradeCard(\'' + cid + '\')">' +
              '<div class="uc-name">' + base.name + countNote + ' → <strong>' + upg.name + '</strong></div>' +
              '<div class="uc-desc">' + base.description + ' → ' + upg.description + '</div>' +
            '</div>';
          }).join('');
      choiceSection =
        '<div class="upgrade-picker">' +
          '<div class="upgrade-picker-title">Choose a card to upgrade:</div>' +
          cardPicker +
          '<button class="btn btn-small" onclick="window._ui.hideUpgradeChoice()">← Back</button>' +
        '</div>';
    } else {
      const hpFull = player.hp >= player.maxHp;
      const canUpgrade = [...player.hand, ...player.drawPile, ...player.discardPile].some(cid => CARD_UPGRADES[cid]);
      choiceSection =
        '<div class="reward-choice">' +
          '<div class="choice-label">Choose your rest site action:</div>' +
          '<div class="choice-row">' +
            '<button class="btn btn-rest choice-btn' + (hpFull ? ' choice-disabled' : '') + '" ' +
              (hpFull ? 'disabled' : 'onclick="window._ui.restAndHeal()"') + '>' +
              '🔥 Rest &amp; Heal<br><small>Restore ' + healAmt + ' HP' + (hpFull ? ' (HP full)' : '') + '</small>' +
            '</button>' +
            '<div class="choice-or">or</div>' +
            '<button class="btn choice-btn btn-upgrade' + (canUpgrade ? '' : ' choice-disabled') + '" ' +
              (canUpgrade ? 'onclick="window._ui.showUpgradeChoice()"' : 'disabled') + '>' +
              '⚡ Upgrade Card<br><small>' + (canUpgrade ? 'Permanently improve one card' : 'No cards to upgrade') + '</small>' +
            '</button>' +
          '</div>' +
        '</div>';
    }
  }

  let relicSection = '';
  if (run.relicOffer && run.relicOffer.length > 0) {
    relicSection = renderRelicOfferHTML(run.relicOffer);
  }

  return '<div class="result-view reward-view">' +
    '<div class="result-title">' + title + '</div>' +
    relicSection +
    choiceSection +
    '<button class="btn btn-danger" onclick="window._ui.proceedAfterReward()">← Back to Map</button>' +
  '</div>';
}

function renderRelicOfferHTML(relicOffer) {
  const rarityColor = { common:'var(--common-gray)', uncommon:'var(--uncommon-green)', rare:'var(--rare-gold)' };
  return '<div class="relic-offer">' +
    '<div class="relic-offer-title">✦ Choose a Relic</div>' +
    relicOffer.map(rid => {
      const r = RELICS[rid];
      return '<div class="relic-offer-card" onclick="window._ui.pickRelic(\'' + rid + '\');hideTooltip()">' +
        '<span class="relic-icon">' + r.icon + '</span>' +
        '<div class="relic-info">' +
          '<div class="relic-name" style="color:' + rarityColor[r.rarity] + '">' + r.name + '</div>' +
          '<div class="relic-desc">' + r.description + '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

// ─── Run Shop ─────────────────────────────────────────────────────────────────

function renderShopNodeHTML() {
  const run = uiContext.state.run;
  const shopCards = run.shopCards || [];
  const cardsHtml = shopCards.map(cardId => {
    const card = CARDS[cardId];
    if (!card) return '';
    const isSale = (cardId === run.shopSaleCard);
    const baseCost = CARD_COST[card.rarity];
    const cost = isSale ? Math.floor(baseCost * 0.5) : baseCost;
    const canBuy = uiContext.state.idle.gold >= cost;
    const saleBadge = isSale ? '<span class="sale-badge">SALE 50% OFF</span>' : '';
    return '<div class="shop-card card-' + card.type + ' rarity-' + card.rarity + (isSale ? ' on-sale' : '') + '" ' +
      'onmouseenter="showTooltip(event,\'card\',\'' + cardId + '\')" ' +
      'onmouseleave="hideTooltip()" ' +
      'onmousemove="showTooltip(event,\'card\',\'' + cardId + '\')">' +
      saleBadge +
      '<div class="card-header"><span class="card-name">' + card.name + '</span><span class="card-cost-badge">' + card.cost + '⚡</span></div>' +
      '<div class="card-desc">' + card.description + '</div>' +
      '<div class="card-footer"><span class="rarity-tag">' + card.rarity + '</span>' +
      '<button class="btn btn-gold btn-small' + (canBuy ? '' : ' disabled') + '" ' + (canBuy ? '' : 'disabled ') +
        'onclick="window._ui.buyRunCard(\'' + cardId + '\')">⚜ ' + (isSale ? '<s style="opacity:0.5">' + baseCost + '</s> ' : '') + cost + '</button>' +
      '</div></div>';
  }).join('');

  const deck = [...run.player.drawPile, ...run.player.discardPile, ...run.player.hand];
  const counts = {};
  deck.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
  const removeCost = 75 + (run.removeCount || 0) * 25;
  const removalAvailable = !run.shopRemovalUsed;
  const canRemove = removalAvailable && uiContext.state.idle.gold >= removeCost && deck.length > 0;
  const removalList = Object.keys(counts).map((cardId) => {
    const card = CARDS[cardId];
    if (!card) return '';
    return '<div class="shop-remove-row">' +
      '<span class="remove-card-name">' + card.name + ' <span class="remove-count">x' + counts[cardId] + '</span></span>' +
      '<button class="btn btn-small' + (canRemove ? '' : ' disabled') + '" ' + (canRemove ? '' : 'disabled ') +
        'onclick="window._ui.removeRunCard(\'' + cardId + '\')">Remove</button>' +
      '</div>';
  }).join('');

  return '<div class="result-view shop-view">' +
    '<div class="result-title">💰 Merchant\'s Wares</div>' +
    '<p class="shop-hint">Cards purchased here are added to your deck for this run. &nbsp;⚜ ' + fmt(uiContext.state.idle.gold) + '</p>' +
    '<div class="shop-grid">' + (cardsHtml || '<p class="shop-empty">Nothing left in stock.</p>') + '</div>' +
    '<div class="shop-removal">' +
      '<div class="shop-removal-title">Card Removal Service</div>' +
      '<div class="shop-removal-cost">Cost: ⚜ ' + removeCost + (removalAvailable ? '' : ' (used)') + '</div>' +
      (deck.length > 0 ? ('<div class="shop-removal-list">' + removalList + '</div>') : '<p class="shop-empty">No cards to remove.</p>') +
    '</div>' +
    '<button class="btn btn-danger" onclick="window._ui.leaveShop()">Leave Shop</button>' +
  '</div>';
}

// ─── Victory / Death ─────────────────────────────────────────────────────────-

function renderVictoryHTML() {
  const run = uiContext.state.run;
  const ess = run.essenceGained || 0;
  return '<div class="result-view victory-view">' +
    '<div class="result-title">👑 Dungeon Conquered!</div>' +
    '<p>All ' + TOTAL_FLOORS + ' floors cleared. You are victorious.</p>' +
    '<div class="reward-summary">' +
      '<div>Gold earned: <strong>' + run.goldEarned + '</strong></div>' +
      '<div>Essence gained: <strong>◈ ' + ess + '</strong></div>' +
      '<div>Total damage dealt: <strong>' + (run.totalDamage || 0) + '</strong></div>' +
    '</div>' +
    '<button class="btn btn-danger" onclick="window._ui.exitRun()">Return to Hub</button>' +
  '</div>';
}

function renderDeathHTML() {
  const run = uiContext.state.run;
  const ess = run.essenceGained || 0;
  return '<div class="result-view death-view">' +
    '<div class="result-title">☠ Defeated</div>' +
    '<p>You fell on floor ' + run.floor + '.</p>' +
    '<div class="reward-summary">' +
      '<div>Gold earned: <strong>' + run.goldEarned + '</strong></div>' +
      '<div>Essence gained: <strong>◈ ' + ess + '</strong></div>' +
      '<div>Total damage dealt: <strong>' + (run.totalDamage || 0) + '</strong></div>' +
    '</div>' +
    '<button class="btn btn-danger" onclick="window._ui.exitRun()">Return to Hub</button>' +
  '</div>';
}
