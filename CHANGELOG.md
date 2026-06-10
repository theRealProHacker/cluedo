# Changelog

All notable changes to this project are documented here. Dates are `YYYY-MM-DD`.
This is a single self-contained `index.html`; "the app" means that file.

## 2026-06-11

### Added
- **Setup phase.** A game now opens in setup until you explicitly Submit
  ("Loslegen" / "Start"), recorded as a `setupDone` event so re-entering setup is
  just an undo. The rail hosts your hand picker + the deal editor during setup; the
  turn rail replaces it once you Submit. Opponent and envelope cells are locked and
  dimmed until then.
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
- **Deal default seeds the extras to the first `rem` seats in turn order** (the
  starter and the next), modelling a clockwise deal from the dealer's left where the
  first-dealt seats hold the leftover cards — so the starter now holds the *larger*
  hand. Fully overridable in the deal editor; the seed only affects untouched games.

### Fixed
- The `[hidden]` attribute was overridden by `display:flex`/`display:grid` rules
  (`.steps`, `.picker`, `.setupbar`, `.setup` rows), so the turn rail and setup bar
  could render at once. Added `[hidden]{display:none!important}`.
