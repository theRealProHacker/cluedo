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
All three are free and load from the **Google Fonts CDN** (via `<link>` in `<head>`). They
are deliberately **not** self-hosted/inlined — see the 2026-06-08 decision below. Once cached
on first load the app runs offline.
- **Display/Hero** (app title, section headers, the verdict line): **Fraunces** —
  warm transitional serif with letterpress character; use the optical-size axis. Weights
  400/500/600 + italic for reasoning notes. Both models independently chose it.
- **Body / UI / card-name row labels:** **Hanken Grotesk** — warm neutral grotesque
  that disappears so the matrix can speak; handles German well. Weights 400/500/600/700.
- **Grid cells, marks, counts, constraint chips:** **JetBrains Mono** — true monospace
  locks every column to a spreadsheet rhythm; tabular figures keep envelope-probability
  counts from jittering. (Alt with more character: Commit Mono / Martian Mono, if a
  non-Google CDN is acceptable.)
- **Loading:** Google Fonts CDN, shipped as-is (no inline build step):
  `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@...&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap`.
- **Scale (suggested):** display 34–46px, section header 13px tracked uppercase,
  body 15–16px, card label 12px, grid mark 11px. Tune at build time.

## Color (Symbole pivot — 2026-06-09)
- **Approach:** Restrained, but now two accents with distinct jobs: **navy** (primary)
  and **gold** (the envelope), on warm off-white paper and warm-black ink. Suspects
  additionally carry their canonical token colour as **row identity** (see below).
- **Tokens (light):**
  - `--paper: #fbfaf6` — off-white canvas
  - `--surface: #f4f1e9` — sticky headers / symbol column / cell backing
  - `--hairline: #e6e0d3` — ledger rules
  - `--ink: #2b2926` — warm near-black; primary text + **your** marks
  - `--muted: #6f685c` — labels, secondary text, **engine** "chalk" marks
  - `--navy: #1f3a5f` — THE primary accent: Has marks, "du", verdict, primary actions, live column
  - `--navy-tint: rgba(31,58,95,.06)` — verdict strip + live-column wash
  - `--gold: #b08534` — the Envelope (Umschlag) column
  - `--gold-tint: #f3ebd9` — Envelope column wash
  - `--good: #3f6b4a` — solved row (envelope holds this card): disc ring + glyph + cell tint
- **Suspect disc colours (row identity, NOT cell state):** Scarlet `#b23a48`, Mustard
  `#c8962f`, Green `#4a7a52`, White `#efe9dc` (pale → ring), Plum `#6a4a78`, Peacock `#2f6f8c`.
- **Semantic:** Cells still avoid red/green coding — **cell state is carried by form**
  (solid square check vs diagonal strike, ink vs grey), **not hue**. The suspect colours
  label *which card a row is*; they never encode has/hasn't.
- **Dark mode:** Warm dark, not cold black. Reference tokens:
  `--paper:#201E19 --surface:#2A2722 --hairline:#3B372F --ink:#F2EDE3 --muted:#9A9284
   --navy:#5b8ac4 --navy-tint:rgba(91,138,196,.12) --gold:#caa75a --gold-tint:#332b1d --good:#7faa86`.
  A top-bar **switch** (sun/moon icon, beside the DE/EN toggle) overrides the system:
  light/dark persisted to localStorage via a `data-theme` attr on `:root`. Default is
  **follow `prefers-color-scheme`** until the first toggle (no attr = auto); forcing light
  wins over a dark system via `:root:not([data-theme="light"])` on the media query.

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
    **Räume / Rooms** (serif small-caps section labels). **Sticky left column = symbols**
    (Symbole pivot): suspects = colour discs, weapons & rooms = inked glyphs; **tap a
    symbol to reveal the full name** (names stay in `aria-label`/`title`, so the rail
    picker, verdict and screen readers are unaffected). The corner header is blank.
    **Sticky top header** = players + a gold-tinted **Umschlag / Envelope** column. The
    cell field scrolls under both. Hairline rules between rows like an accounting ledger.
  - Event log (the source of truth; free undo) lives in a **pull-up sheet** so the table
    view stays clean. Three event types: known card / suggestion+response (mark passers
    AND shower) / fully unrefuted.
  - **Verdict strip** pinned to the bottom (clay): quietly states the solution as it
    resolves, e.g. *"Es war Frau Gloria, im Wintergarten."* It is also where a
    **contradiction** surfaces persistently (*"Widerspruch — prüfe den Verlauf"*) when the
    log implies an impossible state — the engine's checks are worthless if they only flash
    in a toast and vanish.
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
- **Scoped exception (2026-06-09):** functional **category object-glyphs** for weapons &
  rooms (dagger, candlestick, wrench…) are allowed as left-margin *identity* symbols. This
  is wayfinding iconography, NOT campy sleuth/magnifier/noir clip-art — the distinction the
  guardrail protects still holds.

