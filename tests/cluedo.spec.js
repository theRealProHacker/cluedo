// End-to-end tests for the Indizien Cluedo deduction sheet (single-file index.html).
//
// Two layers, both exercising the SPEC in DESIGN.md:
//   1. UI-driven  — setup phase, grid hand-entry, the Submit gate, language.
//   2. Engine-driven — seed the event log (the documented source of truth) via
//      localStorage, reload, and assert the *derived* grid. This is the robust way
//      to hit the hard deduction edge-cases that are impractical to click through.
//
// Cell marks (language-independent, from markFor()):
//   .mark-has         = you entered "has"        .mark-has.eng   = engine deduced "has"
//   .mark-hasnt       = you entered "hasn't"     .mark-hasnt.eng = engine deduced "hasn't"

const { test, expect } = require('@playwright/test');

const KEY = 'indizien.v1';
const ENV = 'env';

// ---- helpers ---------------------------------------------------------------

// Seed localStorage (optional) before any page script runs, then load the app.
async function boot(page, state) {
  if (state) {
    await page.addInitScript((s) => localStorage.setItem('indizien.v1', JSON.stringify(s)), state);
  }
  await page.goto('/index.html');
  await page.waitForSelector('#grid-body tr.sec'); // grid sections rendered
}

const cell = (page, card, col) =>
  page.locator(`button.cell[data-card="${card}"][data-col="${col}"]`);

const seatHeader = (page, col) => page.locator(`th.seat[data-col="${col}"]`);

const fact = (card, holder, value) => ({ type: 'fact', card, holder, value });
const suggestion = (asker, cards, shower) => ({ type: 'suggestion', asker, cards, shower });
const DONE = { type: 'setupDone' };

// A minimal stored game: not in setup, no extras needed unless given.
const game = (overrides = {}) => ({
  players: 4, lang: 'de', starter: 0, theme: null, handExtras: [], events: [DONE],
  ...overrides,
});

