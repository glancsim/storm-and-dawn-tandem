// Overview: banner, percentage tiles, toolbar, start date, progress bar,
// the four parts with chapter buttons, and the Finished button.

import { BOOK_NAMES, chapterLabel, shortLabel } from '../chapters.js';
import { formatDate, isISODate } from '../dates.js';
import * as S from '../state.js';
import { icon } from '../icons.js';
import { act, banner, esc, footer, tile } from './common.js';
import { noteEditor } from './note-editor.js';

const chipSel = (id) => `[data-k="ch:${id}"]`;

function blockTitle(block) {
  const range = block.spec.slice(2).replace('-', '–').replace(/^N$/, 'Nightfall').replace(/^F$/, 'Fireheart');
  return `${BOOK_NAMES[block.book]} ${range}`;
}

function startRow(ctx) {
  const { state, ui, T } = ctx;
  if (ui.editDate) {
    return `<div class="start-row">${icon('calendar')}<label for="start-date">${esc(T('startLbl'))}</label>
      <input type="date" id="start-date" data-k="start-date:" value="${esc(state.startDate)}">
      <button type="button" class="btn btn-small" ${act('sdSave')}>${esc(T('save'))}</button>
      <button type="button" class="btn btn-small" ${act('sdCancel')}>${esc(T('cancel'))}</button></div>`;
  }
  const value = state.startDate ? formatDate(state.startDate, state.lang) : T('notSet');
  return `<div class="start-row">${icon('calendar')}<span>${esc(T('startLbl'))} <strong>${esc(value)}</strong></span>
    <button type="button" class="icon-btn" ${act('sdEdit')} aria-label="${esc(T('editDate'))}">${icon('pencil', 14)}</button></div>`;
}

function progressBar(ctx, stats) {
  const { state, model, T } = ctx;
  const x = S.herePosition(model.flat, state.read);
  const pin = x === null ? '' : `<div class="here-pin" style="left:${x.toFixed(2)}%"><span class="badge">${esc(T('here'))}</span></div>`;
  const segs = model.parts
    .map((part) =>
      part.blocks
        .map((block) => {
          const status = S.blockStatus(block.ids, state.read);
          const title = `${T('part')} ${part.index + 1} · ${blockTitle(block)}`;
          return `<div class="seg seg-${block.book} is-${status}" style="flex:${block.ids.length}" data-act="seg" data-id="${part.index}" title="${esc(title)}"></div>`;
        })
        .join(''),
    )
    .join('');
  const label = `${T('progress')}: ${stats.total.read} / ${stats.total.all}`;
  return `<div class="bar-wrap">${pin}<div class="bar" role="img" aria-label="${esc(label)}">${segs}</div></div>`;
}

function chip(ctx, id, cur) {
  const { state, ui, T } = ctx;
  const book = id[0];
  const isRead = Boolean(state.read[id]);
  const hasNote = state.notes[id] !== undefined;
  const cls = ['chip', `chip-${book}`];
  if (isRead) cls.push('is-read');
  if (id === cur) cls.push('is-cur');
  if (id === ui.flash) cls.push('flash');
  const label = chapterLabel(id);
  return `<span class="cg"><button type="button" class="${cls.join(' ')}" ${act('ch', id)} aria-pressed="${isRead}" aria-label="${esc(label)}"${id === cur ? ' aria-current="step"' : ''}>${isRead ? icon('check', 12) : ''}${esc(shortLabel(id))}</button><button type="button" class="pen${hasNote ? ' has-note' : ''}" ${act('pen', id)} aria-label="${esc(`${T('note')}: ${label}`)}" aria-expanded="${ui.editing === id}">${icon('pencil', 13)}</button></span>`;
}

function markPrompt(ctx, id) {
  const { state, model, T } = ctx;
  const n = S.unreadBefore(model.flat, state.read, id);
  return `<div class="prompt" role="group" aria-label="${esc(chapterLabel(id))}"><span class="prompt-text">${esc(T('markPrev', n))}</span>
    <button type="button" class="btn btn-small" ${act('all')}>${esc(T('yesAll'))}</button>
    <button type="button" class="btn btn-small" ${act('one')}>${esc(T('onlyThis'))}</button></div>`;
}

function blockRow(ctx, block, cur) {
  const { ui } = ctx;
  let extras = '';
  for (const id of block.ids) {
    if (ui.pending === id) extras += markPrompt(ctx, id);
    if (ui.editing === id) extras += noteEditor(ctx, id);
  }
  return `<div class="row row-${block.book}"><span class="row-name">${BOOK_NAMES[block.book]}</span>${block.ids.map((id) => chip(ctx, id, cur)).join('')}${extras}</div>`;
}

function partCard(ctx, part, cur) {
  const { state, model, ui, T } = ctx;
  const i = part.index;
  const done = S.countRead(part.ids, state.read);
  const isOpen = ui.open.has(i);
  const hasCur = cur !== null && model.partOf.get(cur) === i;
  return `<section class="card part" id="part-${i}">
    <button type="button" class="part-head" ${act('part', i)} aria-expanded="${isOpen}" aria-controls="part-body-${i}">
      <span class="chev">${icon('chevron', 18)}</span>
      <span class="part-title">${esc(T('part'))} ${i + 1}</span>
      <span class="mini"><span class="mini-fill" style="width:${S.percent(done, part.ids.length)}%"></span></span>
      <span class="part-count">${done} / ${part.ids.length}</span>
      ${hasCur ? `<span class="badge">${esc(T('here'))}</span>` : ''}
    </button>
    ${isOpen ? `<div class="part-body" id="part-body-${i}">${part.blocks.map((b) => blockRow(ctx, b, cur)).join('')}</div>` : ''}
  </section>`;
}

