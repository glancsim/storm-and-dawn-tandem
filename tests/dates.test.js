import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, isISODate, todayISO, daysReading } from '../js/dates.js';

test('formatDate per language', () => {
  assert.equal(formatDate('2026-10-18', 'cs'), '18. 10. 2026');
  assert.equal(formatDate('2026-10-18', 'en'), '18 Oct 2026');
  assert.equal(formatDate('2026-01-05', 'cs'), '5. 1. 2026');
  assert.equal(formatDate('2026-01-05', 'en'), '5 Jan 2026');
});

test('formatDate returns empty string for invalid input', () => {
  for (const bad of ['', 'x', '2026-13-01', '2026-02-30', null, undefined, 20261018]) {
    assert.equal(formatDate(bad, 'en'), '');
  }
});

test('isISODate', () => {
  assert.ok(isISODate('2028-02-29'));
  assert.ok(!isISODate('2026-02-29'));
  assert.ok(!isISODate('2026-2-9'));
  assert.ok(!isISODate('18. 10. 2026'));
});

test('todayISO uses local date parts', () => {
  assert.equal(todayISO(new Date(2026, 10, 10, 23, 59)), '2026-11-10');
  assert.equal(todayISO(new Date(2026, 0, 5, 0, 1)), '2026-01-05');
});

test('daysReading counts the first day', () => {
  assert.equal(daysReading('2026-10-18', '2026-10-18'), 1);
  assert.equal(daysReading('2026-10-18', '2026-11-10'), 24);
  assert.equal(daysReading('2026-03-28', '2026-03-30'), 3); // across a DST change
  assert.equal(daysReading('2026-11-10', '2026-10-18'), null);
  assert.equal(daysReading('', '2026-10-18'), null);
});
