// Inline note editor shown under a chapter on the overview:
// text, optional page number and a date (today by default).

import { chapterLabel } from '../chapters.js';
import * as S from '../state.js';
import { act, esc } from './common.js';

/** Starts editing the note of `id` (used by the pencil and by the Notes page). */
export function openEditor(ctx, id) {
  const note = ctx.state.notes[id];
  ctx.ui.editing = id;
  ctx.ui.draft = { t: note?.t ?? '', p: note?.p ?? '', d: note?.d || ctx.today() };
  ctx.ui.pending = null;
  ctx.ui.focus = '#note-text';
}

function closeEditor(ctx) {
  const id = ctx.ui.editing;
  ctx.ui.editing = null;
  ctx.ui.draft = null;
  if (id) ctx.ui.focus = `[data-k="pen:${id}"]`;
}

export function noteEditor(ctx, id) {
  const { ui, T } = ctx;
  const label = chapterLabel(id);
  const d = ui.draft || { t: '', p: '', d: ctx.today() };
  return `<div class="editor" role="group" aria-label="${esc(`${T('note')}: ${label}`)}">
    <div class="editor-title">${esc(label)}</div>
    <textarea id="note-text" rows="3" data-input="draft" data-k="note-text:" placeholder="${esc(T('notePH'))}" aria-label="${esc(T('note'))}">${esc(d.t)}</textarea>
    <div class="fields">
      <label>${esc(T('page'))} <input type="number" id="note-page" min="1" step="1" inputmode="numeric" data-input="draft" data-k="note-page:" value="${esc(d.p)}"></label>
      <label>${esc(T('date'))} <input type="date" id="note-date" data-input="draft" data-k="note-date:" value="${esc(d.d)}"></label>
    </div>
    <div class="actions">
      <button type="button" class="btn btn-primary" ${act('noteSave')}>${esc(T('save'))}</button>
      <button type="button" class="btn" ${act('noteCancel')}>${esc(T('cancel'))}</button>
    </div></div>`;
}

export const actions = {
  pen(ctx, id) {
    if (ctx.ui.editing === id) closeEditor(ctx);
    else openEditor(ctx, id);
  },
  noteSave(ctx) {
    const id = ctx.ui.editing;
    if (!id) return;
    // An empty text deletes the note.
    ctx.update(S.setNote(ctx.state, id, ctx.ui.draft || {}, ctx.today()));
    closeEditor(ctx);
  },
  noteCancel: (ctx) => closeEditor(ctx),
};

export const inputs = {
  /** Keeps typed values across re-renders; no re-render needed for typing. */
  draft(ctx, _id, el) {
    const box = el.closest('.editor');
    ctx.ui.draft = {
      t: box.querySelector('#note-text').value,
      p: box.querySelector('#note-page').value,
      d: box.querySelector('#note-date').value,
    };
    return false;
  },
};
