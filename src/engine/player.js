// src/engine/player.js — Player stat helpers

export function playerMaxHp(state) {
  return 80 + (state.meta.upgrades.max_hp || 0) * 10 + (state.meta.bonusMaxHp || 0);
}

export function playerMaxEnergy(state) {
  const base = 3 + (state.meta.upgrades.extra_energy || 0);
  const relics = state.meta.relics || [];
  const energyRelics = [
    'busted_crown',
    'coffee_dripper',
    'cursed_key',
    'fusion_hammer',
    'philosophers_stone',
    'runic_dome',
    'sozu',
    'velvet_choker'
  ];
  const bonus = energyRelics.reduce((sum, id) => sum + (relics.includes(id) ? 1 : 0), 0);
  return base + bonus;
}
