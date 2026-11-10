// Notes page: every note in reading order, with edit and delete.

import { chapterLabel } from '../chapters.js';
import { formatDate } from '../dates.js';
import * as S from '../state.js';
import { icon } from '../icons.js';
import { act, backLink, esc, footer } from './common.js';
import { openEditor } from './note-editor.js';

function noteCard(ctx, id) {
  const { state, model, ui, T } = ctx;
  const note = state.notes[id];
  const label = chapterLabel(id);
  const meta = [
    note.p ? `${T('page')} ${note.p}` : '',
    `${T('part')} ${model.partOf.get(id) + 1}`,
    formatDate(note.d, state.lang),
  ].filter(Boolean);
  const confirm =
    ui.delAsk === id
      ? `<div class="prompt" role="group"><span class="prompt-text">${esc(T('delQ'))}</span>
          <button type="button" class="btn btn-small btn-danger" ${act('delYes', id)}>${esc(T('yesDel'))}</button>
          <button type="button" class="btn btn-small" ${act('delNo', id)}>${esc(T('cancel'))}</button></div>`
      : '';
  return `<article class="card note-card">
    <div class="note-head"><span class="tag tag-${id[0]}">${esc(label)}</span><span class="spacer"></span>
      <button type="button" class="icon-btn" ${act('noteEdit', id)} aria-label="${esc(`${T('edit')}: ${label}`)}">${icon('edit')}</button>
      <button type="button" class="icon-btn" ${act('noteDel', id)} aria-label="${esc(`${T('del')}: ${label}`)}">${icon('trash')}</button></div>
    <p class="note-text">${esc(note.t)}</p>
    <p class="note-meta">${esc(meta.join(' · '))}</p>${confirm}</article>`;
}

export function view(ctx) {
  const { state, model, T } = ctx;
  const ids = S.noteIds(model.flat, state.notes);
  let h = backLink(T) + `<h1 class="page-title">${esc(T('notes'))} (${ids.length})</h1>`;
  if (!ids.length) h += `<p class="empty">${esc(T('empty'))}</p>`;
  h += ids.map((id) => noteCard(ctx, id)).join('');
  return h + footer();
}

export const actions = {
  /** Back to the overview with the editor open at that chapter. */
  noteEdit(ctx, id) {
    openEditor(ctx, id);
    ctx.ui.open.add(ctx.model.partOf.get(id));
    ctx.ui.scroll = { sel: `[data-k="ch:${id}"]`, block: 'center' };
    ctx.go('#/', { keep: true });
    return false;
  },
  noteDel(ctx, id) {
    ctx.ui.delAsk = id;
    ctx.ui.focus = `[data-k="delNo:${id}"]`;
  },
  delYes(ctx, id) {
    ctx.update(S.deleteNote(ctx.state, id));
    ctx.ui.delAsk = null;
    ctx.ui.focus = '[data-k="back:"]';
  },
  delNo(ctx, id) {
    ctx.ui.delAsk = null;
    ctx.ui.focus = `[data-k="noteDel:${id}"]`;
  },
};
