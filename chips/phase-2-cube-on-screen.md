# Chip: phase 2 - the cube on screen, and entering the colours

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push.

Phases 0 and 1 are done and passed their gates (latest commit on `main` before this
chip: `dc01752`). The page shows the header. Every pure module exists and is tested.
This phase draws the cube and lets a person enter its colours. It is the first phase
a person can see, and the drawing in `layout.jpg` is the design.

## Read first, in this order

1. `CLAUDE.md` in this folder. Every rule in it binds.
2. `layout.jpg`. Look at it before reading the spec's layout, so the spec's words
   attach to the drawing.
3. `docs/cuber-spec.md` sections 4, 5, 6.4, 10, 13.3, 15.2 and 17 items 1 to 4.
4. `docs/cuber-build-plan.md`: "Rules for the builder", "Standing discipline", the
   phase 1 notes and gate 1 findings, and the whole of "Phase 2 - the cube on
   screen, and entering the colours". Boxes 2.1 to 2.11 are your work list. Note
   the correction in its "Read first": Conquest has no long-press helper to copy.
5. The model you will call, all under `src/model/` and `src/storage/`, with their
   tests beside them: `cube.ts` (`blank`, `paint`, `counts`, `filled`, `CENTRES`,
   `schemeOf`), `geometry.ts` (`positionOf`, `stickersAt`, `placeOf`, `sticker`),
   `colours.ts` (`COLOURS`, `hexOf`, `faceWord`, `Colour`, `Face`), `validate.ts`
   (`checkPartial`, its `Problem` shape), `views.ts` (`VIEW_MOVEMENTS`,
   `viewFaces`, `Slot`), `cube-text.ts`, and `prefs.ts` (`useRememberedCube`,
   `useRemembered`, `read`, `write`). Do not add a second way to do anything these
   already do.
6. `../Conquest/src/ui/styles.css` lines 51 to 68 (the safe-area padding on
   `.board-page` and the 900 px breakpoint) and line 139 (`touch-action:
   manipulation`). `../London/src/ui/Play.tsx` and `play.css` for how a button row
   and a fieldset are styled there.
7. `src/ui/app.css` and `src/index.css` in this folder: every colour on the frame
   comes from `index.css`'s variables; the sticker colours come from `hexOf`.

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## What this phase delivers

The drawing's screen, minus the box's contents. A person opens the app and sees the
header (Reset cube, Solve, Hint, theme toggle), the picker at the top right, the
corner-on cube with its pre-filled centres, "Show the other side" under it, the
status line, and an empty box that says "Press Solve and the steps appear here."
They paint all 54 stickers in both views by left click, right-click menu or long
press, see the counts and the validation sentences as they go, reset with the
two-press guard, and find the cube still there after a reload. Solve and Hint are
present and disabled: phase 3 wires them.

## The CSS 3D cube, exactly

This is the one part a wrong guess would cost a day, so here is the recipe. Build it
this way unless the pane proves a line wrong, and then say so in the notes.

**Elements.** `.scene` is a square of `S` pixels (from `fit.ts`) with
`perspective: 1200px` and the cube centred in it. `.cube` is a zero-size positioned
element at the scene's centre with `transform-style: preserve-3d` and the view
transform below. Inside it, one `.cubie` per piece: 26 of them, one for every
(x, y, z) with a coordinate that is not 0 (the core has no stickers and is not
drawn). Each cubie is `position: absolute`, `C` pixels square, offset by `-C / 2` so
its centre is at the cube's origin, `transform-style: preserve-3d`, and placed with
`transform: translate3d(x * P, -y * P, z * P)` where `P = C + gap` (gap 4 px). The
minus on y is because the model's y runs up and the screen's runs down. Keep the
cubie's transform as ONE string in ONE place (a function `cubieTransform(position,
layerTurn?)`), because phase 3 prepends a layer rotation to it.

**Stickers.** Each cubie holds only the stickers `stickersAt(x, y, z)` returns: one,
two or three. A sticker is a `C` by `C` element at the cubie's origin, turned on to
its face and pushed out by half a cubie:

| Face | Transform |
|---|---|
| U | `rotateX(90deg) translateZ(C/2)` |
| D | `rotateX(-90deg) translateZ(C/2)` |
| F | `translateZ(C/2)` |
| B | `rotateY(180deg) translateZ(C/2)` |
| R | `rotateY(90deg) translateZ(C/2)` |
| L | `rotateY(-90deg) translateZ(C/2)` |

with `backface-visibility: hidden`, so a sticker facing away neither draws nor takes
a click. The sticker's colour is `hexOf(colour)` painted on an inner box inset 6 px
with a 4 px radius, on the cube-body colour `#111`. A blank sticker is the body
colour with a 1 px dotted border in `--text-faint`. A sticker in the current
problem's `stickers` gets a 2 px `--bad` outline. Every sticker carries
`data-sticker="<index>"` and `data-face="<letter>"`, and the accessible name
"<face word>, row R, column K, <colour or blank>" so a test and a screen reader can
find it.

