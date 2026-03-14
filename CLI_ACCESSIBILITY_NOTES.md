# CLI Accessibility Notes

This file tracks which accessibility and navigation checks are currently easy to
run from the terminal in this repo, and which ones still need better CLI
coverage.

Currently CLI-checkable

- Static accessibility guardrail:
  `python scripts/check_static_accessibility.py`
- Browser-backed accessibility smoke test:
  `npm run check:browser-a11y`
- Combined CLI accessibility check:
  `npm run check:cli-a11y`
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

Covered by the current browser-backed check

- The first library card is reachable by keyboard and opens with `Enter`.
- AI buttons expose accessible names in the browser accessibility tree.
- Concept-page canvases expose accessible names derived from their section
  headings.
- Slider interaction updates accessible value text and announces simulation
  status changes.
- Button-driven simulation controls announce when they are activated.
- Sample pages stay free of browser console errors and page errors.
- Core text colors stay above WCAG AA contrast in light and dark themes.
- Key UI labels and buttons also stay above WCAG AA contrast on sampled pages.

Not yet CLI-covered, but should be

- Continuous or time-based simulation updates after an interaction.
- More than one representative button interaction pattern.
- Broader contrast coverage across all concept-specific inline styles.

Good next step

- Extend the browser automation to cover one long-running simulation where the
  canvas state changes after a control update, not just the announced status.
