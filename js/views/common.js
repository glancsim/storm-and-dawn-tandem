// Markup helpers shared by the views. They only build strings.

import { icon } from '../icons.js';

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Attributes for an actionable element. `data-k` identifies the element across
 * re-renders so keyboard focus can be restored.
 */
export function act(name, id = '') {
  const idAttr = id === '' ? '' : ` data-id="${esc(id)}"`;
  return `data-act="${name}"${idAttr} data-k="${name}:${esc(id)}"`;
}

/** The shared silhouette scene (defined once in index.html). */
export function scene() {
  return '<svg class="scene" viewBox="0 0 680 200" preserveAspectRatio="xMinYMax meet" aria-hidden="true" focusable="false"><use href="#scene-art"/></svg>';
}

export function banner() {
  return `<header class="banner">${scene()}<div class="banner-text"><h1 class="banner-title">My Tandem Read</h1><p class="banner-sub">EMPIRE OF STORMS &amp; TOWER OF DAWN</p></div></header>`;
}

export function tile(label, value) {
  return `<div class="tile"><div class="tile-label">${label}</div><div class="tile-value">${value}</div></div>`;
}

export function backLink(T) {
  return `<a class="btn back" href="#/" data-k="back:">${icon('back')}${esc(T('back'))}</a>`;
}

/** Footer is English only by specification. */
export function footer() {
  return '<footer class="footer"><span>Chapter order based on the infographic by @parismaereads.</span><span>An unofficial fan project; it contains no text from the books.</span><span>Empire of Storms and Tower of Dawn © Sarah J. Maas.</span></footer>';
}
