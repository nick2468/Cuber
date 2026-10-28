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
phase 6. It does not add a pass over the eleven items above, which the browser and the
installed app have both already answered. It adds the three lines below instead.

---

## The iPad walk

Phase 6, built 2026-09-12 at version 1.1.0. The steps that need Nick's accounts and
his iPad are in [cuber-deploy.md](cuber-deploy.md).

### i. It opens and solves with no internet

`npm run build` writes `dist/manifest.webmanifest` and `dist/sw.js`, and the service
worker's precache names seventeen entries, `assets/worker-*.js` among them, which is
the solver. Served on `localhost` by `npm run preview` and driven in the browser pane:
the worker registered and took control, then the server was **stopped** and the page
reloaded. It opened, drew the remembered cube, answered Solve with "Solved in 19
moves." and stepped forward, with nothing answering on the port.

That last part is the real proof. The app opening offline only says the HTML and the
bundle were stored; Solve answering says the solver's own chunk was stored too, which
is the one file a size limit or a wrong glob would have left out.

**Passed**, 2026-09-12.

### ii. The Home Screen and aeroplane mode

Nick opens the project's `pages.dev` address in Safari, adds it to the Home Screen, turns
on Aeroplane Mode, closes the app fully, opens it again and solves a real cube. That is
plan box 6.6, and it needs the site to be published first (deploy steps 1 to 3).

**Nick: pending.**

### iii. A new version is offered, never forced

Seen in the browser pane on the dev server with `?pretendUpdate`, in both themes. A bar
appears across the bottom of the page reading "A new version is ready" and "Your cube
and settings are remembered, so loading it loses nothing.", with "Not now" and "Load
it". "Not now" removed the bar without reloading. "Load it" reloaded the page, and the
theme came back from storage, which is the promise the words make.

The bar is fixed at the bottom and takes none of the page's height, so the layout probe
at 800 by 1000 gave the same numbers with it showing: `scrollWidth` 800 of 800 and
`scrollHeight` 1000 of 1000.

`src/ui/update-watch.dom.test.tsx` holds the other half: the watch is mounted in a
browser and not mounted inside the Tauri window, so the installed app registers no
service worker and still updates by installer (spec C21).

**Passed**, 2026-09-12.

## Three methods

Added at phase 7, version 1.2.0, for Nick's ruling Q18. Spec 7.3 to 7.5 and 9.5.
Driven in the browser pane at 800 by 1000 against the real solver in its worker, with
the tab in front, on 2026-09-14.

### i. The three methods answer, and differ

On the fixed scramble `R U R' U' F2 D L' B2 U2 R`, which is ten turns:

| Method | Moves | Time to answer |
|---|---|---|
| Quick solve | 19 | 109 ms |
| Fewest moves | 10 | 217 ms |
| Beginner method | 146 | 109 ms |

Ten more moves than the scrambling took, against exactly the scrambling undone. That
is the thing Nick asked about, answered.

A three-turn scramble (`R U F`, seeded through `cuber.cube` and reloaded) came back
from Fewest moves as `F' U' R'`, in 137 ms.

**Passed**, 2026-09-14.

### ii. Fewest moves says when it gave up

A fully scrambled random cube under Fewest moves: the box said "Working it out..." for
7.8 seconds and the status line then read "Solved in 20 moves. No shorter answer was
found in five seconds, so this is the quick one." (spec 7.4).

The wait is longer than the five seconds the sentence names because the budget is
checked BEFORE each depth, so the depth already running when the clock passes five
seconds runs to its end. That is the specification's own design and there is no way
inside the library to stop a search part way. Recorded in the phase 7 notes as a gap
between the words and the clock.

**Passed**, 2026-09-14.

### iii. The beginner method reads as a method

The box shows all seven stages with the specification's names and sentences, in order,
each heading above its own rows: the white cross, the white corners, the middle layer,
the yellow cross, the yellow edges, the yellow corners in place, the yellow corners
turned. Named sequences carry a label above their moves, reading for example "The
righty move, front-right: R U R' U', four times" with the letters in the same
fixed-width style the moves use. The holding line carries the extra sentence, "Most
guides start with white: hold the cube with white at the bottom before you enter it."

Seen in both themes and in both views. Stepping, the marked row and the scrolling of
the list work over a 146-row solution exactly as they do over a 19-row one.

Ten random cubes: 141, 149, 151, 151, 162, 166, 180, 185, 190 and 192 moves, 167 on
average, each answered in 51 to 72 ms. The suite's own run of 200 random cubes is in
`src/solver/beginner.test.ts`.

**Passed**, 2026-09-14.

### iv. Following a beginner solution on a real cube

Nick, or his son, follows one beginner solution all the way through on a physical cube
and reaches a solved cube. The suite proves the moves solve the model; this proves the
words and the stages make sense to a person learning the method, which no test can.

**Nick: pending.**

### v. The cube moved up beside the picker

The Method choice needs a second line in the box, which costs 51 pixels the 800 by 1000
window did not have. Nick ruled two changes on 2026-09-14: the cube moves up into the
empty space beside the picker, and the "Show the other side" button moves from under
the cube to under the picker. Neither of them costs the page any height now, because
the picker and the button together are 197 tall and the cube is never shorter than 280,
so the row is as tall as the cube and nothing else.

The layout probe, with a solution showing:

| Viewport | Scene | `scrollWidth` / `innerWidth` | `scrollHeight` / `innerHeight` |
|---|---|---|---|
| 800 by 1000 | 400 square | 800 of 800 | 1000 of 1000 |
| 820 by 1180 | 400 square | 820 of 820 | 1180 of 1180 |
| 1180 by 820 | 375 square | 1180 of 1180 | 820 of 820 |

The cube is bigger at every viewport than it was before this phase, not smaller. The
sideways iPad gets 375 where it used to get 280, the smallest allowed, and it no longer
scrolls down at all. The 800 by 1000 window has about 150 pixels spare at the bottom,
where it had 15: the cube is held at 400 by spec 4.1's ceiling, not by the room.

Both themes checked at 800 by 1000, in both views.

**Passed**, 2026-09-14.

---

## Public release, 2026-10-24

Version 1.2.1 went public on Nick's ruling, the path PDFluffer and Tabiya took: an MIT
licence (`LICENSE`), licence fields in `package.json` and `Cargo.toml`, an About view
(spec C23) that shows both MIT texts, a public repository at
`github.com/nick2468/Cuber`, release `v1.2.1` with `Cuber_1.2.1_x64-setup.exe` and a
`SHA256SUMS.txt`, an entry at nick2468.github.io/cuber with three screenshots from the
installed window, and a mention on the nick2468 landing page. The suite: 40 files, 238
tests. **Passed**, 2026-10-24.
