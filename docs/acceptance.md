# The acceptance walk

Spec section 17 says the app is done when eleven lines are true. Each one is below
with what was done to check it, what was seen, the date, and where it stands. Three
states are used: **Passed**, **Nick: pending** for the ones that need his hands or his
cube, and **Waits for phase 6** for anything the iPad brings.

The walk was written at phase 5 on 2026-09-12, the day the version became 1.0.0.
Where an item was checked in an earlier phase, the phase is named: a check does not
stop being true because time passed, and the suite has run green over every commit
since.

---

## 1. The screen

**One column with the header, the picker, the cube, the view button, the status line
and the box, laid out as section 4 says, in both themes, at the three viewports of
section 15, with the probe's two numbers holding (C20).**

Checked at phase 4 and again at gate 4, by running `scripts/probes/layout.js` in the
browser pane at each viewport with the `solution` scene loaded, which is the tallest
the page ever gets: nineteen moves in the box. Both themes at 800 by 1000, and both
views on the `scrambled` scene.

Every box is written out in the plan's phase 4 notes, and gate 4 re-ran the probe and
got the same numbers; the one thing the gate changed was the column, which had been
720 wide below 900 px of window and 672 above it, and is now 720 at every width. The
numbers are not repeated here, because one table in two documents is one table that
can disagree with itself.

What they say: C20 holds at all three viewports. `scrollWidth` is never over
`innerWidth`, and the scene is square and never under 280 - 400 at both upright
viewports, 280 at 1180 by 820, where the fit rule shrinks it. The 800 by 1000 window
does not scroll at all with nineteen moves in the box: the content comes to 991,
nine pixels spare. At 1180 by 820 the page itself does not scroll either; `main`
scrolls 51 px inside the pinned shell, which is what spec 4.1's tall-window rule is
for. Phase 5 ran the same probe in the installed window, and those numbers are in the
phase 5 notes.

**Passed**, 2026-09-12.

## 2. Entering

**Every sticker can be painted by left click, by the right-click menu and by long
press; the swatch counts are right; a tenth sticker of a colour is refused; the
centres are pre-filled and editable.**

`src/ui/entering.dom.test.tsx` drives all three ways on the real provider and reads
the stickers and the counts back. Seen in the pane at phases 2 and 4.

One thing changed after section 17 was written, and the wording there has not caught
up. Spec C9 was amended at gate 3: **a colour already on nine stickers is refused on a
BLANK sticker, and allowed over a filled one**, because refusing everywhere made the
validator's first rule unreachable on screen and left the user unable to correct a
mistake by painting over it. So "a tenth sticker of a colour is refused" is true of
the case it was written for, and the other case is a deliberate change. Left for the
orchestrator to reword in spec 17.

**Passed**, 2026-09-12, with that note.

## 3. The views

**"Show the other side" plays the two slow movements with their sentences and shows
Down, Left and Back; "Show the first side" plays them back.**

`src/ui/views.dom.test.tsx` is the one test that does not set the durations to zero:
it gives each movement 150 ms, because a sequence of three sentences with no time in
it is over before anything can read it. Watched in the pane at phase 2, both
directions, and the two cube transforms are exact opposites.

**Passed**, 2026-09-12 (phase 2).

## 4. Validation

**Every rule of section 6.4 fires with its sentence on a hand-made cube; the offending
stickers are outlined; Solve is disabled with the reason and enabled when the cube is
fixed.**

`src/model/validate.test.ts` has a hand-made cube for each rule, plus the two property
tests: every random library cube validates, and every single swap of two differently
coloured non-centre stickers fails. `src/ui/validation.dom.test.tsx` checks the
sentence, the outlined stickers and Solve's disabled state on screen. The `mirrored`
scene shows it in the pane: "That corner is not a real piece. Check its three
colours.", with stickers 8, 9 and 20 outlined.

**Passed**, 2026-09-12.

## 5. Solving

**A real scrambled cube entered from a physical cube is solved in 22 moves or fewer;
following the moves on the physical cube solves it. Nick does this check with his
son's cube.**

Nick did it on 2026-09-12, from the dev server: he entered his son's scrambled cube,
pressed Solve, followed the moves on the real cube, and the real cube came out solved.
That is what closed phase 3.

Phase 5's box 5.6 repeats it on the installed app, which is a check of the installer
rather than of the solver.

