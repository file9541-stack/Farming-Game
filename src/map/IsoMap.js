// IsoMap.js
// Tile-data driven map. Stores the ground grid + an occupancy grid so the
// placement system (Phase 2) can know which tiles are free.
//
// Ground is stored compactly as a flat array of tile-type keys, so the map is
// pure data (no giant image). Scales to 200x200 cheaply.

export class IsoMap {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.ground = new Array(w * h).fill('grass'); // tile-type key per cell
    this.occupied = new Array(w * h).fill(null);  // entity id occupying cell
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  idx(x, y) { return y * this.w + x; }

  getGround(x, y) {
    return this.inBounds(x, y) ? this.ground[this.idx(x, y)] : null;
  }

  setGround(x, y, type) {
    if (this.inBounds(x, y)) this.ground[this.idx(x, y)] = type;
  }

  // --- occupancy (tile reservation for placed objects) ---
  isFree(x, y) {
    return this.inBounds(x, y) && this.occupied[this.idx(x, y)] === null;
  }

  // Check a footprint (w x h tiles, anchored at x,y) is all free.
  canPlace(x, y, fw = 1, fh = 1) {
    for (let dy = 0; dy < fh; dy++)
      for (let dx = 0; dx < fw; dx++)
        if (!this.isFree(x + dx, y + dy)) return false;
    return true;
  }

  occupy(x, y, fw, fh, id) {
    for (let dy = 0; dy < fh; dy++)
      for (let dx = 0; dx < fw; dx++)
        if (this.inBounds(x + dx, y + dy))
          this.occupied[this.idx(x + dx, y + dy)] = id;
  }

  release(x, y, fw, fh) {
    for (let dy = 0; dy < fh; dy++)
      for (let dx = 0; dx < fw; dx++)
        if (this.inBounds(x + dx, y + dy))
          this.occupied[this.idx(x + dx, y + dy)] = null;
  }

  // --- serialization ---
  serialize() {
    return { w: this.w, h: this.h, ground: this.ground };
  }

  static deserialize(data) {
    const m = new IsoMap(data.w, data.h);
    if (Array.isArray(data.ground) && data.ground.length === data.w * data.h) {
      m.ground = data.ground.slice();
    }
    return m;
  }
}
