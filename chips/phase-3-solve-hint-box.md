# Chip: phase 3 - Solve, Hint, the box and the animation

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push.

Phases 0 to 2 are done and passed their gates (latest commit on `main` before this
chip: `cd40ab5`). A person can enter a cube in both views and see it validated. This
phase makes the app do its job: Solve writes the moves in the box, the controls step
and play, the cube on screen turns with each move, and Hint gives one move at a time.

## Read first, in this order

1. `CLAUDE.md`. Every rule binds, and two new standing hazards matter here: a busy
   pane throttles CSS transitions (front the tab, wait, read the computed transform),
   and the pane's viewport emulation sends no `resize` event (reload after resizing).
2. `docs/cuber-spec.md` sections 7.2, 8, 9 (all of it), 10, 13.3 and 14.
3. `docs/cuber-build-plan.md`: "Rules for the builder", the phase 2 notes and gate 2
   findings, and the whole of "Phase 3 - Solve, Hint, the box and the animation".
   Boxes 3.1 to 3.9 are your work list. Box 3.2's wording was aligned with this chip
   at gate 2: the layer turn is a web animation, not a CSS transition (see "The
   layer turn, exactly" below for why).
4. The code you build on: `src/ui/cube-context.tsx` and `cube-state.ts` (the
   provider and its state), `Scene.tsx` and `transforms.ts` (`cubieTransform` takes
   a `layer` string already, in front of the place), `Sticker.tsx`, `Screen.tsx`,
   `HeaderButtons.tsx`, `StatusLine.tsx`; `src/solver/solver.ts` (`createSolver`,
   `Solver`, `SolverWorker`), `src/test/fake-solver.ts`; `src/model/moves.ts`
   (`Move`, `applyMove`, `applyMoves`, `inverse`, `undo`, `FIXED_SCRAMBLE`),
   `notation.ts` (`moveSentence`), `speeds.ts` (`Speed`, `SPEEDS`), `geometry.ts`
   (`positionOf`), `facelets.ts`, `validate.ts`; `src/storage/prefs.ts` (`useSpeed`,
   `useRemembered` and its unused `show`); `src/test/dom.tsx` and the phase 2 DOM
   tests for the house style of a DOM test.
5. `../London/src/ui/play-context.tsx` for the `finally` discipline around an
   async engine call and the injected `createEngine`; `../London/src/ui/Study.tsx`
   for the auto-step effect (search `STEP_MS`).

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## What this phase delivers

Solve lists every move in the box with its letter and sentence, the five controls
and the three speeds work, the cube on screen turns the right way for every move,
Hint reveals one move at a time, the keyboard steps and plays, painting during a
solution discards it, and the solver's worker warms up when the app opens without
freezing the screen. A physical cube has been solved by following the screen.

## Settled facts, verified

- `createSolver()` returns `{ ready, solve(facelets) }`. `solve` resolves to the
  library's move strings (`"R"`, `"U'"`, `"F2"`), rejects with "The solver found no
  solution." on `failed`, and answers a solved cube with `[]` without sending it.
  `fakeSolver()` is ready at once and always answers `undo(FIXED_SCRAMBLE)`, which
  solves the `scrambled` cube (`applyMoves(solved(), FIXED_SCRAMBLE)`).
- `initSolver` takes about a second here. The worker posts `ready` when done.
- `applyMove(cube, move)` validates first and throws on an impossible cube. Every
  cube at any step of a solution is a valid cube, so it never throws in this phase
  unless something is wrong; do not catch it.
- The moves test pins the reference direction: after `R` on a solved cube, the
  front face's right column (green) is on the top face's right column. `R` is
  clockwise as seen from the right.
- `cubieTransform(position, cubie, layer)` puts `layer` first, so a rotation there
  turns about the cube's own centre. The cube's view transform is on the parent
  `.cube` element, so a layer rotation is in the cube's own frame, whichever view
  is showing.

## Settled decisions you do not revisit

- **Speeds** (spec 9.2), one table in `src/model/speeds.ts`:

  | Speed | Interval between moves | Turn duration |
  |---|---|---|
  | slow | 1600 ms | 900 ms |
  | normal | 800 ms | 450 ms |
  | fast | 400 ms | 220 ms |

  `SPEED_TIMES: Record<Speed, { interval: number; turn: number }>`. `Durations`
  gains `speedScale: number` (1 in the app, 0 in the tests), which multiplies both
  numbers. So the DOM tests step at once and the app steps at the speed.
- **One solution, one step counter, shared by Solve and Hint** (spec 9.3). The
  provider holds `solution: { start: Cube; moves: Move[]; revealed: number } | null`
  and `step: number`. Solve sets `revealed` to `moves.length`. Hint reveals one more
  when `step === revealed`, then steps forward. Solve pressed on a hint solution
  sets `revealed` to `moves.length` and changes nothing else.
- **The cube on screen is the cube at the current step**, always. Step forward
  animates `moves[step]` then applies it; step back animates `inverse(moves[step -
  1])` then applies that; jump to start sets the cube to `solution.start`; jump to
  end applies `moves.slice(step, revealed)` at once. Every step writes storage
  (spec 10). The solution is not stored (spec C15).
- **Painting during a solution discards it** (spec C12): `paint` sets `solution` to
  null and `step` to 0 and paints the cube as it is on screen. Reset also clears
  the solution. `changeView` works during a solution but not while a move turns.
- **Controls** (spec 9.2): five buttons named exactly "Jump to start", "Step back",
  "Play" or "Pause", "Step forward", "Jump to end", and a "Speed" fieldset with
  three radios "Slow", "Normal", "Fast". All five disabled while a move turns,
  while the view changes, and when there is no solution; Step back and Jump to
  start also when `step === 0`; Step forward, Play and Jump to end also when
  `step === revealed`. Keyboard: left and right arrows step, space plays or
  pauses; ignored while the colour menu is open and when the focused element is a
  button, input or select, so a focused button is not pressed twice.
- **Play** is an effect: while `playing` and not turning and `step < revealed`,
  wait the speed's interval, then step forward. It stops by itself at `revealed`.
  The interval is the gap between the START of one move and the START of the next;
  the turn is shorter than the interval at every speed, so a pause is seen.
- **Solve and Hint** (spec 7.2, 9.1) are enabled when `ready` (the validator),
  `solverReady`, no move is turning, the view is not changing and no solve is in
  flight. Disabled, their `title` says why: the validator's sentence, or "Getting
  ready..." before the worker is ready, or "Working it out..." while solving. The
  status line says "Solved in N moves." after Solve, "Your cube is already solved."
  when `solve` answers `[]`, and "The solver found no solution." if it rejects.
  The box says "Working it out..." while waiting.
- **The box** (spec 8, 9.1): the control row at the top; the fixed holding line;
  then one row per shown move: the number, the letter in a fixed-width chip, the
  sentence from `moveSentence`. The row for `moves[step]`, the move to make next,
  is marked with `--mark` and scrolled into view (`scrollIntoView?.({ block:
  'nearest' })`, guarded because jsdom has none). After the last shown step the
  box ends with "Done. Your cube is solved." In hint mode (`revealed <
  moves.length`) each row reads "Hint N: <chip> <sentence>" and the total is not
  shown. Before any solution: "Press Solve and the steps appear here."
- **The worker starts when the provider mounts**, once, through `createSolver`,
  and is terminated on unmount (`SolverWorker` gains an optional `terminate?()`).
  The provider takes `createSolver` as a prop, defaulting to the real one; the
  tests pass `fakeSolver`. One DOM test installs a throwing `Worker` on
  `globalThis` before `renderApp` and asserts it was never constructed.
- **`prefs.ts`'s unused `show`** goes if this phase does not use it (gate 1's
  watch item). Say in the notes which.
