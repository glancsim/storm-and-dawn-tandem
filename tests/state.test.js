import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expandParts } from '../js/chapters.js';
import * as S from '../js/state.js';

const model = expandParts(JSON.parse(readFileSync(new URL('../chapters.json', import.meta.url), 'utf8')));
const { flat, ids } = model;
const TODAY = '2026-11-10';
const readFirst = (n) => Object.fromEntries(flat.slice(0, n).map((id) => [id, true]));

test('detectLang', () => {
  assert.equal(S.detectLang('cs'), 'cs');
  assert.equal(S.detectLang('cs-CZ'), 'cs');
  assert.equal(S.detectLang('en-GB'), 'en');
  assert.equal(S.detectLang('sk'), 'en');
  assert.equal(S.detectLang(undefined), 'en');
});

test('sanitizeState falls back to defaults on broken data', () => {
  for (const bad of [null, undefined, 'x', 5, [], { read: 'no', notes: [] }]) {
    assert.deepEqual(S.sanitizeState(bad, ids, 'cs'), S.defaultState('cs'));
  }
});

test('sanitizeState keeps valid parts and drops the rest', () => {
  const s = S.sanitizeState(
    {
      read: { 'E:N': true, 'E:1': 1, 'E:2': false, 'X:9': true },
      notes: {
        'E:12': { t: 'text', p: '88', d: '2026-10-27' },
        'E:13': { t: 'no date', p: 'abc', d: 'nope' },
        'E:14': { t: '   ' },
        'Z:1': { t: 'unknown' },
        'E:15': 'string',
      },
      startDate: '2026-10-18',
      finishDate: 'garbage',
      lang: 'de',
      theme: 'dark',
    },
    ids,
    'en',
  );
  assert.deepEqual(s.read, { 'E:N': true, 'E:1': true });
  assert.deepEqual(s.notes, {
    'E:12': { t: 'text', p: '88', d: '2026-10-27' },
    'E:13': { t: 'no date', p: '', d: '' },
  });
  assert.equal(s.startDate, '2026-10-18');
  assert.equal(s.finishDate, '');
  assert.equal(s.lang, 'en');
  assert.equal(s.theme, 'dark');
  assert.equal(s.version, 1);
});

test('progressStats and percent rounding', () => {
  const none = S.progressStats(flat, {});
  assert.deepEqual([none.total.pct, none.E.pct, none.T.pct], [0, 0, 0]);
  assert.deepEqual([none.total.all, none.E.all, none.T.all], [145, 76, 69]);

  const st = S.progressStats(flat, readFirst(52));
  assert.equal(st.total.read, 52);
  assert.equal(st.total.pct, 36); // 52 / 145
  assert.equal(st.E.read + st.T.read, 52);
  assert.equal(st.E.pct, Math.round((100 * st.E.read) / 76));
  assert.equal(st.T.pct, Math.round((100 * st.T.read) / 69));

  const all = S.progressStats(flat, readFirst(145));
  assert.deepEqual([all.total.pct, all.E.pct, all.T.pct], [100, 100, 100]);
  assert.equal(S.percent(1, 3), 33);
  assert.equal(S.percent(2, 3), 67);
  assert.equal(S.percent(0, 0), 0);
});

test('blockStatus', () => {
  const block = ['E:1', 'E:2', 'E:3'];
  assert.equal(S.blockStatus(block, {}), 'none');
  assert.equal(S.blockStatus(block, { 'E:2': true }), 'partial');
  assert.equal(S.blockStatus(block, { 'E:1': true, 'E:2': true, 'E:3': true }), 'done');
});

test('firstUnread, unreadBefore, remaining', () => {
  assert.equal(S.firstUnread(flat, {}), 'E:N');
  assert.equal(S.firstUnread(flat, readFirst(6)), 'T:1');
  assert.equal(S.firstUnread(flat, readFirst(145)), null);
  assert.equal(S.unreadBefore(flat, {}, 'E:N'), 0);
  assert.equal(S.unreadBefore(flat, {}, 'T:1'), 6);
  assert.equal(S.unreadBefore(flat, { 'E:1': true, 'E:3': true }, 'T:1'), 4);
  assert.equal(S.remaining(flat, readFirst(140)), 5);
});

test('herePosition points at the middle of the first unread chapter', () => {
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  assert.ok(near(S.herePosition(flat, {}), (0.5 / 145) * 100));
  assert.ok(near(S.herePosition(flat, readFirst(144)), (144.5 / 145) * 100));
  assert.ok(near(S.herePosition(flat, readFirst(72)), (72.5 / 145) * 100));
  assert.equal(S.herePosition(flat, readFirst(145)), null);
});

test('markRead sets the start date only once', () => {
  let s = S.markRead(S.defaultState(), flat, 'E:N', TODAY);
  assert.deepEqual(s.read, { 'E:N': true });
  assert.equal(s.startDate, TODAY);
  s = S.markRead(s, flat, 'E:1', '2026-12-01');
  assert.equal(s.startDate, TODAY);
});

test('markRead with earlier chapters marks everything up to the chapter', () => {
  const s = S.markRead(S.defaultState(), flat, 'T:1', TODAY, true);
  assert.deepEqual(Object.keys(s.read), ['E:N', 'E:1', 'E:2', 'E:3', 'E:4', 'E:5', 'T:1']);
  const only = S.markRead(S.defaultState(), flat, 'T:1', TODAY, false);
  assert.deepEqual(Object.keys(only.read), ['T:1']);
});

