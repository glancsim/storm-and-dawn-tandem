// Finale: shown once a finish date is stored. Its texts are always English.

import { daysReading, formatDate } from '../dates.js';
import * as S from '../state.js';
import { cryFace } from '../icons.js';
import { backLink, esc, footer, scene, tile } from './common.js';

export function view(ctx) {
  const { state, model, T } = ctx;
  const days = daysReading(state.startDate, state.finishDate);
  const range = [state.startDate, state.finishDate]
    .map((d) => formatDate(d, state.lang))
    .filter(Boolean)
    .join(' – ');

  let h = backLink(T);
  h += `<section class="finale-banner"><div class="finale-text" lang="en">
      <h1 class="finale-title">You did not yield.</h1>
      <p class="finale-lines"><span>You turned the last page with your head held high, Fireheart.</span><span>The storm has passed, the tower still stands, and the dawn is yours.</span></p>
    </div>${scene()}</section>`;
  h += `<p class="tissues">${cryFace(28)}<span>${esc(T('tissues'))}</span></p>`;
  h += `<div class="tiles">${tile(esc(T('chapters')), model.flat.length)}${tile(esc(T('days')), days ?? '–')}${tile(esc(T('notes')), S.noteIds(model.flat, state.notes).length)}</div>`;
  h += `<p class="range">${esc(range)}</p>`;
  return h + footer();
}