**The view.** The cube's transform is always the same four functions in the same
order, so a CSS transition between views interpolates each angle rather than
decomposing a matrix:

```
transform: rotateX(-28deg) rotateY(-38deg) rotateY(Tdeg) rotateZ(Rdeg)
```

- Near view: `T = 0`, `R = 0`. Shows Up on top, Front at the front-left, Right at
  the front-right. Tune the two fixed angles by eye in the pane until it matches the
  drawing; record what you chose.
- After movement 1 (roll over sideways, spec C2): `T = 0`, `R = 180`.
- Far view, after movement 2 (quarter turn, right face to the front): `T = -90`,
  `R = 180`. Shows Down on top, Left at the front-left, Back at the front-right.

Check in the pane with the standard centres: near view white, green, red at the
three slots; far view yellow, orange, blue. If the far view shows anything else, the
sign of `T` or `R` is wrong; try the other sign before anything else. `viewFaces`
in the model is the truth of which faces the far view must show.

**The animation between views** (spec 5.2, C3): a `transition: transform <ms>
ease-in-out` on `.cube`, the duration from the provider's `durations.movement`
(1200 ms by default). The provider sets the view stage (`near`, `rolled`, `far`) and
the status sentence, waits `durations.movement`, pauses `durations.pause` (400 ms),
then sets the next stage. Going back plays the stages in reverse with the `back`
sentences. Both durations are 0 in tests. Use one `setTimeout` chain owned by the
provider, cleared on unmount; do not rely on `transitionend`.

## Settled decisions you do not revisit

- The screen is the drawing (spec C1, section 4): header, picker at the top right,
  cube centred, the view button under it, the status line, the box across the
  bottom. One column, up to 720 px wide, centred. Sizes per spec 4.1.
- The picker's order is red, green, yellow, white, blue, orange (spec 4). Each swatch
  shows `n/9` from `counts`. Red is selected on first open. The selection is not
  remembered. A swatch at nine is greyed, `aria-disabled`, and does nothing.
- Painting goes through ONE provider action, `paint(index, colour | null)`, whatever
  opened it (spec 13.3). It refuses a tenth sticker of a colour, runs `checkPartial`,
  and writes storage through `useRememberedCube`'s setter.
- The right-click menu and the long-press menu are ONE component, `ColourMenu`
  (spec 13.3): six swatches and "Clear", positioned at the pointer, clamped to the
  viewport, closed by a choice, Escape or a click outside.
- The long press is this app's own helper, `src/ui/long-press.ts`: a pure state
  machine with `down(x, y, at)`, `move(x, y, at)`, `up(at)` and `elapsed(at)`,
  where `at` is a millisecond time you pass in. It answers `'menu'`, `'click'` or
  `'nothing'`. 500 ms and 8 px are its two constants. The component wires pointer
  events and one `setTimeout` to it. The helper is string-tested with explicit times
  and no fake timers; the DOM tests cover right click, not long press.
- Reset: the blank cube with the standard centres, the near view without animation,
  no solution (spec C14). Two presses: the first changes the label to "Press again
  to clear" for three seconds, the second within that time clears.
- The status line (spec 4): "Fill in the stickers. N of 48 done." where N is
  `filled(cube) - 6`; the problem's sentence when there is one; "Ready. Press
  Solve." when `validate(cube).ok`; the movement sentences during the view change,
  then "Check the centres: they should match your cube." for two seconds
  (`durations.check`, 0 in tests).
- Solve and Hint render in the header, disabled, with no title. Phase 3 wires them
  and gives them their titles. Yes, that means the status line can say "Ready. Press
  Solve." while Solve does nothing; that is one phase long and the notes say so.
