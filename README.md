# Indizien — Cluedo Deduction Cheat Sheet

A multi-language (Deutsch / English) Cluedo deduction helper that's smarter than the
paper grid. It tracks per-card-per-holder state (has / hasn't / unknown) and runs a
small deduction engine: log a suggestion and the response, and it works out the
consequences for you — who can't hold which cards, which card a player must have shown,
and what's left in the envelope.

**Live:** https://therealprohacker.github.io/cluedo/

## How it works

- **The event log is the source of truth.** Every fact and every suggestion is an entry
  in the log; the grid is derived from it. Undo is free — drop an entry and it re-derives.
- **Provenance is visible.** Solid marks are facts you entered; hollow/grey marks are
  what the engine deduced. No legend needed.
- **Deduction rules:** each card has exactly one holder (a player or the envelope); the
  shower of a suggestion holds one of the three named cards (and that collapses as cards
  are ruled out); players passed between asker and shower hold none of the three; the
  envelope holds exactly one suspect, one weapon, one room; and each player holds exactly
  their dealt hand size, so once a hand is full the rest are ruled out (and once only
  enough cards are left to fill it, they're all ruled in) — the card-counting the paper
  grid can't do.
- **You saw the card.** When *you* (seat 0) ask and a real player shows, you pick which
  of the three cards you were shown; that's logged as a hard fact, stronger than the
  "holds one of three" you get from watching other players' turns.
- **Contradictions surface.** If the log implies an impossible state (a card in two hands,
  a hand that can't be filled), the verdict strip says so until you fix it.

## Running it

It's a single self-contained HTML file with zero build step. Open `index.html` in any
modern browser, or use the live link above. State persists in `localStorage`, so it
survives a reload. Works offline once loaded (fonts come from Google Fonts on first load).

Set the player count (2–6) in the log sheet; seat 0 is you.

## Design

See [DESIGN.md](DESIGN.md) for the full design system — a warm-paper deduction ledger,
deliberately not campy detective theming.
