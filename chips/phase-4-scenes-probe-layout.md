# Chip: phase 4 - scenes, the probe, the layout pass, and painting over

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push.

Phases 0 to 3 are done and passed their gates (latest commit on `main` before this
chip: `fa06b1a`). The app solves a cube, and Nick has solved a real one by following
the screen. This phase makes every screen state reachable from the address bar,
writes the layout probe, makes the layout hold at the three viewports with no
scroll at the Windows window size, and builds one ruling from gate 3: painting over a
filled sticker.

## Read first, in this order

1. `CLAUDE.md`. Every rule binds. Three standing hazards matter here: a background
   pane tab throttles timers and stalls animations (front the tab before any number
   or motion check), the pane's viewport emulation sends no `resize` event (reload
   after `resize_window`), and no screenshot files, no headless browser.
2. `docs/cuber-spec.md` sections 4.1, 4.3, 15 (all of it), C9 as amended at gate 3,
   5.3, and 11.1.
3. `docs/cuber-build-plan.md`: "Rules for the builder", the phase 3 notes and gate 3
   findings, and the whole of "Phase 4". Boxes 4.1 to 4.6 are your work list.
4. The code you build on: `src/ui/App.tsx` (`Shell` and `App`), `cube-context.tsx`
   and `cube-state.ts` (the provider: `paint`, `select`, `changeView`, `solve`,
   `solverReady`), `Picker.tsx`, `ColourMenu.tsx`, `StatusLine.tsx`, `fit.ts` (the
   height budget constants), `app.css` and `box.css` (the gaps and minimums),
   `src/ui/theme.ts`, `src/storage/prefs.ts` (`useRememberedCube`, `useSpeed`),
   `src/model/cube-text.ts`, `moves.ts` (`FIXED_SCRAMBLE`, `applyMoves`),
   `geometry.ts` (`CORNERS`), `src/test/dom.tsx`, and the phase 2 and 3 DOM tests.
5. `../London/src/ui/App.tsx` around line 103 (`import.meta.env.DEV` gating the
   dev-only view) and `../London/scripts/packaged-eval.mjs` in full. Simple Chess
   has not built its scenes yet, so there is nothing to copy there.

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## What this phase delivers

- `http://localhost:5190/?scene=scrambled&view=far&theme=light&speed=slow` opens
  the app in that state, in development builds only, and the production bundle
  carries none of it.
- `scripts/probes/layout.js` returns the layout's boxes and the two scroll numbers
  as JSON, and `scripts/packaged-eval.mjs` is in place for phase 5.
- At 800 by 1000 with a solution in the box, the page does not scroll at all. At
  820 by 1180 and 1180 by 820 nothing scrolls sideways and the scene is at least
  280 square. Every scene, both themes, both views, checked and recorded.
- Painting over a filled sticker works as spec C9 now says.

## The scenes, exactly (spec 15.1)

`src/dev/scenes.ts` exports the scene names and a pure `sceneCube(name): Cube`:

| Scene | The cube |
|---|---|
| `blank` | `blank()` |
| `solved` | `solved()` |
| `scrambled` | `applyMoves(solved(), FIXED_SCRAMBLE)` |
| `mirrored` | `scrambled` with the URF corner's first two stickers swapped (`CORNERS[0].stickers[0]` and `[1]`), which makes a corner that is not a real piece, so rule 5's sentence shows and its three stickers are outlined. (The spec says "rotated the wrong way"; a rotation is a twist and shows rule 10 with no outline, and the outline is what a screenshot wants. Say so in the notes.) |
| `partial` | `scrambled` with the twenty stickers of indices 0, 1, 2, 9, 10, 11, 18, 19, 20, 27, 28, 29, 36, 37, 38, 45, 46, 47, 5 and 14 blanked, none of them a centre |
| `solution` | `scrambled`, and Solve is pressed once the solver is ready |

`sceneFromLocation(search: string)` returns `{ scene, view: 'near' | 'far', theme:
'dark' | 'light', speed }` with the defaults `near`, `dark`, `normal`, or null when
there is no valid `scene`. String-tested: every name, the defaults, a bad name, a bad
view.

**How a scene is applied.** Two pieces, both under `src/dev/` and both dead in a
production build:

1. `applyDevScene(search)`: writes `cuber.cube` (through `toText`), `cuber.theme` and
   `cuber.speed` to storage and returns the scene. `App` calls it ONCE, before the
   provider mounts, inside a `useState` initialiser guarded by `import.meta.env.DEV`,
   so the hooks that read storage read the scene. `App` passes the scene's `view` to
   the provider as a new optional prop `initialView`, which sets `view` and `stage`
   without an animation.
2. `useDevScene(scene)`: called once in `Shell`, inside the provider. For the
   `solution` scene it waits for `solverReady` and calls `solve()` once. Nothing
   else.

Storage is real storage, so a scene leaves the pane's storage changed: clear it
after every drive, as rule 12 says.

**The production bundle.** Guard every call with `import.meta.env.DEV`. After `npm
run build`, search `dist/assets/*.js` for `scene=`, `mirrored` and `applyDevScene`:
none may appear. If any does, the static import is surviving tree-shaking; change
`App` to `await import('./dev/apply-scene')` inside the guard (a dynamic import
inside a dead branch is removed) and search again. Record which form was needed.

## The probe (spec 15.3)

`scripts/probes/layout.js` is one expression, no statements at the top level (wrap
in an arrow that is called at once), returning an object: for each of
`.app-header`, `.picker`, `.scene`, `.status`, `.box`, its `getBoundingClientRect()`
as `{ x, y, width, height }` rounded; plus `scrollWidth`, `innerWidth`,
`scrollHeight`, `innerHeight`, and `sceneSquare: width === height` for the scene.
It is evaluated in the pane through the JavaScript tool during this phase, and by
`node scripts/packaged-eval.mjs @scripts/probes/layout.js` in phase 5.

