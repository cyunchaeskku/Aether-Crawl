// src/engine/map.js — Map generation

import { TOTAL_FLOORS, MAP_WIDTH } from '../data.js';

export function generateMap() {
  const map = [];
  for (let y = 0; y < TOTAL_FLOORS; y++) {
    const actFloor = (y % 15) + 1;
    const isBossFloor = (actFloor === 15);
    const nodesInRow = isBossFloor ? 1 : 2 + Math.floor(Math.random() * 2);
    const row = [];

    for (let i = 0; i < nodesInRow; i++) {
      let type = 'monster';
      if (isBossFloor) type = 'boss';
      else if (actFloor === 1) type = 'monster';
      else if (actFloor === 8) type = 'treasure';
      else if (actFloor === 14) type = 'rest';
      else {
        const r = Math.random();
        if (r < 0.15) type = 'shop';
        else if (r < 0.30) type = 'rest';
        else if (r < 0.45) type = 'event';
        else if (r < 0.60) type = 'elite';
        else type = 'monster';
      }
      row.push({
        id: `node_${y}_${i}`,
        type,
        x: (MAP_WIDTH / (nodesInRow + 1)) * (i + 1),
        y,
        connections: [],
        completed: false
      });
    }
    map.push(row);
  }

  for (let y = 0; y < TOTAL_FLOORS - 1; y++) {
    const currentRow = map[y];
    const nextRow = map[y + 1];
    currentRow.forEach((node, i) => {
      const targetIdx = Math.min(i, nextRow.length - 1);
      node.connections.push(nextRow[targetIdx].id);
      if (Math.random() > 0.5 && nextRow[targetIdx + 1]) node.connections.push(nextRow[targetIdx + 1].id);
      if (Math.random() > 0.5 && i > 0 && nextRow[i - 1]) node.connections.push(nextRow[i - 1].id);
    });
  }
  return map;
}
