// Crop.js  (Phase 3)
// A growing plant on a single tile. Cycles through stages over time; when ready
// it can be harvested (yields produce, then the tile is freed).

import { Entity } from './Entity.js';
import { LAYERS } from '../engine/Config.js';

const STAGES = [
  { sprite: 'crop_seed',  ms: 8000 },
  { sprite: 'crop_grow',  ms: 12000 },
  { sprite: 'crop_ready', ms: Infinity },
];

export class Crop extends Entity {
  constructor(opts) {
    super({ ...opts, sprite: STAGES[0].sprite, layer: LAYERS.DECORATION, fw: 1, fh: 1 });
    this.stage = opts.stage || 0;
    this.elapsed = opts.elapsed || 0;
    this.sprite = STAGES[this.stage].sprite;
    this.yieldItem = opts.yieldItem || 'wheat';
  }

  update(dtMs) {
    if (this.stage >= STAGES.length - 1) return;
    this.elapsed += dtMs;
    if (this.elapsed >= STAGES[this.stage].ms) {
      this.elapsed = 0;
      this.stage++;
      this.sprite = STAGES[this.stage].sprite;
    }
  }

  get isReady() { return this.stage >= STAGES.length - 1; }

  serialize() {
    return {
      ...super.serialize(), cls: 'Crop',
      stage: this.stage, elapsed: this.elapsed, yieldItem: this.yieldItem,
    };
  }
}
