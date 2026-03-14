# CLI Accessibility Notes

This file tracks which accessibility and navigation checks are currently easy to
run from the terminal in this repo, and which ones still need better CLI
coverage.

Currently CLI-checkable

- Static accessibility guardrail:
  `python scripts/check_static_accessibility.py`
- Local HTTP smoke checks:
  1. `python -m http.server 8765`
  2. `Invoke-WebRequest http://127.0.0.1:8765/ -UseBasicParsing`
  3. Repeat for edited concept pages
- Repo-wide pattern searches:
  - `rg -n 'target=\"_blank\"' -g '*.html'`
  - `rg -n 'class=\"ai-btn\"' Concepts -g '*.html'`
  - `rg -n 'document.createElement\\(' index.html`

Covered by the current static check

- Homepage cards stay semantic anchors instead of mouse-only click targets.
- AI buttons keep an accessible name source in markup.
- External `_blank` anchors retain `rel="noopener noreferrer"`.

Not yet CLI-covered, but should be

- Keyboard tab-order verification in a real browser.
- Screen-reader checks for interactive simulation output and canvas regions.
- Color-contrast auditing across light and dark themes.
- Browser-console regression checks for the concept pages after edits.

Good next step

- Add a small browser-automation smoke test that tabs through the library cards,
  opens one concept page, and asserts that AI buttons expose accessible names.