## Interaction Model (one single view)
The entire app is **one view** — no navigation, no separate screens. The matrix is
always present; logging a turn happens on the same surface.
- **Always-on turn rail (chosen, "Variant B"):** a compact rail pinned directly under
  the top bar builds the current turn left to right: **Wer fragt? → Verdacht (3 cards)
  → Wer zeigt?**. When **you** (seat 0) are the asker and a real player shows, a
  conditional fourth step **Gezeigte Karte / Card shown** appears — you saw the exact
  card, so the rail logs it as a hard fact rather than the weaker "holds one of three".
  It is modeless (no overlay), so the grid stays visible the whole time.
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
| 2026-06-08 | Keep Google Fonts CDN; do not inline/self-host fonts | User decision overriding the original embed-for-offline plan. CDN load is cached after first load; true-offline is an accepted trade-off, not a defect. |
| 2026-06-09 | Conditional "Gezeigte Karte" rail step when you ask and a player shows | You see the exact card, so log it as a hard fact (stronger than the shower one-of-three). The step only appears for seat-0 asks with a real shower; the rail stays three steps otherwise. |
| 2026-06-09 | Contradictions live in the verdict strip, not just a toast | A deduction instrument's core value is catching the impossible; a fading toast (and none on reload) let garbage deductions read as fact. The strip carries it persistently. |
| 2026-06-09 | **Symbole pivot**: new palette (off-white/navy/gold) + symbol left margin | Implemented from the Claude Design "Cluedo Notebook — Symbole" handoff. Suspects = colour discs, weapons/rooms = inked glyphs with tap-to-reveal names. Supersedes the clay-on-ivory palette; cells still encode state by form, not hue. |
| 2026-06-09 | Kept Fraunces + Hanken Grotesk + JetBrains Mono after a `/design-shotgun` font run | Explored Futura/Jost (official-Cluedo branding) and Newsreader (the mock's serif) against the original three-font system; the original read best on the symbol ledger. |
| 2026-06-09 | Weapon glyphs from game-icons.net (CC BY 3.0) | Hand-drawn weapon SVGs were weak; swapped 5 for real vectors (Lorc & Delapouite: sacrificial-dagger, monkey-wrench, revolver, rope-coil, lead-pipe) + a photo-matched candlestick. Attribution comment in index.html. |
| 2026-06-09 | Suspect colour = row identity, not cell state | Keeps "state by form, not hue" intact for cells; the disc only says which card the row is. |
| 2026-06-09 | Manual dark-mode switch (sun/moon) in the top bar | Dark mode was system-only; added an explicit light/dark toggle that overrides `prefers-color-scheme`, persisted to localStorage. Defaults to following the system until first toggle. |
| 2026-06-09 | Turn rail adopts the Symbole language (pick by disc/glyph, not text) | The "Aktueller Zug" picker dumped 6–9 wide text-name chips (3 rows, ~264px) — crowded and inconsistent with the symbol grid. Suggestion/seen chips are now compact 44px disc/glyph chips (suspects 1 row, rooms 2), and the chosen suggestion shows as mini symbols in the step (no truncation). Names stay in aria-label/title. |
