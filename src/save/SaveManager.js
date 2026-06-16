// SaveManager.js
// Persists the World to LocalStorage. The save format is plain JSON, so moving
// to Cloud Save later only means swapping the storage backend below — the
// serialize/deserialize contract on World stays the same.

import { CONFIG } from '../engine/Config.js';
import { World } from '../engine/World.js';

export class SaveManager {
  constructor(key = CONFIG.SAVE_KEY) {
    this.key = key;
    // Backend is pluggable: implement {getItem,setItem,removeItem} for cloud.
    this.backend = window.localStorage;
  }

  save(world) {
    try {
      const payload = JSON.stringify({ v: 1, ts: Date.now(), world: world.serialize() });
      this.backend.setItem(this.key, payload);
      return true;
    } catch (e) {
      console.warn('Save failed', e);
      return false;
    }
  }

  load() {
    try {
      const raw = this.backend.getItem(this.key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return World.deserialize(data.world);
    } catch (e) {
      console.warn('Load failed', e);
      return null;
    }
  }

  clear() { this.backend.removeItem(this.key); }
  has() { return !!this.backend.getItem(this.key); }
}