`scripts/packaged-eval.mjs` is London's, byte-identical plus one `Origin:` line at
the top of its header comment. It is not run this phase.

## The layout pass (box 4.4)

The page must not scroll at all at 800 by 1000 with the `solution` scene (19 moves
in the box, five rows visible). Gate 3 measured `scrollHeight` 1069 against 1000.
Find the 70 px in this order and stop when it fits:

1. The vertical gaps between the screen's parts (`.screen` gap 8, the header's
   margins, the box's padding): tighten before anything is made smaller.
2. `SCENE_MAX` 440 to 400 in `fit.ts` (the cubie goes from 91 to 83, still far more
   than a finger needs). Update spec 4.1's table if you do this; the orchestrator
   accepts 400.
3. Only if still short: the box shows four rows instead of five, and say so.
   Never shrink the column's width, and never change the window's 800 by 1000 in
   spec 11.1 without stopping to ask: a taller window does not fit a 1080-tall
   screen under the taskbar.

Then make `fit.ts`'s height budget the truth: replace its estimated constants
(`PICKER 92`, `BOX_MIN 220`, `GAPS 40`) with the numbers the probe measures at 800
by 1000 after the pass, and say in a comment beside each which probe box it came
from. The fit rule's string test keeps its three viewports; update its expected
numbers to what the budget now gives, and check that 1180 by 820 still gives at
least 280.

Then every scene at the three viewports of spec 15.2, both themes, the `scrambled`
scene in both views. Reload after each `resize_window`. Front the tab. Record the
probe's output per viewport in the notes (one table), and say what you saw.

## Painting over a filled sticker (box 4.5, spec C9 as ruled at gate 3)

- The provider's `paint(index, colour)`: refuses only when the sticker is BLANK and
  `counts[colour] >= 9`, and then sets a `notice` of `"${Colour} is already on nine
  stickers."` with the colour's name capitalised ("Red is already on nine
  stickers."). The notice takes the status line until the next paint, Reset or view
  change, whichever is first. A filled sticker takes any colour.
- `select` never refuses. The picker's swatch at nine keeps its count `9/9` in the
  faint style (`--text-faint`), loses `aria-disabled`, and is clickable. The menu's
  swatches the same: a menu on a filled sticker paints any colour; on a blank
  sticker a colour at nine shows the notice.
- `checkPartial`'s rule 1 is now reachable on screen (paint red over blue on a
  complete cube gives ten red), and its sentence and outline already exist. Look at
  it once in the pane and say what it shows.
- Tests: `entering.dom.test.tsx`'s "a colour on nine stickers is refused and its
  swatch is disabled" becomes two cases: a blank sticker refuses with the notice
  and the swatch is still enabled; a filled sticker takes it and the status line
  reads rule 7's or rule 1's sentence. `discard.dom.test.tsx` used Clear to change
  a complete cube; it may now paint directly, or stay as it is.

## Steps

1. `git status` first. Clean, with the commit that added this chip on top of
   `fa06b1a`. If not, stop and report. Never stash, reset or discard.
2. Boxes in this order: 4.5 first (a small behaviour change with its tests, one
   commit, so the scenes are built on the final painting rules), then 4.1 and 4.2
   (scenes, one commit), 4.3 (the probe and the copied script, one commit), 4.4
   (the layout pass, one or two commits), 4.6.
3. Tick each box in the plan in the same sitting it lands with green tests.
4. `npx vitest run` green under twenty seconds, `tsc -b` clean, `npx oxlint`
   silent, `npm run build` clean, the bundle search of "The production bundle"
   done and recorded.
5. Append the phase 4 notes to the plan: the probe table, what the layout pass
   changed and which of the three steps it needed, the fit constants before and
   after, the bundle search's result, what the mirrored scene shows, what you
   decided, what you asked Nick and what he said, what the reuse review found. Set
   the Progress row. Update `CLAUDE.md`'s "Current state" and `docs/testing.md` (the
   scenes are a dev tool, not a test). `README.md` gains one line on `?scene=`.

## Decision rules for the small things

- `src/dev/` holds only `scenes.ts`, `apply-scene.ts` and `use-dev-scene.ts`, and
  nothing under `src/dev/` is imported by anything outside `App.tsx` and
  `Shell`. `main.tsx` stays untouched (spec 13.3).
- The `view=far` scene sets the far view instantly; nothing animates on a scene
  load.
- The probe rounds to whole pixels.
- If a viewport needs a rule the spec does not have (a narrower breakpoint, a
  smaller box on a short screen), add the smallest rule that fixes it and say so
  in the notes with the number.

## Out of scope

Tauri and the installer (phase 5). The PWA. The photo feature, the beginner method,
the non-standard cube colours (later phases, spec 16).

## If something does not fit

Stop that item, write the contradiction under the phase 4 notes, and carry on with
the items that do not depend on it. Ask Nick when a choice would change what a
person sees beyond what this chip settles. Decide small matters of code shape
yourself and say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- No em dashes under `src/`. Australian English. Spec section 3's words.

## Done when

The plan's phase 4 "Done when" line is true, plus: no scroll at all at 800 by 1000
with the `solution` scene, the bundle search clean, painting over built and tested,
every box 4.1 to 4.6 ticked, and the phase notes written with the probe table.
Finish with a short report: what landed, the commit hashes, the probe table, which
layout step it took, what you asked, and anything left for the orchestrator's review.
