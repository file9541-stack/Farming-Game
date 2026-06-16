// Entity.js
// Base class for everything placed on the map (buildings, crops, animals,
// decorations). Each entity occupies one or more tiles and renders one sprite.
//
// Subclasses add behaviour (e.g. Crop growth) and override update()/serialize().

let NEXT_ID = 1;

export class Entity {
  constructor({ type, sprite, tx, ty, layer, fw = 1, fh = 1 }) {
    this.id = NEXT_ID++;
    this.type = type;       // logical type, e.g. 'house'
    this.sprite = sprite;   // asset key
    this.tx = tx;           // anchor tile x
    this.ty = ty;           // anchor tile y
    this.layer = layer;     // LAYERS.*
    this.fw = fw;           // footprint width (tiles)
    this.fh = fh;           // footprint height (tiles)
  }

  // Depth uses the FAR corner of the footprint so big objects sort correctly.
  depth() {
    return (this.tx + this.fw - 1) + (this.ty + this.fh - 1);
  }

  update(/* dtMs, ctx */) { /* override */ }

  serialize() {
    return {
      cls: 'Entity',
      type: this.type, sprite: this.sprite,
      tx: this.tx, ty: this.ty, layer: this.layer,
      fw: this.fw, fh: this.fh,
    };
  }

  static resetIds() { NEXT_ID = 1; }
}
