# Chip: phase 1 - the model, the validator and the solver

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push.

Phase 0 is done and passed its review gate (commit `3c7bb6b`). The page shows the
header and nothing else. This phase adds every pure module the app needs, under
test, and changes nothing on screen.

## Read first, in this order

1. `CLAUDE.md` in this folder. Every rule in it binds, including the new standing
   hazard about `npm install --prefix`: run npm from this folder, never with
   `--prefix` and this folder's path.
2. `docs/cuber-spec.md` sections 3, 6, 7, 10, 13 and 14 in full. Section 6 has the
   sticker order, the geometry table, the piece tables and the twelve validation
   rules with their exact sentences. Section 7 has the vendoring edits.
3. `docs/cuber-build-plan.md`: "Rules for the builder", "Standing discipline", the
   phase 0 notes and gate findings, and the whole of "Phase 1 - the model, the
   validator and the solver". Boxes 1.1 to 1.13 are your work list.
4. `../London/src/ui/prefs.ts`: the four helpers `read`, `write`, `readOneOf` and
   `useRemembered`, and the comment above them. `../Conquest/src/ui/remembered-setup.ts`
   and its test: how a stored value is checked on the way back.
5. The library. Get it into a scratch folder OUTSIDE the repository, for example
   `%TEMP%\cubejs-scratch`: `npm pack cubejs@1.3.2` there, then extract the tarball.
   Do not `npm install` it anywhere. Read `package/lib/cube.js` lines 1 to 120 (the
   `centerFacelet`, `cornerFacelet`, `edgeFacelet` tables and the colour tables),
   then `asString`, `fromString`, `move`, `isSolved`, `randomize` and the closing
   globals block; and `package/lib/solve.js` `initSolver`, `solveUpright`, `solve`
   and its opening `Cube = this.Cube || require('./cube')` line. Read `package/LICENSE`.

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## What this phase delivers

`src/model/` and `src/solver/` complete and tested: the colours and the scheme, the
54-sticker cube, the geometry, the facelet mapping, the eighteen moves through the
library, the validator, the sentences, the two views, the remembered form, the
vendored solver with its worker and adapter, and the storage helpers with the two
hooks. The suite is green under twenty seconds including the one slow solver test.
Nothing new on screen.

## Settled facts, verified at source by the orchestrator

- **The library does no validation.** `Cube.fromString` looks each corner and edge
  up in its tables and silently leaves a slot unset when nothing matches. A bad
  string makes a broken cube that can hang `solve`. The validator runs first,
  always (spec 6.4, C6).
- **The facelet order is U R F D L B, nine each, index `9 * face + 3 * row +
  column`.** The corner and edge facelet tables in spec 6.1 are copied from the
  library's `cornerFacelet` and `edgeFacelet`. If your reading of `cube.js`
  disagrees with the spec's table, the library is right, the spec is wrong: stop,
  record it in the notes, and use the library's numbers.
- **`Cube.random()` needs no `initSolver`.** It lives in `cube.js` and enforces the
  three whole-cube rules (twist, flip, permutation parity) itself. The validator's
  property tests use it and stay fast.
- **`solve()` returns a string** of moves separated by spaces, each a face letter
  optionally followed by `2` or `'`, and an empty string for a solved cube. Its
  default depth is 22.
- **The npm package declares `npm` as a runtime dependency** and both files are
  CommonJS wrapped in `(function(){...}).call(this)`. That is why the two files are
  vendored with an ES module edit each (spec C5), not installed.
- **The scratch scramble** for the fixed-cube tests and later scenes is
  `R U R' U' F2 D L' B2 U2 R` (spec 15.1). Its solution for the fake solver is the
  inverse sequence, reversed: `R' U2 B2 L D' F2 U R U' R'`.

## Settled decisions you do not revisit

- Module boundaries (spec C17): `src/model` and `src/solver` import no React and
  touch no browser global. The one exception is `new Worker(...)` inside
  `src/solver/solver.ts`.
- One implementation per algorithm (spec 13.3): the library's `move` is the only
  face turn; `geometry.ts` is the only "which sticker is where"; `validate.ts` is
  the only home of the rules; `moveSentence` the only home of the words.
- The vendored files: `src/solver/vendor/cube.js`, `solve.js`, `cube.d.ts`,
  `LICENSE`. Each `.js` file gets an `Origin:` line as its first comment naming
  cubejs 1.3.2, MIT, and the one edit made. Nothing else in them changes, not even
  formatting. `cube.d.ts` declares only what the app uses: `Cube.fromString`,
  `Cube.random`, `Cube.initSolver`, and the instance methods `asString`, `move`,
  `solve` and `isSolved`.
- The fake solver `src/test/fake-solver.ts` answers `ready` at once and `solve`
  with the fixed solution above, whatever it is given.