- No em dashes under `src/`. Australian English on screen.

## The layer turn, exactly

The cube on screen is drawn from the model. A move is: turn the nine cubies of the
layer as one, then apply the move to the model and draw the new state with no
rotation. The new drawing shows the same colours where the rotation left them, so
nothing jumps. Two details make this work.

**Which cubies, which axis, which sign.** A cubie is in a face's layer when its
position has that face's coordinate: `x = 1` for R, `x = -1` for L, `y = 1` for U,
`y = -1` for D, `z = 1` for F, `z = -1` for B. Put `inLayer(face, position)` in
`src/model/geometry.ts`. The rotation for a clockwise quarter turn of each face, in
the cube's own frame, is (derived from the screen's y running down, and checked
against the moves test's `R`):

| Face | Clockwise quarter turn |
|---|---|
| R | `rotateX(90deg)` |
| L | `rotateX(-90deg)` |
| U | `rotateY(-90deg)` |
| D | `rotateY(90deg)` |
| F | `rotateZ(90deg)` |
| B | `rotateZ(-90deg)` |

A `'` move negates the angle and a `2` move doubles it. Put this table in
`transforms.ts` as `layerTurn(move): string`, with a string test for all eighteen
moves. **The screen tells you if a sign is wrong**: the model is always right, so a
layer that turned the wrong way ends with a visible jump when the new picture is
drawn. Watch every one of the six faces turn once in the pane (step through a
solution that uses them, or seed a cube and press Step forward), and if any face
jumps at the end of its turn, flip that face's sign and try again. Record all six
in the notes as "R turns clockwise from the right, no jump" and so on.

