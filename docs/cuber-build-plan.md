# Cuber - build plan

Version 1. Written 2026-09-11. Status: **Active**, phases 0 to 3 built and passed
their gates (0 on 2026-09-11, 1 to 3 on 2026-09-12). Nick's physical-cube check is
still open (phase 3's "Done when", carried to phase 5 box 5.6).

Read [the specification](cuber-spec.md) first. It says what the app does. This
document says what gets built, in what order, and how we know each part is finished.
Where the two disagree, the specification wins.

## How to use this document

Tick a box in the same sitting the item lands with green tests. A box is not ticked
because the code exists. It is ticked because the tests are green and the thing works
on screen. Review corrects any tick that does not survive scrutiny.

Each phase ends with something you can look at. No phase ends with "the groundwork is
laid". Each phase ends with one commit at least, on `main`.

## Rules for the builder

You are an Opus session in `C:\Users\nick2\Code\Cuber`. These rules bind for every
phase.

1. **Work on `main`, in this folder, and never push.** There is no worktree. Nick
   pushes.
2. **Never change anything under `../London`, `../SimpleChess` or `../Conquest`.** You
   read them and copy from them. If a copied file has a fault, fix the copy and record
   the fault in the phase notes so the orchestrator can carry it back.
3. **Ask Nick rather than guess.** When the specification and this plan do not say
   what to do, and the choice would change what a person sees or how the app behaves,
   stop and ask. Record the question and the answer in the phase notes. Small matters
   of code shape you decide yourself; say what you decided and why.
4. **Stop on a contradiction.** If the specification, this plan and the copied code
   cannot all be right, stop that item, write down the contradiction under the phase's
   notes, and carry on with the items that do not depend on it.
5. **Copy per C16.** A file this app does not change is byte-identical to its origin,
   plus one `Origin:` line at the top of its header comment. An adapted file says
   `Origin: ... adapted: <what changed>`. Comments in adapted files describe this app,
   not chess.
6. **Code quality from the first line** (spec 13.3). One home for every repeated
   snippet the moment it appears twice. `main.tsx` stays free of harness code. Close
   every phase with a reuse and duplication review of the new code and refactor on the
   spot, before the phase commit. Say in the phase notes what the review found, even
   when it found nothing.
7. **Look at what a person can see** (spec 15). Every UI-affecting phase drives the
   app in the pane, screenshots the scenes, and records the layout probe's output in
   its notes. Watch `scrollWidth` against `innerWidth`: a page that scrolls sideways is
   a regression, whatever else went right.
   **No screenshot files are required** (ruled at Simple Chess's gate 0, carried here
   at Cuber's gate 0). The pane's screenshot is looked at by the session and writes no
   file; the phase notes say what was seen and give the measured numbers. Never start
   a headless browser on this machine to make one: Edge signed a scratch profile into
   Nick's account when Simple Chess tried. The only screenshot file in this project is
   `packaged-eval.mjs --shot` against the Tauri window in phase 5, which has its own
   WebView2 profile.
8. **Tests with the code.** `npx vitest run` green and `tsc -b` clean before every
   commit. A regression test is shown red before its fix. No snapshots, no fake
   timers, no worker in the DOM suite (`docs/testing.md`).
9. **Words** (spec 3). One name for one thing. "The top face", never "the up face"
   on screen. No em dashes under `src/`. Australian English.
10. **Commits.** Short imperative subject line, a body that says why. End every
    message with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the
    model you actually are). PowerShell 5.1 mangles some multi-line messages: write
    the message to a scratch file and use `git commit -F` when in doubt.
11. **The dev server.** `npm run dev` serves on 5190 with `--strictPort`, so a clash
    fails loudly. Before any live check, confirm the served page is this folder's
    code: the version in the header is the one in `package.json`.
12. **Nick's own files are not yours.** Do not list, read or report anything under
    his user profile except what a step names. Clear the pane's storage after a drive
    that wrote to it.
13. **The solver is the library's, the validator is ours** (spec C5, C6). Never write
    a second face-turn implementation. Never let an unvalidated cube reach the
    library.

## Standing discipline, every phase

1. Write the phase's tests with the code.
2. Close with the reuse and duplication review, refactor, then commit.
3. Screenshot every UI-affecting change in the same phase, record the probe.
4. Tick boxes as items land. Write the phase notes: what was measured, what was
   decided, what was asked, what is left.

---

## Phase 0 - the scaffold

**Goal: `npm run dev` opens a page titled Cuber with the version and the theme
toggle, `npx vitest run` is green, `npm run build` produces `dist/`.**

Read first: `../SimpleChess/docs/simple-chess-build-plan.md` phase 0 (the same
scaffold, done a day earlier: if it has been built, copy from `../SimpleChess`
instead of from `../London` where the two differ, and say which you used);
`../London/package.json`, `vite.config.ts`, the three `tsconfig*.json`,
`.oxlintrc.json`, `.gitignore`, `index.html`, `src/main.tsx`, `src/index.css`,
`src/globals.d.ts`, `src/version.test.ts`, `src/ui/theme.ts`, `src/ui/app.css`,
`docs/testing.md`; `../Conquest/index.html`, `.node-version`, `.vscode/`.

- [x] 0.1 `git init`. `package.json`: name `cuber`, version `0.1.0`, `"type":
      "module"`, description "Solves a Rubik's Cube from its colours". Scripts:
      `dev` = `vite --port 5190 --strictPort`, `build` = `tsc -b && vite build`,
      `preview` = `vite preview --port 5191 --strictPort`, `test` = `vitest run`,
      `test:watch` = `vitest`, `lint` = `oxlint`, `tauri` = `tauri`. Dependencies:
      `react`, `react-dom`, `@tauri-apps/api` at the trainer's versions. Dev
      dependencies: the trainer's list. Pin the four testing-library and jsdom
      versions exactly, as the trainer does.
- [x] 0.2 `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: the trainer's,
      identical, plus `src/solver/vendor` excluded from `checkJs` if the trainer's
      config checks JavaScript (it may not; then nothing to add). `.oxlintrc.json`
      identical plus an ignore for `src/solver/vendor/**`. `.node-version` =
      `22.12.0`.
- [x] 0.3 `vite.config.ts`: the trainer's `define` for `__APP_VERSION__`, the server
      port from `PORT` or 5190 with `strictPort`, the two vitest projects (`string` in
      node for `src/**/*.test.ts`, `dom` in jsdom for `src/**/*.dom.test.tsx` with
      `src/test/dom-setup.ts`). No PWA plugin (phase 6).
- [x] 0.4 `.gitignore`: the trainer's (`node_modules/`, `dist/`, `src-tauri/target/`,
      `src-tauri/gen/`, caches, editor files, logs) plus Conquest's `dev-dist/`.
      `.vscode/extensions.json` and `settings.json` from Conquest, committed.
- [x] 0.5 `.claude/launch.json` with `cuber-dev` (`npm run dev`, port 5190) and
      `cuber-preview` (`npm run preview`, port 5191), in Conquest's shape with the
      `--prefix` flag pointing at this folder.
- [x] 0.6 `index.html`: Conquest's head (lang `en-AU`, viewport with
      `viewport-fit=cover`, theme-color `#16181c`, the two `mobile-web-app-capable`
      metas, the apple-touch-icon and favicon links) with the title Cuber. The icon
      files arrive in phase 5 and 6; the links may point at files not there yet.
- [x] 0.7 `src/main.tsx` identical, `src/index.css` identical, `src/globals.d.ts`
      identical, `src/ui/theme.ts` identical but for the key `cuber.theme`,
      `src/ui/app.css` cut to `.app`, `.app-header`, `.app-version`, `.nav-link`,
      `.theme-toggle`, `button`, `button:disabled` and the `@media (min-width: 900px)
      and (min-height: 700px)` block.
- [x] 0.8 `src/ui/App.tsx`: the header (name, version, theme toggle) and an empty
      `<main>`. No provider yet.
- [x] 0.9 `src/version.test.ts`: the trainer's. The two Tauri files do not exist
      until phase 5, so the two tests that read them are written now and marked
      `it.skip` with a comment naming phase 5, which unskips them.
- [x] 0.10 `src/test/dom-setup.ts` identical. `src/test/dom.tsx` with `renderApp`
      only, adapted to this app's provider as it arrives.
- [x] 0.11 `docs/testing.md`: the trainer's, adapted. Drop the content checkers and
      the board stub. Keep the two kinds, what is faked and why (the solver, from
      phase 3), and the rules, with the one slow solver test named as the exception.
- [x] 0.12 One DOM test: the header shows "Cuber" and the version, and the theme
      toggle flips `data-theme` on the root and writes `cuber.theme`.
- [x] 0.13 `README.md`: what the app is, the two ways to run it, the documents.
- [x] 0.14 `npm run dev`, `npx vitest run`, `tsc -b`, `npm run build` all work.

**Done when:** the dev page shows the header in both themes, the suite is green, and
`dist/` exists. Screenshot the header in both themes at 800 by 1000.

