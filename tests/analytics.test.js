import test from 'node:test';
import assert from 'node:assert/strict';
import { GOATCOUNTER_CODE, shouldCount, countUrl } from '../js/analytics.js';

const pages = { protocol: 'https:', hostname: 'someone.github.io' };

test('code is a valid GoatCounter code or empty', () => {
  assert.match(GOATCOUNTER_CODE, /^([a-z0-9-]+)?$/i);
});

test('counts only with a code on a real host', () => {
  assert.equal(shouldCount('tandem', pages), true);
  assert.equal(shouldCount('', pages), false);
  assert.equal(shouldCount('bad code/', pages), false);
  for (const hostname of ['localhost', '127.0.0.1', '[::1]', 'mac.local', '']) {
    assert.equal(shouldCount('tandem', { protocol: 'http:', hostname }), false, hostname);
  }
  assert.equal(shouldCount('tandem', { protocol: 'file:', hostname: '' }), false);
});

test('builds the count URL', () => {
  const url = new URL(countUrl('tandem', {
    path: '/storm-and-dawn-tandem/',
    title: 'My Tandem Read',
    referrer: 'https://www.reddit.com/r/books/',
    hostname: 'someone.github.io',
    screen: { width: 390, height: 844, dpr: 3 },
    rnd: 'x1',
  }));
  assert.equal(url.origin, 'https://tandem.goatcounter.com');
  assert.equal(url.pathname, '/count');
  assert.equal(url.searchParams.get('p'), '/storm-and-dawn-tandem/');
  assert.equal(url.searchParams.get('t'), 'My Tandem Read');
  assert.equal(url.searchParams.get('r'), 'https://www.reddit.com/r/books/');
  assert.equal(url.searchParams.get('s'), '390,844,3');
  assert.equal(url.searchParams.get('rnd'), 'x1');
});

test('drops same-site and invalid referrers', () => {
  const same = new URL(countUrl('tandem', { referrer: 'https://someone.github.io/x', hostname: 'someone.github.io' }));
  assert.equal(same.searchParams.has('r'), false);
  const bad = new URL(countUrl('tandem', { referrer: 'not a url', hostname: 'someone.github.io' }));
  assert.equal(bad.searchParams.has('r'), false);
  assert.equal(bad.searchParams.get('p'), '/');
});