- The box (`.box`) is a placeholder of the minimum height saying "Press Solve and
  the steps appear here." Phase 3 fills it.
- iPad readiness now (spec C21): safe-area padding on `.app` as Conquest's
  `.board-page`; `touch-action: manipulation` on the scene; buttons at least 36 px
  tall; no hover-only control.
- Stickers ignore clicks while the view changes, and the view button is disabled
  then.
- No em dashes under `src/`. Australian English on screen: "colour", "centre".

## The provider, `src/ui/cube-context.tsx`

State: `cube`, `view` (`'near' | 'far'`), `stage` (`'near' | 'rolled' | 'far'`, what
the CSS shows), `selected` (`Colour`), `problem` (`Problem | null`), `viewChanging`
(`boolean`), `status` (the sentence to show, derived, not stored, except during a
view change), `resetArmed` (`boolean`). Actions: `paint`, `select`, `reset`,
`changeView`. Options (props on the provider): `durations: { movement, pause, check
}` in ms, and from phase 3 `createSolver`. The cube comes from `useRememberedCube`,
called once here. The provider's value is not memoised, for the trainer's reason
(read the comment in `../London/src/ui/play-context.tsx` and keep it in your words).
`App` wraps `<Screen />` in the provider.

## Files

`src/ui/cube-context.tsx`, `Screen.tsx`, `Scene.tsx` + `scene.css`, `Sticker.tsx`,
`Picker.tsx`, `ColourMenu.tsx`, `StatusLine.tsx`, `HeaderButtons.tsx`, `fit.ts`,
`long-press.ts`, and their tests. `app.css` grows the column, the picker, the box
placeholder and the safe-area padding; `scene.css` holds everything 3D. `src/test/
dom.tsx`'s `renderApp` puts the provider around the screen with zero durations and
returns `{ user }` plus helpers `stickerAt(index)` and `swatch(colour)`.

## Tests to write (spec C19 items 9, 10, 14, 15 for the cube, 16)

- `fit.test.ts`: the three viewports of spec 15.2 give 440, 440 and about 300;
  never under 280.
- `long-press.test.ts`: down then up before 500 ms is `'click'`; down, 500 ms
  elapsed, is `'menu'` and the later up is `'nothing'`; down, move 9 px, elapsed is
  `'nothing'` and up is `'click'`.
- `entering.dom.test.tsx`: left click paints the selected colour; picking a swatch
  then clicking paints that colour; the swatch count updates; the right-click menu
  (`await user.pointer({ keys: '[MouseRight]', target: stickerAt(8) })`) paints and
  clears; a colour on nine stickers is refused and its swatch is disabled; the
  status count reads "N of 48 done".
- `validation.dom.test.tsx`: a mirrored URF corner (white on U9, green on R1, red
  on F3, on a blank cube) outlines those three stickers and shows "That corner is
  not a real piece. Check its three colours."; repainting fixes it; a complete valid
  cube (paint `applyMoves(solved(), FIXED_SCRAMBLE)` through `paint` calls, or seed
  storage with its `toText` before `renderApp`) shows "Ready. Press Solve." and
  Solve is still disabled this phase.
- `reset.dom.test.tsx`: one press arms ("Press again to clear"), a second clears
  to the blank cube; a single press followed by nothing leaves the cube alone
  (assert after `vi.waitFor` on the label going back, with `durations` making the
  arm window short; if the three seconds cannot be shortened without a fake timer,
  test only the arm and the clear, and say so).
- `remembered.dom.test.tsx`: paint three stickers, unmount, `renderApp` again, the
  three are there; a scrambled `cuber.cube` value gives the blank cube.