---

## Phase 1 - the model, the validator and the solver

**Goal: every pure module the app needs is in place and tested, the vendored solver
runs, and nothing has changed on screen.**

Read first: spec 6 and 7 in full; `../London/src/ui/prefs.ts` (the four helpers);
`../Conquest/src/ui/remembered-setup.ts` and its test (checking a stored value on
the way back). Get cubejs 1.3.2 with `npm pack cubejs@1.3.2` into a scratch folder
outside the repository (do not `npm install` it), and read `lib/cube.js` lines 1 to
120 (the tables), `fromString`, `asString`, `move`, `isSolved`, and `lib/solve.js`
`initSolver` and `solve`.

- [x] 1.1 `src/model/colours.ts`: `Colour` = the six names, `COLOURS` in the
      picker's order (red, green, yellow, white, blue, orange), `hexOf(colour)` per
      spec 4.3, `Face` = `U R F D L B`, `FACES` in the library's order, `faceWord`
      ("the top face" and the rest), `opposite(face)`. `Scheme` = a map from face
      to colour, `standardScheme()`, `schemeFrom(centres)` returning null when two
      centres share a colour.
- [x] 1.2 `src/model/cube.ts`: `Cube` = an array of 54 `Colour | null`. `blank()`
      (48 nulls, the standard centres), `solved(scheme)`, `paint(cube, index,
      colour | null)` returning a new array, `counts(cube)` per colour, `filled(cube)`
      as a number, `isComplete`. `CENTRES` = `[4, 13, 22, 31, 40, 49]`.
- [x] 1.3 `src/model/geometry.ts`: `indexOf(face, row, column)`, `placeOf(index)`
      returning `{ face, row, column }`, `positionOf(index)` returning `{ x, y, z }`
      from the table in spec 6.1, and the inverse `stickersAt(x, y, z)` returning
      the indices of that cubie's outside stickers. `CORNERS` (8) and `EDGES` (12)
      as arrays of facelet indices in the library's clockwise order, exactly the
      table in spec 6.1, with the piece names as comments. (Built with the names
      as data, `{ name, stickers }`: the validator reads a piece's solved colours
      from its name. See the phase 1 notes.) Tests: C19 item 1
      (the geometry's three stickers at (1, 1, 1) are the URF entry, and so on for
      all 20 pieces); `positionOf` and `stickersAt` are inverses for all 54.
- [x] 1.4 `src/model/facelets.ts`: `toFacelets(cube)` returning the 54-letter string
      or null (a blank sticker or a bad scheme), `fromFacelets(letters, scheme)`.
      Test: round trip on `solved(standardScheme())` and on a hand-made cube.
- [x] 1.5 `src/solver/vendor/`: `cube.js` and `solve.js` from the scratch package with
      the two edits of spec C5 and an `Origin:` line each; `LICENSE` copied;
      `cube.d.ts` with the seven members named in C5. Test (C19 item 8): the one
      slow test, `initSolver`, solve the fixed scramble of spec 15.1 and one random
      cube, apply each solution with `move`, assert `isSolved()`. Record the init
      time in the notes. **If the vendored files do not load under vitest or Vite,
      stop and report**: the fallback is `npm install cubejs` with Vite's CommonJS
      interop, but that is a spec change (C5) and is the orchestrator's call.
- [x] 1.6 `src/model/moves.ts`: `Move` = the eighteen strings, `MOVES`,
      `inverse(move)`, `applyMove(cube, move)` through `Cube.fromString(...).move
      (move).asString()` and `fromFacelets`, `applyMoves(cube, moves)`. Test: C19
      item 4; and `applyMoves(solved, scramble)` equals `Cube.fromString(solved
      letters).move(scramble).asString()` converted back (the library as oracle).
- [x] 1.7 `src/model/validate.ts`: `checkPartial(cube)` and `validate(cube)` per spec
      6.4, returning `{ ok: true, facelets }` or `{ ok: false, message, stickers }`
      where `stickers` is the indices to outline. The piece tables come from
      `geometry.ts`. Tests: C19 items 2 and 3. For item 3 build each failing cube
      from `solved()` by hand and assert the exact sentence. The two property tests
      use `Cube.random().asString()` from the vendored library (no `initSolver`
      needed for that).
- [x] 1.8 `src/model/notation.ts`: `moveSentence(move)` per spec 8. Test: C19 item 5.
- [x] 1.9 `src/model/views.ts`: `View` = `near | far`, `viewFaces(view)` returning
      the three faces at the top, front-left and front-right slots, and
      `VIEW_MOVEMENTS` = the two movements of spec C2 with their forward and reverse
      sentences (spec 5.2), as data. Test: C19 item 6.
- [x] 1.10 `src/model/cube-text.ts`: `toText(cube)` (54 characters, `wyrobg-`) and
      `fromText(text)` returning the cube or null for anything else. Test: C19 item 7.
