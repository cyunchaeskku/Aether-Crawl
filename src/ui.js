// src/ui.js — All DOM rendering

import {
  CARDS, BUILDINGS, META_UPGRADES, CARD_COST, ENEMIES, TOTAL_FLOORS
} from './data.js';
import {
  getBuildingUpgradeCost, canUpgradeBuilding,
  getMetaUpgradeCost, canBuyMetaUpgrade,
  canBuyCard, canRefreshShop,
  canPlayCard, getEnemyNextAction,
  startRun, endRun, upgradeBuilding,
  buyCard, refreshShop, buyMetaUpgrade,
  playCard, endTurn, proceedAfterReward
} from './engine.js';
import { saveState } from './state.js';

let _state = null;
let _onUpdate = null;

export function initUI(state, onUpdate) {
  _state = state;
  _onUpdate = onUpdate;
  render();
}

export function render() {
  renderResources();
  renderHub();
  renderDungeon();
}

// ─── Resources Bar ────────────────────────────────────────────────────────────

function renderResources() {
  const s = _state.idle;
  const fmtRate = r => r > 0 ? ` <span class="rate">(+${r.toFixed(1)}/s)</span>` : '';
  document.getElementById('res-gold').innerHTML =
    `⚜ ${fmt(s.gold)}${fmtRate(s.goldRate)}`;
  document.getElementById('res-mana').innerHTML =
    `✦ ${fmt(s.mana)}${fmtRate(s.manaRate)}`;
  document.getElementById('res-essence').innerHTML =
    `◈ ${fmt(s.essence)}${fmtRate(s.essenceRate)}`;
  document.getElementById('res-runs').textContent =
    `Runs: ${_state.meta.totalRuns} | Best: Floor ${_state.meta.bestFloor}`;
}

// ─── Hub Panel ────────────────────────────────────────────────────────────────

function renderHub() {
  renderBuildings();
  renderShop();
  renderMetaUpgrades();
  renderDeckList();
  renderRunButton();
}

function renderBuildings() {
  const el = document.getElementById('buildings-list');
  el.innerHTML = BUILDINGS.map((def, i) => {
    const b = _state.buildings[i];
    const cost = getBuildingUpgradeCost(_state, i);
    const canBuy = canUpgradeBuilding(_state, i);
    const maxed = b.level >= def.maxLevel;
    const rateNow = b.level > 0 ? `${(def.baseRate * b.level).toFixed(1)}/s` : 'inactive';
    return `
      <div class="building-card ${maxed ? 'maxed' : ''}">
        <div class="building-info">
          <span class="building-name">${def.name}</span>
          <span class="building-level">Lv ${b.level}/${def.maxLevel}</span>
          <span class="building-rate">${rateNow}</span>
          <span class="building-desc">${def.description}</span>
        </div>
        <button class="btn btn-gold ${canBuy ? '' : 'disabled'}"
          onclick="window._ui.upgradeBuilding(${i})"
          ${canBuy ? '' : 'disabled'}>
          ${maxed ? 'MAX' : `⚜ ${fmt(cost)}`}
        </button>
      </div>`;
  }).join('');
}

function renderShop() {
  const el = document.getElementById('shop-cards');
  const shop = _state.shop;
  el.innerHTML = shop.available.map((cardId, i) => {
    const card = CARDS[cardId];
    const canBuy = canBuyCard(_state, cardId);
    const cost = CARD_COST[card.rarity];
    return `
      <div class="shop-card card-${card.type} rarity-${card.rarity}">
        <div class="card-header">
          <span class="card-name">${card.name}</span>
          <span class="card-cost-badge">${card.cost}⚡</span>
        </div>
        <div class="card-desc">${card.description}</div>
        <div class="card-footer">
          <span class="rarity-tag">${card.rarity}</span>
          <button class="btn btn-gold ${canBuy ? '' : 'disabled'}"
            onclick="window._ui.buyCard('${cardId}')"
            ${canBuy ? '' : 'disabled'}>
            ⚜ ${cost}
          </button>
        </div>
      </div>`;
  }).join('');

  const refreshBtn = document.getElementById('shop-refresh');
  const canRefresh = canRefreshShop(_state);
  refreshBtn.innerHTML = `Refresh ⚜ ${_state.shop.refreshCost}`;
  refreshBtn.disabled = !canRefresh;
  refreshBtn.className = `btn btn-small ${canRefresh ? '' : 'disabled'}`;
}

function renderMetaUpgrades() {
  const el = document.getElementById('meta-upgrades-list');
  el.innerHTML = META_UPGRADES.map(def => {
    const level = _state.meta.upgrades[def.id];
    const maxed = level >= def.maxLevel;
    const cost = getMetaUpgradeCost(_state, def.id);
    const canBuy = canBuyMetaUpgrade(_state, def.id);
    return `
      <div class="meta-card ${maxed ? 'maxed' : ''}">
        <div class="meta-info">
          <span class="meta-name">${def.name}</span>
          <span class="meta-level">${level}/${def.maxLevel}</span>
          <span class="meta-desc">${def.description}</span>
        </div>
        <button class="btn btn-essence ${canBuy ? '' : 'disabled'}"
          onclick="window._ui.buyMeta('${def.id}')"
          ${canBuy ? '' : 'disabled'}>
          ${maxed ? 'MAX' : `◈ ${cost}`}
        </button>
      </div>`;
  }).join('');
}

