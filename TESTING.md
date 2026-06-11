# Testing

End-to-end tests for the single-file app, driven by [Playwright](https://playwright.dev).
A tiny `python3 -m http.server` serves `index.html`; each test gets a fresh browser
context, so `localStorage` starts empty unless the test seeds it.

## Run

```bash
npm install            # first time only (Playwright browser is already cached on most machines;
npx playwright install # run this if it complains the browser is missing)
npm test               # headless
npm run test:headed    # watch it drive the UI
npm run test:ui        # Playwright's interactive runner
```

## What's covered (`tests/cluedo.spec.js`)

Two layers, both against the behavioral spec in `DESIGN.md`:

- **UI-driven** — the setup phase (hidden "Current turn", enlarged hint, grid hand-entry,
  the two-invariant Submit gate, even vs uneven deal, re-entering setup via undo), the turn
  rail (asker preselect + the lighter asker column cue), and the language toggle.
- **Engine-driven** — seeds the event log (the documented source of truth) via `localStorage`,
  reloads, and asserts the *derived* grid. This is how the hard deduction edge-cases are tested:
  envelope-by-elimination, shower one-of-three collapse, wrap-around passers, fully-unrefuted
  suggestions, hand-size counting, and contradiction detection. Plus the deal invariant (hands
  always sum to 18 for N=2..6) and persistence/corrupt-store recovery.

Cell state is read from the language-independent mark classes: `.mark-has` / `.mark-hasnt`,
with the `.eng` modifier meaning the engine deduced it (vs. you entering it).

## Convention

When you change deduction rules or the setup gate, add or update an engine-driven test that
seeds the precise event log and asserts the derived cell. A bug worth fixing is worth a
seed-and-assert test that would have caught it.
