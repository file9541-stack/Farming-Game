// World.js
// Owns the map and all entities. Central API for placement (Phase 2), growth
// (Phase 3), animals (Phase 4) and the inventory/storage. Keeps the occupancy
// grid in sync so the renderer + placement never disagree.

import { IsoMap } from '../map/IsoMap.js';
import { CONFIG } from './Config.js';
import { createFromBlueprint, createFromData, BLUEPRINTS } from '../entities/EntityFactory.js';
import { Crop } from '../entities/Crop.js';
import { Animal } from '../entities/Animal.js';

export class World {
  constructor(map) {
    this.map = map || new IsoMap(CONFIG.MAP_W, CONFIG.MAP_H);
    this.entities = [];
    this.inventory = {};          // item -> count
    this.coins = 0;
  }

  // --- placement / occupancy (Phase 2) ---
  canPlace(key, tx, ty) {
    const bp = BLUEPRINTS[key];
    if (!bp) return false;
    return this.map.canPlace(tx, ty, bp.fw, bp.fh);
  }

  place(key, tx, ty) {
    if (!this.canPlace(key, tx, ty)) return null;
    const e = createFromBlueprint(key, tx, ty);
    this.entities.push(e);
    this.map.occupy(tx, ty, e.fw, e.fh, e.id);
    // crops sit on soil — flip the ground tile
    if (e instanceof Crop) this.map.setGround(tx, ty, 'soil');
    return e;
  }

  remove(entity) {
    const i = this.entities.indexOf(entity);
    if (i < 0) return;
    this.entities.splice(i, 1);
    this.map.release(entity.tx, entity.ty, entity.fw, entity.fh);
  }

  entityAt(tx, ty) {
    const id = this.map.occupied[this.map.idx(tx, ty)];
    return id ? this.entities.find(e => e.id === id) : null;
  }

  // --- interaction (Phase 3/4): tap an entity to harvest/collect ---
  interact(tx, ty) {
    const e = this.entityAt(tx, ty);
    if (!e) return null;
    if (e instanceof Crop && e.isReady) {
      this.addItem(e.yieldItem, 1);
      this.remove(e);
      return { action: 'harvest', item: e.yieldItem };
    }
    if (e instanceof Animal && e.ready) {
      const item = e.collect();
      this.addItem(item, 1);
      return { action: 'collect', item };
    }
    return { action: 'none', entity: e };
  }

  // --- inventory / storage (Phase 4) ---
  addItem(item, n = 1) {
    this.inventory[item] = (this.inventory[item] || 0) + n;
  }

  // --- per-frame update ---
  update(dtMs) {
    for (const e of this.entities) e.update(dtMs, this);
  }

  // --- serialization (Phase 5 save) ---
  serialize() {
    return {
      map: this.map.serialize(),
      entities: this.entities.map(e => e.serialize()),
      inventory: this.inventory,
      coins: this.coins,
    };
  }

  static deserialize(data) {
    const w = new World(IsoMap.deserialize(data.map));
    w.inventory = data.inventory || {};
    w.coins = data.coins || 0;
    for (const d of data.entities || []) {
      const e = createFromData(d);
      w.entities.push(e);
      w.map.occupy(e.tx, e.ty, e.fw, e.fh, e.id);
    }
    return w;
  }
}
