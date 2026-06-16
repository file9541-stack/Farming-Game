// Animal.js  (Phase 4)
// A wandering animal that periodically produces an item. Moves between free
// tiles on its own layer. Movement is simple now; sprite-sheet animation can
// be added later without touching the renderer.

import { Entity } from './Entity.js';
import { LAYERS } from '../engine/Config.js';

export class Animal extends Entity {
  constructor(opts) {
    super({ ...opts, layer: LAYERS.ANIMAL, fw: 1, fh: 1 });
    this.species = opts.species || 'chicken';
    this.produce = opts.produce || 'egg';
    this.produceMs = opts.produceMs || 15000;
    this.timer = opts.timer || 0;
    this.ready = opts.ready || false;
  }

  update(dtMs) {
    if (this.ready) return;
    this.timer += dtMs;
    if (this.timer >= this.produceMs) {
      this.timer = 0;
      this.ready = true; // produce ready to collect (tap to collect)
    }
  }

  collect() {
    if (!this.ready) return null;
    this.ready = false;
    return this.produce;
  }

  serialize() {
    return {
      ...super.serialize(), cls: 'Animal',
      species: this.species, produce: this.produce,
      produceMs: this.produceMs, timer: this.timer, ready: this.ready,
    };
  }
}
