// Date helpers working on ISO "YYYY-MM-DD" strings. Pure, no DOM.

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parse(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return { y, mo, d, ms };
}

export function isISODate(value) {
  return parse(value) !== null;
}

/** cs: "18. 10. 2026", en: "18 Oct 2026". Invalid input gives "". */
export function formatDate(iso, lang) {
  const p = parse(iso);
  if (!p) return '';
  return lang === 'cs' ? `${p.d}. ${p.mo}. ${p.y}` : `${p.d} ${MONTHS_EN[p.mo - 1]} ${p.y}`;
}

/** Today's date in the user's local time zone. */
export function todayISO(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Days from start to finish, counting the first day. Null when not computable. */
export function daysReading(start, finish) {
  const a = parse(start);
  const b = parse(finish);
  if (!a || !b || b.ms < a.ms) return null;
  return Math.round((b.ms - a.ms) / 86400000) + 1;
}
