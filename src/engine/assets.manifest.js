// assets.manifest.js
// Declarative asset registry. Each entry maps a logical key to a PNG path and
// metadata. `src` points at assets/ — when the file exists it is used, when it
// does not the AssetManager draws a placeholder of the same shape/size.
//
// To add new content: append an entry here. No engine changes needed.

import { CONFIG } from './Config.js';

const T = CONFIG.TILE_W, H = CONFIG.TILE_H;

export const MANIFEST = {
  // --- ground tiles ---
  grass:  { src: 'assets/tiles/grass.png',  w: T, h: H, kind: 'tile', color: '#6dbf45', color2: '#55a030' },
  soil:   { src: 'assets/tiles/soil.png',   w: T, h: H, kind: 'tile', color: '#a0704a', color2: '#7a4e2e' },
  water:  { src: 'assets/tiles/water.png',  w: T, h: H, kind: 'tile', color: '#38b0e8', color2: '#1f8fcf' },
  sand:   { src: 'assets/tiles/sand.png',   w: T, h: H, kind: 'tile', color: '#e8d28a', color2: '#cdb35f' },

  // --- buildings (taller than a tile) ---
  house:  { src: 'assets/buildings/house.png',  w: T, h: H * 2, kind: 'object', color: '#c8873a', label: '🏠' },
  barn:   { src: 'assets/buildings/barn.png',   w: T, h: H * 2, kind: 'object', color: '#b5532f', label: '🛖' },
  silo:   { src: 'assets/buildings/silo.png',   w: T, h: H * 2.2, kind: 'object', color: '#8a96a3', label: '🗄️' },

  // --- crops (small, multi-stage handled by Crop entity) ---
  crop_seed:   { src: 'assets/crops/seed.png',   w: T, h: H, kind: 'object', color: '#7a4e2e', label: '·' },
  crop_grow:   { src: 'assets/crops/grow.png',   w: T, h: H, kind: 'object', color: '#3cad3c', label: '🌱' },
  crop_ready:  { src: 'assets/crops/ready.png',  w: T, h: H, kind: 'object', color: '#f5c518', label: '🌾' },

  // --- animals ---
  chicken: { src: 'assets/animals/chicken.png', w: T, h: H, kind: 'object', color: '#fff3c4', label: '🐔' },
  cow:     { src: 'assets/animals/cow.png',     w: T, h: H * 1.3, kind: 'object', color: '#efe7da', label: '🐄' },

  // --- decorations ---
  tree:   { src: 'assets/decorations/tree.png',  w: T, h: H * 2, kind: 'object', color: '#2e7d32', label: '🌳' },
  rock:   { src: 'assets/decorations/rock.png',  w: T, h: H, kind: 'object', color: '#9e9e9e', label: '🪨' },
};
