# Design System — Cluedo Deduction Cheat Sheet (working title: *Indizien*)

> The metaphor: a warm-paper deduction ledger that happens to think. claude.ai's
> warmth, a drafting table's discipline. The deduction engine is the only ornament.
> Created by /design-consultation, 2026-06-08. Cross-model validated (Claude main +
> independent Claude subagent; Codex was unavailable). Anchored to the claude.ai
> paper aesthetic at the user's request.

## Product Context
- **What this is:** A multi-language Cluedo (Clue) deduction cheat sheet, smarter than
  the paper grid. Tracks per-card-per-holder state (has / hasn't / unknown) plus the
  "player showed *a* card → has one of {a,b,c}" constraint that auto-collapses as cards
  are ruled out. The envelope is modeled as just another card-holder.
- **Who it's for:** Players at the table, mid-game, glancing between turns. Hobby project.
- **Space/industry:** Board-game companion / deduction tool.
- **Project type:** Single self-contained HTML file + localStorage. Touch-first, runs
  offline on a phone at the table. Grid is derived from an editable event log (free undo).
- **The one memorable thing (priority order):** (1) fast at the table, (2) clearer than
  paper, (3) "it just knows" — the quiet intelligence of auto-deduction. Every design
  decision serves these, in this order.

## Aesthetic Direction
- **Direction:** Warm-paper deduction ledger. Editorial-refined minimalism.
- **Decoration level:** Intentional (not expressive). Hairline ledger rules, warm
  paper canvas, and the engine's own reasoning as the only decoration. No campy
  detective theming — no magnifying glasses, noir, boardgame-box gloss, or cartoon
  sleuths. This rejection of the category norm is deliberate; it is where the product
  gets its face.
- **Mood:** Calm, exact, trustworthy, premium. Sitting down at a clean architect's
  drafting table, not at a game-night gimmick.
- **Reference:** claude.ai / claude.com visual language (warm ivory, transitional
  serif headings, clay accent, hairlines, generous space).

## Typography
All three are free and must be **embedded/self-hosted in the single HTML file** for true
offline use (the preview loads them from Google Fonts via `@import`; ship them inlined).
- **Display/Hero** (app title, section headers, the verdict line): **Fraunces** —
  warm transitional serif with letterpress character; use the optical-size axis. Weights
  400/500/600 + italic for reasoning notes. Both models independently chose it.
- **Body / UI / card-name row labels:** **Hanken Grotesk** — warm neutral grotesque
  that disappears so the matrix can speak; handles German well. Weights 400/500/600/700.
- **Grid cells, marks, counts, constraint chips:** **JetBrains Mono** — true monospace
  locks every column to a spreadsheet rhythm; tabular figures keep envelope-probability
  counts from jittering. (Alt with more character: Commit Mono / Martian Mono, if a
  non-Google CDN is acceptable.)
- **Loading:** `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@...&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap`
  for dev; **self-host/inline** for the offline production build.
- **Scale (suggested):** display 34–46px, section header 13px tracked uppercase,
  body 15–16px, card label 12px, grid mark 11px. Tune at build time.

## Color
- **Approach:** Restrained. One accent (clay); everything else is warm paper and ink.
- **Tokens (light):**
  - `--paper: #F4EFE6` — warm ivory canvas
  - `--surface: #FBF8F1` — raised sheet / cells
  - `--hairline: #DDD4C4` — ledger rules
  - `--ink: #23211C` — warm near-black; primary text + **your** marks
  - `--muted: #8A8275` — labels, secondary text, **engine** "chalk" marks
  - `--clay: #C45B3C` — THE accent: Has marks, Envelope column, verdict, primary actions
  - `--clay-tint: #F0E3DC` — Envelope column wash, chip backgrounds
- **Semantic:** Avoid red/green coding. State is carried by **form and pressure**, not
  hue. Clay is the only saturated color; everything else earns attention by weight.
- **Dark mode:** Warm dark, not cold black. Invert to a warm near-black paper, lift the
  ink to ivory, slightly lighten/desaturate the clay. Reference tokens:
  `--paper:#201E19 --surface:#2A2722 --hairline:#3B372F --ink:#F2EDE3 --muted:#9A9284 --clay:#D6764F --clay-tint:#3A2A22`.

## Cell Encoding (the heart of the product)
Optimize for the common case (most cells become "hasn't") and make the rare, valuable
"has" loud. Always show provenance: *solid = I told it, hollow/grey = it told me.*
- **Unknown:** empty. Absence is the information. No dots, no question marks.
- **Hasn't — manual:** faint diagonal hairline strike, `--ink` at ~32% opacity. Quiet.
- **Hasn't — engine:** diagonal strike in `--muted` at ~60%. Recedes further.
- **Has — manual:** solid `--clay` square (4px radius) with an ivory check punched out.
  Rare and loud; the eye jumps to it.
- **Has — engine:** hollow `--clay` outline square with a clay check. Lighter hand.
- **No legend needed at the table.** Solid vs hollow / ink vs grey is self-evident.

## Spacing
- **Base unit:** 4px.
- **Density:** Compact matrix (tight cells), calmer/comfortable chrome around it.
  Cell visual size ~34–38px but **≥44px touch hit-area** via padding.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approach:** Hybrid. The deduction matrix is strict and dense (the hero); the
  surrounding chrome is calm and editorial.
- **Structure (mobile-first, single column):**
  - Slim top bar: app title (Fraunces) + DE/EN language toggle + new game / menu.
  - Matrix: cards as rows grouped under **Verdächtige / Suspects**, **Waffen / Weapons**,
    **Räume / Rooms** (serif small-caps section labels). **Sticky left column** (card
    names, Hanken Grotesk) and **sticky top header** (players + a clay-tinted
    **Umschlag / Envelope** column). The cell field scrolls under both. Hairline rules
    between rows like an accounting ledger.
  - Event log (the source of truth; free undo) lives in a **pull-up sheet** so the table
    view stays clean. Three event types: known card / suggestion+response (mark passers
    AND shower) / fully unrefuted.
  - **Verdict strip** pinned to the bottom (clay): quietly states the solution as it
    resolves, e.g. *"Es war Frau Gloria, im Wintergarten."*
- **Border radius:** restrained, hierarchical — cells/marks 4px, buttons/cards 8–10px,
  language toggle 7px, chips 999px. No bubble-radius-everything.
- **Localized card names** so the grid matches the physical cards; names in a swappable
  table for adding languages later. German + English at launch.

## Motion
- **Approach:** Minimal-functional, plus ONE signature.
- **The cascade (signature):** when you set a fact, the engine's resulting deductions
  propagate **visibly, cell by cell** along the row and column, on a ~70ms stagger, like
  ink wicking across paper. When a category collapses to exactly one, that cell draws its
  clay square in a single pen-stroke and the verdict strip updates. This is "it just
  knows" made tangible (serves memorable #3 without slowing the core loop).
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out).
- **Duration:** micro 50–100ms, cascade-stagger ~70ms/cell, short 150–250ms.
- Everything else (entering a fact, undo) is instant — speed is priority #1.

