// Config.js
// Central configuration. Tweak values here without touching engine logic.
// All systems read from this single source of truth.

export const CONFIG = {
  // --- Isometric tile dimensions ---
  TILE_W: 128,
  TILE_H: 64,

  // --- Map ---
  MAP_W: 50,            // starting map size (tiles)
  MAP_H: 50,
  MAP_MAX: 200,         // supported future size

  // --- Camera / Zoom ---
  ZOOM_MIN: 0.5,        // 50%
  ZOOM_MAX: 2.0,        // 200%
  ZOOM_START: 1.0,
  ZOOM_STEP: 0.1,
  CAMERA_PADDING: 256,  // extra world padding allowed around map edges

  // --- Rendering ---
  CULL_PADDING: 2,      // extra tiles rendered beyond viewport edge

  // --- Save ---
  SAVE_KEY: 'isofarm.save.v1',
  AUTOSAVE_MS: 30000,
};

// Render layer order (lower index = drawn first / behind).
// Adding a new layer is just appending to this list.
export const LAYERS = {
  GROUND: 0,
  DECORATION: 1,
  BUILDING: 2,
  ANIMAL: 3,
  EFFECT: 4,
};