function renderDeckList() {
  const el = document.getElementById('deck-list');
  const allCards = ['strike','strike','strike','strike','strike','defend','defend','defend','defend',
    ..._state.meta.permanentDeck];
  // Count occurrences
  const counts = {};
  allCards.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const unique = Object.keys(counts);
  el.innerHTML = `<span class="deck-count">${allCards.length} cards</span>` +
    unique.map(id => {
      const card = CARDS[id];
      const n = counts[id];
      return `<span class="deck-pill card-${card.type}" title="${card.description}">
        ${card.name}${n > 1 ? ` ×${n}` : ''}
      </span>`;
    }).join('');
}

function renderRunButton() {
  const btn = document.getElementById('run-btn');
  const inRun = !!_state.run;
  btn.textContent = inRun ? 'In Dungeon...' : 'Enter Dungeon';
  btn.disabled = inRun;
  btn.className = `btn btn-danger ${inRun ? 'disabled' : ''}`;
}

// ─── Dungeon Panel ────────────────────────────────────────────────────────────

function renderDungeon() {
  const run = _state.run;
  const el = document.getElementById('dungeon-panel');

  if (!run) {
    el.innerHTML = `
      <div class="dungeon-idle">
        <div class="dungeon-title">The Dungeon Awaits</div>
        <p class="dungeon-hint">
          Build your deck in the hub. Enter the dungeon when ready.<br>
          Each run: 5 floors, increasingly dangerous enemies.
        </p>
        <div class="dungeon-stats">
          <div>Total Runs: <strong>${_state.meta.totalRuns}</strong></div>
          <div>Best Floor: <strong>${_state.meta.bestFloor || '—'}</strong></div>
        </div>
      </div>`;
    return;
  }

  if (run.phase === 'victory') {
    renderVictory();
    return;
  }

  if (run.phase === 'death') {
    renderDeath();
    return;
  }

  if (run.phase === 'reward') {
    renderReward();
    return;
  }

  if (run.phase === 'combat') {
    renderCombat();
  }
}

function renderCombat() {
  const run = _state.run;
  const { player, enemy } = run;
  const enemyDef = ENEMIES[enemy.id];
  const nextAction = getEnemyNextAction(enemy);

  const statusTags = buildStatusTags(enemy.status);
  const playerStatusTags = player.strength > 0
    ? `<span class="status-tag status-strength">Strength +${player.strength}</span>` : '';

  document.getElementById('dungeon-panel').innerHTML = `
    <div class="combat-view">
      <!-- Floor indicator -->
      <div class="floor-bar">
        ${Array.from({length: TOTAL_FLOORS}, (_, i) => i + 1).map(f =>
          `<div class="floor-dot ${f < run.floor ? 'cleared' : f === run.floor ? 'current' : ''}">
            ${f === run.floor ? '⚔' : f < run.floor ? '✓' : f}
          </div>`
        ).join('')}
        <span class="floor-label">Floor ${run.floor}/${TOTAL_FLOORS}</span>
      </div>

      <!-- Enemy -->
      <div class="enemy-section">
        <div class="enemy-name ${enemyDef.isBoss ? 'boss' : ''}">
          ${enemyDef.isBoss ? '👑 ' : ''}${enemyDef.name}
          ${statusTags}
        </div>
        <div class="hp-bar-wrap">
          <div class="hp-bar" style="width:${(enemy.hp/enemy.maxHp)*100}%"></div>
          <span class="hp-text">❤ ${enemy.hp} / ${enemy.maxHp}</span>
        </div>
        ${enemy.armor > 0 ? `<div class="armor-display">🛡 ${enemy.armor}</div>` : ''}
        <div class="enemy-intent">
          Next: <strong>${nextAction.label}</strong>
          ${nextAction.type === 'attack' ? `(${nextAction.value + enemy.status.strength} dmg${enemy.status.weak > 0 ? ', Weak' : ''})` : ''}
          ${nextAction.type === 'block' ? `(+${nextAction.value} block)` : ''}
        </div>
      </div>

      <!-- Player -->
      <div class="player-section">
        <div class="player-stats">
          <div class="stat-block hp">
            <div class="hp-bar-wrap">
              <div class="hp-bar hp-player" style="width:${(player.hp/player.maxHp)*100}%"></div>
              <span class="hp-text">❤ ${player.hp} / ${player.maxHp}</span>
            </div>
            ${player.armor > 0 ? `<span class="armor-display">🛡 ${player.armor}</span>` : ''}
          </div>
          <div class="energy-display">
            ${Array.from({length: player.maxEnergy}, (_, i) =>
              `<span class="energy-gem ${i < player.energy ? 'full' : 'empty'}">⚡</span>`
            ).join('')}
            <span class="energy-text">${player.energy}/${player.maxEnergy}</span>
          </div>
          ${playerStatusTags ? `<div class="player-status">${playerStatusTags}</div>` : ''}
        </div>

        <!-- Hand -->
        <div class="hand-label">Your Hand (${player.drawPile.length} in draw, ${player.discardPile.length} in discard)</div>
        <div class="hand">
          ${player.hand.map((cardId, i) => renderCardInHand(cardId, i)).join('')}
        </div>

        <button class="btn btn-end-turn" onclick="window._ui.endTurn()">End Turn</button>
      </div>

      <!-- Log -->
      <div class="combat-log">
        ${run.log.slice(-8).map(l => `<div class="log-line">${l}</div>`).join('')}
      </div>
    </div>`;
}

