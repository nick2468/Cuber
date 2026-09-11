# Cuber - build plan

Version 1. Written 2026-09-11. Status: **Active**, nothing built yet.

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

- [ ] 0.1 `git init`. `package.json`: name `cuber`, version `0.1.0`, `"type":
      "module"`, description "Solves a Rubik's Cube from its colours". Scripts:
      `dev` = `vite --port 5190 --strictPort`, `build` = `tsc -b && vite build`,
      `preview` = `vite preview --port 5191 --strictPort`, `test` = `vitest run`,
      `test:watch` = `vitest`, `lint` = `oxlint`, `tauri` = `tauri`. Dependencies:
      `react`, `react-dom`, `@tauri-apps/api` at the trainer's versions. Dev
      dependencies: the trainer's list. Pin the four testing-library and jsdom
      versions exactly, as the trainer does.
- [ ] 0.2 `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: the trainer's,
      identical, plus `src/solver/vendor` excluded from `checkJs` if the trainer's
      config checks JavaScript (it may not; then nothing to add). `.oxlintrc.json`
      identical plus an ignore for `src/solver/vendor/**`. `.node-version` =
      `22.12.0`.
- [ ] 0.3 `vite.config.ts`: the trainer's `define` for `__APP_VERSION__`, the server
      port from `PORT` or 5190 with `strictPort`, the two vitest projects (`string` in
      node for `src/**/*.test.ts`, `dom` in jsdom for `src/**/*.dom.test.tsx` with
      `src/test/dom-setup.ts`). No PWA plugin (phase 6).
- [ ] 0.4 `.gitignore`: the trainer's (`node_modules/`, `dist/`, `src-tauri/target/`,
      `src-tauri/gen/`, caches, editor files, logs) plus Conquest's `dev-dist/`.
      `.vscode/extensions.json` and `settings.json` from Conquest, committed.
- [ ] 0.5 `.claude/launch.json` with `cuber-dev` (`npm run dev`, port 5190) and
      `cuber-preview` (`npm run preview`, port 5191), in Conquest's shape with the
      `--prefix` flag pointing at this folder.
- [ ] 0.6 `index.html`: Conquest's head (lang `en-AU`, viewport with
      `viewport-fit=cover`, theme-color `#16181c`, the two `mobile-web-app-capable`
      metas, the apple-touch-icon and favicon links) with the title Cuber. The icon
      files arrive in phase 5 and 6; the links may point at files not there yet.
- [ ] 0.7 `src/main.tsx` identical, `src/index.css` identical, `src/globals.d.ts`
      identical, `src/ui/theme.ts` identical but for the key `cuber.theme`,
      `src/ui/app.css` cut to `.app`, `.app-header`, `.app-version`, `.nav-link`,
      `.theme-toggle`, `button`, `button:disabled` and the `@media (min-width: 900px)
      and (min-height: 700px)` block.
- [ ] 0.8 `src/ui/App.tsx`: the header (name, version, theme toggle) and an empty
      `<main>`. No provider yet.
- [ ] 0.9 `src/version.test.ts`: the trainer's. The two Tauri files do not exist
      until phase 5, so the two tests that read them are written now and marked
      `it.skip` with a comment naming phase 5, which unskips them.
- [ ] 0.10 `src/test/dom-setup.ts` identical. `src/test/dom.tsx` with `renderApp`
      only, adapted to this app's provider as it arrives.
- [ ] 0.11 `docs/testing.md`: the trainer's, adapted. Drop the content checkers and
      the board stub. Keep the two kinds, what is faked and why (the solver, from
      phase 3), and the rules, with the one slow solver test named as the exception.
- [ ] 0.12 One DOM test: the header shows "Cuber" and the version, and the theme
      toggle flips `data-theme` on the root and writes `cuber.theme`.
- [ ] 0.13 `README.md`: what the app is, the two ways to run it, the documents.
- [ ] 0.14 `npm run dev`, `npx vitest run`, `tsc -b`, `npm run build` all work.

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

- [ ] 1.1 `src/model/colours.ts`: `Colour` = the six names, `COLOURS` in the
      picker's order (red, green, yellow, white, blue, orange), `hexOf(colour)` per
      spec 4.3, `Face` = `U R F D L B`, `FACES` in the library's order, `faceWord`
      ("the top face" and the rest), `opposite(face)`. `Scheme` = a map from face
      to colour, `standardScheme()`, `schemeFrom(centres)` returning null when two
      centres share a colour.
