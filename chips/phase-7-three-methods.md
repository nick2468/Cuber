# Chip: phase 7 - three methods: quick, fewest moves, beginner

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push. This chip is
self-contained: it carries everything you need, because your session may have been
compacted and the earlier phases' context may be gone.

## Where things stand

Cuber is a Rubik's Cube solver. The user paints the colours of a real cube on to a
CSS 3D cube on the screen, presses Solve, and follows the moves in the box under
it while the screen cube turns with each move. React 19, TypeScript, Vite 8, vitest
4, a vendored Kociemba two-phase solver (`src/solver/vendor/`, from the cubejs
library) in a web worker, a Tauri 2 Windows app and an iPad web app from one code
base. Version 1.1.1 is built and accepted; phases 0 to 6 passed their review gates
(latest commit on `main` before this chip: `690c774`). The suite is 36 files, 191
tests, about 8 seconds.

Nick asked what the solver follows, after a cube he scrambled with a few turns came
back with nineteen moves. It follows the library's two-phase method, which stops at
the first solution under 22 moves and never looks for the shortest. He ruled three
methods, chosen in the box and remembered: **Quick solve** (today's, named), **Fewest
moves** (the library asked for 1 move, then 2, and so on), and **Beginner method**
(layer by layer, the method every guide teaches, so his son can learn it). All three
in this one phase, version 1.2.0. He reviews at the end.

## Read first, in this order

1. `CLAUDE.md`. Every rule binds: run npm from this folder and never with `--prefix`;
   no screenshot files, no headless browser; front the pane tab before any timing
   or motion check; the vendored library's `fromString` does no validation, so the
   validator runs before anything reaches it; one implementation per algorithm.
2. `docs/cuber-spec.md` sections 7.3, 7.4 and 7.5 (the design of this phase, read
   every table), 9.5, 8, 9.1 to 9.3, 10, C12, C13 and 17. Then section 6.1 (the
   sticker order and the piece tables) and 6.3 (moves).
3. `docs/cuber-build-plan.md`: "Rules for the builder" and "Phase 7". Boxes 7.1 to
   7.9 are your work list.
4. The code you build on, all of it: `src/solver/worker.ts`, `solver.ts`,
   `src/test/fake-solver.ts`; `src/ui/cube-context.tsx` (`askSolver`, `solve`,
   `hint`, `makeMove`, `revealOne`), `cube-state.ts` (`Solution`, `Durations`),
   `Box.tsx`, `Controls.tsx`, `box.css`; `src/model/moves.ts` (`Move`, `MOVES`,
   `applyMove`, `applyMoves`, `inverse`, `undo`, `FIXED_SCRAMBLE`, `isMove`),
   `cube.ts`, `geometry.ts` (`CORNERS`, `EDGES`, `sticker`, `positionOf`),
   `colours.ts` (`faceOf`, `opposite`, `Scheme`), `validate.ts`, `speeds.ts`,
   `notation.ts`; `src/storage/prefs.ts` (`useSpeed` is the shape `useMethod`
   copies); `src/test/dom.tsx`; `src/ui/solving.dom.test.tsx` and
   `hint.dom.test.tsx` for the house style; `src/solver/vendor.test.ts` (the one
   slow test); `docs/testing.md`.
5. `src/solver/vendor/solve.js`: `Cube.prototype.solve = function(maxDepth = 22)`
   and `solveUpright`, to see that an empty string comes back when nothing fits in
   `maxDepth`.

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## Facts verified by the orchestrator on 2026-09-14

- `solve(maxDepth)` searches phase one to increasing depth and gives phase two the
  rest of `maxDepth`; it returns the first solution found, or `''` when none fits.
  So depth 1, 2, 3... in turn gives the shortest the method can find.
- The library also knows whole-cube turns (`x`, `y`, `z`) and slice moves. **Do not
  use them.** Spec C11 holds the cube as entered, and the beginner method is
  designed so it never needs a whole-cube turn: the first layer is the BOTTOM face
  as entered.
- The model's `applyMoves` validates before every library call and throws on an
  impossible cube. Every intermediate cube in a solution is a real cube, so it
  never throws here unless something is wrong; do not catch it.
- The scheme is read from the centres (`schemeOf`), so "white" in the beginner
  method means the bottom centre's colour and "yellow" the top centre's, whatever
  they are. Write the goals against faces (`D`, `U`) and the scheme, never against
  colour names.
- The worker is a module worker started by `createSolver`; `fakeSolver` in tests.
  One DOM test guards that no real `Worker` is constructed in the suite.

## The pieces, exactly

**`src/model/methods.ts`**: `Method = 'quick' | 'fewest' | 'beginner'`, `METHODS`
in that order, `methodWord` ("Quick solve", "Fewest moves", "Beginner method").
`prefs.ts`: `useMethod()` in `useSpeed`'s shape, key `cuber.method`, default
`quick`.

**The worker protocol.** `SolveRequest` gains `method: Method`. `WorkerReply`'s
`solution` gains `stages: Stage[]`, `labels: Label[]` and `note: 'quick' | null`.
`Stage = { name, sentence, from, to }` (move indices, `to` exclusive); `Label = {
at, text }`. Quick and fewest return empty `stages` and `labels`. `Solver.solve(
facelets, method)` returns `Promise<{ moves: string[]; stages; labels; note }>`.
`fakeSolver` answers `undo(FIXED_SCRAMBLE)` for every method, with one stage
`{ name: 'The whole cube', sentence: 'A fake solution.', from: 0, to: 10 }` and no
labels when the method is `beginner`, so the box's headings can be tested.

**Fewest moves, in `worker.ts`** (spec 7.4): a function `solveFewest(cube, now,
budgetMs, maxDepth)` with the clock injected: `for depth 1..maxDepth: if now() -
start > budgetMs break; const said = cube.solve(depth); if (said) return { moves,
note: null }`; then `return { moves: quick, note: 'quick' }` with `quick =
cube.solve()`. The worker calls it with `performance.now`, 5000 and 20. Put
`solveFewest` in its own file, `src/solver/fewest.ts`, imported by the worker, so
a node test can call it with a fake clock and the vendored library (the slow test
file already calls `initSolver`; add these cases there rather than starting a
second slow file).

**The beginner method, `src/solver/beginner.ts`** (spec 7.5, the whole design). In
outline:

```ts
export interface Macro { name: string; moves: Move[] }
export type Item = Move | Macro                    // one vocabulary entry
export function solveStage(cube, vocabulary: Item[], goal: (c: Cube) => boolean,
  limit: number): Item[] | null                     // breadth-first, shortest first
export function solveBeginner(cube): { moves: Move[]; stages: Stage[]; labels: Label[] }
```

- The macros as data, exactly the spec's table: four righty moves, eight insertions
  (build them from the formula with the face order F, R, B, L), the cross move, the
  edge move, the corner move, the twist move.
- The goals as functions of the cube and its scheme. A piece is "in place" when
  every sticker of the position carries the colour of that sticker's face in the
  scheme (`geometry.ts`'s `CORNERS` and `EDGES` give each position's stickers, and
  each sticker's face is `placeOf(index).face`). Stage 4's goal is only that the
  four `U` edge positions' `U` stickers carry the scheme's `U` colour.
- `solveStage` is breadth-first over sequences of items: level by level, apply each
  item to each frontier cube, test the goal, stop at the first hit. Keep a `Set` of
  seen facelet strings so the frontier does not revisit a cube. Limits per spec
  7.5. Return `null` past the limit; `solveBeginner` treats `null` as a thrown
  error naming the stage and the piece.
- Stages 1 to 3 run per piece: for each of the four target positions in a fixed
  order (front-right, front-left, back-left, back-right), a search whose goal is
  "this position in place, and every position solved so far still in place". For
  stage 1 the vocabulary is `MOVES` (all eighteen) with limit six. For stage 2 the
  four righty macros plus `U`, `U'`, `U2`, limit eight. For stage 3 the eight
  insertions plus the three `U` turns, limit eight.
- Stages 4 to 7 run once each with their macro plus the three `U` turns, limit
  twelve.
- The output: the flat `moves` from expanding every item; `stages` with `from` and
  `to` over that flat list; a `Label` at each macro's first move, its text
  "<name>: <letters>", and when the same macro repeats back to back, one label
  "<name>: <letters>, N times" covering the run. A stage that needed no moves gets
  no `stages` entry but a `labels`-free "already there" line: put it in `stages`
  too, with `from === to` and the sentence "The white cross was already there."
  (or that stage's name), so the box has one list to render.
- Every solution is checked before it is returned: `applyMoves(cube, moves)` passes
  `validate` and equals `solved(scheme)`. If not, throw. The worker turns a throw
  into `failed`.

**The provider** (`cube-context.tsx`): `method` and `setMethod` from `useMethod`;
`askSolver` sends `method`; `Solution` gains `stages`, `labels`, `note`; `setMethod`
discards a showing solution exactly as `paint` does (C12, C22) and writes storage;
the status line's sentence after a fewest-moves fallback is spec 7.4's, otherwise
"Solved in N moves."; the solver's `note` is read from the reply, never guessed.

**The box** (`Box.tsx`, `Controls.tsx`, `box.css`): the "Method" fieldset beside
"Speed", the trainer's fieldset style, three radios with `methodWord`. For a
solution with `stages`: before the first row of each stage, a heading row with the
stage's name in the app's text colour and its sentence in `--text-dim`; for a stage
with `from === to`, the one "already there" line in `--text-dim`; before a macro's
first move, a label row in `--text-soft` with the letters in the chip style. The
holding line gains the extra sentence when `method === 'beginner'`. Nothing else in
the box changes; the row for `moves[step]` is still the marked one, and Hint reveals
moves one at a time regardless of headings (a heading shows once its stage's first
revealed move does).

**Version 1.2.0** in `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`
(and the two lock files: `npm install` from this folder; `cargo` at
`%USERPROFILE%\.cargo\bin` for `Cargo.lock`, or leave `Cargo.lock` to the next Tauri
build and say so).

## Tests to write

- `methods.test.ts`: the three words; `useMethod` remembered and a nonsense value
  giving `quick` (in `prefs.dom.test.tsx`'s shape).
- `fewest.test.ts` cases inside `src/solver/vendor.test.ts` (the one slow file): a
  1-, 3- and 6-move scramble of the solved cube return exactly the undo; a fake
  clock that jumps past the budget returns the quick solution with `note: 'quick'`
  without calling `solve(depth)` more than once.
- `beginner.test.ts` (string tests, fast: no `initSolver` needed, the library's
  `move` is enough): each macro applied to a set-up cube reaches its goal (for
  example: a solved cube, then `R U R' U'` inverted to pop the front-right corner
  out, then the righty macro two or four times puts it back); each stage goal on a
  cube just before and just after; `solveStage` finds a one-item answer when one
  exists and returns null past the limit; **200 random library cubes solve**, every
  stage's goal holding at its `to`, every solution under 250 moves, the whole run
  under four seconds (record the time; if it is over, cut the search limits or
  prune, and record what changed); the fixed scramble's solution pinned with its
  stage boundaries.
- `solver.test.ts` grows: the adapter passes `method` and returns `stages`,
  `labels`, `note`.
- DOM: `method.dom.test.tsx`: the radios; remembered across a remount; changing the
  method with a solution showing empties the box; with `fakeSolver` and
  `beginner`, the box shows the fake stage's heading and sentence and the rows
  under it; the fallback sentence shows when the fake answers `note: 'quick'`
  (give `fakeSolver` an optional argument for that).

## Steps

1. `git status` first: clean, with the commit that added this chip on top of
   `690c774`. If not, stop and report. Never stash, reset or discard.
2. Boxes 7.1 and 7.2, one commit: "Name the methods and widen the solver's reply".
3. Box 7.3, one commit: "Find the fewest moves the two-phase method can".
4. Box 7.4, one or two commits: "Solve layer by layer with the beginner method".
   This is the big one; land the macros and goals with their tests first, then the
   search and the 200-cube run.
5. Boxes 7.5 to 7.7, one commit: "Choose the method in the box, with stages".
6. Box 7.8 in the pane, tab fronted, dev server `cuber-dev` on 5190: the
   `scrambled` scene under each method (note the three lengths and the time to
   answer); a three-turn scramble under fewest moves (seed `toText(applyMoves(
   solved(), ['R', 'U', 'F']))` through `localStorage.setItem('cuber.cube', ...)`
   and reload) gives `F' U' R'`; the beginner method's box with its headings and
   labels, both themes; the fallback sentence if you can provoke it (a full
   scramble under fewest moves will take the five seconds and then fall back; say
   how long it took). Ten random cubes under the beginner method: record the
   lengths. Clear the pane's storage afterwards.
7. Box 7.9: version 1.2.0, the reuse review (one search, one macro table, the
   goals not duplicated between the solver and its tests beyond the hand-made
   cubes, `methodWord` the only home of the words), the docs sweep: spec 17 gains
   one line per method; `docs/acceptance.md` a "Three methods" section with what
   was seen and "Nick: pending" for following a beginner solution on a real cube;
   `README.md`; `CLAUDE.md`'s "Current state" and the one-implementation list
   (`solveStage` and the macro table as new homes). Commit: "Set version 1.2.0 with
   three solving methods".
8. Append the phase 7 notes to the plan, tick the boxes, set the Progress row.

## Decision rules for the small things

- The three radios' order and words are the spec's. Australian English.
- The beginner method's stage names and sentences are the spec's, word for word.
- If a macro in the spec's table does not do what its row says (the table is the
  orchestrator's reading of the guides), the test tells you: fix the letters to the
  guide's sequence, say which and why in the notes, and keep going. The eight
  insertions from the formula are the likeliest place.
- If the 200-cube run cannot get under four seconds, raise the bar to eight and say
  so; do not weaken the run to fewer cubes.
- The fewest-moves budget and depth are named constants in `fewest.ts`.
- Nothing under `src-tauri/src`, `src/ui/Scene.tsx` or `transforms.ts` changes.

## Out of scope

Whole-cube turns in the notation. A true optimal solver. CFOP or any other
speedcubing method. The non-standard cube colours (phase 8, waits for Nick), the
photo entry. A Tauri build (the version files change; the next build picks them
up).

## If something does not fit

Stop that item, write the contradiction under the phase 7 notes in
`docs/cuber-build-plan.md`, and carry on with the items that do not depend on it.
Ask Nick when a choice would change what a person sees. Decide small matters of
code shape yourself and say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- `npx vitest run` green under twenty seconds, `tsc -b` clean, `npx oxlint` silent
  before every commit. No em dashes under `src/`. Spec section 3's words.

## Done when

The plan's phase 7 "Done when" line is true except Nick's own follow-through, every
box 7.1 to 7.9 ticked, the 200-cube run green and timed, and the phase notes
written. Finish with a short report: what landed, the commit hashes, the three
solution lengths on the scrambled scene, the ten beginner lengths, the 200-cube time,
what you asked, and anything left for Nick's review.