test('unmarkRead clears finishDate', () => {
  const done = S.finishReading(S.defaultState(), flat, TODAY);
  assert.equal(done.finishDate, TODAY);
  assert.equal(done.startDate, TODAY);
  assert.equal(S.remaining(flat, done.read), 0);
  const s = S.unmarkRead(done, 'E:40');
  assert.equal(s.finishDate, '');
  assert.equal(s.read['E:40'], undefined);
  assert.equal(S.remaining(flat, s.read), 1);
  assert.equal(done.read['E:40'], true, 'original state is not mutated');
});

test('finishReading keeps an existing start date', () => {
  const s = S.finishReading({ ...S.defaultState(), startDate: '2026-10-18' }, flat, TODAY);
  assert.equal(s.startDate, '2026-10-18');
});

test('setNote saves, trims, defaults the date and deletes on empty text', () => {
  let s = S.setNote(S.defaultState(), 'E:12', { t: '  hello ', p: '88', d: '2026-10-27' }, TODAY);
  assert.deepEqual(s.notes['E:12'], { t: 'hello', p: '88', d: '2026-10-27' });
  s = S.setNote(s, 'T:4', { t: 'x', p: '-3', d: '' }, TODAY);
  assert.deepEqual(s.notes['T:4'], { t: 'x', p: '', d: TODAY });
  s = S.setNote(s, 'E:12', { t: '   ', p: '88', d: '2026-10-27' }, TODAY);
  assert.equal(s.notes['E:12'], undefined);
  assert.deepEqual(S.noteIds(flat, s.notes), ['T:4']);
  assert.deepEqual(S.deleteNote(s, 'T:4').notes, {});
});

test('noteIds follow reading order, not insertion order', () => {
  const notes = { 'T:F': { t: 'a' }, 'T:1': { t: 'b' }, 'E:N': { t: 'c' } };
  assert.deepEqual(S.noteIds(flat, notes), ['E:N', 'T:1', 'T:F']);
});

test('resetProgress keeps language and theme', () => {
  const s = S.resetProgress({
    ...S.finishReading(S.defaultState('cs'), flat, TODAY),
    notes: { 'E:1': { t: 'a', p: '', d: TODAY } },
    theme: 'dark',
  });
  assert.deepEqual(s, { ...S.defaultState('cs'), theme: 'dark' });
});

test('export -> import round trip', () => {
  let s = S.markRead(S.defaultState('cs'), flat, 'T:1', '2026-10-18', true);
  s = S.setNote(s, 'E:3', { t: 'note', p: '12', d: '2026-10-19' }, TODAY);
  const text = S.exportState(s);
  assert.equal(JSON.parse(text).version, 1);
  const res = S.validateImport(text, ids);
  assert.ok(res.ok);
  const target = { ...S.defaultState('en'), theme: 'dark', read: { 'T:F': true } };
  const merged = S.applyImport(target, res.data);
  assert.deepEqual(merged.read, s.read);
  assert.deepEqual(merged.notes, s.notes);
  assert.equal(merged.startDate, '2026-10-18');
  assert.equal(merged.lang, 'en', 'language is kept');
  assert.equal(merged.theme, 'dark', 'theme is kept');
});

test('validateImport rejects invalid files with a reason', () => {
  const base = { version: 1, read: {}, notes: {}, startDate: '', finishDate: '' };
  const check = (value, error) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    assert.deepEqual(S.validateImport(text, ids), { ok: false, error }, text);
  };
  check('not json {', 'json');
  check('', 'json');
  check('[]', 'shape');
  check('"text"', 'shape');
  check({ read: {}, notes: {} }, 'shape');
  check({ ...base, version: 2 }, 'version');
  check({ ...base, version: '1' }, 'version');
  check({ ...base, read: [] }, 'shape');
  check({ version: 1, read: {} }, 'shape');
  check({ ...base, read: { 'E:76': true } }, 'ids');
  check({ ...base, read: { 'E:1': 'yes' } }, 'data');
  check({ ...base, notes: { 'T:69': { t: 'x' } } }, 'ids');
  check({ ...base, notes: { 'T:1': 'x' } }, 'data');
  check({ ...base, notes: { 'T:1': { t: 5 } } }, 'data');
  check({ ...base, notes: { 'T:1': { t: 'x', p: 88 } } }, 'data');
  check({ ...base, notes: { 'T:1': { t: 'x', d: '27 Oct' } } }, 'data');
  check({ ...base, startDate: 'yesterday' }, 'data');
  check({ ...base, finishDate: 20261110 }, 'data');
  check({ ...base, lang: 'de' }, 'data');
  check({ ...base, theme: 'pink' }, 'data');
});

test('validateImport accepts the documented model', () => {
  const res = S.validateImport(
    JSON.stringify({
      version: 1,
      read: { 'E:N': true, 'E:1': true },
      notes: { 'E:12': { t: 'text', p: '88', d: '2026-10-27' } },
      startDate: '2026-10-18',
      finishDate: '',
      lang: 'cs',
      theme: 'auto',
    }),
    ids,
  );
  assert.deepEqual(res, {
    ok: true,
    data: {
      read: { 'E:N': true, 'E:1': true },
      notes: { 'E:12': { t: 'text', p: '88', d: '2026-10-27' } },
      startDate: '2026-10-18',
      finishDate: '',
    },
  });
});
