// Renderer.js
// Draws the isometric world with automatic depth sorting and viewport culling.
//
// Pipeline each frame:
//   1. clear
//   2. draw visible ground tiles (already depth-ordered by iteration)
//   3. collect visible entities, sort by (layer, depth, ty), draw
//   4. draw highlight (hover/placement preview)
//
// Handles HiDPI via devicePixelRatio. Many assets supported because we cull to
// the viewport and only sort what's on screen.

import { CONFIG } from '../engine/Config.js';
import { tileToWorld, worldToTile, HALF_W, HALF_H } from '../map/TileMath.js';

export class Renderer {
  constructor(canvas, camera, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = camera;
    this.assets = assets;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.camera.setViewport(w, h);
  }

  render(map, entities, highlight) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.camera.viewport.w, this.camera.viewport.h);
    ctx.imageSmoothingEnabled = false;

    const range = this._visibleTileRange(map);

    this._drawGround(map, range);
    this._drawEntities(entities, range);
    if (highlight) this._drawHighlight(highlight);
  }

  // Determine which tiles can appear on screen (with padding) to cull the rest.
  _visibleTileRange(map) {
    const cam = this.camera;
    const corners = [
      cam.screenToWorld(0, 0),
      cam.screenToWorld(cam.viewport.w, 0),
      cam.screenToWorld(0, cam.viewport.h),
      cam.screenToWorld(cam.viewport.w, cam.viewport.h),
    ].map(w => worldToTile(w.x, w.y));

    const pad = CONFIG.CULL_PADDING;
    let minX = Math.floor(Math.min(...corners.map(c => c.x))) - pad;
    let maxX = Math.ceil(Math.max(...corners.map(c => c.x))) + pad;
    let minY = Math.floor(Math.min(...corners.map(c => c.y))) - pad;
    let maxY = Math.ceil(Math.max(...corners.map(c => c.y))) + pad;

    minX = Math.max(0, minX); minY = Math.max(0, minY);
    maxX = Math.min(map.w - 1, maxX); maxY = Math.min(map.h - 1, maxY);
    return { minX, maxX, minY, maxY };
  }

  _drawGround(map, r) {
    // Iterate in depth order (x+y ascending) -> correct painter ordering.
    for (let sum = r.minX + r.minY; sum <= r.maxX + r.maxY; sum++) {
      for (let x = r.minX; x <= r.maxX; x++) {
        const y = sum - x;
        if (y < r.minY || y > r.maxY) continue;
        const type = map.getGround(x, y);
        if (!type) continue;
        this._drawSprite(this.assets.get(type), x, y, CONFIG.TILE_W, CONFIG.TILE_H, true);
      }
    }
  }

  _drawEntities(entities, r) {
    // Cull, then sort by layer -> depth -> ty for stable correct overlap.
    const visible = [];
    for (const e of entities) {
      if (e.tx + e.fw - 1 < r.minX || e.tx > r.maxX) continue;
      if (e.ty + e.fh - 1 < r.minY || e.ty > r.maxY) continue;
      visible.push(e);
    }
    visible.sort((a, b) =>
      (a.layer - b.layer) || (a.depth() - b.depth()) || (a.ty - b.ty)
    );

    for (const e of visible) {
      const img = this.assets.get(e.sprite);
      const def = this.assets.manifest?.[e.sprite] || {};
      const w = def.w || CONFIG.TILE_W;
      const h = def.h || CONFIG.TILE_H;
      // anchor at the front-bottom tile of the footprint
      this._drawSprite(img, e.tx, e.ty, w, h, false, e.fw, e.fh);
    }
  }

  // Draws a sprite whose bottom sits on the tile's diamond. For tiles the image
  // covers the full diamond; for objects the image bottom aligns to tile base.
  _drawSprite(img, tx, ty, w, h, isTile, fw = 1, fh = 1) {
    if (!img) return;
    const cam = this.camera;
    // world anchor: front corner of footprint diamond
    const anchorWorld = tileToWorld(tx + fw - 1, ty + fh - 1);
    const s = cam.worldToScreen(anchorWorld.x, anchorWorld.y);

    let dx, dy;
    if (isTile) {
      dx = s.x - (w / 2) * cam.zoom;
      dy = s.y;
    } else {
      // bottom-center of sprite on the front tile's center
      dx = s.x - (w / 2) * cam.zoom;
      dy = s.y + HALF_H * cam.zoom - h * cam.zoom;
    }
    this.ctx.drawImage(img, dx, dy, w * cam.zoom, h * cam.zoom);
  }

  _drawHighlight(h) {
    const cam = this.camera;
    const w = tileToWorld(h.tx, h.ty);
    const s = cam.worldToScreen(w.x, w.y);
    const ctx = this.ctx;
    const hw = HALF_W * cam.zoom, hh = HALF_H * cam.zoom;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + hw, s.y + hh);
    ctx.lineTo(s.x, s.y + hh * 2);
    ctx.lineTo(s.x - hw, s.y + hh);
    ctx.closePath();
    ctx.fillStyle = h.valid ? 'rgba(80,220,120,0.4)' : 'rgba(230,70,70,0.4)';
    ctx.fill();
    ctx.strokeStyle = h.valid ? '#2fa84f' : '#c83232';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