**Why a web animation and not a CSS transition.** A transition on the cubie's
`transform` would also animate the way BACK when the move commits: the cubie's
transform goes from `rotateX(90deg) translate3d(...)` to `translate3d(...)` and a
transition would spin it back over the same duration, which is exactly the jump the
design avoids. Also, a CSS transition between transform lists with different
functions interpolates by matrix, which for a 180 degree turn (`R2`) is ambiguous.
So `Scene.tsx` uses the Web Animations API, with the same function list at both
ends:

```ts
// In Scene, when `turning` becomes { move, ms }: for each cubie in the layer,
const place = cubieTransform(position, cubie)            // no rotation
const from = `${layerTurn(move, 0)} ${place}`             // rotateX(0deg) ...
const to = `${layerTurn(move)} ${place}`                  // rotateX(90deg) ...
const animation = element.animate?.([{ transform: from }, { transform: to }],
  { duration: ms, easing: 'ease-in-out', fill: 'forwards' })
```

`fill: 'forwards'` holds the turned pose after the animation ends. When the
provider commits the move (`turning` goes back to null and the cube re-renders
from the new model), an effect cancels the animations, and the element falls back
to its plain `place` transform, which now carries the new colours in the same
places the pose left them. `element.animate` is guarded with `?.` because jsdom
has none; the DOM tests test the model's state after a step, never the pose.
`layerTurn(move, angleOverride?)` gives the same function with a given angle so the
two keyframes share the list. Under `prefers-reduced-motion: reduce`, pass 0 for
the duration.

**The provider owns the clock.** `stepForward` sets `turning = { move, reverse:
false }`, waits `SPEED_TIMES[speed].turn * durations.speedScale` with the
provider's `later`, then applies the move, advances `step`, clears `turning` and
writes storage. `stepBack` the same with `inverse(moves[step - 1])`. No
`animationend`, no `finished` promise: the animation is decoration and the timer is
the truth.

## Files

New: `src/ui/Box.tsx` and `box.css` (the box, its rows, the holding line, the
done line), `src/ui/Controls.tsx` (the five buttons and the speed radios),
`src/ui/useKeys.ts` (the keyboard, one `keydown` listener on `document`),
`src/ui/turn-layer.ts` (the web-animation helper above, so `Scene.tsx` stays a
drawing), `src/model/speeds.ts` grows the table, `src/model/geometry.ts` grows
`inLayer`, `src/ui/transforms.ts` grows `layerTurn`. Changed: `cube-state.ts`
and `cube-context.tsx` (the state and actions above), `Scene.tsx`, `Screen.tsx`
(the real box replaces the placeholder), `HeaderButtons.tsx` (Solve and Hint
wired, with titles), `StatusLine.tsx` if the wording needs it, `src/test/dom.tsx`
(`renderApp` passes `fakeSolver` and `speedScale: 0`; helpers `control(name)`,
`boxRows()`), `src/solver/solver.ts` (`terminate?`), `docs/testing.md` (the worker
guard is now real).

## Tests to write (spec C19 items 11, 12, 13, 15 for the speed)

- `speeds.test.ts`: the table's six numbers; every turn shorter than its interval.
- `transforms.test.ts` grows: `layerTurn` for all eighteen moves; the zero-angle
  form shares the function list with the full form.
- `geometry.test.ts` grows: `inLayer` gives nine positions per face, and the six
  layers of opposite faces do not overlap.