- [x] 1.11 `src/solver/solver.ts`: `createSolver()` per spec 7.2 with the worker
      started through `new Worker(new URL('./worker.ts', import.meta.url), { type:
      'module' })`; `src/solver/worker.ts`. `src/test/fake-solver.ts`: answers
      `ready` at once and `solve` with a fixed list (the inverse of the spec's fixed
      scramble, reversed, so the scrambled scene's fake solution really solves it).
      String test of the adapter's message handling with a hand-made fake worker
      object (no real `Worker`).
- [x] 1.12 `src/storage/prefs.ts`: the trainer's `read`, `write`, `readOneOf`,
      `useRemembered` (identical text, origin line) and two hooks: `useSpeed`
      (`slow | normal | fast`, default `normal`) and `useRememberedCube` (reads with
      `fromText`, writes with `toText`). `src/storage/paths.ts`: `isDesktop` and
      `LOCAL_FOLDER = 'Cuber Data'` only.
- [x] 1.13 Reuse review: nothing in `src/model` or `src/solver` imports React or
      touches `window` or `document` (the worker in `solver.ts` is the one exception).
      Say so in the notes.

**Done when:** the suite is green with every string test of C19 items 1 to 8 present,
under twenty seconds. No screenshot: nothing changed on screen.

---

## Phase 2 - the cube on screen, and entering the colours

**Goal: the drawing's screen, minus the box. A person can paint all 54 stickers in
both views, see the counts and the validation sentences, reset, and find the cube
still there after a reload.**

Read first: spec 4, 5 and 6.4; `../Conquest/src/ui/styles.css` (safe-area padding
on `.board-page`, the 900 px breakpoint, `touch-action: manipulation`);
`../London/src/ui/Play.tsx` for the button row styles. (Version 1 of this plan
named Conquest's `taps.ts` as a long-press helper. It is not one: it decides what
a tap means in that game. Corrected at gate 1. The long-press helper is this app's
own, box 2.3.)

- [x] 2.1 `src/ui/cube-context.tsx`: the provider. State: `cube`, `view`, `selected`
      (the picker colour), `problem` (from `checkPartial`), `viewChanging`
      (`null` or the movement in progress). Actions: `paint(index, colour | null)`
      (the one home for painting; refuses a tenth of a colour; runs `checkPartial`;
      writes storage), `select(colour)`, `reset()`, `changeView()`. Options:
      `durations` (the view movement and pause, and later the turn, in ms; tests
      pass zeros), `createSolver` (phase 3). The remembered cube is read once on
      mount through `useRememberedCube`.
- [x] 2.2 `src/ui/Scene.tsx` and `scene.css`: `.scene` (square, `perspective: 1200px`)
      holding `.cube` (`transform-style: preserve-3d`) holding 26 `.cubie` elements
      positioned by `translate3d` from `positionOf`, each holding its outside
      `.sticker` elements rotated on to their faces with `data-sticker="<index>"`
      and `data-face`. The cubie size from `fit.ts` (2.4). The near view transform
      is about `rotateX(-28deg) rotateY(-38deg)`; the far view is the near view with
      the two movements of C2 applied, and the builder finds the exact rotation
      whose three visible centres are Down, Left and Back (check in the pane: yellow
      on top, orange front-left, blue front-right with the standard scheme).
      Stickers use `hexOf`; a blank sticker is the body colour with a dotted
      border; a sticker in `problem.stickers` has a red outline.
- [x] 2.3 `src/ui/Sticker.tsx`: left click paints with `selected`; `contextmenu`
      opens `ColourMenu` at the pointer; a pointer held 500 ms without moving more
      than 8 px opens the same menu (`src/ui/long-press.ts`, a small pure state
      machine fed explicit times, string-tested without fake timers).
      `src/ui/ColourMenu.tsx`: six swatches and
      "Clear", closes on choice, Escape or outside click; greyed swatches for
      used-up colours; one component for both openers.
- [x] 2.4 `src/ui/fit.ts`: `sceneSize(viewportWidth, viewportHeight)` per spec 4.1
      with the numbers it subtracts as named constants beside the layout numbers
      they come from; `cubieSize(sceneSize)` = floor(scene / 3.67). A hook
      `useSceneSize()` re-measures on resize and orientation change. String test
      with the three viewports of spec 15.2: 440, 440, about 300; never under 280.
- [x] 2.5 `src/ui/Picker.tsx`: the bordered box, "Colours", six swatches in the
      drawing's order with the count `n/9`, a ring on the selected, greyed at nine.
- [x] 2.6 The view change (spec 5.2): `changeView` runs the two movements one after
      the other, each a transition of the `.cube` transform over the movement
      duration, with the pause between, setting the status line's sentence for
      each, then the "Check the centres" sentence for two seconds. The button under
      the scene reads "Show the other side" or "Show the first side" and is
      disabled while `viewChanging`. Stickers ignore clicks while it plays.
- [x] 2.7 `src/ui/StatusLine.tsx`: the fill-in count, the problem sentence, the view
      sentences, "Ready. Press Solve." (spec 4). `src/ui/HeaderButtons.tsx`: Reset
      cube with its two-press guard (spec 5.4); Solve and Hint present and disabled
      until phase 3.
- [x] 2.8 `src/ui/Screen.tsx`: the column of spec 4 without the box (a placeholder
      `.box` of the minimum height saying "Press Solve and the steps appear here.").
      `App.tsx` wraps `<Screen />` in the provider. Safe-area padding, the narrow
      rules, buttons at least 36 px, `touch-action: manipulation` on the scene.
- [x] 2.9 DOM tests (C19 items 9, 10, 14, 15 for the cube, 16): stickers found by
      `[data-sticker]`; the right-click menu through `user-event`'s `pointer` with
      `{ keys: '[MouseRight]' }`; the long press is a string-tested function, not a
      DOM test; the view test reads `data-face` of the three centre stickers whose
      cubies are at the slots (or `viewFaces` through a `data-view` attribute on
      `.cube`), with the durations at 0.
- [x] 2.10 Drive in the pane: paint a full valid cube from a real scramble (apply
      the spec's fixed scramble on a physical cube, or read the `scrambled` scene
      once phase 4 exists; until then paint by hand), watch the counts, make a
      mirrored corner and see the outline and the sentence, fix it and see "Ready".
      Play the view change and confirm the far view's centres. Screenshots at 800
      by 1000 in both themes and both views. Record the probe.
- [x] 2.11 Reuse review and commit.

**Done when:** a complete valid cube can be entered in the pane and survives a reload,
and every validation sentence of spec 6.4 rules 2 to 5 has been seen on screen.

---

## Phase 3 - Solve, Hint, the box and the animation

**Goal: the whole drawing works. Solve writes the steps, the controls step and play,
the cube turns with each move, and Hint gives one move at a time.**

Read first: spec 7, 8 and 9; `../London/src/ui/play-context.tsx` (`createEngine`
injected, the `finally` discipline, why the value is not memoised); `../London/src/ui/
Study.tsx` (the auto-step effect and its speed, `STEP_MS`, and the phase 45 step
speed); `../London/src/ui/prefs.ts` `useStepMs`.

- [x] 3.1 The provider grows: `solver` (from `createSolver`, `fakeSolver` in tests),
      `solverReady`, `solution` (`null` or `{ moves, revealed }`), `step`, `playing`,
      `turning` (`null` or the move animating). Actions: `solve()` (validate, send,
      set `revealed` to all), `hint()` (solve if needed, reveal one more, step
      forward), `stepForward()`, `stepBack()`, `jumpToStart()`, `jumpToEnd()`,
      `play()`, `pause()`, `setSpeed()`. `paint` during a solution clears it (C12).
      Every step applies `applyMove` (or its inverse) to `cube` after the turn
      duration, then writes storage.
- [x] 3.2 The animation (spec 9.4) in `Scene.tsx`: while `turning`, the nine cubies of
      that layer are turned by a web animation (`element.animate`, two keyframes
      with the same function list, `fill: 'forwards'`) of the turn duration with
      `ease-in-out`; when the provider applies the move and clears `turning`, the
      animations are cancelled and the cubies are drawn from the new model with no
      rotation. Not a CSS transition: a transition would animate the snap back to
      zero when the move commits, and it interpolates a half turn by matrix, which
      is ambiguous (aligned with the phase 3 chip at gate 2). The provider owns the
      timer (one `setTimeout` of the turn duration; no animation event is relied
      on). Check every face's direction in the pane: a wrong sign shows as a jump
      at the end of the turn. Record "R clockwise from the right, no jump" and the
      other five in the notes.
- [x] 3.3 `src/ui/Box.tsx` and `box.css`: the control row (five buttons with
      accessible names "Jump to start", "Step back", "Play", "Pause", "Step forward",
      "Jump to end"; the speed radios), the holding line, the moves with the letter
      in a fixed-width chip and the sentence from `moveSentence`, the current step
      marked with `--mark`, the list scrolled to keep the current row in view, "Done.
      Your cube is solved." after the last step, "Working it out..." while waiting,
      and the Hint form ("Hint 1: ...") when `revealed` is less than the count.
      Keyboard: left and right arrows step, space plays or pauses, ignored while a
      menu is open.
- [x] 3.4 Play: an effect that steps forward at the speed's interval while `playing`
      and stops at the end, in the shape of the trainer's auto-step effect. The
      speeds from spec 9.2 as one table in `src/model/speeds.ts`.
- [x] 3.5 Header: Solve enabled when `validate` passes and the solver is ready, else
      disabled with the reason in its `title` and in the status line; Hint the same.
      Both say "Getting ready..." before `solverReady`. The status line says "Solved
      in N moves." and "Your cube is already solved." per spec.
- [x] 3.6 The worker in the real app: `createSolver` default builds the worker;
      confirm in the pane that the page is not frozen during the four to five
      seconds of `initSolver` (the theme toggle answers) and that Solve on the
      `scrambled` cube returns within a second. Record both times.
- [x] 3.7 DOM tests (C19 items 11, 12, 13, 15 for the speed): with `fakeSolver` and
      durations at 0. The worker guard: a throwing `Worker` on `globalThis` is never
      constructed.
- [x] 3.8 Drive in the pane with the real solver: (Everything but the physical
      cube, which needs one in a hand: see the notes. The six faces are proved by
      `turn-direction.test.ts` because the pane's throttling makes the walk
      unreliable.) enter a real scrambled cube from a
      physical cube, Solve, follow the moves on the physical cube at slow speed,
      and confirm it ends solved. Then Hint from a fresh entry, three presses. Then
      paint during a solution and see it discarded. Screenshots of the box with a
      solution at 800 by 1000 in both themes. Record the probe.
- [x] 3.9 Reuse review and commit.

**Done when:** a physical cube has been solved by following the screen, and every
DOM test of C19 is present.

---

## Phase 4 - scenes, the probe and the layout pass

**Goal: every screenshot of spec 15 can be set up from the address bar, the probe
exists, and the layout holds at all three viewports.**

Read first: spec 15; `../London/src/ui/Diagnostics.tsx` (dev-only pattern);
`../SimpleChess/src/dev/` if it exists by now (the same pattern, copy it);
`../London/scripts/packaged-eval.mjs`.

- [ ] 4.1 `src/dev/scenes.ts`: the six scenes of spec 15.1 as data, built through
      `applyMoves` and `paint` so they are always valid (or invalid in exactly the
      way named). `sceneFromLocation(search)` returning `{ scene, view, theme,
      speed }` or null, tested as a string test.
- [ ] 4.2 `useDevScene()` in `src/dev/use-dev-scene.ts`: returns null unless
      `import.meta.env.DEV` and a scene is present; otherwise applies the settings
      and the cube once; the `solution` scene waits for `solverReady` and presses
      Solve. `App` calls it once. Confirm by reading the built bundle that no scene
      text survives `npm run build`.
- [ ] 4.3 `scripts/probes/layout.js`: the expression of spec 15.3.
      `scripts/packaged-eval.mjs` identical (used in phase 5).
- [ ] 4.4 The layout pass: every scene at the three viewports, both themes, both
      views. Fix what is wrong. Record the probe for each viewport in the notes.
      The two numbers of C20 hold everywhere. Also (gate 2): at 800 by 1000 with
      the box holding five moves, the page must not scroll at all; phase 2 measured
      `scrollHeight` 1006 against 1000 with the empty box. Change the gaps, or the
      window height in spec 11.1, and record which.
- [ ] 4.5 Painting over a filled sticker (spec C9 as ruled at gate 3): the provider's
      `paint` refuses a colour at nine only for a BLANK sticker, and then puts "Red
      is already on nine stickers." in the status line until the next paint;
      `select` never refuses; the picker's swatch at nine shows its count in the
      faint style and stays enabled; the menu's swatches the same. Tests: the
      phase 2 entering test changes to match; a new case paints red over a blue
      sticker on a complete cube and reads rule 7's sentence; a blank sticker
      refuses with the new sentence.
- [ ] 4.6 Reuse review and commit.

**Done when:** the notes carry a screenshot list and the probe output for every
viewport, with no sideways scroll anywhere.

---

## Phase 5 - the Windows app and the installer

**Goal: an installer that installs Cuber for the current user, opens the window, and
uninstalls cleanly. Version 1.0.0.**

Read first: `../London/src-tauri/` in full, `scripts/check-uninstall-hook.mjs`,
`scripts/packaged-eval.mjs`, `src/version.test.ts`, spec 11.

- [ ] 5.1 `src-tauri/`: `tauri.conf.json` (productName "Cuber", identifier
      `com.nick.cuber`, devUrl 5190, the window per spec 11.1 with `"create":
      false`, nsis `currentUser` with `installerHooks`, `csp: null` as the trainer,
      no `plugins` block), `Cargo.toml` (package `cuber`, lib `cuber_lib`, no
      plugin crates), `build.rs`, `src/main.rs`, `src/lib.rs` identical but for
      `LOCAL_FOLDER` and the two plugin lines removed, `capabilities/default.json`
      with `core:default` only, `.gitignore`.
- [ ] 5.2 `installer-hooks.nsh` with one folder, and `scripts/check-uninstall-hook.
      mjs` adapted to one folder. Run the check: four cases, only the ticked
      non-upgrade case removes the scratch folder. Record the output.
- [ ] 5.3 `public/icon.svg`: the corner-on cube of spec 11.2. `npx tauri icon
      public/icon.svg` into `src-tauri/icons/`.
- [ ] 5.4 `version.test.ts`: unskip the two Tauri tests. Set 1.0.0 in all three
      files.
- [ ] 5.5 `npx tauri build`. Record the installer's path and size. Start the built
      executable with the debug port and run the probe through `packaged-eval.mjs`;
      `--shot` the window. Confirm the solver's worker starts inside WebView2 (Solve
      answers).
