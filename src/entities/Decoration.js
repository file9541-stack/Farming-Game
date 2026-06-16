// Decoration.js  (Phase 1/2)
// Non-functional scenery: trees, rocks. Occupies tiles for collision but has
// no behaviour.

import { Entity } from './Entity.js';
import { LAYERS } from '../engine/Config.js';

export class Decoration extends Entity {
  constructor(opts) {
    super({ ...opts, layer: LAYERS.DECORATION });
  }
  serialize() { return { ...super.serialize(), cls: 'Decoration' }; }
}
