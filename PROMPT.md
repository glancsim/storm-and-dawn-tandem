Build the app described in `SPEC.md` in this repository. Read `SPEC.md` and `CLAUDE.md` fully before you start. The spec is written in Czech; the app itself must follow the UI strings in it exactly.

How to work:
1. Make a short plan, then build in stages: (a) data + pure logic modules + unit tests, (b) shared SVG scene and styles/theme, (c) intro canvas animation, (d) overview screen with marking logic and progress bar, (e) notes, (f) settings with export/import/start over, (g) finale, (h) GitHub Actions workflow and README.
2. If `assets/mockup.html` exists, reuse its SVG scene paths and colors. If not, draw the scene yourself from the description; do not stop to ask.
3. Do not ask questions unless you are truly blocked. Where the spec is silent, choose the simplest reasonable behavior and list your choices in the README under "Decisions".
4. Run `node --test` after each stage that adds logic. Before finishing, serve the site locally and check it in a browser at 360 px and 1024 px width: intro animation, marking chapters, the "also mark earlier" prompt, Continue, notes, language switch, theme switch, export/import, start over, finale, reload persistence, and browser Back. Use Playwright if it is available; otherwise check as well as you can and say what you could not check.
5. Finish by walking through the 9 acceptance criteria in `SPEC.md` one by one and report which pass, which you could not verify, and any deviations.
6. Commit in small, meaningful commits on `main`. Do not push or change repository settings.
