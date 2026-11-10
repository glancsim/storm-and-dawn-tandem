import test from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, t } from '../js/i18n.js';

test('Czech markPrev picks one / few / other', () => {
  const one = 'Označit i {n} předchozí nepřečtenou kapitolu?';
  const few = 'Označit i {n} předchozí nepřečtené kapitoly?';
  const other = 'Označit i {n} předchozích nepřečtených kapitol?';
  const expected = { 1: one, 2: few, 4: few, 5: other, 11: other, 21: other };
  for (const [n, form] of Object.entries(expected)) {
    assert.equal(t('cs', 'markPrev', Number(n)), form.replace('{n}', n));
  }
});

test('Czech askFin picks one / few / other', () => {
  assert.equal(t('cs', 'askFin', 1), 'Ještě ti zbývá 1 kapitola. Označit ji jako přečtenou a dokončit?');
  assert.equal(t('cs', 'askFin', 2), 'Ještě ti zbývají 2 kapitoly. Označit je jako přečtené a dokončit?');
  assert.equal(t('cs', 'askFin', 4), 'Ještě ti zbývají 4 kapitoly. Označit je jako přečtené a dokončit?');
  assert.equal(t('cs', 'askFin', 5), 'Ještě ti zbývá 5 kapitol. Označit je jako přečtené a dokončit?');
  assert.equal(t('cs', 'askFin', 11), 'Ještě ti zbývá 11 kapitol. Označit je jako přečtené a dokončit?');
  assert.equal(t('cs', 'askFin', 21), 'Ještě ti zbývá 21 kapitol. Označit je jako přečtené a dokončit?');
});

test('English plurals pick one / other', () => {
  assert.equal(t('en', 'markPrev', 1), 'Also mark 1 earlier unread chapter as read?');
  for (const n of [2, 4, 5, 11, 21]) {
    assert.equal(t('en', 'markPrev', n), `Also mark ${n} earlier unread chapters as read?`);
    assert.equal(t('en', 'askFin', n), `${n} chapters left. Mark them as read and finish?`);
  }
  assert.equal(t('en', 'askFin', 1), '1 chapter left. Mark it as read and finish?');
});

test('plain strings', () => {
  assert.equal(t('cs', 'cont'), 'Pokračovat');
  assert.equal(t('en', 'cont'), 'Continue');
  assert.equal(t('cs', 'here'), 'Tady jsi');
  assert.equal(t('en', 'here'), 'You are here');
});

test('both languages define the same keys', () => {
  assert.deepEqual(Object.keys(STRINGS.cs).sort(), Object.keys(STRINGS.en).sort());
});

test('unknown language falls back to English, unknown key to the key', () => {
  assert.equal(t('de', 'cont'), 'Continue');
  assert.equal(t('de', 'askFin', 1), '1 chapter left. Mark it as read and finish?');
  assert.equal(t('en', 'nope'), 'nope');
});
