// Camera.js
// Pannable, zoomable camera with clamped boundaries.
// Holds world-space center position (x,y) and zoom. The renderer applies it.

import { CONFIG } from '../engine/Config.js';
import { tileToWorld } from '../map/TileMath.js';

export class Camera {
  constructor(viewport) {
    this.viewport = viewport;        // { w, h } in CSS pixels
    this.x = 0;                      // world position at screen center
    this.y = 0;
    this.zoom = CONFIG.ZOOM_START;
    this.bounds = null;              // { minX, maxX, minY, maxY }
  }

  setViewport(w, h) {
    this.viewport.w = w;
    this.viewport.h = h;
    this.clamp();
  }

  // Compute world bounds from map size so the camera can't fly off into void.
  computeBounds(mapW, mapH) {
    // corners of the diamond map in world space
    const corners = [
      tileToWorld(0, 0),
      tileToWorld(mapW, 0),
      tileToWorld(0, mapH),
      tileToWorld(mapW, mapH),
    ];
    const xs = corners.map(c => c.x);
    const ys = corners.map(c => c.y);
    const p = CONFIG.CAMERA_PADDING;
    this.bounds = {
      minX: Math.min(...xs) - p,
      maxX: Math.max(...xs) + p,
      minY: Math.min(...ys) - p,
      maxY: Math.max(...ys) + p,
    };
    this.clamp();
  }

  // Center the camera on a tile.
  centerOnTile(tx, ty) {
    const w = tileToWorld(tx, ty);
    this.x = w.x;
    this.y = w.y;
    this.clamp();
  }

  pan(dxScreen, dyScreen) {
    this.x -= dxScreen / this.zoom;
    this.y -= dyScreen / this.zoom;
    this.clamp();
  }

  // Zoom toward a screen anchor point so content under the cursor stays put.
  zoomAt(factor, screenX, screenY) {
    const before = this.screenToWorld(screenX, screenY);
    this.zoom = clamp(this.zoom * factor, CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX);
    const after = this.screenToWorld(screenX, screenY);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.clamp();
  }

  setZoom(z, screenX, screenY) {
    const target = clamp(z, CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX);
    this.zoomAt(target / this.zoom, screenX, screenY);
  }

  clamp() {
    if (!this.bounds) return;
    this.x = clamp(this.x, this.bounds.minX, this.bounds.maxX);
    this.y = clamp(this.y, this.bounds.minY, this.bounds.maxY);
  }

  // --- coordinate transforms ---
  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.viewport.w / 2,
      y: (wy - this.y) * this.zoom + this.viewport.h / 2,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewport.w / 2) / this.zoom + this.x,
      y: (sy - this.viewport.h / 2) / this.zoom + this.y,
    };
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
