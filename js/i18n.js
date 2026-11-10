// UI dictionary and plural handling. Pure, no DOM.
// The first block of each language is the dictionary from SPEC.md, verbatim.
// The second block holds strings the spec does not list (aria-labels,
// confirmations, import messages); see README "Decisions".

export const STRINGS = {
  cs: {
    total: 'Celkem', cont: 'Pokračovat', allDone: 'Hotovo', notes: 'Poznámky', settings: 'Nastavení',
    startLbl: 'Začátek čtení:', notSet: 'zatím nenastaveno', save: 'Uložit', cancel: 'Zrušit',
    here: 'Tady jsi', part: 'Část', yesAll: 'Ano, všechny', onlyThis: 'Jen tuto',
    notePH: 'Co tě u téhle kapitoly zaujalo?', page: 'Strana', date: 'Datum', finish: 'Dočteno',
    yesFin: 'Ano, dočteno', notYet: 'Ještě ne', back: 'Zpět na přehled',
    empty: 'Zatím tu nic není. Poznámku přidáš tužtičkou u kapitoly.', lang: 'Jazyk', look: 'Vzhled',
    light: 'Světlý', dark: 'Tmavý', auto: 'Podle zařízení', backup: 'Záloha postupu',
    exp: 'Exportovat', imp: 'Importovat', reset: 'Začít znovu',
    resetD: 'Smaže přečtené kapitoly, poznámky i datum začátku.',
    resetQ: 'Opravdu smazat veškerý postup?', yesDel: 'Ano, smazat',
    replay: 'Pustit úvodní animaci znovu', chapters: 'Kapitol', days: 'Dní čtení',
    tissues: 'Tady máš kapesníčky na slzy.',
    markPrev: {
      one: 'Označit i {n} předchozí nepřečtenou kapitolu?',
      few: 'Označit i {n} předchozí nepřečtené kapitoly?',
      other: 'Označit i {n} předchozích nepřečtených kapitol?',
    },
    askFin: {
      one: 'Ještě ti zbývá {n} kapitola. Označit ji jako přečtenou a dokončit?',
      few: 'Ještě ti zbývají {n} kapitoly. Označit je jako přečtené a dokončit?',
      other: 'Ještě ti zbývá {n} kapitol. Označit je jako přečtené a dokončit?',
    },

    editDate: 'Upravit datum začátku', note: 'Poznámka', edit: 'Upravit', del: 'Smazat',
    delQ: 'Smazat tuto poznámku?', progress: 'Postup čtení',
    impQ: 'Přepsat současný postup daty ze zálohy?', yesImp: 'Ano, přepsat',
    impDone: 'Záloha byla načtena.',
    errJson: 'Soubor není platný JSON. Nic se nezměnilo.',
    errShape: 'Tohle není záloha z My Tandem Read. Nic se nezměnilo.',
    errVersion: 'Záloha má nepodporovanou verzi. Nic se nezměnilo.',
    errData: 'Záloha obsahuje neplatná data. Nic se nezměnilo.',
    errIds: 'Záloha obsahuje neznámé kapitoly. Nic se nezměnilo.',
    errRead: 'Soubor se nepodařilo přečíst. Nic se nezměnilo.',
    loadErr: 'Nepodařilo se načíst pořadí kapitol. Zkus stránku obnovit.',
  },
  en: {
    total: 'Total', cont: 'Continue', allDone: 'Done', notes: 'Notes', settings: 'Settings',
    startLbl: 'Reading started:', notSet: 'not set yet', save: 'Save', cancel: 'Cancel',
    here: 'You are here', part: 'Part', yesAll: 'Yes, all', onlyThis: 'Just this one',
    notePH: 'What stood out in this chapter?', page: 'Page', date: 'Date', finish: 'Finished',
    yesFin: 'Yes, finished', notYet: 'Not yet', back: 'Back to overview',
    empty: 'Nothing here yet. Add a note with the pencil next to a chapter.', lang: 'Language',
    look: 'Appearance', light: 'Light', dark: 'Dark', auto: 'Auto', backup: 'Progress backup',
    exp: 'Export', imp: 'Import', reset: 'Start over',
    resetD: 'Deletes your read chapters, notes and start date.',
    resetQ: 'Really delete all progress?', yesDel: 'Yes, delete',
    replay: 'Replay intro animation', chapters: 'Chapters', days: 'Days reading',
    tissues: 'Tissues are on the house.',
    markPrev: {
      one: 'Also mark {n} earlier unread chapter as read?',
      other: 'Also mark {n} earlier unread chapters as read?',
    },
    askFin: {
      one: '{n} chapter left. Mark it as read and finish?',
      other: '{n} chapters left. Mark them as read and finish?',
    },

    editDate: 'Edit start date', note: 'Note', edit: 'Edit', del: 'Delete',
    delQ: 'Delete this note?', progress: 'Reading progress',
    impQ: 'Replace your current progress with this backup?', yesImp: 'Yes, replace',
    impDone: 'Backup imported.',
    errJson: 'This file is not valid JSON. Nothing was changed.',
    errShape: 'This is not a My Tandem Read backup. Nothing was changed.',
    errVersion: 'This backup has an unsupported version. Nothing was changed.',
    errData: 'This backup contains invalid data. Nothing was changed.',
    errIds: 'This backup contains unknown chapters. Nothing was changed.',
    errRead: 'The file could not be read. Nothing was changed.',
    loadErr: 'Could not load the chapter order. Try reloading the page.',
  },
};

export const LANGS = Object.keys(STRINGS);

const rulesCache = new Map();
function pluralRules(lang) {
  if (!rulesCache.has(lang)) rulesCache.set(lang, new Intl.PluralRules(lang));
  return rulesCache.get(lang);
}

/**
 * Looks up a UI string. For count-dependent keys pass `n`; the form is picked
 * with Intl.PluralRules (cs: one/few/other, en: one/other) and `{n}` is filled in.
 */
export function t(lang, key, n) {
  const dict = STRINGS[lang] || STRINGS.en;
  const entry = dict[key] ?? STRINGS.en[key];
  if (entry === undefined) return key;
  if (typeof entry === 'string') return entry;
  const form = entry[pluralRules(lang in STRINGS ? lang : 'en').select(n)] ?? entry.other;
  return form.replace('{n}', String(n));
}