- Storage keys (spec 10): `cuber.theme`, `cuber.speed`, `cuber.cube`. The cube is
  54 characters from `wyrobg-`.
- The blank cube has the standard centres: white up, yellow down, green front, blue
  back, red right, orange left. Index 4 white, 13 red, 22 green, 31 yellow, 40
  orange, 49 blue.
- Validation sentences are the spec's, word for word, with the piece named by its
  stickers where the spec shows a placeholder. Return `{ ok: false, message,
  stickers }` where `stickers` is the indices to outline, and `{ ok: true,
  facelets }` on success.

## One follow-up from gate 0, do it in this phase

`src/ui/theme.ts` reads and writes storage itself. Once `prefs.ts` exists (box
1.12), change `theme.ts` to use its `read` and `write`, delete the hook's own
try-and-catch, and update its `Origin:` line to say so. The shell DOM test already
covers the behaviour. Land it as its own small commit.

## Decision rules for the small things

- Where the spec names a function and a file, use that name and that file. Where it
  does not, choose a name from spec section 3's words.
- A test for a piece table or a sentence lists every case rather than sampling:
  eight corners, twelve edges, eighteen moves.
- The property tests: 200 random cubes must validate; for 100 random cubes, one
  swap each of two non-centre stickers of different colours must fail. Pick the two
  stickers with a seeded or simple deterministic walk so a failure is repeatable,
  and print the facelet string in the assertion message.
- The slow solver test lives in one file, `src/solver/vendor.test.ts`, and is the
  only test that calls `initSolver`. Record its time in the notes. If it takes the
  suite past twenty seconds on this machine, stop and report the numbers rather
  than removing the test.
- If the vendored files do not load under vitest or under Vite's worker bundling,
  stop and report. The fallback (`npm install cubejs` with CommonJS interop) is a
  spec change and is the orchestrator's call, not yours.
- `applyMove` is called only on a valid cube. Make it throw with a plain message if
  `toFacelets` returns null, so a misuse fails loudly in a test rather than
  reaching the library.
- The worker file `src/solver/worker.ts` is not unit tested (it needs a worker
  global). Keep it small: import, `initSolver`, post `ready`, answer `solve`. The
  adapter `solver.ts` is tested with a hand-made object that has `postMessage` and
  `onmessage`, passed in through an optional `makeWorker` argument, so no real
  `Worker` is constructed in the suite.

## Steps

1. `git status` first. It should be clean, with the commit that added this chip on
   top of `3c7bb6b`. If it is not, stop and report what is there. Never stash,
   reset or discard.
2. Work through plan boxes 1.1 to 1.13 in order, ticking each in
   `docs/cuber-build-plan.md` in the same sitting it lands with green tests. Write
   each module's test beside it as you go.
3. Commit as you go, every commit green: a natural split is (a) colours, cube and
   geometry, (b) facelets and the vendored library with its slow test, (c) moves,
   notation, views and cube-text, (d) the validator, (e) the solver adapter, worker
   and fake, (f) prefs, paths and the theme follow-up. Fewer commits are fine if
   each stays reviewable.
4. Run the whole suite and note its time warm. Run `tsc -b` and `npx oxlint`. Run
   `npm run build` and confirm the vendored files are bundled without a warning
   about CommonJS or `this`.
5. Reuse and duplication review of everything new: the piece tables exist once
   (in `geometry.ts`), the letter-to-colour mapping exists once (in `facelets.ts`
   or `colours.ts`, not both), no test re-implements a table it could import.
   Refactor on the spot. Say in the notes what it found.
6. Append the phase 1 notes under "Phase notes" in the plan: the `initSolver` time,
   the suite time, what the vendoring edits were exactly (quote the lines), what
   the property tests found on first run, anything the library disagreed with the
   spec on, what you decided, what you asked Nick and what he said. Set the
   Progress table's phase 1 row to "Done, <date>".
7. Update `README.md` only if a command changed. Update `CLAUDE.md`'s "Current
   state" line.

## Out of scope

Anything on screen. No provider, no component, no CSS. No Tauri, no PWA, no scenes,
no probe. The beginner method and the photo feature are later phases with their own
designs.

## If something does not fit

Stop that item, write the contradiction under the phase 1 notes, and carry on with
the items that do not depend on it. Ask Nick when a choice would change what a
person sees or how the app behaves. Decide small matters of code shape yourself and
say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- No em dashes under `src/`. Australian English. One name for one thing.

## Done when

The plan's phase 1 "Done when" line is true: the suite is green with every string
test of spec C19 items 1 to 8 present, under twenty seconds, `tsc -b` clean,
`npm run build` clean, every box 1.1 to 1.13 ticked, the theme follow-up landed, and
the phase notes written. Finish with a short report: what landed, the commit hashes,
the two measured times, what you asked, and anything left for the orchestrator's
review.
