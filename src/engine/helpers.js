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

export function markEncounteredCards(state, cardIds) {
  const run = state.run;
  if (!run || !Array.isArray(cardIds) || cardIds.length === 0) return;
  if (!Array.isArray(run.encounteredCards)) run.encounteredCards = [];
  const seen = new Set(run.encounteredCards);
  cardIds.forEach((id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    run.encounteredCards.push(id);
  });
}

export function getEncounteredCards(state) {
  const run = state.run;
  if (!run) return [];
  if (!Array.isArray(run.encounteredCards)) {
    run.encounteredCards = [];
    markEncounteredCards(state, [
      ...(run.player ? run.player.hand : []),
      ...(run.player ? run.player.drawPile : []),
      ...(run.player ? run.player.discardPile : []),
      ...(run.cardOffer || []),
      ...(run.shopCards || []),
    ]);
  }
  return run.encounteredCards;
}
