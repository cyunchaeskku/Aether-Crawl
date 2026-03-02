// src/engine/player.js — Player stat helpers

export function playerMaxHp(state) {
  return 80 + (state.meta.upgrades.max_hp || 0) * 10;
}

export function playerMaxEnergy(state) {
  return 3 + (state.meta.upgrades.extra_energy || 0);
}
