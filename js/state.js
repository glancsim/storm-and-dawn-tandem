// Data model, progress maths, marking rules and backup validation.
// Pure, no DOM. Every "change" function returns a new state object.

import { isISODate } from './dates.js';

export const STORAGE_KEY = 'myTandemRead:v1';
export const SCHEMA_VERSION = 1;
export const BACKUP_FILENAME = 'my-tandem-read-backup.json';
export const LANG_VALUES = ['cs', 'en'];
export const THEME_VALUES = ['light', 'dark', 'auto'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/** navigator.language -> 'cs' for Czech, otherwise 'en'. */
export function detectLang(navLang) {
  return typeof navLang === 'string' && /^cs\b/i.test(navLang) ? 'cs' : 'en';
}

export function defaultState(lang = 'en') {
  return {
    version: SCHEMA_VERSION,
    read: {},
    notes: {},
    startDate: '',
    finishDate: '',
    lang: LANG_VALUES.includes(lang) ? lang : 'en',
    theme: 'auto',
  };
}

function cleanPage(p) {
  if (typeof p === 'number' && Number.isInteger(p) && p > 0) return String(p);
  if (typeof p === 'string' && /^\d+$/.test(p.trim())) return p.trim();
  return '';
}

/**
 * Lenient clean-up for whatever is in localStorage: anything missing or
 * broken falls back to defaults, so the app never crashes on bad data.
 */
export function sanitizeState(raw, knownIds, fallbackLang = 'en') {
  const s = defaultState(fallbackLang);
  if (!isObject(raw)) return s;
  if (isObject(raw.read)) {
    for (const id of Object.keys(raw.read)) {
      if (knownIds.has(id) && raw.read[id]) s.read[id] = true;
    }
  }
  if (isObject(raw.notes)) {
    for (const id of Object.keys(raw.notes)) {
      const n = raw.notes[id];
      if (!knownIds.has(id) || !isObject(n) || typeof n.t !== 'string' || !n.t.trim()) continue;
      s.notes[id] = { t: n.t, p: cleanPage(n.p), d: isISODate(n.d) ? n.d : '' };
    }
  }
  if (isISODate(raw.startDate)) s.startDate = raw.startDate;
  if (isISODate(raw.finishDate)) s.finishDate = raw.finishDate;
  if (LANG_VALUES.includes(raw.lang)) s.lang = raw.lang;
  if (THEME_VALUES.includes(raw.theme)) s.theme = raw.theme;
  return s;
}

/* ---------- progress ---------- */

export function percent(read, total) {
  return total > 0 ? Math.round((100 * read) / total) : 0;
}

/** Read counts and percentages for the whole order and per book. */
export function progressStats(flat, read) {
  const out = { total: { read: 0, all: 0 }, E: { read: 0, all: 0 }, T: { read: 0, all: 0 } };
  for (const id of flat) {
    const book = out[id[0]];
    out.total.all++;
    book.all++;
    if (read[id]) {
      out.total.read++;
      book.read++;
    }
  }
  for (const k of Object.keys(out)) out[k].pct = percent(out[k].read, out[k].all);
  return out;
}

export function countRead(ids, read) {
  let n = 0;
  for (const id of ids) if (read[id]) n++;
  return n;
}

/** 'done' | 'partial' | 'none' for one block of chapters. */
export function blockStatus(ids, read) {
  const n = countRead(ids, read);
  return n === ids.length ? 'done' : n > 0 ? 'partial' : 'none';
}

/** First unread chapter in reading order, or null when everything is read. */
export function firstUnread(flat, read) {
  for (const id of flat) if (!read[id]) return id;
  return null;
}

/** Number of unread chapters that come before `id` in reading order. */
export function unreadBefore(flat, read, id) {
  let n = 0;
  for (const other of flat) {
    if (other === id) break;
    if (!read[other]) n++;
  }
  return n;
}

export function remaining(flat, read) {
  return flat.length - countRead(flat, read);
}

/**
 * Horizontal position (in %) of the "You are here" badge: where the first
 * unread chapter sits on the bar, clamped to 9..91. Null when all is read.
 */
export function herePosition(flat, read) {
  const cur = firstUnread(flat, read);
  if (cur === null) return null;
  const x = (flat.indexOf(cur) / flat.length) * 100;
  return Math.min(Math.max(x, 9), 91);
}

/* ---------- changes ---------- */

/** Marks `id` as read; with `withEarlier` also everything before it. */
export function markRead(state, flat, id, today, withEarlier = false) {
  const read = { ...state.read };
  if (withEarlier) {
    for (const other of flat) {
      read[other] = true;
      if (other === id) break;
    }
  } else {
    read[id] = true;
  }
  return { ...state, read, startDate: state.startDate || today };
}

/** Marks `id` as unread. Reading is no longer finished, so finishDate is cleared. */
export function unmarkRead(state, id) {
  const read = { ...state.read };
  delete read[id];
  return { ...state, read, finishDate: '' };
}

/** Marks everything as read and stores the finish date. */
export function finishReading(state, flat, today) {
  const read = {};
  for (const id of flat) read[id] = true;
  return { ...state, read, startDate: state.startDate || today, finishDate: today };
}

/** Saves a note; an empty text deletes it. */
export function setNote(state, id, { t, p, d }, today) {
  const notes = { ...state.notes };
  const text = typeof t === 'string' ? t.trim() : '';
  if (!text) delete notes[id];
  else notes[id] = { t: text, p: cleanPage(p), d: isISODate(d) ? d : today };
  return { ...state, notes };
}

export function deleteNote(state, id) {
  const notes = { ...state.notes };
  delete notes[id];
  return { ...state, notes };
}

/** Start over: clears chapters, notes and both dates; keeps language and theme. */
export function resetProgress(state) {
  return { ...state, read: {}, notes: {}, startDate: '', finishDate: '' };
}

/** Ids that have a note, in reading order. */
export function noteIds(flat, notes) {
  return flat.filter((id) => own(notes, id));
}

/* ---------- backup ---------- */

export function exportState(state) {
  return JSON.stringify(
    {
      version: SCHEMA_VERSION,
      read: state.read,
      notes: state.notes,
      startDate: state.startDate,
      finishDate: state.finishDate,
      lang: state.lang,
      theme: state.theme,
    },
    null,
    2,
  );
}

/**
 * Strict validation of a backup file. Returns { ok: true, data } or
 * { ok: false, error } with error one of: json, shape, version, data, ids.
 */
export function validateImport(text, knownIds) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (!isObject(raw) || !own(raw, 'version')) return { ok: false, error: 'shape' };
  if (raw.version !== SCHEMA_VERSION) return { ok: false, error: 'version' };
  if (!isObject(raw.read) || !isObject(raw.notes)) return { ok: false, error: 'shape' };

  const dateOk = (v) => v === undefined || v === '' || isISODate(v);
  if (!dateOk(raw.startDate) || !dateOk(raw.finishDate)) return { ok: false, error: 'data' };
  if (raw.lang !== undefined && !LANG_VALUES.includes(raw.lang)) return { ok: false, error: 'data' };
  if (raw.theme !== undefined && !THEME_VALUES.includes(raw.theme)) return { ok: false, error: 'data' };

  const read = {};
  for (const id of Object.keys(raw.read)) {
    if (!knownIds.has(id)) return { ok: false, error: 'ids' };
    if (raw.read[id] !== true) return { ok: false, error: 'data' };
    read[id] = true;
  }
  const notes = {};
  for (const id of Object.keys(raw.notes)) {
    if (!knownIds.has(id)) return { ok: false, error: 'ids' };
    const n = raw.notes[id];
    if (!isObject(n) || typeof n.t !== 'string' || !n.t.trim()) return { ok: false, error: 'data' };
    if (n.p !== undefined && !(typeof n.p === 'string' && /^\d*$/.test(n.p))) return { ok: false, error: 'data' };
    if (!dateOk(n.d)) return { ok: false, error: 'data' };
    notes[id] = { t: n.t, p: n.p || '', d: n.d || '' };
  }
  return {
    ok: true,
    data: { read, notes, startDate: raw.startDate || '', finishDate: raw.finishDate || '' },
  };
}

/** Replaces progress with validated backup data; keeps language and theme. */
export function applyImport(state, data) {
  return {
    ...state,
    read: { ...data.read },
    notes: { ...data.notes },
    startDate: data.startDate,
    finishDate: data.finishDate,
  };
}
