# Storm & Dawn Tandem

A small static web app for reading *Empire of Storms* and *Tower of Dawn* in tandem, following a fixed alternating chapter order. It tracks progress and notes in your browser only (no accounts, no tracking).

An unofficial fan project; it contains no text from the books. Chapter order based on the infographic by @parismaereads. Empire of Storms and Tower of Dawn © Sarah J. Maas.

## Status
Specification stage. The app itself is built from `SPEC.md`.

## Files
- `SPEC.md` – full requirements (Czech)
- `CLAUDE.md` – project rules for Claude Code
- `PROMPT.md` – the kickoff prompt to give Claude Code
- `assets/` – put `mockup.html` here (optional, used for the SVG scene)

## Build it with Claude Code
1. Put the interactive mockup into `assets/mockup.html` if you have it.
2. In this folder run `claude`, then paste the contents of `PROMPT.md`.
3. When it is done: create an empty repository on GitHub, push, then in **Settings → Pages** set **Source: GitHub Actions**.

## Postup česky
1. Mockup (pokud ho máš) ulož jako `assets/mockup.html`.
2. V této složce spusť `claude` a vlož obsah `PROMPT.md`.
3. Až bude hotovo: na GitHubu vytvoř prázdné repo, pushni, v **Settings → Pages** nastav **Source: GitHub Actions**.
