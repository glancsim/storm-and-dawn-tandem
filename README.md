# Storm & Dawn Tandem (My Tandem Read)

A small static web app for reading *Empire of Storms* and *Tower of Dawn* in tandem, following a fixed alternating chapter order. It tracks progress and notes in your browser only (no accounts, no cookies, no tracking).

An unofficial fan project; it contains no text from the books. Chapter order based on the infographic by @parismaereads. Empire of Storms and Tower of Dawn © Sarah J. Maas.

## What it does

- Intro animation on every load (click, tap or press any key).
- Overview with percentages, a segmented progress bar with a "You are here" pin, and four collapsible parts with all 145 chapters in reading order.
- Marking chapters as read, with an "also mark earlier?" prompt, a Continue button and a start date.
- Notes per chapter (text, page, date) and a Notes page.
- Settings: Czech / English, light / dark / auto, backup export and import, replay intro, start over.
- A finale screen once you finish.

## Run locally

No build step and no dependencies. ES modules need HTTP, so serve the folder instead of opening `index.html` from disk:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Tests

```bash
node --test
```

Uses Node's built-in test runner (Node 20 or newer). The tests cover chapter expansion and counts, plural forms, date formatting, progress maths, marking rules, backup validation and the storage fallback.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages** set **Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/pages.yml`: it runs `node --test` first and deploys only if the tests pass.

The workflow publishes only the site files (`index.html`, `styles.css`, `favicon.svg`, `manifest.webmanifest`, `icons/`, `chapters.json`, `js/`). All URLs are relative, so the app works under `https://<user>.github.io/<repo>/`.

## Visit counting

The app counts visits anonymously with [GoatCounter](https://www.goatcounter.com): no cookies, no third-party script, no consent banner needed. Each app load sends one image request to `https://<code>.goatcounter.com/count` with the page path, title, screen size and the referring site. Reading progress and notes are never sent.

To turn it on, set `GOATCOUNTER_CODE` in `js/analytics.js` to your GoatCounter site code (the part before `.goatcounter.com`). With an empty code, on `localhost` and when opened as a file, nothing is sent. The numbers are on your GoatCounter dashboard.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page shell; defines the SVG scene once |
| `styles.css` | All styles and the light / dark theme variables |
| `chapters.json` | Reading order in compact block notation |
| `js/chapters.js`, `i18n.js`, `dates.js`, `state.js`, `storage.js`, `analytics.js` | Pure logic, no DOM, unit tested |
| `js/app.js` | Boot, routing, rendering, event delegation |
| `js/intro.js` | Intro canvas animation |
| `js/views/` | Overview, note editor, Notes, Settings, finale |
| `tests/` | `node --test` suites |
| `SPEC.md`, `CLAUDE.md`, `PROMPT.md`, `assets/mockup.html` | Requirements, project rules, kickoff prompt, visual reference |

## Decisions

Choices made where `SPEC.md` is silent:

- **Site root** is the repository root. The deploy workflow copies only the site files, so the spec, mockup and tests are not published.
- **Extra UI strings.** The spec dictionary has no texts for aria-labels, the note delete confirmation, the import confirmation and import errors. These were added in both languages in `js/i18n.js` (second block of each language).
- **Import keeps language and appearance.** A backup replaces read chapters, notes and both dates. Language and theme stay as they are on the current device (the file is still validated in full, including those two fields).
- **Import validation is strict:** `version` must be `1`, `read` values must be `true`, every chapter id must exist, each note needs a non-empty text, a digits-only page and a valid date. Anything else is rejected with a reason and nothing is changed.
- **Start over** returns to the overview with Part 1 open (as in the mockup).
- **Start date editor** has Save and Cancel; saving an empty date clears it. A start date set by hand is never overwritten by marking a chapter.
- **Finished / Done with nothing left to read** stores today as the finish date without asking. "Yes, finished" also sets the start date to today if it was empty.
- **Days reading** shows "–" if the start date is missing or later than the finish date.
- **Chapter tile on the finale** shows the total number of chapters (145), as in the mockup.
- **"You are here" on the progress bar:** the arrow points at the middle of the first unread chapter, with no 9-91 % limit (changed on request). The badge above it slides toward the bar's edge so it always fits, so near the start and the end the arrow is not under the badge's centre.
- **Intro text** is upright Georgia like the banner title, not italic (changed on request).
- **Clicking a progress bar segment** opens that part and scrolls to it (it does not toggle it closed). The segments are mouse and touch shortcuts only; the same action is available to keyboard and screen reader users through the part headers, so the 53 segments are not tab stops.
- **Opening a note editor** closes a pending "also mark earlier?" prompt. Typed note text survives re-renders while the editor is open. Escape closes open prompts and editors.
- **Notes with an empty page** leave the page out of the meta line ("Part 2 · 27 Oct 2026").
- **Intro:** particles are sampled every 2 CSS px and capped at 6000 (3500 on narrow screens or devices with 4 or fewer cores) by widening the sampling step. Tab and modifier keys alone do not start it, so keyboard users are not surprised.
- **Scene on very wide screens:** the scene is anchored to the left and the dark shore line continues to the right edge.
- **Intro scene on phones held upright** (up to 600 px wide) is at least a quarter of the screen high instead of following the width. The wave stays pinned left and the tower pinned right, and a strip of empty sea between them is skipped, so both stay whole.
- **Banner and finale height** follow the scene's aspect ratio instead of the fixed pixel heights of the mockup, so nothing is cropped at 360 px.
- **UI colours outside the scene** (neutral surfaces, blue accent, tints) approximate the mockup, which used its host's design tokens; they are plain CSS variables in `styles.css`.
- **Two tabs:** a change made in another tab of the app is picked up through the `storage` event.
- **Icons** are own inline SVG drawings in `js/icons.js`; `favicon.svg` is an own drawing too. iOS does not use SVG icons, so `icons/` holds PNG copies of it (rendered once from `favicon.svg`, square corners because iOS rounds them itself) for the home screen and the web manifest.

## Česky

Statická aplikace pro tandemové čtení *Empire of Storms* a *Tower of Dawn*. Postup a poznámky se ukládají jen ve tvém prohlížeči.

- **Spuštění:** `python3 -m http.server 8000` a otevři http://localhost:8000 (žádný build, žádné závislosti).
- **Testy:** `node --test`.
- **Nasazení:** pushni na GitHub a v **Settings → Pages** nastav **Source: GitHub Actions**. Workflow nejdřív spustí testy a nasadí jen při úspěchu.
- **Počítání návštěv:** anonymně přes GoatCounter. Zapne se vyplněním `GOATCOUNTER_CODE` v `js/analytics.js`, na `localhost` se nic neposílá.
- Rozhodnutí tam, kde zadání mlčí, jsou v sekci "Decisions" výše.
