// Building.js  (Phase 2 / Phase 4)
// A static placed structure occupying a footprint. House / barn / silo etc.

import { Entity } from './Entity.js';
import { LAYERS } from '../engine/Config.js';

export class Building extends Entity {
  constructor(opts) {
    super({ ...opts, layer: LAYERS.BUILDING });
    this.role = opts.role || 'generic'; // 'house' | 'barn' | 'storage'...
  }

  serialize() {
    return { ...super.serialize(), cls: 'Building', role: this.role };
  }
}