- `solving.dom.test.tsx` (fake solver, `speedScale` 0): seed `cuber.cube` with the
  scrambled cube's text before `renderApp`; Solve lists ten rows with the letters
  of `undo(FIXED_SCRAMBLE)` and the status says "Solved in 10 moves."; the first
  row is marked; Step forward changes the cube as `applyMove` says (compare
  `colourAt` on a few stickers against the model) and marks the second row; Step
  back undoes it; Jump to end shows "Done. Your cube is solved." and the cube is
  solved (every sticker its centre's colour); Jump to start restores the entered
  cube; Play reaches "Done" (`waitFor`); the controls' disabled rules at step 0 and
  at the end.
- `hint.dom.test.tsx`: Hint shows one row "Hint 1: ..." and steps the cube; a
  second press shows two; Solve then shows all ten with the rows renumbered as
  plain steps and the step counter unchanged.
- `discard.dom.test.tsx`: painting a sticker at step 3 clears the box back to
  "Press Solve and the steps appear here." and the cube keeps the step-3 colours
  plus the paint.
- `speed.dom.test.tsx`: the Fast radio writes `cuber.speed` and survives a
  remount; a stored nonsense value gives Normal.
- `worker-guard.dom.test.tsx`: a throwing `Worker` on `globalThis` is never
  constructed through `renderApp`; and `createSolver` with no argument DOES
  construct one (assert through the same throwing stub, in a string test of the
  adapter, so the real path is proved to reach `new Worker`).
- `keys.dom.test.tsx`: right arrow steps forward, left steps back, space plays
  and pauses; nothing happens while the colour menu is open.

## Steps

1. `git status` first. Clean, with the commit that added this chip on top of
   `cd40ab5`. If not, stop and report. Never stash, reset or discard.
2. Work through plan boxes 3.1 to 3.9 in order, ticking each in the plan in the
   same sitting it lands with green tests. A natural commit split: (a) the speeds
   table, `inLayer`, `layerTurn` and their tests; (b) the provider's solution,
   steps and worker, with the fake-solver DOM tests; (c) the box and the controls;
   (d) the layer animation; (e) Hint, the keyboard, the titles; (f) the reuse
   review's moves.
3. Drive it in the pane with `cuber-dev` on 5190, the tab FRONTED (the throttling
   hazard). Confirm the header's version. Then, recording each in the notes:
   - The theme toggle answers during the first second after load (the worker is
     warming up, the screen is not frozen). Record the time to `ready`.
   - Seed the scrambled cube: in the JavaScript tool, `localStorage.setItem(
     'cuber.cube', '<text>')` where the text comes from a scratch script printing
     `toText(applyMoves(solved(), FIXED_SCRAMBLE))`, then reload. Solve. Record the
     solution and the time it took.
   - Step forward through every move, watching the layer turn and checking for a
     jump at the end of each. All six faces must have been seen to turn: if the
     solution does not use one, seed a cube that needs it (apply one move to the
     solved cube in the scratch script) and Solve that. Record the six faces.
   - Play at each speed; Pause; Step back; Jump to start; Jump to end.
   - Hint three times from a fresh solve, then Solve.
   - Paint during a solution and see the box empty.
   - The keyboard: arrows and space.
   - `scrollWidth` against `innerWidth` at 800 by 1000 with the box holding the
     solution, both themes. Record `scrollHeight` too: phase 4 owns making it fit.
   - Then, with a real physical cube: scramble it, enter it, Solve, and follow the
     moves at slow speed to the end. If the cube is not solved at the end, stop:
     something is wrong in the sticker reading or the direction, and it is a
     finding, not a thing to work around. Ask Nick for a cube if you have none
     to hand and say so in the notes; the orchestrator can do this check at the
     gate.
   - Clear the pane's storage afterwards and reset the viewport.
4. Reuse and duplication review: one step path (`stepForward` and `stepBack` share
   one `turn(move, then)` helper), one place that decides whether a control is
   enabled, one keyframe builder, the sentence only from `moveSentence`, no second
   copy of the speed numbers. Refactor on the spot. Say what it found.
5. `npx vitest run` green under twenty seconds, `tsc -b` clean, `npx oxlint`
   silent, `npm run build` clean (the worker is now bundled: record its chunk).
6. Append the phase 3 notes to the plan, set the Progress row, update `CLAUDE.md`'s
   "Current state" and `docs/testing.md`. `README.md` if a command changed.

## Decision rules for the small things

- The letter chip is monospace at the app's font size in `--chip` on `--text`; the
  marked row uses `--mark`. Row numbers are tabular figures.
- Numbers in the status line are digits ("Solved in 19 moves."), not words.
- If a move is turning when Solve or Hint is pressed, the press is ignored (the
  buttons are disabled anyway).
- The speed radios are the trainer's fieldset style, inline in the control row;
  under 480 px of width the row wraps.
- If jsdom cannot do something, test the state and attributes and say what could
  not be tested.

## Out of scope

Scenes and the probe script (phase 4). The layout pass and the 6 px scroll at 800
by 1000 (phase 4, box 4.4). Tauri. The PWA. The photo feature. The beginner
method.

## If something does not fit

Stop that item, write the contradiction under the phase 3 notes, and carry on with
the items that do not depend on it. Ask Nick when a choice would change what a
person sees. Decide small matters of code shape yourself and say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- No em dashes under `src/`. Australian English. Spec section 3's words.

## Done when

The plan's phase 3 "Done when" line is true: a physical cube has been solved by
following the screen (or the notes say the orchestrator does that at the gate and
why), every DOM test of C19 is present, all six faces have been seen to turn without
a jump, every box 3.1 to 3.9 is ticked, and the phase notes are written. Finish with
a short report: what landed, the commit hashes, the six faces, the solve time and
the ready time, what you asked, and anything left for the orchestrator's review.
