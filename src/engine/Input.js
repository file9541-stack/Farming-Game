// Input.js
// Unified pointer input for mouse + touch. Handles:
//  - drag to pan the camera
//  - mouse wheel zoom
//  - pinch zoom (two fingers)
//  - tap/click (distinguishes from drag) -> onTap(screenX, screenY)
//
// Emits camera operations directly and forwards taps to a callback.

import { CONFIG } from './Config.js';

export class Input {
  constructor(canvas, camera, { onTap } = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.onTap = onTap || (() => {});

    this.pointers = new Map();   // id -> {x,y}
    this.lastSingle = null;      // {x,y}
    this.pinchDist = 0;
    this.dragMoved = 0;          // total movement of a single pointer
    this.downPos = null;

    this._bind();
  }

  _bind() {
    const c = this.canvas;
    c.style.touchAction = 'none';

    c.addEventListener('pointerdown', (e) => this._down(e));
    c.addEventListener('pointermove', (e) => this._move(e));
    window.addEventListener('pointerup', (e) => this._up(e));
    window.addEventListener('pointercancel', (e) => this._up(e));

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? (1 + CONFIG.ZOOM_STEP) : (1 - CONFIG.ZOOM_STEP);
      this.camera.zoomAt(factor, e.offsetX, e.offsetY);
    }, { passive: false });
  }

  _pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _down(e) {
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this._pos(e);
    this.pointers.set(e.pointerId, p);

    if (this.pointers.size === 1) {
      this.lastSingle = p;
      this.dragMoved = 0;
      this.downPos = p;
    } else if (this.pointers.size === 2) {
      this.pinchDist = this._twoFingerDist();
    }
  }

  _move(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const p = this._pos(e);
    this.pointers.set(e.pointerId, p);

    if (this.pointers.size === 1 && this.lastSingle) {
      const dx = p.x - this.lastSingle.x;
      const dy = p.y - this.lastSingle.y;
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      this.camera.pan(dx, dy);
      this.lastSingle = p;
    } else if (this.pointers.size === 2) {
      const dist = this._twoFingerDist();
      if (this.pinchDist > 0) {
        const mid = this._twoFingerMid();
        this.camera.zoomAt(dist / this.pinchDist, mid.x, mid.y);
      }
      this.pinchDist = dist;
    }
  }

  _up(e) {
    const wasSingle = this.pointers.size === 1;
    this.pointers.delete(e.pointerId);

    if (wasSingle && this.downPos && this.dragMoved < 8) {
      this.onTap(this.downPos.x, this.downPos.y);
    }

    if (this.pointers.size === 1) {
      // returning from pinch to single drag
      this.lastSingle = [...this.pointers.values()][0];
    } else if (this.pointers.size === 0) {
      this.lastSingle = null;
      this.downPos = null;
    }
  }

  _twoFingerDist() {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  _twoFingerMid() {
    const [a, b] = [...this.pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
}