- `views.dom.test.tsx`: the view button changes `.cube`'s `data-view` from `near`
  to `far` and its label to "Show the first side"; the three centre stickers whose
  cubies are at the top, front-left and front-right slots have `data-face` D, L, B
  (read the slot from `positionOf` against `viewFaces('far')`, or simpler: assert
  `data-view` and trust `viewFaces`'s own string test for the faces); the button is
  disabled while `viewChanging` (with durations at 0 this is a moment: assert the
  status sentence sequence instead, through `vi.waitFor`).
- The worker guard is phase 3's; nothing here starts a worker.

## Steps

1. `git status` first. It should be clean, with the commit that added this chip on
   top of `dc01752`. If not, stop and report. Never stash, reset or discard.
2. Work through plan boxes 2.1 to 2.11 in order, ticking each in the plan in the
   same sitting it lands with green tests. A natural commit split: (a) the
   provider, the scene and the stickers drawn from the model, near view only; (b)
   the picker, painting, the menu and the long press; (c) validation on screen, the
   status line, Reset; (d) the far view and its animation; (e) fit, safe-area, the
   narrow layout; (f) anything the reuse review moved.
3. Drive it in the pane with `cuber-dev` on 5190. Confirm the version in the header
   is this folder's. Then, and record each in the notes:
   - The near view's three centres are white, green, red; the far view's are
     yellow, orange, blue. The two movements play one after the other with their
     sentences, slowly enough to copy on a real cube (about 1.2 s each).
   - Paint a full valid cube: use a real cube scrambled by hand, or paint the cube
     `applyMoves(solved(), FIXED_SCRAMBLE)` gives (print its `toText` in a scratch
     script, then paint by reading it). Watch the counts. "Ready. Press Solve."
     appears at the end.
   - Make a mirrored corner: the outline and the sentence appear; fix it.
   - Right-click a sticker: the menu opens at the pointer, a choice paints, Clear
     blanks, Escape closes, an outside click closes.
   - Reset: arm, wait three seconds, the label returns; arm and press again, blank.
   - Reload: the cube is still there.
   - In the pane's JavaScript tool, read `document.documentElement.scrollWidth`
     against `window.innerWidth` at 800 by 1000, 820 by 1180 and 1180 by 820. Record
     the numbers. No sideways scroll anywhere. Record the scene size at each.
   - Screenshots (looked at, no files): both themes at 800 by 1000, both views.
     Say what you saw. Clear the pane's storage afterwards.
4. Reuse and duplication review: one `paint` path, one menu component, one
   transform-string function for the cubies, the face-to-transform table exists
   once, no colour literal outside `hexOf` and `index.css` (the body `#111` is
   the one new literal and lives in `scene.css` with a comment). Refactor on the
   spot. Say what it found.
5. `npx vitest run` green under twenty seconds, `tsc -b` clean, `npx oxlint`
   silent, `npm run build` clean. Commit.
6. Append the phase 2 notes to the plan: the two view angles you chose, the numbers
   from step 3, what you saw, what you decided, what you asked Nick and what he
   said, what the review found. Set the Progress row to "Done, <date>". Update
   `CLAUDE.md`'s "Current state" line and `README.md` if a command changed.

## Decision rules for the small things

- The drawing wins over the spec's ASCII sketch where they differ in proportion.
  The spec wins over the drawing on what exists (the drawing has no Solve button;
  the spec adds one).
- Where a CSS number is not in spec 4.1, take the trainer's (`app.css`, `play.css`).
- The picker's label "Colours" is a `<legend>` in a `<fieldset>`, the trainer's
  fieldset style.
- The view button's names are exactly "Show the other side" and "Show the first
  side".
- Keyboard: Escape closes the menu. Nothing else this phase.
- `prefers-reduced-motion: reduce` makes the view change instant (no transition)
  but the sentences still show for their durations. One media rule in `scene.css`.
- If jsdom cannot do something the tests need (it has no layout and no CSS), test
  the state and the attributes, not the pixels, and say what could not be tested.

## Out of scope

Solve, Hint and the box's contents. The step controls, the layer-turn animation and
the speeds. Scenes and the probe script (phase 4; you may add a `?scene=` hook only
if you need it for the pane checks, in `src/dev/`, behind `import.meta.env.DEV`, and
say so). Tauri. The PWA.

## If something does not fit

Stop that item, write the contradiction under the phase 2 notes, and carry on with
the items that do not depend on it. Ask Nick when a choice would change what a
person sees: the view angles are yours to tune, the layout is the drawing's, and
anything in between is a question. Decide small matters of code shape yourself and
say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- No em dashes under `src/`. Australian English. One name for one thing: spec
  section 3's words.

## Done when

The plan's phase 2 "Done when" line is true: a complete valid cube can be entered
in the pane and survives a reload, every validation sentence of spec 6.4 rules 2 to
5 has been seen on screen, the far view's centres are yellow, orange and blue, no
viewport scrolls sideways, every box 2.1 to 2.11 is ticked, and the phase notes are
written. Finish with a short report: what landed, the commit hashes, the view angles,
the scroll numbers, what you asked, and anything left for the orchestrator's review.