function renderCardInHand(cardId, index) {
  const card = CARDS[cardId];
  const playable = canPlayCard(_state, index);
  return `
    <div class="hand-card card-${card.type} ${playable ? 'playable' : 'unplayable'}"
      onclick="${playable ? `window._ui.playCard(${index})` : ''}">
      <div class="hc-cost">${card.cost}⚡</div>
      <div class="hc-name">${card.name}</div>
      <div class="hc-desc">${card.description}</div>
      <div class="hc-type">${card.type}</div>
    </div>`;
}

function buildStatusTags(status) {
  const tags = [];
  if (status.weak > 0) tags.push(`<span class="status-tag status-weak">Weak ${status.weak}</span>`);
  if (status.vulnerable > 0) tags.push(`<span class="status-tag status-vuln">Vuln ${status.vulnerable}</span>`);
  if (status.regen > 0) tags.push(`<span class="status-tag status-regen">Regen ${status.regen}</span>`);
  if (status.strength > 0) tags.push(`<span class="status-tag status-strength">Str +${status.strength}</span>`);
  return tags.join('');
}

function renderReward() {
  const run = _state.run;
  document.getElementById('dungeon-panel').innerHTML = `
    <div class="result-view reward-view">
      <div class="result-title">⚔ Victory!</div>
      <p>Floor ${run.floor} cleared.</p>
      <div class="reward-gold">Gold earned this run so far: <strong>${run.goldEarned}</strong></div>
      ${run.floor < TOTAL_FLOORS
        ? `<button class="btn btn-danger" onclick="window._ui.proceed()">→ Floor ${run.floor + 1}</button>`
        : `<button class="btn btn-danger" onclick="window._ui.proceed()">👑 Claim Victory!</button>`
      }
    </div>`;
}

function renderVictory() {
  const run = _state.run;
  const essence = 10 + 5 * (run.floor - 1);
  document.getElementById('dungeon-panel').innerHTML = `
    <div class="result-view victory-view">
      <div class="result-title">👑 You conquered the dungeon!</div>
      <p>All ${TOTAL_FLOORS} floors cleared. You are victorious.</p>
      <div class="reward-summary">
        <div>Gold earned: <strong>${run.goldEarned}</strong></div>
        <div>Essence gained: <strong>◈ ${essence}</strong></div>
      </div>
      <button class="btn btn-danger" onclick="window._ui.exitRun()">Return to Hub</button>
    </div>`;
}

function renderDeath() {
  const run = _state.run;
  const essence = Math.max(1, Math.floor((run.floor - 1) * 5));
  document.getElementById('dungeon-panel').innerHTML = `
    <div class="result-view death-view">
      <div class="result-title">☠ Defeated</div>
      <p>You fell on floor ${run.floor}.</p>
      <div class="reward-summary">
        <div>Gold earned: <strong>${run.goldEarned}</strong></div>
        <div>Essence gained: <strong>◈ ${essence}</strong></div>
      </div>
      <button class="btn btn-danger" onclick="window._ui.exitRun()">Return to Hub</button>
    </div>`;
}

// ─── Action Handlers (exposed to window) ─────────────────────────────────────

function fmt(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'k';
  return Math.floor(n).toString();
}

window._ui = {
  upgradeBuilding(i) {
    if (upgradeBuilding(_state, i)) { saveState(_state); _onUpdate(); }
  },
  buyCard(cardId) {
    if (buyCard(_state, cardId)) { saveState(_state); _onUpdate(); }
  },
  refreshShop() {
    if (refreshShop(_state)) { saveState(_state); _onUpdate(); }
  },
  buyMeta(upgradeId) {
    if (buyMetaUpgrade(_state, upgradeId)) { saveState(_state); _onUpdate(); }
  },
  startRun() {
    if (startRun(_state)) { saveState(_state); _onUpdate(); }
  },
  playCard(index) {
    if (playCard(_state, index)) { saveState(_state); _onUpdate(); }
  },
  endTurn() {
    if (endTurn(_state)) { saveState(_state); _onUpdate(); }
  },
  proceed() {
    if (proceedAfterReward(_state)) { saveState(_state); _onUpdate(); }
  },
  exitRun() {
    endRun(_state);
    saveState(_state);
    _onUpdate();
  }
};
