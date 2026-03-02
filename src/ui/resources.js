// src/ui/resources.js — Resource bar rendering

import { uiContext } from './context.js';
import { fmt } from './utils.js';
import { playerMaxHp } from '../engine.js';

export function renderResources() {
  const s = uiContext.state.idle;
  const rate = (r) => r > 0 ? ' <span class="rate">(+' + r.toFixed(1) + '/s)</span>' : '';
  document.getElementById('res-gold').innerHTML    = '⚜ ' + fmt(s.gold)    + rate(s.goldRate);
  document.getElementById('res-essence').innerHTML = '◈ ' + fmt(s.essence) + rate(s.essenceRate);
  const run = uiContext.state.run;
  const maxHp = run && run.player ? run.player.maxHp : playerMaxHp(uiContext.state);
  const curHp = run && run.player ? run.player.hp : maxHp;
  const hpEl = document.getElementById('res-hp');
  if (hpEl) hpEl.textContent = '❤ ' + Math.floor(curHp) + '/' + Math.floor(maxHp);
  document.getElementById('res-runs').textContent  =
    'Runs: ' + uiContext.state.meta.totalRuns + ' | Best Floor: ' + (uiContext.state.meta.bestFloor || '—') + ' | Best Gold: ' + (uiContext.state.meta.bestGold || '—');
}

export function renderBgmButton() {
  const btn = document.getElementById('bgm-toggle-btn');
  if (btn) {
    btn.textContent = uiContext.state.settings.bgmEnabled ? 'BGM On' : 'BGM Off';
  }
}
