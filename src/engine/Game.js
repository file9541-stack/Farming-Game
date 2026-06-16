// Game.js
// Top-level orchestrator. Wires AssetManager, Camera, Input, World, Renderer,
// SaveManager and UI together and runs the fixed-ish game loop.
//
// Modes:
//   - 'view'  : tap to interact (harvest crops, collect from animals)
//   - 'place' : a blueprint is selected; tap to place it on a valid tile

import { CONFIG } from './Config.js';
import { MANIFEST } from './assets.manifest.js';
import { AssetManager } from './AssetManager.js';
import { Camera } from '../camera/Camera.js';
import { Input } from './Input.js';
import { World } from './World.js';
import { IsoMap } from '../map/IsoMap.js';
import { Renderer } from '../renderer/Renderer.js';
import { SaveManager } from '../save/SaveManager.js';
import { UI } from '../ui/UI.js';
import { worldToTile } from '../map/TileMath.js';

export class Game {
  constructor(canvas, uiRoot) {
    this.canvas = canvas;
    this.uiRoot = uiRoot;
    this.mode = 'view';
    this.placeKey = null;
    this.highlight = null;
    this.lastTs = 0;
  }

  async start() {
    this.assets = new AssetManager();
    await this.assets.loadManifest(MANIFEST);

    this.save = new SaveManager();
    this.world = this.save.load() || this._newWorld();

    this.camera = new Camera({ w: this.canvas.clientWidth, h: this.canvas.clientHeight });
    this.camera.computeBounds(this.world.map.w, this.world.map.h);
    this.camera.centerOnTile(this.world.map.w / 2, this.world.map.h / 2);

    this.renderer = new Renderer(this.canvas, this.camera, this.assets);

    this.input = new Input(this.canvas, this.camera, {
      onTap: (x, y) => this._onTap(x, y),
    });
    this.canvas.addEventListener('pointermove', (e) => this._onHover(e));

    this.ui = new UI(this.uiRoot, {
      onSelectBlueprint: (k) => { this.mode = 'place'; this.placeKey = k; },
      onCancel: () => { this.mode = 'view'; this.placeKey = null; this.highlight = null; },
      onSave: () => { this.save.save(this.world); this.ui.showToast('บันทึกแล้ว 💾'); },
      onReset: () => this._reset(),
    });
    this._refreshUI();

    window.addEventListener('resize', () => this.renderer.resize());
    setInterval(() => this.save.save(this.world), CONFIG.AUTOSAVE_MS);

    requestAnimationFrame((t) => this._loop(t));
  }

  _newWorld() {
    const w = new World(new IsoMap(CONFIG.MAP_W, CONFIG.MAP_H));
    // a little starter scenery / pond so the map isn't empty
    const m = w.map;
    for (let y = 4; y < 9; y++)
      for (let x = 4; x < 9; x++)
        m.setGround(x, y, 'water');
    w.place('house', 20, 20);
    w.place('tree', 24, 18);
    w.place('tree', 26, 22);
    w.coins = 100;
    return w;
  }

  _reset() {
    this.save.clear();
    this.world = this._newWorld();
    this.camera.computeBounds(this.world.map.w, this.world.map.h);
    this.camera.centerOnTile(this.world.map.w / 2, this.world.map.h / 2);
    this.ui.clearSelection();
    this.mode = 'view';
    this._refreshUI();
    this.ui.showToast('เริ่มฟาร์มใหม่ 🌱');
  }

  _tileUnder(sx, sy) {
    const w = this.camera.screenToWorld(sx, sy);
    const t = worldToTile(w.x, w.y);
    return { x: Math.floor(t.x), y: Math.floor(t.y) };
  }

  _onHover(e) {
    if (this.mode !== 'place') return;
    const r = this.canvas.getBoundingClientRect();
    const t = this._tileUnder(e.clientX - r.left, e.clientY - r.top);
    this.highlight = {
      tx: t.x, ty: t.y,
      valid: this.world.canPlace(this.placeKey, t.x, t.y),
    };
  }

  _onTap(sx, sy) {
    const t = this._tileUnder(sx, sy);
    if (!this.world.map.inBounds(t.x, t.y)) return;

    if (this.mode === 'place') {
      if (this.world.place(this.placeKey, t.x, t.y)) {
        this.ui.showToast('วางแล้ว ✓');
        this._refreshUI();
      } else {
        this.ui.showToast('วางตรงนี้ไม่ได้ ✗');
      }
    } else {
      const r = this.world.interact(t.x, t.y);
      if (r && (r.action === 'harvest' || r.action === 'collect')) {
        this.ui.showToast(`ได้รับ ${r.item} +1`);
        this._refreshUI();
      }
    }
  }

  _refreshUI() {
    this.ui.setInventory(this.world.inventory, this.world.coins);
  }

  _loop(ts) {
    const dt = Math.min(ts - this.lastTs, 100); // clamp dt after tab switch
    this.lastTs = ts;
    this.world.update(dt);
    this.renderer.render(this.world.map, this.world.entities,
      this.mode === 'place' ? this.highlight : null);
    requestAnimationFrame((t) => this._loop(t));
  }
}
