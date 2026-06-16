// EntityFactory.js
// Single place that knows how to construct entities from a type/blueprint and
// how to rebuild them from saved data. Adding a new entity class = register it
// here; the rest of the engine stays untouched.

import { Building } from './Building.js';
import { Crop } from './Crop.js';
import { Animal } from './Animal.js';
import { Decoration } from './Decoration.js';

// Blueprints: design-time definitions used by the placement UI.
export const BLUEPRINTS = {
  house:   { cls: 'Building', sprite: 'house', role: 'house',   fw: 1, fh: 1, label: 'บ้าน' },
  barn:    { cls: 'Building', sprite: 'barn',  role: 'barn',    fw: 1, fh: 1, label: 'โรงนา' },
  silo:    { cls: 'Building', sprite: 'silo',  role: 'storage', fw: 1, fh: 1, label: 'คลัง' },
  tree:    { cls: 'Decoration', sprite: 'tree', fw: 1, fh: 1, label: 'ต้นไม้' },
  rock:    { cls: 'Decoration', sprite: 'rock', fw: 1, fh: 1, label: 'หิน' },
  wheat:   { cls: 'Crop', yieldItem: 'wheat', fw: 1, fh: 1, label: 'ข้าวสาลี' },
  chicken: { cls: 'Animal', sprite: 'chicken', species: 'chicken', produce: 'egg',  fw: 1, fh: 1, label: 'ไก่' },
  cow:     { cls: 'Animal', sprite: 'cow',     species: 'cow',     produce: 'milk', fw: 1, fh: 1, label: 'วัว' },
};

const CLASSES = { Building, Crop, Animal, Decoration };

// Create from a blueprint key + tile position.
export function createFromBlueprint(key, tx, ty) {
  const bp = BLUEPRINTS[key];
  if (!bp) throw new Error('Unknown blueprint: ' + key);
  return _make(bp.cls, { ...bp, type: key, tx, ty });
}

// Rebuild from serialized data.
export function createFromData(data) {
  return _make(data.cls, data);
}

function _make(cls, opts) {
  const C = CLASSES[cls] || Decoration;
  return new C(opts);
}
