// TileMath.js
// Pure isometric coordinate conversions. No side effects.
// Tile grid (x,y) <-> screen/world pixels. Diamond tiles 128x64.

import { CONFIG } from '../engine/Config.js';

const HW = CONFIG.TILE_W / 2; // half width
const HH = CONFIG.TILE_H / 2; // half height

// Tile coords -> world pixel position of the tile's TOP-CENTER anchor.
export function tileToWorld(tx, ty) {
  return {
    x: (tx - ty) * HW,
    y: (tx + ty) * HH,
  };
}

// World pixel -> fractional tile coords. Floor for the containing tile.
export function worldToTile(wx, wy) {
  const tx = (wx / HW + wy / HH) / 2;
  const ty = (wy / HH - wx / HW) / 2;
  return { x: tx, y: ty };
}

// Depth key for painter's algorithm. Larger = closer to camera (drawn later).
export function depthKey(tx, ty) {
  return tx + ty;
}

export { HW as HALF_W, HH as HALF_H };
