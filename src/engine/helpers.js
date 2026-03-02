// src/engine/helpers.js — Shared helpers

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// state is passed in — state.run must exist
export function addLog(state, msg) {
  if (!state.run) return;
  state.run.log.push(msg);
  if (state.run.log.length > 30) state.run.log.shift();
}

export function hasRelic(state, id) {
  return state.meta.relics && state.meta.relics.includes(id);
}
