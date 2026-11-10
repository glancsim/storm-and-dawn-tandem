// App shell: boot, storage, hash routing, rendering and event delegation.
// Views live in ./views/*; each exports view(ctx) plus optional
// actions / inputs / changes maps keyed by data-act / data-input / data-change.

import { expandParts } from './chapters.js';
import { t } from './i18n.js';
import { todayISO } from './dates.js';
import * as S from './state.js';
import { createStore } from './storage.js';
import { playIntro } from './intro.js';
import { banner, footer, esc } from './views/common.js';
import * as overview from './views/overview.js';
import * as noteEditor from './views/note-editor.js';
import * as notes from './views/notes.js';

const VIEWS = { main: overview, notes, settings: overview, finale: overview };
const MODULES = [overview, noteEditor, notes];
const ROUTES = { '#/': 'main', '#/notes': 'notes', '#/settings': 'settings', '#/finale': 'finale' };

const appEl = document.getElementById('app');
const introEl = document.getElementById('intro');
const warnEl = document.getElementById('storage-warning');

const handlers = { actions: {}, inputs: {}, changes: {} };
for (const mod of MODULES) {
  Object.assign(handlers.actions, mod.actions);
  Object.assign(handlers.inputs, mod.inputs);
  Object.assign(handlers.changes, mod.changes);
}

function freshUi() {
  return {
    open: new Set(), // indexes of expanded parts
    pending: null, // chapter id waiting for the "also mark earlier?" answer
    editing: null, // chapter id whose note editor is open
    draft: null, // unsaved note editor values
    editDate: false,
    finishAsk: false,
    resetAsk: false,
    delAsk: null,
    importData: null,
    msg: null, // { type: 'ok' | 'err', key }
    flash: null, // chapter id to highlight once
    focus: null, // selector to focus after the next render
    scroll: null, // { sel, block } to scroll to after the next render
    keep: false, // keep transient state across the next route change
  };
}

const ctx = {
  model: null,
  state: null,
  ui: freshUi(),
  T: (key, n) => t(ctx.state.lang, key, n),
  today: () => todayISO(),
  /** Replaces the state, persists it and updates language / theme / warning. */
  update(next) {
    ctx.state = next;
    store.save(next);
    syncChrome();
  },
  go(hash, { keep = false } = {}) {
    if ((location.hash || '#/') === hash) return;
    ctx.ui.keep = keep;
    location.hash = hash;
  },
  render: () => render(),
  replayIntro() {
    appEl.inert = true;
    playIntro(introEl).then(() => {
      appEl.inert = false;
      appEl.querySelector('[data-k="replay:"]')?.focus({ preventScroll: true });
    });
  },
};

let store;
let currentView = null;

function clearTransient() {
  const ui = ctx.ui;
  ui.pending = null;
  ui.editing = null;
  ui.draft = null;
  ui.editDate = false;
  ui.finishAsk = false;
  ui.resetAsk = false;
  ui.delAsk = null;
  ui.importData = null;
  ui.msg = null;
}

function hasTransient() {
  const ui = ctx.ui;
  return Boolean(
    ui.pending || ui.editing || ui.editDate || ui.finishAsk || ui.resetAsk || ui.delAsk || ui.importData,
  );
}

function syncChrome() {
  const root = document.documentElement;
  root.lang = ctx.state.lang;
  if (ctx.state.theme === 'auto') root.removeAttribute('data-theme');
  else root.dataset.theme = ctx.state.theme;
  warnEl.hidden = store.persistent;
}

function resolveView() {
  let name = ROUTES[location.hash || '#/'] || 'main';
  // The finale only exists while a finish date is stored.
  if (name === 'finale' && !ctx.state.finishDate) {
    history.replaceState(null, '', '#/');
    name = 'main';
  }
  return name;
}

function render() {
  const ui = ctx.ui;
  const name = resolveView();
  const routeChanged = name !== currentView;
  currentView = name;
  const activeKey = document.activeElement?.dataset?.k;

  appEl.innerHTML = VIEWS[name].view(ctx);

  let target = ui.focus ? appEl.querySelector(ui.focus) : null;
  if (!target && activeKey !== undefined && !routeChanged) {
    target = [...appEl.querySelectorAll('[data-k]')].find((el) => el.dataset.k === activeKey) || null;
  }
  target?.focus({ preventScroll: true });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollEl = ui.scroll ? appEl.querySelector(ui.scroll.sel) : null;
  if (scrollEl) {
    scrollEl.scrollIntoView({ block: ui.scroll.block || 'center', behavior: reduced ? 'auto' : 'smooth' });
  } else if (routeChanged) {
    window.scrollTo(0, 0);
  }
  ui.focus = null;
  ui.scroll = null;
  ui.flash = null;
}

function delegate(type, attr, map) {
  appEl.addEventListener(type, (e) => {
    const el = e.target.closest(`[${attr}]`);
    if (!el || !appEl.contains(el)) return;
    const fn = map[el.getAttribute(attr)];
    if (!fn) return;
    if (fn(ctx, el.dataset.id, el) !== false) render();
  });
}

async function boot() {
  store = createStore(() => window.localStorage);
  appEl.inert = true;
  const intro = playIntro(introEl);

  try {
    const res = await fetch(new URL('../chapters.json', import.meta.url));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ctx.model = expandParts(await res.json());
  } catch (err) {
    console.error(err);
    const lang = S.detectLang(navigator.language);
    appEl.innerHTML = banner() + `<p class="msg msg-err" role="alert">${esc(t(lang, 'loadErr'))}</p>` + footer();
    await intro;
    appEl.inert = false;
    return;
  }

  ctx.state = S.sanitizeState(store.load(), ctx.model.ids, S.detectLang(navigator.language));
  ctx.update(ctx.state); // writes the cleaned state back and detects blocked storage

  // On open, the part with the first unread chapter is expanded (or the first part).
  const cur = S.firstUnread(ctx.model.flat, ctx.state.read);
  ctx.ui.open.add(cur ? ctx.model.partOf.get(cur) : 0);

  delegate('click', 'data-act', handlers.actions);
  delegate('input', 'data-input', handlers.inputs);
  delegate('change', 'data-change', handlers.changes);

  window.addEventListener('hashchange', () => {
    if (!ctx.ui.keep) clearTransient();
    ctx.ui.keep = false;
    render();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !appEl.inert && hasTransient()) {
      clearTransient();
      render();
    }
  });
  // Keep this tab in sync when another tab of the app changes the data.
  window.addEventListener('storage', (e) => {
    if (e.key !== S.STORAGE_KEY) return;
    ctx.state = S.sanitizeState(store.load(), ctx.model.ids, ctx.state.lang);
    syncChrome();
    render();
  });

  render();
  await intro;
  appEl.inert = false;
}

boot();