**Passed**, 2026-09-12.

## 6. Steps

**The five controls and the three speeds work as section 9.2; the cube on screen turns
the right way for every face; the keyboard works.**

`src/ui/solving.dom.test.tsx` drives the five controls and reads the model's stickers
after each, `src/ui/speed.dom.test.tsx` the three speeds, and
`src/ui/keys.dom.test.tsx` the keyboard. Which way the cube turns is asked in
arithmetic rather than by eye: `src/ui/turn-direction.test.ts` proves the transform
for all eighteen moves. That is deliberate, because a background browser tab stalls
animations and makes a correct turn look wrong.

**Passed**, 2026-09-12 (phase 3).

## 7. Hint

**Reveals one move at a time; Solve reveals the rest.**

`src/ui/hint.dom.test.tsx`. Seen in the pane at phase 3.

**Passed**, 2026-09-12 (phase 3).

## 8. Remembered

**The cube, the theme and the speed survive closing and reopening the app.**

`src/ui/remembered.dom.test.tsx` remounts the app and finds the cube and the speed
still there; `src/storage/prefs.dom.test.tsx` covers the three keys and a browser that
refuses storage. In a browser the store is the site's `localStorage`; in the installed
app it is the same `localStorage` inside the window's own WebView2 profile at
`%LOCALAPPDATA%\Cuber Data\WebView2`, which `src-tauri/src/lib.rs` points it at.

Closing and reopening the INSTALLED app is Nick's check, in box 5.6.

**Passed** in the browser, 2026-09-12, and **Passed** on the installed app the same
day: Nick closed and reopened it and found his cube remembered.

## 9. Windows

**The installer builds, installs for the current user, opens an 800 by 1000 window
titled Cuber with the version in the header, and the uninstaller's ticked box removes
`Cuber Data` and nothing else, proved by the check script's four cases.**

Three halves, and two of them are done here.

- **The installer builds.** `npm run tauri build` at phase 5 wrote
  `src-tauri/target/release/bundle/nsis/Cuber_1.0.0_x64-setup.exe`. Path and size are
  in the plan's phase 5 notes.
- **The window.** The built `cuber.exe` was started with WebView2's debugging port
  open and read through `scripts/packaged-eval.mjs`: the title is `Cuber`, the header
  shows `v1.0.0`, the solver became ready by itself, Solve answered, and the layout
  probe's numbers from the real window are in the phase 5 notes.
- **The uninstaller.** `node scripts/check-uninstall-hook.mjs` compiles the shipped
  macro against a scratch folder and runs all four cases. Only the ticked ordinary
  uninstall removed it; the ticked upgrade and both unticked cases left it alone. The
  output is in the phase 5 notes.

Installing and uninstaller for real is Nick's, in box 5.6: this session does not
install software on his machine.

**Passed** for the build, the window and the hook, 2026-09-12, and **Passed** for the
install and the uninstall the same day: Nick ran the installer, solved his cube in
the installed app, and uninstalled with the box ticked. Every item in this walk is
now passed, and version 1.0.0 is accepted.

## 10. Tests

**The suite is green under twenty seconds, both projects, with the sixteen tests of
C19 present; `tsc -b` clean; no em dashes under `src/`; the version held in three
files.**

`npx vitest run`: 33 files, 184 tests, both projects, in about 7 seconds on this
machine. Nothing skipped from phase 5 on: the two version tests that waited for
`src-tauri/` now run. `npx tsc -b` clean, `npx oxlint` silent. The sixteen tests of
C19 are each present and were ticked in the plan as their phase landed. No em dashes
under `src/` or `src-tauri/`.

**Passed**, 2026-09-12.

## 11. Docs

**The spec, the plan with every box ticked or its gap recorded, `testing.md`,
`acceptance.md` and `CLAUDE.md` all current.**

All five were swept at phase 5's close. The plan's only open boxes are 5.6, which is
Nick's, and the whole of phase 6, which waits for his word. Every gap found on the way
is recorded in the phase notes rather than quietly left.

**Passed**, 2026-09-12.

---

## What the iPad brings

Nothing in section 17 is an iPad line: the Home Screen app is spec section 12 and plan
phase 6, and it waits for Nick. When it comes it adds its own walk, not another pass
over this one.