- [ ] 1.2 `src/model/cube.ts`: `Cube` = an array of 54 `Colour | null`. `blank()`
      (48 nulls, the standard centres), `solved(scheme)`, `paint(cube, index,
      colour | null)` returning a new array, `counts(cube)` per colour, `filled(cube)`
      as a number, `isComplete`. `CENTRES` = `[4, 13, 22, 31, 40, 49]`.
- [ ] 1.3 `src/model/geometry.ts`: `indexOf(face, row, column)`, `placeOf(index)`
      returning `{ face, row, column }`, `positionOf(index)` returning `{ x, y, z }`
      from the table in spec 6.1, and the inverse `stickersAt(x, y, z)` returning
      the indices of that cubie's outside stickers. `CORNERS` (8) and `EDGES` (12)
      as arrays of facelet indices in the library's clockwise order, exactly the
      table in spec 6.1, with the piece names as comments. Tests: C19 item 1
      (the geometry's three stickers at (1, 1, 1) are the URF entry, and so on for
      all 20 pieces); `positionOf` and `stickersAt` are inverses for all 54.
- [ ] 1.4 `src/model/facelets.ts`: `toFacelets(cube)` returning the 54-letter string
      or null (a blank sticker or a bad scheme), `fromFacelets(letters, scheme)`.
      Test: round trip on `solved(standardScheme())` and on a hand-made cube.
- [ ] 1.5 `src/solver/vendor/`: `cube.js` and `solve.js` from the scratch package with
      the two edits of spec C5 and an `Origin:` line each; `LICENSE` copied;
      `cube.d.ts` with the seven members named in C5. Test (C19 item 8): the one
      slow test, `initSolver`, solve the fixed scramble of spec 15.1 and one random
      cube, apply each solution with `move`, assert `isSolved()`. Record the init
      time in the notes. **If the vendored files do not load under vitest or Vite,
      stop and report**: the fallback is `npm install cubejs` with Vite's CommonJS
      interop, but that is a spec change (C5) and is the orchestrator's call.
- [ ] 1.6 `src/model/moves.ts`: `Move` = the eighteen strings, `MOVES`,
      `inverse(move)`, `applyMove(cube, move)` through `Cube.fromString(...).move
      (move).asString()` and `fromFacelets`, `applyMoves(cube, moves)`. Test: C19
      item 4; and `applyMoves(solved, scramble)` equals `Cube.fromString(solved
      letters).move(scramble).asString()` converted back (the library as oracle).
- [ ] 1.7 `src/model/validate.ts`: `checkPartial(cube)` and `validate(cube)` per spec
      6.4, returning `{ ok: true, facelets }` or `{ ok: false, message, stickers }`
      where `stickers` is the indices to outline. The piece tables come from
      `geometry.ts`. Tests: C19 items 2 and 3. For item 3 build each failing cube
      from `solved()` by hand and assert the exact sentence. The two property tests
      use `Cube.random().asString()` from the vendored library (no `initSolver`
      needed for that).
- [ ] 1.8 `src/model/notation.ts`: `moveSentence(move)` per spec 8. Test: C19 item 5.
- [ ] 1.9 `src/model/views.ts`: `View` = `near | far`, `viewFaces(view)` returning
      the three faces at the top, front-left and front-right slots, and
      `VIEW_MOVEMENTS` = the two movements of spec C2 with their forward and reverse
      sentences (spec 5.2), as data. Test: C19 item 6.
- [ ] 1.10 `src/model/cube-text.ts`: `toText(cube)` (54 characters, `wyrobg-`) and
      `fromText(text)` returning the cube or null for anything else. Test: C19 item 7.
