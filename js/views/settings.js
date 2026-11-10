// Settings: language, appearance, backup (export / import), replay intro, start over.

import * as S from '../state.js';
import { icon } from '../icons.js';
import { act, backLink, esc, footer } from './common.js';

function segmented(name, value, options, label) {
  const buttons = options
    .map(([id, text]) => `<button type="button" ${act(name, id)} aria-pressed="${value === id}">${esc(text)}</button>`)
    .join('');
  return `<div class="seg-control" role="group" aria-label="${esc(label)}">${buttons}</div>`;
}

export function view(ctx) {
  const { state, ui, T } = ctx;
  let h = backLink(T) + `<h1 class="page-title">${esc(T('settings'))}</h1>`;

  h += `<section class="card"><div class="card-label">${esc(T('lang'))}</div>${segmented('lang', state.lang, [['cs', 'Česky'], ['en', 'English']], T('lang'))}</section>`;
  h += `<section class="card"><div class="card-label">${esc(T('look'))}</div>${segmented('theme', state.theme, [['light', T('light')], ['dark', T('dark')], ['auto', T('auto')]], T('look'))}</section>`;

  h += `<section class="card"><div class="card-label">${esc(T('backup'))}</div>`;
  if (ui.importData) {
    h += `<div class="confirm"><span class="confirm-text">${esc(T('impQ'))}</span>
      <button type="button" class="btn" ${act('impYes')}>${esc(T('yesImp'))}</button>
      <button type="button" class="btn" ${act('impNo')}>${esc(T('cancel'))}</button></div>`;
  } else {
    h += `<div class="actions" style="margin-top:0">
      <button type="button" class="btn" ${act('exp')}>${icon('download')}${esc(T('exp'))}</button>
      <button type="button" class="btn" ${act('impPick')}>${icon('upload')}${esc(T('imp'))}</button>
      <input type="file" id="import-file" accept="application/json,.json" data-change="impFile" hidden></div>`;
  }
  if (ui.msg) {
    h += `<p class="msg msg-${ui.msg.type}" role="${ui.msg.type === 'err' ? 'alert' : 'status'}">${esc(T(ui.msg.key))}</p>`;
  }
  h += '</section>';

  h += `<section class="card"><button type="button" class="btn" ${act('replay')}>${icon('flame')}${esc(T('replay'))}</button></section>`;

  h += `<section class="card card-danger"><div class="card-label">${esc(T('reset'))}</div><p class="card-text">${esc(T('resetD'))}</p>`;
  if (ui.resetAsk) {
    h += `<div class="confirm"><span class="confirm-text danger-text">${esc(T('resetQ'))}</span>
      <button type="button" class="btn btn-danger" ${act('resetYes')}>${esc(T('yesDel'))}</button>
      <button type="button" class="btn" ${act('resetNo')}>${esc(T('cancel'))}</button></div>`;
  } else {
    h += `<button type="button" class="btn btn-danger" ${act('reset')}>${esc(T('reset'))}</button>`;
  }
  h += '</section>';
  return h + footer();
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const ERROR_KEYS = { json: 'errJson', shape: 'errShape', version: 'errVersion', data: 'errData', ids: 'errIds' };

export const actions = {
  lang(ctx, id) {
    if (S.LANG_VALUES.includes(id)) ctx.update({ ...ctx.state, lang: id });
  },
  theme(ctx, id) {
    if (S.THEME_VALUES.includes(id)) ctx.update({ ...ctx.state, theme: id });
  },
  exp(ctx) {
    download(S.BACKUP_FILENAME, S.exportState(ctx.state));
    return false;
  },
  impPick(_ctx, _id, el) {
    el.parentElement.querySelector('#import-file').click();
    return false;
  },
  impYes(ctx) {
    const { model, ui } = ctx;
    ctx.update(S.applyImport(ctx.state, ui.importData));
    ui.importData = null;
    ui.msg = { type: 'ok', key: 'impDone' };
    const cur = S.firstUnread(model.flat, ctx.state.read);
    ui.open = new Set([cur ? model.partOf.get(cur) : 0]);
    ui.focus = '[data-k="impPick:"]';
  },
  impNo(ctx) {
    ctx.ui.importData = null;
    ctx.ui.focus = '[data-k="impPick:"]';
  },
  replay(ctx) {
    ctx.replayIntro();
    return false;
  },
  reset(ctx) {
    ctx.ui.resetAsk = true;
    ctx.ui.focus = '[data-k="resetNo:"]';
  },
  resetNo(ctx) {
    ctx.ui.resetAsk = false;
    ctx.ui.focus = '[data-k="reset:"]';
  },
  /** Deletes chapters, notes and dates (not language or theme), then shows the overview. */
  resetYes(ctx) {
    ctx.update(S.resetProgress(ctx.state));
    ctx.ui.resetAsk = false;
    ctx.ui.open = new Set([0]);
    ctx.go('#/');
  },
};

export const changes = {
  /** Validates the chosen file; nothing is overwritten until the user confirms. */
  impFile(ctx, _id, el) {
    const file = el.files && el.files[0];
    if (!file) return false;
    const { ui } = ctx;
    file
      .text()
      .then((text) => {
        const res = S.validateImport(text, ctx.model.ids);
        if (res.ok) {
          ui.importData = res.data;
          ui.msg = null;
          ui.focus = '[data-k="impNo:"]';
        } else {
          ui.importData = null;
          ui.msg = { type: 'err', key: ERROR_KEYS[res.error] || 'errData' };
        }
      })
      .catch(() => {
        ui.importData = null;
        ui.msg = { type: 'err', key: 'errRead' };
      })
      .then(() => ctx.render());
    return false;
  },
};