export function view(ctx) {
  const { state, model, ui, T } = ctx;
  const cur = S.firstUnread(model.flat, state.read);
  const stats = S.progressStats(model.flat, state.read);
  const noteCount = S.noteIds(model.flat, state.notes).length;
  const swatch = (b) => `<span class="swatch swatch-${b}"></span>`;

  let h = banner();
  h += `<div class="tiles">${tile(esc(T('total')), `${stats.total.pct} %`)}${tile(`${swatch('E')}EOS`, `${stats.E.pct} %`)}${tile(`${swatch('T')}TOD`, `${stats.T.pct} %`)}</div>`;
  h += `<div class="toolbar">
    <button type="button" class="btn btn-primary" ${act('cont')}>${icon('play')}${esc(cur ? T('cont') : T('allDone'))}</button>
    <a class="btn" href="#/notes" data-k="nav:notes">${icon('pencil')}${esc(T('notes'))} (${noteCount})</a>
    <span class="spacer"></span>
    <a class="btn" href="#/settings" data-k="nav:settings">${icon('gear')}${esc(T('settings'))}</a></div>`;
  h += startRow(ctx);
  h += progressBar(ctx, stats);
  h += model.parts.map((part) => partCard(ctx, part, cur)).join('');
  if (ui.finishAsk) {
    h += `<div class="prompt prompt-block" role="group"><span class="prompt-text">${esc(T('askFin', S.remaining(model.flat, state.read)))}</span>
      <button type="button" class="btn" ${act('finYes')}>${esc(T('yesFin'))}</button>
      <button type="button" class="btn" ${act('finNo')}>${esc(T('notYet'))}</button></div>`;
  }
  h += `<button type="button" class="btn btn-block" ${act('finish')}>${icon('sparkle', 18)}${esc(T('finish'))}</button>`;
  return h + footer();
}

/** Finishes the read (when nothing is left to confirm) and opens the finale. */
function finishNow(ctx) {
  if (!ctx.state.finishDate) ctx.update(S.finishReading(ctx.state, ctx.model.flat, ctx.today()));
  ctx.ui.finishAsk = false;
  ctx.go('#/finale');
}

function mark(ctx, withEarlier) {
  const id = ctx.ui.pending;
  if (!id) return;
  ctx.update(S.markRead(ctx.state, ctx.model.flat, id, ctx.today(), withEarlier));
  ctx.ui.pending = null;
  ctx.ui.focus = chipSel(id);
}

export const actions = {
  part(ctx, i) {
    const n = Number(i);
    if (ctx.ui.open.has(n)) ctx.ui.open.delete(n);
    else ctx.ui.open.add(n);
  },
  seg(ctx, i) {
    ctx.ui.open.add(Number(i));
    ctx.ui.scroll = { sel: `#part-${Number(i)}`, block: 'start' };
  },
  ch(ctx, id) {
    const { state, model, ui } = ctx;
    if (state.read[id]) {
      // Unmarking also clears finishDate: the read is no longer finished.
      ctx.update(S.unmarkRead(state, id));
      ui.pending = null;
      ui.finishAsk = false;
    } else if (S.unreadBefore(model.flat, state.read, id) > 0) {
      ui.pending = id;
      ui.focus = '[data-k="all:"]';
    } else {
      ctx.update(S.markRead(state, model.flat, id, ctx.today()));
      ui.pending = null;
    }
  },
  all: (ctx) => mark(ctx, true),
  one: (ctx) => mark(ctx, false),
  cont(ctx) {
    const { state, model, ui } = ctx;
    const cur = S.firstUnread(model.flat, state.read);
    if (cur === null) return finishNow(ctx);
    ui.open.add(model.partOf.get(cur));
    ui.pending = null;
    ui.flash = cur;
    ui.focus = chipSel(cur);
    ui.scroll = { sel: chipSel(cur), block: 'center' };
  },
  sdEdit(ctx) {
    ctx.ui.editDate = true;
    ctx.ui.focus = '#start-date';
  },
  sdSave(ctx, _id, el) {
    const value = el.closest('.start-row').querySelector('#start-date').value;
    if (value === '' || isISODate(value)) ctx.update({ ...ctx.state, startDate: value });
    ctx.ui.editDate = false;
    ctx.ui.focus = '[data-k="sdEdit:"]';
  },
  sdCancel(ctx) {
    ctx.ui.editDate = false;
    ctx.ui.focus = '[data-k="sdEdit:"]';
  },
  finish(ctx) {
    const { state, model, ui } = ctx;
    if (state.finishDate || S.remaining(model.flat, state.read) === 0) return finishNow(ctx);
    ui.finishAsk = true;
    ui.focus = '[data-k="finYes:"]';
  },
  finYes: (ctx) => finishNow(ctx),
  finNo(ctx) {
    ctx.ui.finishAsk = false;
    ctx.ui.focus = '[data-k="finish:"]';
  },
};