- [ ] 1.11 `src/solver/solver.ts`: `createSolver()` per spec 7.2 with the worker
      started through `new Worker(new URL('./worker.ts', import.meta.url), { type:
      'module' })`; `src/solver/worker.ts`. `src/test/fake-solver.ts`: answers
      `ready` at once and `solve` with a fixed list (the inverse of the spec's fixed
      scramble, reversed, so the scrambled scene's fake solution really solves it).
      String test of the adapter's message handling with a hand-made fake worker
      object (no real `Worker`).
- [ ] 1.12 `src/storage/prefs.ts`: the trainer's `read`, `write`, `readOneOf`,
      `useRemembered` (identical text, origin line) and two hooks: `useSpeed`
      (`slow | normal | fast`, default `normal`) and `useRememberedCube` (reads with
      `fromText`, writes with `toText`). `src/storage/paths.ts`: `isDesktop` and
      `LOCAL_FOLDER = 'Cuber Data'` only.
- [ ] 1.13 Reuse review: nothing in `src/model` or `src/solver` imports React or
      touches `window` or `document` (the worker in `solver.ts` is the one exception).
      Say so in the notes.

**Done when:** the suite is green with every string test of C19 items 1 to 8 present,
under twenty seconds. No screenshot: nothing changed on screen.

---

## Phase 2 - the cube on screen, and entering the colours

**Goal: the drawing's screen, minus the box. A person can paint all 54 stickers in
both views, see the counts and the validation sentences, reset, and find the cube
still there after a reload.**

Read first: spec 4, 5 and 6.4; `../Conquest/src/ui/styles.css` (safe-area padding,
the 900 px breakpoint, touch rules), `../Conquest/src/ui/taps.ts` (how a long press
is told from a tap); `../London/src/ui/Play.tsx` for the button row styles;
`../London/src/ui/Diagnostics.tsx` for the dev-only pattern.

- [ ] 2.1 `src/ui/cube-context.tsx`: the provider. State: `cube`, `view`, `selected`
      (the picker colour), `problem` (from `checkPartial`), `viewChanging`
      (`null` or the movement in progress). Actions: `paint(index, colour | null)`
      (the one home for painting; refuses a tenth of a colour; runs `checkPartial`;
      writes storage), `select(colour)`, `reset()`, `changeView()`. Options:
      `durations` (the view movement and pause, and later the turn, in ms; tests
      pass zeros), `createSolver` (phase 3). The remembered cube is read once on
      mount through `useRememberedCube`.
- [ ] 2.2 `src/ui/Scene.tsx` and `scene.css`: `.scene` (square, `perspective: 1200px`)
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
- [ ] 2.3 `src/ui/Sticker.tsx`: left click paints with `selected`; `contextmenu`
      opens `ColourMenu` at the pointer; a pointer held 500 ms without moving more
      than 8 px opens the same menu (Conquest's `taps.ts` shape, copied as one
      function with an origin line). `src/ui/ColourMenu.tsx`: six swatches and
      "Clear", closes on choice, Escape or outside click; greyed swatches for
      used-up colours; one component for both openers.
- [ ] 2.4 `src/ui/fit.ts`: `sceneSize(viewportWidth, viewportHeight)` per spec 4.1
      with the numbers it subtracts as named constants beside the layout numbers
      they come from; `cubieSize(sceneSize)` = floor(scene / 3.67). A hook
      `useSceneSize()` re-measures on resize and orientation change. String test
      with the three viewports of spec 15.2: 440, 440, about 300; never under 280.
- [ ] 2.5 `src/ui/Picker.tsx`: the bordered box, "Colours", six swatches in the
      drawing's order with the count `n/9`, a ring on the selected, greyed at nine.
- [ ] 2.6 The view change (spec 5.2): `changeView` runs the two movements one after
      the other, each a transition of the `.cube` transform over the movement
      duration, with the pause between, setting the status line's sentence for
      each, then the "Check the centres" sentence for two seconds. The button under
      the scene reads "Show the other side" or "Show the first side" and is
      disabled while `viewChanging`. Stickers ignore clicks while it plays.
- [ ] 2.7 `src/ui/StatusLine.tsx`: the fill-in count, the problem sentence, the view
      sentences, "Ready. Press Solve." (spec 4). `src/ui/HeaderButtons.tsx`: Reset
      cube with its two-press guard (spec 5.4); Solve and Hint present and disabled
      until phase 3.
- [ ] 2.8 `src/ui/Screen.tsx`: the column of spec 4 without the box (a placeholder
      `.box` of the minimum height saying "Press Solve and the steps appear here.").
      `App.tsx` wraps `<Screen />` in the provider. Safe-area padding, the narrow
      rules, buttons at least 36 px, `touch-action: manipulation` on the scene.
- [ ] 2.9 DOM tests (C19 items 9, 10, 14, 15 for the cube, 16): stickers found by
      `[data-sticker]`; the right-click menu through `user-event`'s `pointer` with
      `{ keys: '[MouseRight]' }`; the long press is a string-tested function, not a
      DOM test; the view test reads `data-face` of the three centre stickers whose
      cubies are at the slots (or `viewFaces` through a `data-view` attribute on
      `.cube`), with the durations at 0.
- [ ] 2.10 Drive in the pane: paint a full valid cube from a real scramble (apply
      the spec's fixed scramble on a physical cube, or read the `scrambled` scene
      once phase 4 exists; until then paint by hand), watch the counts, make a
      mirrored corner and see the outline and the sentence, fix it and see "Ready".
      Play the view change and confirm the far view's centres. Screenshots at 800
      by 1000 in both themes and both views. Record the probe.
- [ ] 2.11 Reuse review and commit.

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

- [ ] 3.1 The provider grows: `solver` (from `createSolver`, `fakeSolver` in tests),
      `solverReady`, `solution` (`null` or `{ moves, revealed }`), `step`, `playing`,
      `turning` (`null` or the move animating). Actions: `solve()` (validate, send,
      set `revealed` to all), `hint()` (solve if needed, reveal one more, step
      forward), `stepForward()`, `stepBack()`, `jumpToStart()`, `jumpToEnd()`,
      `play()`, `pause()`, `setSpeed()`. `paint` during a solution clears it (C12).
      Every step applies `applyMove` (or its inverse) to `cube` after the turn
      duration, then writes storage.
- [ ] 3.2 The animation (spec 9.4) in `Scene.tsx`: while `turning`, the nine cubies of
      that layer carry the layer rotation before their `translate3d`, with a
      transition of the turn duration and `ease-in-out`; when the provider applies
      the move and clears `turning`, the cubies are drawn from the new model with no
      rotation. The provider owns the timer (one `setTimeout` of the turn duration;
      `transitionend` is not relied on). Check every face's direction in the pane
      against a real cube and record "R clockwise from the right" and the other
      five in the notes.
- [ ] 3.3 `src/ui/Box.tsx` and `box.css`: the control row (five buttons with
      accessible names "Jump to start", "Step back", "Play", "Pause", "Step forward",
      "Jump to end"; the speed radios), the holding line, the moves with the letter
      in a fixed-width chip and the sentence from `moveSentence`, the current step
      marked with `--mark`, the list scrolled to keep the current row in view, "Done.
      Your cube is solved." after the last step, "Working it out..." while waiting,
      and the Hint form ("Hint 1: ...") when `revealed` is less than the count.
      Keyboard: left and right arrows step, space plays or pauses, ignored while a
      menu is open.
- [ ] 3.4 Play: an effect that steps forward at the speed's interval while `playing`
      and stops at the end, in the shape of the trainer's auto-step effect. The
      speeds from spec 9.2 as one table in `src/model/speeds.ts`.
- [ ] 3.5 Header: Solve enabled when `validate` passes and the solver is ready, else
      disabled with the reason in its `title` and in the status line; Hint the same.
      Both say "Getting ready..." before `solverReady`. The status line says "Solved
      in N moves." and "Your cube is already solved." per spec.
- [ ] 3.6 The worker in the real app: `createSolver` default builds the worker;
      confirm in the pane that the page is not frozen during the four to five
      seconds of `initSolver` (the theme toggle answers) and that Solve on the
      `scrambled` cube returns within a second. Record both times.
- [ ] 3.7 DOM tests (C19 items 11, 12, 13, 15 for the speed): with `fakeSolver` and
      durations at 0. The worker guard: a throwing `Worker` on `globalThis` is never
      constructed.
- [ ] 3.8 Drive in the pane with the real solver: enter a real scrambled cube from a
      physical cube, Solve, follow the moves on the physical cube at slow speed,
      and confirm it ends solved. Then Hint from a fresh entry, three presses. Then
      paint during a solution and see it discarded. Screenshots of the box with a
      solution at 800 by 1000 in both themes. Record the probe.
- [ ] 3.9 Reuse review and commit.

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
      The two numbers of C20 hold everywhere.
- [ ] 4.5 Reuse review and commit.

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
| 0 - the scaffold | Not started |
| 1 - the model, the validator and the solver | Not started |
| 2 - the cube on screen, and entering the colours | Not started |
| 3 - Solve, Hint, the box and the animation | Not started |
| 4 - scenes, the probe and the layout pass | Not started |
| 5 - the Windows app and the installer | Not started |
| 6 - the iPad Home Screen app | Waits for Nick |

## Phase notes

Each phase appends its notes here as it closes: what was measured, what was decided
and why, what was asked of Nick and what he said, what the reuse review found, and
what is left. The orchestrator's review adds its gate findings under them.