## Optional layers (deferred; available if more edge is wanted later)
- **Zero chrome:** matrix bleeds to device edges like one sheet clamped to the table;
  only the verdict strip persists; controls move to gestures + the pull-up sheet. More
  document-like, less discoverable. Not adopted for v1 (discoverability vs speed).
- **Reasoning margin notes:** Fraunces-italic gutter lines narrating each deduction
  (*"Grün zeigte eine von {Dolch, Seil}, Seil ausgeschlossen, also Dolch"*). Beautiful,
  but competes with density. Consider as a collapsible/expandable detail, off by default.

## Anti-slop guardrails (do not introduce)
No purple/violet gradients; no 3-column icon-in-circle grids; no centered-everything; no
gradient CTA buttons; no uniform bubble radius; no system-ui/-apple-system as display or
body font; no detective clip-art or magnifying glasses; no red/green cell coding.

## Interaction Model (one single view)
The entire app is **one view** — no navigation, no separate screens. The matrix is
always present; logging a turn happens on the same surface.
- **Always-on turn rail (chosen, "Variant B"):** a compact rail pinned directly under
  the top bar builds the current turn left to right: **Wer fragt? → Verdacht (3 cards)
  → Wer zeigt?**. It is modeless (no overlay), so the grid stays visible the whole time.
  As you pick who showed, that player's **column highlights live** in the grid below —
  input and consequence in the same glance. An `OK` button commits; the rail resets.
- **Pull-up composer ("Variant A") is the retained alternative.** If the always-on rail
  ever costs too much vertical space, fall back to a bottom-sheet composer that expands
  on demand and collapses after commit, freeing full-height grid while scanning. Keep
  this pattern in reserve for low-frequency entry (e.g. editing a past event).
- **Numbered seats, not names (minimal setup):** players are **0, 1, 2, 3, …** going
  clockwise; **seat 0 is you** (subtly marked "du" in clay). Setup collapses to a single
  question — how many players — so a game starts in seconds. Card names stay localized
  (DE/EN) because they must match the physical cards; only player identity is numeric.
- **Direct cell tap** remains available for marking a known card (cycle unknown → has →
  hasn't) without opening the rail.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-08 | Warm-paper ledger aesthetic; reject campy detective theming | EUREKA: this is a deduction *instrument* glanced at under time pressure; the campy category norm fights legibility. claude.ai's warm-paper calm is the correct functional language, not just a taste. |
| 2026-06-08 | Fraunces + Hanken Grotesk + JetBrains Mono | Cross-model agreement (Claude main + subagent); warm serif/clean sans/mono-grid pairing matches the claude.ai anchor and gives the grid spreadsheet rhythm. |
| 2026-06-08 | One clay accent (#C45B3C); state via form, not hue | Restraint keeps the paper calm; clay alone carries Has-marks, Envelope, verdict, actions. |
| 2026-06-08 | Asymmetric cell weight (quiet hasn't / loud has) | Optimize for the common case; the eye finds what's known. Serves "fast at the table". |
| 2026-06-08 | Provenance by hand-weight (solid=you, hollow/grey=engine) | Makes "it just knows" visible and builds trust; no legend needed. Subagent's refinement. |
| 2026-06-08 | The cascade as the one signature motion | Turns the deduction engine into the product's only decoration. |
| 2026-06-08 | One single view; always-on turn rail (Variant B) | User: "there really should only be one single view." Modeless rail keeps the grid visible while logging; fastest for the per-turn loop. Pull-up composer (Variant A) retained as fallback. |
| 2026-06-08 | Numbered seats, 0 = you | User: "replace real names with numbers for minimal setup." Setup collapses to player count; seat 0 is you. Card names stay localized to match physical cards. |