- [ ] 5.6 Nick: run the installer, open the app, enter his son's cube, solve it,
      close and reopen to see the cube remembered. Uninstall with the box ticked and
      confirm `%LOCALAPPDATA%\Cuber Data` is gone. Record the date here.
- [ ] 5.7 Acceptance walk: spec 17, item by item, each with what was done to check
      it, in `docs/acceptance.md`.
- [ ] 5.8 Reuse review, docs sweep (spec, plan, testing, README, CLAUDE.md
      current), commit.

**Done when:** spec 17 is green in `docs/acceptance.md`, with 5.6 dated by Nick.

---

## Phase 6 - the iPad Home Screen app (waits for Nick)

**Goal: the built app installs to an iPad Home Screen and solves a cube with no
internet. Not started until Nick asks.**

Read first: `../Conquest/vite.config.ts`, `src/ui/useUpdate.ts`, `UpdateBanner.tsx`,
`updates.ts` and `updates.test.ts`, `tools/make-icons.mjs`, `docs/conquest-deploy.md`,
`../SimpleChess/docs/simple-chess-deploy.md` if it exists, spec 12.

- [ ] 6.1 `tools/make-icons.mjs` adapted from Conquest's: reads `public/icon.svg`,
      writes `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180),
      `favicon-32.png`. Run it and commit the output. Add `sharp` and
      `vite-plugin-pwa` at Conquest's versions.
- [ ] 6.2 `vite.config.ts`: `VitePWA` with Conquest's settings and this app's
      manifest (spec 12), `devOptions` off.
- [ ] 6.3 `src/ui/useUpdate.ts` and `UpdateBanner.tsx` from Conquest, `updates.ts`
      reduced to one notice: "A new version is ready", "Your cube is remembered, so
      loading it loses nothing.", "Load it", "Not now". Rendered only when
      `!isDesktop()`.
- [ ] 6.4 Offline proof: `npm run build`, `npm run preview` on 5191, open it in the
      pane, stop the server, reload, enter and solve the `scrambled` scene's cube.
- [ ] 6.5 `docs/cuber-deploy.md`: Conquest's deploy document adapted for project
      `cuber`, repository `nick2468/Cuber`, domain `cuber.datacrafter.net`, with the
      Home Screen and aeroplane-mode steps. These are Nick's steps.
- [ ] 6.6 Nick: publish, add to the Home Screen, solve a cube in aeroplane mode.
      Record the date here.
- [ ] 6.7 Reuse review, docs sweep, commit.

**Done when:** 6.4 is proven here and 6.6 is proven by Nick.

---

## Later, if Nick asks

Not phases yet. Each needs its own design before a chip:

- **Entering the cube from a photo** (spec 16): one face at a time, a grid overlay,
  nearest-colour reading, user correction.
- **The beginner method** (spec 16, Q4): layer by layer in seven named stages.

## The order, and why

Phase 1 puts the whole model and the solver under test before a single sticker is
drawn, because the geometry table is the one place a wrong number would poison
everything after it, and the library is the cheapest possible oracle for it. Phase 2
draws the cube and gets the colours in, which is where a person first sees the app
and where the drawing is either followed or not. Phase 3 needs a valid entered cube
to solve, so it follows. Scenes and the probe come after the screen is complete so
they capture the real thing, and the Windows wrapper comes last because it touches
only build config. The iPad phase is parked by ruling.

## Progress

| Phase | State |
|---|---|
| 0 - the scaffold | Done, 2026-09-11 |
| 1 - the model, the validator and the solver | Done, 2026-09-12 |
| 2 - the cube on screen, and entering the colours | Done, 2026-09-12 |
| 3 - Solve, Hint, the box and the animation | Done, 2026-09-12 (the physical cube waits for Nick) |
| 4 - scenes, the probe and the layout pass | Not started |
| 5 - the Windows app and the installer | Not started |
| 6 - the iPad Home Screen app | Waits for Nick |

## Phase notes

Each phase appends its notes here as it closes: what was measured, what was decided
and why, what was asked of Nick and what he said, what the reuse review found, and
what is left. The orchestrator's review adds its gate findings under them.

### Phase 0 - builder notes (2026-09-11)

**Which origin.** Simple Chess had finished the same scaffold and passed its review gate
0 the same day, so, per the chip, files were copied from `../SimpleChess` where it
differs from London. It differs in two ways that matter: `version.test.ts` carries
`/// <reference types="node" />` (London's copy compiles only because another London
test pulls node types in), and `theme.ts`'s comment no longer speaks of the trainer's
progress file. Simple Chess's gate 0 rulings were taken as binding here too (see
Screenshots).

**Copied, and from where.**

- Byte-identical, no origin line (JSON has no comment): `tsconfig.json`,
  `tsconfig.app.json`, `tsconfig.node.json` (London); `.vscode/extensions.json`,
  `.vscode/settings.json`, `.node-version` (Conquest).
- Identical plus the origin line, each diffed against London with that line removed:
  `src/main.tsx`, `src/index.css`, `src/globals.d.ts`, `src/test/dom-setup.ts`.
