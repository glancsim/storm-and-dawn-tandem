import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expandParts, expandBlock, chapterLabel, shortLabel } from '../js/chapters.js';

const data = JSON.parse(readFileSync(new URL('../chapters.json', import.meta.url), 'utf8'));
const model = expandParts(data);

test('reading order has 145 items in total', () => {
  assert.equal(model.flat.length, 145);
});

test('counts per book: EOS 76, TOD 69', () => {
  assert.equal(model.flat.filter((id) => id[0] === 'E').length, 76);
  assert.equal(model.flat.filter((id) => id[0] === 'T').length, 69);
});

test('counts per part: 36, 37, 37, 35', () => {
  assert.deepEqual(model.parts.map((p) => p.ids.length), [36, 37, 37, 35]);
});

test('no chapter id repeats', () => {
  assert.equal(new Set(model.flat).size, model.flat.length);
});

test('covers E:N, E:1..75, T:1..68 and T:F exactly', () => {
  const expected = ['E:N', 'T:F'];
  for (let i = 1; i <= 75; i++) expected.push(`E:${i}`);
  for (let i = 1; i <= 68; i++) expected.push(`T:${i}`);
  assert.deepEqual([...model.flat].sort(), expected.sort());
});

test('order starts with Nightfall and ends with Fireheart', () => {
  assert.equal(model.flat[0], 'E:N');
  assert.deepEqual(model.flat.slice(1, 8), ['E:1', 'E:2', 'E:3', 'E:4', 'E:5', 'T:1', 'E:6']);
  assert.equal(model.flat.at(-1), 'T:F');
});

test('each book is read in ascending chapter order', () => {
  for (const book of ['E', 'T']) {
    const nums = model.flat.filter((id) => id[0] === book && /\d/.test(id)).map((id) => Number(id.slice(2)));
    assert.deepEqual(nums, [...nums].sort((a, b) => a - b));
  }
});

test('partOf and indexOf agree with the flat order', () => {
  assert.equal(model.partOf.get('E:N'), 0);
  assert.equal(model.partOf.get('T:17'), 1);
  assert.equal(model.partOf.get('E:38'), 2);
  assert.equal(model.partOf.get('T:F'), 3);
  model.flat.forEach((id, i) => assert.equal(model.indexOf.get(id), i));
});

test('expandBlock handles ranges, singles and novellas', () => {
  assert.deepEqual(expandBlock('E:1-5').ids, ['E:1', 'E:2', 'E:3', 'E:4', 'E:5']);
  assert.deepEqual(expandBlock('T:7'), { book: 'T', ids: ['T:7'] });
  assert.deepEqual(expandBlock('E:N').ids, ['E:N']);
  assert.deepEqual(expandBlock('T:F').ids, ['T:F']);
});

test('expandBlock rejects malformed blocks', () => {
  for (const bad of ['X:1', 'E:5-1', 'E:F', 'T:N', 'E:', 'E:0', '12', 'E:1-']) {
    assert.throws(() => expandBlock(bad), /Invalid block/, bad);
  }
});

test('expandParts rejects duplicates', () => {
  assert.throws(() => expandParts({ parts: [['E:1-3', 'E:3']] }), /Duplicate/);
});

test('labels', () => {
  assert.equal(shortLabel('E:12'), '12');
  assert.equal(shortLabel('E:N'), 'Nightfall');
  assert.equal(shortLabel('T:F'), 'Fireheart');
  assert.equal(chapterLabel('E:12'), 'EOS: Chapter 12');
  assert.equal(chapterLabel('T:4'), 'TOD: Chapter 4');
  assert.equal(chapterLabel('E:N'), 'EOS: Nightfall');
  assert.equal(chapterLabel('T:F'), 'TOD: Fireheart');
});
