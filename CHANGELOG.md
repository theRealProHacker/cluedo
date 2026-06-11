# Changelog

All notable changes to this project are documented here. Dates are `YYYY-MM-DD`.
This is a single self-contained `index.html`; "the app" means that file.

## 2026-06-11

### Added
- **Setup phase.** A game now opens in setup until you explicitly Submit
  ("Loslegen" / "Start"), recorded as a `setupDone` event so re-entering setup is
  just an undo. During setup the rail shows a prominent instruction + the deal editor,
  the turn rail replaces it once you Submit, and opponent + envelope cells are locked
  and dimmed until then.
- **Two-invariant Submit gate.** Submit enables only when the deal sums to 18
  (`|handExtras| === rem`) **and** your hand is fully entered (manual `has` facts
  equal your dealt count). Counts manual facts, not the engine's derived total, so
  auto-completion can't perturb the gate.
- **`handExtras` deal editor.** Tap which `rem` seats hold the extra card; the editor
  keeps at most `rem` selected. Lives in the rail during setup and the pull-up sheet
  after the board locks. Decoupled from `starter`; persisted to localStorage.
- **Asker preselect.** The turn rail preselects the next asker (the seat after the
  last suggestion's asker, or the starter on turn 1), only when no asker is chosen.

### Changed
- **Enter your hand in the grid, not a picker.** The separate my-cards picker is gone;
  during setup you tap your own column (seat 0) in the grid to mark your hand. One input
  surface. The "Current turn" rail label is hidden during setup and the setup
  instruction is enlarged.
- **Setup constraints relaxed during entry.** The hand-size rule is skipped while in
  setup, so you can over-enter your column (total > 18) without a contradiction; the
  Submit gate still validates exact counts on Start.
- **Current asker column cue.** The asker's column gets a lighter highlight (header
  underline + faint tint), distinct from the shower's filled-navy header, so "whose
  turn" and "who showed" don't compete.

### Fixed
- The `[hidden]` attribute was overridden by `display:flex`/`display:grid` rules
  (`.steps`, `.picker`, `.setupbar`, `.setup` rows), so the turn rail and setup bar
  could render at once. Added `[hidden]{display:none!important}`.
- A stored `handExtras` with an out-of-range seat was filtered down to fewer than `rem`
  entries, so a resumed game could run a deal summing to 17, not 18. `load()` now reseeds
  the default deal when the stored extras aren't exactly `rem` distinct seats. (Caught by
  the new Playwright suite.)

### Tests
- Added a Playwright suite (`tests/cluedo.spec.js`, `npm test`) covering the setup phase,
  the turn rail, persistence/i18n, and the hard deduction edge cases (envelope-by-
  elimination, shower one-of-three collapse, wrap-around passers, fully-unrefuted
  suggestions, hand-size counting, contradiction detection, and the sum-to-18 deal
  invariant for N=2..6). See TESTING.md.
