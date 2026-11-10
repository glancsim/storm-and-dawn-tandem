// Anonymous visit counting with GoatCounter (https://www.goatcounter.com).
// No cookies, no third-party script: one image request per app load to the
// site's GoatCounter /count endpoint. Pure helpers here; app.js sends the hit.

/** GoatCounter site code: the part before ".goatcounter.com". Empty = counting off. */
export const GOATCOUNTER_CODE = '';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1', '0.0.0.0', '']);

/** True when a code is set and the app is served from a real host over http(s). */
export function shouldCount(code, { protocol, hostname } = {}) {
  if (!/^[a-z0-9-]+$/i.test(code || '')) return false;
  if (protocol !== 'https:' && protocol !== 'http:') return false;
  const host = String(hostname || '').toLowerCase();
  return !LOCAL_HOSTS.has(host) && !host.endsWith('.local');
}

/**
 * URL of the GoatCounter count request.
 * path: page path without the hash route (one hit per app load, not per screen).
 * referrer is sent only when it comes from another site.
 */
export function countUrl(code, { path = '/', title = '', referrer = '', hostname = '', screen = null, rnd = '' } = {}) {
  const q = new URLSearchParams();
  q.set('p', path || '/');
  if (title) q.set('t', title);
  let ref = '';
  try {
    if (referrer && new URL(referrer).hostname !== hostname) ref = referrer;
  } catch {
    ref = '';
  }
  if (ref) q.set('r', ref);
  if (screen) q.set('s', `${screen.width},${screen.height},${screen.dpr || 1}`);
  if (rnd) q.set('rnd', rnd);
  return `https://${code}.goatcounter.com/count?${q}`;
}
