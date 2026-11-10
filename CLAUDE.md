# Storm & Dawn Tandem

Static GitHub Pages app for a tandem read of Empire of Storms and Tower of Dawn. Full requirements: `SPEC.md` (in Czech; UI strings stay as specified there).

## Rules
- Vanilla HTML/CSS/JS, ES modules, **no build step**, no runtime dependencies. Relative URLs only.
- Only outside request allowed: the anonymous GoatCounter visit count in `js/analytics.js` (no third-party script, no cookies, off on localhost and while `GOATCOUNTER_CODE` is empty).
- Pure logic (chapter expansion, plurals, stats, import/export validation, date formatting) lives in modules that do not touch the DOM, so `node --test` can cover them.
- No book text, no official covers. All graphics are own SVG; no emoji as icons.
- User data only in `localStorage` key `myTandemRead:v1`, with an in-memory fallback.
- Accessibility: aria-labels on icon buttons, keyboard operable, visible focus, `prefers-reduced-motion` respected.
- If `assets/mockup.html` exists, take the SVG scene paths and colors from it.

## Commands
- Test: `node --test`
- Serve locally: `python3 -m http.server 8000` (then open http://localhost:8000)
