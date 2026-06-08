# Cluedo Deduction Cheat Sheet

A multi-language Cluedo deduction cheat sheet, smarter than the paper grid. Single
self-contained HTML file + localStorage, touch-first, runs offline on a phone at the
table. The grid is derived from an editable event log (source of truth; free undo).

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, cell-encoding rules, and aesthetic direction are
defined there. Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

The short version: warm-paper deduction ledger (claude.ai-spirit), NOT campy detective
theming. Fraunces (display) + Hanken Grotesk (UI) + JetBrains Mono (grid). One clay
accent (#C45B3C) on warm ivory (#F4EFE6) and ink (#23211C). Cell state is carried by
form, not hue; provenance is solid = you entered it, hollow/grey = the engine deduced it.
