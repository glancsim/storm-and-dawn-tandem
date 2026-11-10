import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/storage.js';
import { STORAGE_KEY } from '../js/state.js';

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

test('uses the key myTandemRead:v1', () => {
  assert.equal(STORAGE_KEY, 'myTandemRead:v1');
  const storage = fakeStorage();
  const store = createStore(() => storage);
  assert.equal(store.load(), null);
  assert.equal(store.save({ a: 1 }), true);
  assert.deepEqual([...storage.map.keys()], ['myTandemRead:v1']);
  assert.deepEqual(store.load(), { a: 1 });
  assert.equal(store.persistent, true);
});

test('corrupted JSON loads as null but storage stays usable', () => {
  const storage = fakeStorage({ [STORAGE_KEY]: '{oops' });
  const store = createStore(() => storage);
  assert.equal(store.load(), null);
  assert.equal(store.persistent, true);
  assert.equal(store.save({ ok: true }), true);
  assert.deepEqual(store.load(), { ok: true });
});

test('falls back to memory when accessing storage throws', () => {
  const store = createStore(() => {
    throw new Error('SecurityError');
  });
  assert.equal(store.persistent, false);
  assert.equal(store.load(), null);
  assert.equal(store.save({ a: 1 }), false);
  assert.deepEqual(store.load(), { a: 1 });
});

test('falls back to memory when setItem throws', () => {
  const storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
  };
  const store = createStore(() => storage);
  assert.equal(store.persistent, true);
  assert.equal(store.save({ a: 2 }), false);
  assert.equal(store.persistent, false);
  assert.deepEqual(store.load(), { a: 2 });
});

test('falls back to memory when getItem throws or storage is missing', () => {
  const store = createStore(() => ({
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {},
  }));
  assert.equal(store.load(), null);
  assert.equal(store.persistent, false);
  assert.equal(createStore(() => undefined).persistent, false);
});
