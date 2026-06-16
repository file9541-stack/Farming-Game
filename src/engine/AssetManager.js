// AssetManager.js
// Loads PNG assets from a manifest. If a file is missing, it generates a
// procedural placeholder of the right shape so development never blocks.
//
// Swapping placeholders for real art = drop the PNG into assets/ and make sure
// the manifest entry points at it. No engine code changes required.

export class AssetManager {
  constructor() {
    this.images = new Map();   // key -> HTMLImageElement / canvas
    this.manifest = null;
  }

  // manifest: { key: { src, w, h, kind } }
  async loadManifest(manifest) {
    this.manifest = manifest;
    const tasks = Object.entries(manifest).map(([key, def]) =>
      this._load(key, def)
    );
    await Promise.all(tasks);
  }

  get(key) {
    return this.images.get(key) || this.images.get('__missing__');
  }

  has(key) {
    return this.images.has(key);
  }

  _load(key, def) {
    return new Promise((resolve) => {
      if (!def.src) {
        this.images.set(key, this._placeholder(def));
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => { this.images.set(key, img); resolve(); };
      img.onerror = () => {
        // Real asset not present yet -> fall back to placeholder silently.
        this.images.set(key, this._placeholder(def));
        resolve();
      };
      img.src = def.src;
    });
  }

  // Procedurally draw a placeholder onto an offscreen canvas.
  _placeholder(def) {
    const w = def.w || 128;
    const h = def.h || 64;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    if (def.kind === 'tile') {
      this._drawDiamond(ctx, w, h, def.color || '#6dbf45', def.color2 || '#55a030');
    } else {
      this._drawObject(ctx, w, h, def.color || '#c8873a', def.label || '?');
    }
    return c;
  }

  _drawDiamond(ctx, w, h, top, side) {
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();
    ctx.fillStyle = top;
    ctx.fill();
    ctx.strokeStyle = side;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _drawObject(ctx, w, h, color, label) {
    // base diamond footprint
    ctx.globalAlpha = 0.35;
    this._drawDiamond(ctx, w, Math.min(h, 64), color, color);
    ctx.globalAlpha = 1;
    // a simple "block" body rising up
    const bw = w * 0.5, bh = h * 0.55;
    const bx = (w - bw) / 2, by = h - bh - 4;
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(bh / 2)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, by + bh / 2);
  }
}
