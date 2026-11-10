// Reading order: expands the compact block notation from chapters.json
// ("E:1-5", "T:F") into individual chapters. Pure, no DOM.

export const BOOK_NAMES = { E: 'EOS', T: 'TOD' };
const SPECIAL = { 'E:N': 'Nightfall', 'T:F': 'Fireheart' };

/** "E:1-5" -> { book: 'E', ids: ['E:1', ..., 'E:5'] } */
export function expandBlock(spec) {
  const m = /^([ET]):(?:([NF])|(\d+)(?:-(\d+))?)$/.exec(String(spec));
  if (!m) throw new Error(`Invalid block "${spec}"`);
  const book = m[1];
  if (m[2]) {
    const id = `${book}:${m[2]}`;
    if (!SPECIAL[id]) throw new Error(`Invalid block "${spec}"`);
    return { book, ids: [id] };
  }
  const lo = Number(m[3]);
  const hi = m[4] === undefined ? lo : Number(m[4]);
  if (lo < 1 || hi < lo) throw new Error(`Invalid block "${spec}"`);
  const ids = [];
  for (let n = lo; n <= hi; n++) ids.push(`${book}:${n}`);
  return { book, ids };
}

/** Short label shown on a chapter button: "12", "Nightfall", "Fireheart". */
export function shortLabel(id) {
  return SPECIAL[id] || id.slice(2);
}

/** Label used in notes and messages: "EOS: Chapter 12", "TOD: Fireheart". */
export function chapterLabel(id) {
  const book = BOOK_NAMES[id[0]];
  return SPECIAL[id] ? `${book}: ${SPECIAL[id]}` : `${book}: Chapter ${id.slice(2)}`;
}

/**
 * Builds the reading-order model from the parsed chapters.json.
 * Returns { parts, flat, ids, partOf, indexOf }.
 */
export function expandParts(data) {
  if (!data || !Array.isArray(data.parts)) throw new Error('chapters.json: missing "parts"');
  const flat = [];
  const partOf = new Map();
  const indexOf = new Map();
  const parts = data.parts.map((specs, partIndex) => {
    const blocks = specs.map((spec) => {
      const { book, ids } = expandBlock(spec);
      for (const id of ids) {
        if (indexOf.has(id)) throw new Error(`Duplicate chapter "${id}"`);
        indexOf.set(id, flat.length);
        partOf.set(id, partIndex);
        flat.push(id);
      }
      return { book, spec, ids };
    });
    return { index: partIndex, blocks, ids: blocks.flatMap((b) => b.ids) };
  });
  return { parts, flat, ids: new Set(flat), partOf, indexOf };
}