- Adapted, each saying what changed in its origin line: `vite.config.ts` (port 5190 and
  `strictPort`, the port comment lists Simple Chess's 5185 and 5186),
  `src/ui/theme.ts` (key `cuber.theme`), `src/ui/app.css` (Simple Chess's cut, which
  is exactly plan 0.7's list; `button:disabled` is London's `drill.css` line 132),
  `src/version.test.ts` (the two Tauri tests skipped until phase 5), `src/ui/App.tsx`,
  `src/test/dom.tsx`, `index.html` (Conquest's head with Cuber's title, name and
  theme colour `#16181c`), `.claude/launch.json` (Conquest's shape), `docs/testing.md`
  (an origin paragraph).
- `.oxlintrc.json` is London's plus `"ignorePatterns": ["src/solver/vendor/**"]`
  (plan 0.2). `.gitignore` is Simple Chess's (London's plus Conquest's `dev-dist/` and
  the `.vscode/settings.json` exception) without `public/engine/`, which this app does
  not have. `package.json` is the trainer's list without chess, the engine, `ts-fsrs`,
  `react-markdown` or the two Tauri plugins, and with no `engine` or `icons` script,
  so nothing dead is left behind. The four exact pins stay exact.
- `tsconfig.app.json` has `allowJs` but not `checkJs`, so nothing was added for the
  vendor folder (chip rule; phase 1 handles it).

**Measured.**

- `npm install`: 138 packages, 0 vulnerabilities.
- `npx vitest run`: 2 files, 4 passed and 2 skipped (the two Tauri version tests),
  1.6 seconds warm. The first run after `npm install` took 14.1 seconds, 10.8 of them
  jsdom starting.
- `tsc -b` clean. `npx oxlint` reports nothing. `npm run build`: 18 modules,
  `dist/index.html` 1.24 kB, JavaScript 220.45 kB (68.91 kB gzipped), CSS 2.65 kB.
- Red first: `shell.dom.test.tsx` asserted `simple-chess.theme` first and failed with
  "expected null to be 'light'". Then it was fixed to `cuber.theme` and passed.
- The pane at 800 by 1000, dev server `cuber-dev` on 5190. The served page read "Cuber
  v0.1.0" with the title "Cuber", which is this folder's `package.json`, so it was this
  app. Dark: `data-theme` dark, `cuber.theme` = dark, ground rgb(22, 24, 28), the
  version at 12.8 px in rgb(122, 128, 138) (`--text-faint`). After the toggle:
  `data-theme` light, `cuber.theme` = light, ground rgb(244, 242, 238), the button
  reading "Dark" named "Switch to the dark theme". Pressed again, back to dark.
  `scrollWidth` 800 against `innerWidth` 800 in both themes. The pane's storage was
  cleared afterwards and the viewport reset.
- `git -C ../London status` and `git -C ../Conquest status` show only what was there
  before (`grep.exe.stackdump`, `tsconfig.tsbuildinfo`, as Simple Chess's notes
  recorded). `../SimpleChess` is clean.

**Screenshots.** Both themes were screenshotted in the pane at 800 by 1000 and looked
at: the name, the faint version beside it, the toggle at the right behind its rule, and
the empty page under the header's line. **There are no screenshot files, so there are
no names to give.** The chip asked for "the two screenshots' names", but the pane
writes no file, and Simple Chess's gate 0 ruled that no screenshot files are required
and that no session starts a headless browser on this machine (Edge signed a scratch
profile into Nick's account there). This chip predates that ruling reaching Cuber's
plan. The orchestrator may want to copy the ruling into rule 7 here.

**Decided (code shape).**

- The shell test reads the version as `__APP_VERSION__`, not a fresh read of
  `package.json`, for Simple Chess's reason: `version.test.ts` already holds the
  constant to the file. It also checks the app opens dark.
- `vite.config.ts` sets `strictPort: true` as well as the `dev` script's
  `--strictPort`. Plan 0.3 asks for it, and it makes a bare `npx vite` fail loudly too.
- `App.tsx`'s comment says Reset cube, Solve and Hint join the header in phases 2 and
  3 (spec 4). The `nav` carries no `aria-label`, as in Simple Chess.

**A mistake of mine, recorded so it is not repeated.** The first `npm install` was run
as `npm install --prefix C:\Users\nick2\Code\Cuber`. npm took the path as a package as
well as the prefix, and added `"cuber": "file:"` to `dependencies`, with
`node_modules/cuber` a link back to this folder. The line was removed and a plain
`npm install` pruned the link; the lock file has no `file:` entry. A `Remove-Item` of
the link was tried first and stopped at a prompt. That was lucky, because a recursive
delete through that link would have deleted the repository. Run npm from the folder,
not with `--prefix` and a path. (`launch.json`'s `--prefix` is safe: it comes before
`run`.)

**Contradictions.** None that stopped an item. The chip's screenshot names are covered
above.

**Asked of Nick.** Nothing.

**Reuse review.** Every colour is in `src/index.css`: a search of `src/` for hex and
`rgb(` finds only that file. No em dashes under `src/`. The version is read from
`package.json` in two places, `vite.config.ts` (the define) and `version.test.ts`, both
copies, and the new test uses the constant. The toggle label's ternary has one home
(`switchTo`). `App.tsx`, `dom.tsx` and `shell.dom.test.tsx` repeat Simple Chess's text
with Cuber's words, which is the copy rule (C16), not duplication inside this app.
Nothing to refactor.

**Left.** Nothing in phase 0. For the orchestrator: the screenshot-file ruling above.

### Gate 0 findings (orchestrator, 2026-09-11)

- **Verified from the repository, not from the notes.** `npx vitest run`: 4 passed,
  2 skipped, 1.5 seconds. `tsc -b` clean, `npx oxlint` silent, `npm run build` 18
  modules with `dist/index.html`. Every file the notes call identical diffs clean
  against its origin with the `Origin:` line removed (`main.tsx` differs by the blank
  line after its comment, the same two-line form Simple Chess's gate accepted). Every
  adapted file's diff against Simple Chess is exactly the change its origin line
  names. No em dashes under `src/`. `package.json` and the lock file carry no
  `file:` entry and `node_modules/cuber` is gone, so the `--prefix` incident is
  cleaned up. `../London`, `../Conquest` and `../SimpleChess` are untouched.
- **Both commits carry the trailer** naming Claude Opus 5, with bodies that say why.
- **The screenshot-file ruling is carried into rule 7** above. Future chips ask for
  what was seen and the numbers, never for file names.
- **The `--prefix` hazard is now in CLAUDE.md's standing hazards.** The builder's
  own record of it is the reason: a recursive delete through that link would have
  deleted the repository, and only a prompt stopped it.
- **Passed.** Phase 1 is next; its chip follows this gate.

### Phase 1 - builder notes (2026-09-12)

**Measured.**

- `initSolver`: 1,045 to 1,070 ms over three runs, timed in node by a scratch script
  that imports the vendored files. The slow test (`src/solver/vendor.test.ts`, both
  solves included) took 1.10 to 1.12 seconds over three runs. **Spec C10, CLAUDE.md's
  standing hazard and `testing.md` all said four to five seconds; this machine takes
  about one.** `testing.md` now gives the measured figure. The spec and the hazard are
  the orchestrator's to reword. The worker is still right: a second on the main thread
  is a frozen screen, and an iPad will be slower.
- Solutions: the fixed scramble solves in 19 moves, `D R' U2 F2 R2 U' R D L2 B2 U2 R2
  L2 U F2 U R2 B2 U2`, in 7 to 9 ms; random cubes in 20 to 22 moves, in 5 to 24 ms.
- The suite warm: 15 files, 95 passed and 2 skipped (the Tauri version tests), 1.9
  seconds. `tsc -b` clean, `npx oxlint` silent.
- `npm run build`: 18 modules, the same as phase 0, because nothing the app runs
  imports the solver yet, so the worker is not in the app's bundle. So the worker's
  bundling was checked separately. A scratch Vite build (config and output in the
  session scratchpad, nothing in the repository) took `src/solver/solver.ts` as its
  entry: 6 modules, a 40.32 kB worker chunk and a 2.60 kB solver chunk, and **no
  warning of any kind**, CommonJS and `this` included. The built worker chunk, loaded
  in node with a stand-in `self`, posted `ready` after 1,041 ms and answered the fixed
  scramble with the 19 moves above 12 ms later. Phase 3 box 3.6 confirms it in the
  pane.
- The property tests passed on their first run: all 200 random library cubes validate
  with facelets equal to the library's own string, and all 100 cubes with two
  differently coloured stickers swapped are refused. No counterexample to spec 6.4.
- The library agrees with spec 6.1. `cornerFacelet` and `edgeFacelet` in `cube.js`
  (lines 42 to 90) match all 8 corners and 12 edges of the spec's table, and the
  geometry test proves it against the library on 200 random cubes.

**The vendoring edits, exactly.** `diff` against the `npm pack` output shows these and
nothing else. `LICENSE` is byte-identical.

- `cube.js`: line 1, `(function() {`, became two lines, the origin comment and
  `export default (function() {`. The globals block inside the wrapper,
  `if (typeof module !== "undefined" && module !== null) { module.exports = Cube; }
  else { this.Cube = Cube; }`, became `return Cube;`. Its `//# Globals` comment stays.
- `solve.js`: two lines before line 1, the origin comment and
  `import CubeLibrary from './cube.js';`. Line 5, `Cube = this.Cube || require('./cube');`,
  became `Cube = CubeLibrary;`.

**A contradiction in spec C5, decided.** C5 says the globals block "is replaced by
`export default Cube`". It cannot be: the block is inside the outer
`(function() {...}).call(this)` wrapper, where an `export` is a syntax error and `Cube`
is a local. The smallest edit that works is the one above: the wrapper is exported and
returns `Cube`. For `solve.js`, C5's `import Cube from './cube.js'` cannot use the name
`Cube`, because the wrapper's `var` list declares its own `Cube`, which would shadow the
import. So the import is `CubeLibrary`, assigned inside the wrapper as C5 says. Both
wrappers still end `.call(this)`; `this` is undefined in an ES module and neither
wrapper reads it any more. The orchestrator may want C5's wording to match. C5 also
says `cube.d.ts` "declares the five members" and then lists seven; the plan and chip
say seven, and seven are declared.

**Decided (code shape).**

- **Pieces carry their names as data**, `{ name, stickers }`, where plan 1.3 said names
  as comments. A piece's name gives its solved colours (each letter is the face of the
  sticker in that place), which the validator uses, and the tests compare the library's
  cubes against the names rather than a retyped table. Each entry is written as spec
  6.1 writes it, `piece('URF', 'U9 R1 F3')`, and `sticker('U9')` is exported for the
  tests.
- **`applyMoves` runs `validate`**, not only `toFacelets`, before the library. The chip
  asked for a throw when `toFacelets` is null. This throws then too, and also for a
  complete but impossible cube, which plan rule 13 says must never reach the library.
  The cost is one validation per move. `applyMove` is `applyMoves` with one move.
- **`FIXED_SCRAMBLE` and `undo(moves)` live in `moves.ts`**, shared by the slow test,
  the moves test, the fake solver and, from phase 4, the scenes.
- **The validator's order.** `validate` runs rules 2 to 5, then 6 to 12. Rule 1 runs
  only in `checkPartial`. On a complete cube, any colour off nine means one is over
  nine, so rule 1 first would make rule 7 unreachable. Rule 1's guard sentence comes
  from the same function as rule 7's: "There are ten red stickers. A cube has nine of
  each." It outlines every sticker of that colour.
- **Rule 4 names the two colours in the order of `FACES`** (U before D, R before L, F
  before B): "white and yellow", "red and orange", "green and blue".
- **Rule 7 lists the colours over nine first, then those under**, each group in the
  picker order, with counts as words up to twenty.
- **Rules 6, 7, 10, 11 and 12 outline no stickers** (`stickers: []`). No single sticker
  is wrong, and 48 red outlines on a blank cube would be noise. Rules 8 and 9 outline
  every place holding a doubled piece. Phase 2 decides what the screen does with them.
- **Rule 5 can never fire for an edge.** Once rules 3 and 4 pass, any two different,
  non-opposite colours are a real edge. The edge sentence is there because the spec
  has it; its test is the corner case.
- **The sticker colours live in `colours.ts`** (`hexOf`, plan 1.1), not in `index.css`.
  Its comment says why: they belong to the cube, not the theme. Phase 0's review said
  every colour is in `index.css`, and that is no longer true, on purpose.
- **`Speed` and `SPEEDS` are in a new `src/model/speeds.ts`**, the file phase 3 box 3.4
  fills with the speeds table.
- **`prefs.ts` exports the four helpers**, which the trainer keeps private, so
  `theme.ts` can use them. `useRemembered`'s `show` is kept, with its comment reworded
  (it spoke of a resumed chess game). Nothing uses `show` yet. The hooks return
  `{ speed, setSpeed }` and `{ cube, setCube }`, the trainer's hook shape.
- **The solver adapter** pairs replies with requests first in, first out, because a
  worker handles one message at a time. A solved cube resolves to `[]` without being
  sent, and `failed` rejects with "The solver found no solution." `solve` stays
  `Promise<string[]>` as spec 7.2 says; the provider turns the strings into moves in
  phase 3.
- **`worker.ts` reads `self`**, the worker's own global. Spec C17 names only
  `solver.ts`'s `Worker` as the exception; the worker file is the other side of it.
- **The tsconfig is unchanged.** `allowJs` without `checkJs` means `tsc` parses the
  vendored JavaScript and checks none of it, and `cube.d.ts` beside `cube.js` is what
  TypeScript imports read.

**The gate 0 follow-up** landed as its own commit, "Read and write the theme through
the storage helpers". `theme.ts` reads with `readOneOf(KEY, ['dark', 'light'], 'dark')`
and writes with `write`, so anything but `light` is still dark, as before. The shell
DOM test passes unchanged.

**Reuse review.**

- The piece tables exist once, in `geometry.ts`. The validator imports them, and the
  tests compare against their names.
- The colour letters exist once (`colours.ts`, used only by `cube-text.ts`). The face
  letters come from the scheme in one place (`facelets.ts`, through `faceOf`). The
  scramble is in `moves.ts` only, the solved facelets in `facelets.ts` only.
- **Two finds, fixed in their own commit.** `cube-text.test.ts` retyped the centre
  indices, and now imports `CENTRES`. (`cube.test.ts` keeps the literal numbers on
  purpose: it pins the spec's.) In `validate.ts` the two "same piece twice" sentences
  sat in an array beside `KINDS`, which also carried an unused `plural` field. The
  sentences moved into `KINDS` and `plural` went.
- Box 1.13: nothing in `src/model` imports React or touches `window`, `document` or
  storage (searched). In `src/solver` the only browser globals are `solver.ts`'s
  `new Worker` and `worker.ts`'s `self`.
- No em dashes under `src/`, the vendored files included.

**Asked of Nick.** Nothing.

**Left.** Nothing in phase 1. For the orchestrator: C5's two edit descriptions and its
"five members", and the `initSolver` time in spec C10 and CLAUDE.md's standing hazard.

### Gate 1 findings (orchestrator, 2026-09-12)

- **Verified from the repository, not from the notes.** `npx vitest run`: 15 files,
  95 passed, 2 skipped, 2.3 seconds warm (15 seconds on the first cold run, all of
  it jsdom starting, as `testing.md` warns). `tsc -b` clean, `npx oxlint` silent,
  `npm run build` 24 modules with no warning. No em dashes under `src/`. All seven
  commits carry the trailer and a body that says why.
- **The vendored files diff against the `npm pack` tarball exactly as the notes
  say**: two lines in `cube.js` (the exported wrapper and `return Cube;`), three in
  `solve.js` (the origin line, the `CubeLibrary` import and its assignment).
  `LICENSE` is byte-identical.
- **Both findings the builder raised were right, and are now corrected.** Spec C5's
  edit descriptions could not have compiled; C5 now describes the edits that do,
  and says seven members, not five. The start-up time is about a second here, not
  four to five: spec C5, C10 and 7.2, CLAUDE.md's hazard, `cube.d.ts` and
  `vendor.test.ts` now say so. The worker stays, for the reason the builder gave.
- **Read as code.** The validator's twelve rules match spec 6.4 sentence for
  sentence, and its orientation reading (clockwise steps from the Up-or-Down
  sticker; the first-named face for a middle edge) is the library's own, which is
  why the 200-cube property test can pass. `applyMoves` validating before every
  library call is stricter than the chip asked and is the right reading of rule 13.
  Pieces carrying their names as data is better than the plan's comments: the
  validator and the tests both read them. The `R` direction test pins the animation's
  reference for phase 3.
- **One thing to watch, not a fault.** `useRemembered` keeps the trainer's `show`
  helper and nothing uses it. If phase 3 does not use it, phase 3's reuse review
  removes it.
- **Passed.** Phase 2 is next; its chip follows this gate.

### Phase 2 - builder notes (2026-09-12)

**What is on screen.** The header (the name and version, Reset cube, Solve, the Hint
bulb, the theme toggle), the picker at the top right, the cube corner-on with its
centres filled in, "Show the other side" under it, the status line, and the box
saying "Press Solve and the steps appear here." Solve and Hint are there and
disabled, so the status line can say "Ready. Press Solve." while Solve does nothing.
That is one phase long, as the chip says.

**The view angles.** The chip's `rotateX(-28deg) rotateY(-38deg)` was kept: in the
pane the near view shows white on top, green at the front-left and red at the
front-right. The far view adds `rotateY(-90deg) rotateZ(180deg)` and shows yellow,
orange and blue. Read from the screen with `elementFromPoint`: D33 at the top, L40 at
the front-left, B49 at the front-right, which is `viewFaces('far')`.

**The cube did not fit its scene, so the divisor changed. This contradicts spec 4.1.**
Spec 4.1 says the cubie is the scene divided by 3.67. Measured in the pane at 800 by
1000, the cube's silhouette was 552 by 571 inside a 440 scene, 1.26 and 1.30 times too
big: it covered the view button and the status line. 3.67 is three cubies and their
gaps laid flat; turned corner-on behind a 1200 px perspective the cube needs about 30%
more. The divisor is now 4.8, which is 3.67 times that 1.30, and the cube measures 418
by 433 inside the 440 scene with 14 px clear above the view button. A 440 scene gives
a 91 px cubie, not spec 4.1's 120, and 91 px is still far more than the 36 px a finger
needs. The orchestrator should rule on spec 4.1's two numbers.

**The cube also hung low in its box**, by 22 px at a 91 px cubie: the tilt brings the
bottom corner towards the viewer and the perspective magnifies it. `Scene.tsx` lifts
the cube by a quarter of a cubie (`HANGS_LOW`) so the silhouette sits in the middle.
Both numbers carry their measurement in their comment.

**Measured in the pane.** The dev server on 5190, the header reading v0.1.0, so it was
this folder's code.

| Viewport | Scene | Cubie | scrollWidth against innerWidth |
|---|---|---|---|
| 800 by 1000 | 440 | 91 | 785 against 800 |
| 820 by 1180 | 440 | 91 | 820 against 820 |
| 1180 by 820 | 300 | 62 | 1180 against 1180 |

C20's two numbers hold at all three: nothing scrolls sideways and the scene is square
and never under 280. At 1180 by 820 the page is 846 tall against an 820 window, so it
scrolls down a little, which spec 4.1 allows.

**What was driven, with real clicks.** Painting with the picker and watching the
swatch counts; the mirrored URF corner (white on U9, green on R1, red on F3) showing
"That corner is not a real piece. Check its three colours." with those three stickers
outlined, and coming right when repainted; the right-click menu opening at the
pointer, painting blue, and closing; Escape closing it with nothing painted; a reload
keeping all four painted stickers and their counts; Reset arming to "Press again to
clear" with the cube untouched, then clearing to the blank cube with its centres, back
in the near view; the two movements with their sentences, the view button and the
stickers disabled while they played, then "Check the centres: they should match your
cube."; both themes. Screenshots were looked at in the pane, no files (rule 7). The
pane's storage was cleared afterwards and the viewport reset.

**A hazard met, and CLAUDE.md already names it.** The Browser pane was hidden, and a
hidden pane throttles animation. The first far-view check read the near view's faces
3.2 seconds in, and two screenshots half a second apart showed the cube in different
poses, although the provider's state and its sentences were right the whole time.
Fronting the tab and polling gave the right answer immediately. Nothing in the code
changed. For phase 3: the layer-turn animation cannot be judged in a hidden pane.

**The pane does not dispatch `resize` to the page.** Its viewport emulation changes the
window without one, so the scene kept its old size until a reload, which is why
1180 by 820 first measured 440. `useSceneSize` is right: a hand-dispatched
`window.dispatchEvent(new Event('resize'))` took the scene from 440 to 300 at once, and
a reload at that viewport gives 300 with a 62 px cubie. A later phase measuring the fit
rule in the pane must reload after resizing.

**Decided (code shape).**

- **The provider is two files.** `cube-state.ts` holds the durations, the shape of the
  state, the context and `useCube`; `cube-context.tsx` holds only `CubeProvider`. One
  file exporting both a component and a hook makes oxlint's `only-export-components`
  warn, and the chip's bar is a silent oxlint.
- **The problem, the status sentence and the outlined stickers are worked out during
  the render**, not held in state as the chip's 2.1 has them. They are a reading of the
  cube, and a stored reading can drift from the cube it describes.
- **`durations` gained `arm`** (3000 ms), so the reset test can watch the arming lapse
  without a fake timer.
- **A complete cube that breaks a whole-cube rule shows that rule's sentence**, not the
  count, which would say "48 of 48 done" and mean nothing. Its stickers are outlined
  from the same verdict.
- **Stickers are buttons**: they take a click, a right click and a long press, they are
  disabled while the view turns, and each is named "the top face, row 3, column 3,
  white" for a test and a screen reader.
- **Painting happens on the click, not on pointer-up.** Every browser and jsdom agree
  about clicks; the pointer events only notice a long press, and a press that opened
  the menu sets a flag that skips the click behind it.
- **The colour menu has no shadow.** A shadow colour would be a seventh colour, and
  `index.css` is a byte-identical copy this app must not add variables to (C16). A
  strong border does the same work.
- **The picker's "Colours" is a `<legend>`** at the top of the fieldset. The drawing has
  the word at the bottom right of the box; a legend is how a group of controls is
  named for a screen reader, and the chip asks for a fieldset.

**What jsdom could not test.** It has no layout and no CSS, so nothing about how the
cube looks is in the DOM tests: they drive the state and read the attributes
(`data-sticker`, `data-face`, `data-view`, `data-stage`, the accessible names, the
disabled flags). The transform strings are string-tested, the fit rule is string-tested
with the three viewports, and the look was checked in the pane. The long press is a
string-tested state machine; the DOM tests cover the right-click menu, which opens the
same component.

**Asked of Nick.** Nothing.

**Reuse review.** One `paint`, in the provider, reached by the click, the menu and the
long press alike. One `ColourMenu` for both openers. One `cubieTransform`, one
`stickerTransform` and one `viewTransform`, all in `transforms.ts`, with the
face-to-transform table written once. Colour literals live only in `index.css` (the
copy), `hexOf` and its test, and `--cube-body` in `scene.css`, which is the one new
literal the chip allows. No em dashes under `src/`. The review's find was the
provider file exporting a hook and a component together, split as above. Nothing else.

**Left.** For the orchestrator: spec 4.1's cubie divisor and its "cubie 120" line, now
measured wrong; and whether the picker's label should sit where the drawing has it.

### Gate 2 findings (orchestrator, 2026-09-12)

- **Verified from the repository and the pane, not from the notes.** `npx vitest run`:
  23 files, 126 passed, 2 skipped, 4.7 seconds. `tsc -b` clean, `npx oxlint` silent,
  `npm run build` 40 modules, no warning. No em dashes under `src/`. All three
  commits carry the trailer and a body that says why. Every phase 2 box is ticked.
- **Driven in the pane at 800 by 1000, the served header reading v0.1.0.** The near
  view's visible centres read U, F, R by `elementFromPoint` (white, green, red on
  screen); the far view's read D and B by the same test and yellow, orange, blue by
  eye, with "Show the first side" on the button. A click painted D1 red and the swatch
  read 2/9; a right click opened the menu at the pointer and Escape closed it; Reset
  armed to "Press again to clear" with the cube untouched, then cleared to the blank
  cube in the near view with the stored text
  `----w--------r--------g--------y--------o--------b----`. `scrollWidth` 785 against
  800 in both themes.
- **The pane's throttled transition is real and the builder's note is right.** The
  provider reached the far view in 2.8 seconds while the cube on screen was still
  turning for several seconds more; the computed transform caught up and the far
  view was then correct. Nothing in the code is wrong. Carried into CLAUDE.md's
  hazards, with the missing `resize` event.
- **Spec 4.1's cubie size was wrong, as the builder measured.** The spec now says the
  scene divided by 4.8 (91 px at 440), the quarter-cubie lift, and why. The
  builder's `fit.ts` and `Scene.tsx` comments already carry the measurements.
- **One fault found and fixed at the gate: the 4 px gap between cubies was a hole
  through the cube.** In the light theme the page ground showed through it as bright
  white lines across every face, which read as a wireframe rather than a cube. The
  gap is a number of mine (spec 4.1), so the fix is mine: `GAP` is 0, the dark
  plastic between stickers is each sticker's own 6 px inset, the transform test's
  numbers follow, and the spec's table says why. Looked at in both themes: a solid
  cube. Landed in this gate's commit.
- **The picker's label stays a legend at the top of the box.** The drawing has the
  word at the bottom right; a legend is how a group of controls gets its name for a
  screen reader, and the label's position inside its box is not the part of the
  drawing that carries the design. Nick can reverse this with a word.
- **The page scrolls 6 px at the Windows window size** (`scrollHeight` 1006 against
  1000). Spec 4.1 allows a downward scroll, but the window should open showing the
  whole page. Phase 4's layout pass (box 4.4) now says so: with the box holding
  five moves, either the window height in spec 11.1 or the gaps change so nothing
  scrolls at 800 by 1000.
- **Read as code.** One `paint` path, one `ColourMenu`, three transform functions in
  one file, the problem and the status worked out during the render rather than
  stored. The provider split into a state file and a component file is a fair answer
  to the lint rule. The long press as a state machine fed explicit times is exactly
  what the no-fake-timers rule wants.
- **Passed.** Phase 3 is next; its chip follows this gate.

### Phase 3 - builder notes (2026-09-12)

**What the app does now.** Solve sends the cube to the worker and writes every move into
the box with its letter and its sentence. The five controls walk the solution, the three
speeds set how fast, the cube turns with each move, Hint gives one move at a time and
Solve then shows the rest, the arrows and the space bar work, and painting during a
solution discards it.

**Measured.**

- The suite: 31 files, 166 passed and 2 skipped, 7.1 seconds. `tsc -b` clean, `npx
  oxlint` silent. `npm run build`: 49 modules, no warning, and the worker is now its own
  chunk, `worker-*.js` at 17.36 kB; the page is 251.01 kB (79.69 kB gzipped) with 6.82 kB
  of CSS.
- **The worker's warm-up, in the pane: 5.55 seconds** from navigation to Solve being
  enabled. That is the dev server, where the vendored solver is served unminified and
  the machine was also running the suite; the same work measured 1.05 seconds in node at
  phase 1. Worth re-measuring against the built app in phase 5. **The screen is not
  frozen while it happens**: the theme toggle answered during the wait, and Solve's
  tooltip reads "Getting ready...".
- **Solve, with the real solver in the pane: 102 ms** for the fixed scramble, and the
  answer is the same 19 moves phase 1 got from node:
  `D R' U2 F2 R2 U' R D L2 B2 U2 R2 L2 U F2 U R2 B2 U2`. The status line read "Solved in
  19 moves." and the box listed all nineteen with the first marked.
- The layout at 800 by 1000 with an 11-move solution in the box: `scrollWidth` 785
  against `innerWidth` 800, so nothing scrolls sideways; `scrollHeight` 1075 against
  1000, so the page scrolls 75 px downwards. Gate 2 sent the 6 px version of this to
  phase 4's box 4.4 and it is now 75 px with the box full. The box is 285 tall and the
  move list scrolls inside itself (134 px of a 337 px list), which is the five rows the
  design asks for.

**The six faces, and why the check moved out of the pane.**

The chip asks for every face to be watched turning, because a wrong sign shows as a jump
when the move commits. **The pane cannot do this.** Its animations do not run: with the
tab fronted, an animation reported `playState: "running"` with `currentTime: 0` after 200
ms of real time, and every `setTimeout` is clamped, so the provider's own commit timer
took seconds and then a minute. Two probe runs died on the tool's 45-second limit. This
is CLAUDE.md's throttling hazard in its strongest form.

What the pane did show, by driving each animation to its end by hand and comparing the
picture at 49 points across the cube before and after the move committed:

| Move | Keyframes | Cubies turning | Jump |
|---|---|---|---|
| U | `rotateY(0deg)` to `rotateY(-90deg)` | 9 | none |
| F2 | `rotateZ(0deg)` to `rotateZ(180deg)` | 9 | none |

So the answer is now a test instead, and it is a stronger one:
`src/ui/turn-direction.test.ts` takes each of the **eighteen** moves, rotates every
sticker's place and facing by the rotation `layerTurn` hands the browser, works out which
sticker it has become, and holds the library's own `applyMove` to putting that colour
exactly there. It also checks that nothing outside the layer moves. That is what "no
jump" means, said in arithmetic, and it covers R, L, U, D, F and B at once:

| Face | Clockwise quarter turn | Reading |
|---|---|---|
| R | `rotateX(90deg)` | carries every sticker where the model puts it |
| L | `rotateX(-90deg)` | the same |
| U | `rotateY(-90deg)` | the same, and seen in the pane |
| D | `rotateY(90deg)` | the same |
| F | `rotateZ(90deg)` | the same, and seen in the pane as F2 |
| B | `rotateZ(-90deg)` | the same |

**The physical cube has not been solved yet.** There is no cube in this session's hands,
which the chip allows for: Nick or the orchestrator does that at the gate. Everything
short of it is done, including the real solver answering in the pane and the screen cube
reaching a solved state by Jump to end.

**What else was driven in the pane.** The box with a solution in both themes (the marked
row in `--mark`, the letters in `--chip`, the holding line above them); the cube solid in
the light theme, so gate 2's gap fix holds with the box below it; the colour menu's Clear
during a solution, which emptied the box back to "Press Solve and the steps appear
here.", left the cube with its colours and one blank sticker, dropped green to 8/9 and
turned Solve off because the cube is no longer complete. The pane's storage was cleared
and the viewport reset afterwards.

**A consequence of spec C9 worth knowing.** On a complete cube every colour is already on
nine stickers, so the only paint that can change one is Clear: a tenth sticker of a
colour cannot be made. To correct a wrong colour on a finished cube, a person clears that
sticker and then paints it. That is the rule working as written, and it is what
`discard.dom.test.tsx` uses, but the spec does not say it anywhere.

**Two faults the tests found, both fixed.**

1. **A stale wait could wipe a sentence.** The view change leaves "Check the centres" up
   for two seconds, and that wait outlived its own change: pressing the button again
   inside those two seconds let the old wait clear the new change's first sentence. Each
   change now takes a number and every step of it checks that the number is still
   current. Found by the phase 2 view test going red when the timings shifted.
2. **Play kept its state in the wrong place.** The effect turned `playing` off on
   reaching the last move, which is a render asking for another render (oxlint's
   `set-state-in-effect`). Whether the cube is stepping is now worked out from the step
   and the solution, so reaching the end stops it with nothing to write down.

**Decided (code shape).**

- **Hint standing earlier in the solution steps forward** rather than doing nothing. The
  next move is already on the screen, and "just tell me the next move" is what the button
  is for (spec C13). Standing on the last move shown, it reveals one more, as the chip
  says.
- **"Done. Your cube is solved." appears when every move has been made**, not after the
  last move the box happens to be showing. The chip's wording says the latter, but in
  hint mode the cube is not solved, and saying so would be untrue.
- **The status line keeps the solver's last word** ("Solved in 19 moves.", "Your cube is
  already solved.", "The solver found no solution.") until the cube changes under it.
- **Solve and Hint have a third reason to be off**, beyond the validator's sentence and
  "Getting ready...": "Wait for the cube to stop turning." It is not in the spec.
- **The keyboard leaves space alone on a focused button.** A button answers the space bar
  itself, so pressing Solve with the mouse and then pressing space would both press Solve
  again and start playing. The arrows do nothing to a button, so they still pass, which
  is what keeps them working after a click. A radio group answers the arrows itself, so
  nothing passes from an input.
- **One `makeMove`** in the provider is the only path a move takes to the screen; step
  forward, step back and a hint all go through it.
- **The solver's answer is checked, not cast**: `isMove` in `moves.ts` says whether each
  string the worker sent back is one of the eighteen, and anything else is treated as no
  solution.
- **`Solver` gained `terminate()`**, and the provider stops the worker when it goes away.

**Reuse review.** Its finds: the three places that turned a layer and then committed the
move became one `makeMove`; `prefs.ts`'s `useRemembered` still had the trainer's unused
`show`, which gate 1 said to remove if phase 3 did not use it, and phase 3 does not.
Checked and already single: the speed numbers live only in `speeds.ts`, the keyframes
only in `turn-layer.ts`, the sentences only in `moveSentence`, the decision about which
controls are live in one place in `Controls.tsx`, and every transform string in
`transforms.ts`. No em dashes under `src/`.

**One flaky run, watched.** A full-suite run failed once while the dev server and the
pane were both busy; three targeted runs of the three timing-sensitive DOM files passed
3 of 3 afterwards, and every full run since has been green. If it returns, the files to
look at are `views.dom.test.tsx`, `keys.dom.test.tsx` and `solving.dom.test.tsx`, and the
answer is probably longer stage times rather than a `waitFor`.

**Asked of Nick.** Nothing.

**Left.** The physical cube (above), and for the orchestrator: the C9 consequence, the
"Wait for the cube to stop turning." sentence, and the 75 px downward scroll, which is
phase 4's box 4.4.

### Gate 3 findings (orchestrator, 2026-09-12)

- **Verified from the repository and the pane.** `npx vitest run`: 31 files, 166
  passed, 2 skipped, 7 to 11 seconds. `tsc -b` clean, `npx oxlint` silent, `npm run
  build` 49 modules with the worker in its own 17 kB chunk. No em dashes. All three
  commits carry the trailer. Every phase 3 box is ticked.
- **Driven in the pane at 800 by 1000 with the real solver, the tab in front.** The
  scrambled cube seeded through storage; Solve answered in 58 ms with the same 19
  moves; the first row marked; the box 283 px tall with the list scrolling inside
  it. At slow speed, Step forward ran nine web animations (233 ms of 900 when read)
  and the bottom layer was visibly part-turned in the screenshot; after the commit
  the second row was marked, the bottom row's colours had moved, and the stored
  text followed. Play at fast reached "Done. Your cube is solved." with the stored
  text all solved. Jump to start restored the entered cube. Nothing scrolled
  sideways; `scrollHeight` 1069 against 1000, which is box 4.4's.
- **The animations DO run in the pane when its tab is in front.** The builder's
  session had them stalled; this one did not. The builder's answer was right
  anyway: `turn-direction.test.ts` proves all eighteen turns in arithmetic, which is
  stronger than six eyes-on checks, and it stays.
- **The warm-up numbers were a background tab's.** On the built app served by `npm
  run preview` with its tab in front: ready 1.1 seconds after navigation, a solve in
  10 ms. The same page in a background tab: 4.8 seconds and 1.0 seconds, because a
  background tab throttles timers. Spec 7.2 now says so, and CLAUDE.md's hazards
  carry it.
- **One fix at the gate: the animation is cancelled in a layout effect.** It was a
  passive effect, whose cleanup runs after the browser paints, so the frame after a
  move committed could show the new colours still held in the old turned pose.
  `useLayoutEffect` cancels before paint. One word and a comment; the suite is
  unchanged (jsdom has no animations).
- **Rulings on what the builder left.** The C9 consequence is real and the rule is
  changed: painting over a filled sticker is always allowed, a blank sticker
  refuses a colour at nine, and phase 4 builds it as box 4.5. "Wait for the cube to
  stop turning." is now in spec 9.1. Hint standing earlier stepping forward, and
  "Done" only when every move is made, are the right readings and are now in spec
  9.3 and 8.
- **The physical cube is Nick's check.** No cube in either session's hands. It stays
  open here and is phase 5's box 5.6; Nick can do it now from `npm run dev`.
- **Read as code.** One `makeMove` for every move on screen, the play effect
  reading the live step each time, `stepping` derived rather than stored, the
  solver's answer checked with `isMove` rather than cast, `terminate` on unmount.
  The unused `show` helper is gone.
- **Passed.** Nick solved a real cube by following the screen on 2026-09-12, which
  closes phase 3's "Done when" (phase 5's box 5.6 repeats it on the installed app).
  Phase 4 is next; its chip follows this gate.
- **Raised by Nick at the same time: a second cube with non-standard colours.**
  Recorded in spec section 16 as a later phase with a design sketch; the decision
  to wait, and why, is there.
