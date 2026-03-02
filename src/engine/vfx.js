// src/engine/vfx.js — Visual effects queue

const pendingEffects = [];

export function scheduleEffect(type, value) {
  pendingEffects.push({ type, value });
}

export function flushEffects() {
  while (pendingEffects.length > 0) {
    const { type, value } = pendingEffects.shift();
    if (type === 'hit-enemy') {
      const target = '#enemy-unit-' + value.targetIdx;
      shakeElement(target.substring(1), 'shake-hit');
      spawnFloatingNumber(target, value.amount, 'float-dmg');
    } else if (type === 'big-hit-enemy') {
      const target = '#enemy-unit-' + value.targetIdx;
      shakeElement(target.substring(1), 'shake-big-hit');
      spawnFloatingNumber(target, value.amount, 'float-dmg-big');
      spawnBigHitLabel(target);
      spawnScreenFlash();
    } else if (type === 'hit-player') {
      shakeElement('dungeon-panel', 'shake-player-hit');
      spawnFloatingNumber('.player-section', value, 'float-dmg-player');
    } else if (type === 'enemy-attack') {
      shakeElement('enemy-unit-' + value, 'enemy-lunge');
    } else if (type === 'block-success-enemy') {
      spawnBlockEffect('#enemy-unit-' + value.targetIdx, value.amount);
    } else if (type === 'block-success') {
      spawnBlockEffect('.player-section', value);
    } else if (type === 'play-card') {
      spawnCardPlayEffect(value.card, value.rect);
    }
  }
}

function shakeElement(id, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 400);
}

function spawnFloatingNumber(selector, value, cls) {
  const anchor = document.querySelector(selector);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'floating-num ' + cls;
  el.textContent = '-' + value;
  el.style.left = (rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4) + 'px';
  el.style.top  = (rect.top  + rect.height * (0.15 + Math.random() * 0.4)) + 'px';
  document.body.appendChild(el);
  const dur = cls === 'float-dmg-big' ? 1200 : 900;
  setTimeout(() => el.remove(), dur);
}

function spawnBigHitLabel(selector) {
  const anchor = document.querySelector(selector);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'floating-num float-big-label';
  el.textContent = '💥 HEAVY HIT!';
  el.style.left = (rect.left + rect.width * 0.1 + Math.random() * rect.width * 0.3) + 'px';
  el.style.top  = (rect.top + rect.height * 0.05) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function spawnScreenFlash() {
  const el = document.createElement('div');
  el.className = 'big-hit-flash';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

function spawnBlockEffect(selector, absorbed) {
  const anchor = document.querySelector(selector);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const label = document.createElement('div');
  label.className = 'floating-num float-block-label';
  label.textContent = '🛡 BLOCKED!';
  label.style.left = (rect.left + rect.width * 0.15 + Math.random() * rect.width * 0.25) + 'px';
  label.style.top  = (rect.top + rect.height * 0.1) + 'px';
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 900);
  if (absorbed > 0) {
    const num = document.createElement('div');
    num.className = 'floating-num float-block-num';
    num.textContent = absorbed;
    num.style.left = (rect.left + rect.width * 0.5 + Math.random() * rect.width * 0.2) + 'px';
    num.style.top  = (rect.top + rect.height * 0.25) + 'px';
    document.body.appendChild(num);
    setTimeout(() => num.remove(), 800);
  }
}

function spawnCardPlayEffect(card, rect) {
  const el = document.createElement('div');
  el.className = 'hand-card card-' + card.type + ' playing-card-anim';
  el.innerHTML =
    '<div class="hc-cost">' + card.cost + '⚡</div>' +
    '<div class="hc-name">' + card.name + '</div>' +
    '<div class="hc-desc">' + card.description + '</div>' +
    '<div class="hc-type">' + card.type + '</div>';
  el.style.position = 'fixed';
  el.style.left = rect.left + 'px';
  el.style.top = rect.top + 'px';
  el.style.width = rect.width + 'px';
  el.style.height = rect.height + 'px';
  el.style.zIndex = 9999;
  el.style.margin = 0;
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  const panel = document.getElementById('dungeon-panel');
  const panelRect = panel
    ? panel.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
  const targetX = panelRect.left + panelRect.width / 2 - rect.width / 2;
  const targetY = panelRect.top + panelRect.height / 3 - rect.height / 2;
  requestAnimationFrame(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(1.3)`;
    el.style.opacity = '0';
    el.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
  });
  setTimeout(() => el.remove(), 500);
}
