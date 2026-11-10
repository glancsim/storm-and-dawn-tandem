// localStorage wrapper with an in-memory fallback. No DOM access: the storage
// object is injected through a getter (which may itself throw, as
// `window.localStorage` does in some private modes).

import { STORAGE_KEY } from './state.js';

export function createStore(getStorage, key = STORAGE_KEY) {
  let storage = null;
  let persistent = true;
  let memory = null;

  try {
    storage = getStorage();
    if (!storage) persistent = false;
  } catch {
    persistent = false;
  }

  return {
    /** False once reading or writing has failed; data then lives in memory only. */
    get persistent() {
      return persistent;
    },
    /** Parsed stored value, or null when missing, unreadable or corrupted. */
    load() {
      if (!persistent) return memory;
      try {
        const text = storage.getItem(key);
        return text === null ? null : JSON.parse(text);
      } catch (err) {
        if (!(err instanceof SyntaxError)) persistent = false;
        return null;
      }
    },
    /** Returns true when the value was written to persistent storage. */
    save(value) {
      memory = value;
      if (!persistent) return false;
      try {
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        persistent = false;
        return false;
      }
    },
  };
}