// ===========================================================================
// SETUP PHASE (UI-driven)
// ===========================================================================
test.describe('setup phase', () => {
  test('opens in setup: no "Current turn", prominent hint, locked opponents, Submit disabled', async ({ page }) => {
    await boot(page); // fresh, default N=4

    await expect(page.locator('#setupbar')).toBeVisible();
    await expect(page.locator('.steps')).toBeHidden();
    await expect(page.locator('.railhead')).toBeHidden(); // "Aktueller Zug" hidden in setup

    const hint = page.locator('#setup-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toHaveCSS('font-size', '16px'); // enlarged instruction

    await expect(page.locator('#submit')).toBeDisabled();

    // your column is editable; opponents + envelope are locked
    await expect(cell(page, 's1', '0')).toBeEnabled();
    await expect(cell(page, 's1', '1')).toBeDisabled();
    await expect(cell(page, 's1', ENV)).toBeDisabled();

    // no separate my-cards picker exists anymore (item 2)
    await expect(page.locator('#rail-mycards')).toHaveCount(0);
  });

  test('enter hand by tapping your own column; Submit enables at exactly the dealt count', async ({ page }) => {
    await boot(page); // N=4, default extras {2,3} -> seat 0 holds 4
    for (const c of ['s1', 's2', 's3', 'w1']) await cell(page, c, '0').click();

    await expect(page.locator('#setup-hint .count')).toHaveText('4/4');
    await expect(page.locator('#submit')).toBeEnabled();
  });

  test('relaxed: over-entering your column is allowed (no contradiction), Submit just stays off', async ({ page }) => {
    await boot(page);
    for (const c of ['s1', 's2', 's3', 'w1', 'w2']) await cell(page, c, '0').click(); // 5 in a 4-card hand

    await expect(page.locator('#setup-hint .count')).toHaveText('5/4');
    await expect(page.locator('#submit')).toBeDisabled();
    // engine does NOT flag a contradiction during setup (item 3)
    await expect(page.locator('#verdict-text')).not.toContainText('Widerspruch');
    await expect(page.locator('.toast.bad.show')).toHaveCount(0);
  });

  test('Submit transitions to the turn rail with the starter preselected as asker', async ({ page }) => {
    await boot(page);
    for (const c of ['s1', 's2', 's3', 'w1']) await cell(page, c, '0').click();
    await page.locator('#submit').click();

    await expect(page.locator('#setupbar')).toBeHidden();
    await expect(page.locator('.steps')).toBeVisible();
    await expect(page.locator('.railhead')).toBeVisible();
    await expect(page.locator('.step[data-step="asker"] .v')).toHaveText('0'); // starter
  });

  test('even deal (N=6) hides the extras editor; uneven (N=5) shows it and gates on exactly rem', async ({ page }) => {
    // N=6: rem 0, no extras editor, hand of 3 enables Submit
    await boot(page, { players: 6, handExtras: [], events: [fact('s1', 0, 'has'), fact('s2', 0, 'has'), fact('s3', 0, 'has')] });
    await expect(page.locator('#rail-extras')).toBeHidden();
    await expect(page.locator('#submit')).toBeEnabled();

    // N=5: rem 3, extras editor shown; dropping one extra breaks the deal invariant
    await boot(page, { players: 5, starter: 0, handExtras: [2, 3, 4], events: [fact('s1', 0, 'has'), fact('s2', 0, 'has'), fact('s3', 0, 'has')] });
    await expect(page.locator('#rail-extras')).toBeVisible();
    await expect(page.locator('#submit')).toBeEnabled(); // hand 3/3 + 3 extras assigned
    await page.locator('#rail-extras .chip', { hasText: '2' }).first().click(); // deselect seat 2 -> only 2 extras
    await expect(page.locator('#submit')).toBeDisabled();
  });

  test('re-entering setup (undo the setupDone event) re-locks the board', async ({ page }) => {
    await boot(page, { players: 6, events: [fact('s1', 0, 'has'), fact('s2', 0, 'has'), fact('s3', 0, 'has'), DONE] });
    await expect(page.locator('#setupbar')).toBeHidden();

    await page.locator('#logbtn').click();
    await page.locator('#undo').click(); // pops the last event = setupDone

    await expect(page.locator('#setupbar')).toBeVisible();
    await expect(page.locator('.railhead')).toBeHidden();
    await expect(cell(page, 's4', '1')).toBeDisabled(); // opponent cells locked again
  });
});

// ===========================================================================
// DEDUCTION ENGINE — the hard edge cases (engine-driven)
// ===========================================================================
test.describe('deduction engine', () => {
  test('envelope by elimination: holding 5 of 6 suspects pins the 6th to the envelope', async ({ page }) => {
    // N=3 -> 6-card hand: s1..s5 + w1. Only s6 can fill the envelope's one suspect slot.
    await boot(page, {
      players: 3, handExtras: [],
      events: [DONE, ...['s1', 's2', 's3', 's4', 's5', 'w1'].map((c) => fact(c, 0, 'has'))],
    });
    await expect(cell(page, 's6', ENV).locator('.mark-has.eng')).toBeVisible();
    const tr = page.locator('#grid-body tr', { has: cell(page, 's6', ENV) });
    await expect(tr).toHaveClass(/sol/); // solved-row styling
  });

  test('shower one-of-three collapses to the last card as the others are ruled out', async ({ page }) => {
    await boot(page, {
      players: 4,
      events: [
        DONE,
        suggestion(1, ['s1', 'w1', 'r1'], 2), // player 2 holds one of these
        fact('s1', 2, 'hasnt'),
        fact('w1', 2, 'hasnt'),
      ],
    });
    await expect(cell(page, 'r1', '2').locator('.mark-has.eng')).toBeVisible(); // must be r1
  });

  test('wrap-around passers: a clockwise pass that crosses seat 0 marks the right seat out', async ({ page }) => {
    // asker 3, shower 1 -> the only passer is seat 0 (3 -> 0 -> 1).
    await boot(page, { players: 4, events: [DONE, suggestion(3, ['s1', 'w1', 'r1'], 1)] });
    for (const c of ['s1', 'w1', 'r1']) {
      await expect(cell(page, c, '0').locator('.mark-hasnt.eng')).toBeVisible();
    }
    // seat 2 (not between asker and shower) is NOT ruled out
    await expect(cell(page, 's1', '2').locator('.mark-hasnt')).toHaveCount(0);
  });

  test('fully unrefuted suggestion: every non-asker lacks all three cards', async ({ page }) => {
    await boot(page, { players: 4, events: [DONE, suggestion(1, ['s2', 'w2', 'r2'], null)] });
    for (const seat of ['0', '2', '3']) {
      await expect(cell(page, 's2', seat).locator('.mark-hasnt.eng')).toBeVisible();
    }
    await expect(cell(page, 's2', '1').locator('.mark-hasnt')).toHaveCount(0); // the asker is exempt
  });

  test('hand-size counting: a full hand rules out every other card for that seat', async ({ page }) => {
    // N=6 -> 3-card hands. Seat 1 holds s1,s2,s3 (full) => everything else is out for seat 1.
    await boot(page, { players: 6, events: [DONE, fact('s1', 1, 'has'), fact('s2', 1, 'has'), fact('s3', 1, 'has')] });
    await expect(cell(page, 's4', '1').locator('.mark-hasnt.eng')).toBeVisible();
    await expect(cell(page, 'w1', '1').locator('.mark-hasnt.eng')).toBeVisible();
  });

  test('contradiction (one card claimed by two players) surfaces persistently in the verdict strip', async ({ page }) => {
    await boot(page, { players: 4, events: [DONE, fact('s1', 1, 'has'), fact('s1', 2, 'has')] });
    await expect(page.locator('#verdict-text')).toContainText('Widerspruch');
  });

  test('solved game reads out the full accusation', async ({ page }) => {
    await boot(page, { players: 4, events: [DONE, fact('s1', ENV, 'has'), fact('w1', ENV, 'has'), fact('r1', ENV, 'has')] });
    const v = page.locator('#verdict-text');
    await expect(v).toContainText('Gelöst');
    await expect(v).toContainText('Fräulein Gloria'); // s1 localized name (DE)
  });
});

// ===========================================================================
// TURN RAIL — asker preselect + column cues
// ===========================================================================
test.describe('turn rail', () => {
  test('asker preselects the seat after the last suggestion and lights its column', async ({ page }) => {
    await boot(page, { players: 4, events: [DONE, suggestion(2, ['s1', 'w1', 'r1'], 0)] });
    await expect(page.locator('.step[data-step="asker"] .v')).toHaveText('3'); // (2 + 1) % 4
    await expect(seatHeader(page, '3')).toHaveClass(/asking/);
  });

  test('first turn preselects the starter; the asker cue is lighter than the shower cue', async ({ page }) => {
    await boot(page, { players: 4, starter: 1, events: [DONE] });
    await expect(page.locator('.step[data-step="asker"] .v')).toHaveText('1'); // starter
    await expect(seatHeader(page, '1')).toHaveClass(/asking/);
    await expect(seatHeader(page, '1')).not.toHaveClass(/hot/); // asker is not the (filled) shower cue
  });
});

// ===========================================================================
// SUGGESTION RECOMMENDATION — your turn only, highlight-only, never blocks render
// ===========================================================================
test.describe('recommendation', () => {
  test('on your turn the suggest picker rings a recommended card', async ({ page }) => {
    await boot(page); // fresh N=4
    for (const c of ['s1', 's2', 's3', 'w1']) await cell(page, c, '0').click();
    await page.locator('#submit').click();
    await page.locator('.step[data-step="suggest"]').click(); // show the suspect chips

    // a card you hold (s1) is never recommended; an uncertain one (s4) is
    await expect(page.locator('#picker .chip.sym.reco')).toHaveCount(1);
    await expect(page.locator('#picker .chip.sym[data-card="s4"]')).toHaveClass(/reco/);
    await expect(page.locator('#picker .chip.sym[data-card="s1"]')).not.toHaveClass(/reco/);
  });

  test('no recommendation when it is not your turn (asker != 0)', async ({ page }) => {
    // a prior suggestion by seat 0 rotates the preselected asker to seat 1
    await boot(page, { players: 4, events: [DONE, suggestion(0, ['s1', 'w1', 'r1'], 2)] });
    await expect(page.locator('.step[data-step="asker"] .v')).toHaveText('1');
    await page.locator('.step[data-step="suggest"]').click();
    await expect(page.locator('#picker .chip.sym.reco')).toHaveCount(0);
  });
});

// ===========================================================================
// DEAL INVARIANT — hands always sum to 18
// ===========================================================================
test.describe('deal invariant', () => {
  for (const players of [2, 3, 4, 5, 6]) {
    test(`hand sizes sum to 18 for N=${players}`, async ({ page }) => {
      await boot(page, { players, starter: 0, handExtras: undefined, events: [DONE] });
      // the asker picker shows every seat's known/total tally; totals must sum to 18
      const tallies = await page.locator('#picker .chip.player .tally').allTextContents();
      expect(tallies).toHaveLength(players);
      const sum = tallies.reduce((acc, t) => acc + Number(t.split('/')[1]), 0);
      expect(sum).toBe(18);
    });
  }
});

// ===========================================================================
// PERSISTENCE, RECOVERY, i18n
// ===========================================================================
test.describe('persistence & i18n', () => {
  test('state survives a reload', async ({ page }) => {
    await boot(page); // fresh N=4
    for (const c of ['s1', 's2', 's3', 'w1']) await cell(page, c, '0').click();
    await page.reload();
    await page.waitForSelector('#grid-body tr.sec');
    for (const c of ['s1', 's2', 's3', 'w1']) {
      await expect(cell(page, c, '0').locator('.mark-has')).toBeVisible();
    }
  });

  test('a corrupt localStorage store starts clean instead of crashing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('indizien.v1', 'not json {[}'));
    await page.goto('/index.html');
    await page.waitForSelector('#grid-body tr.sec');
    await expect(page.locator('#setupbar')).toBeVisible(); // recovered into a fresh setup
    expect(errors).toEqual([]);
  });

  test('invalid handExtras seats are filtered on load (no out-of-range extra)', async ({ page }) => {
    // seat 9 does not exist for N=4; it must be dropped, leaving the deal still summing to 18.
    await boot(page, { players: 4, starter: 0, handExtras: [9, 2], events: [DONE] });
    const tallies = await page.locator('#picker .chip.player .tally').allTextContents();
    const sum = tallies.reduce((acc, t) => acc + Number(t.split('/')[1]), 0);
    expect(sum).toBe(18);
  });

  test('language toggle switches UI strings', async ({ page }) => {
    await boot(page); // setup, DE
    await expect(page.locator('#submit')).toHaveText('Loslegen');
    await page.locator('.lang button[data-lang="en"]').click();
    await expect(page.locator('#submit')).toHaveText('Start');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
