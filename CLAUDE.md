# Cuber

A Rubik's Cube solver. The user copies the colours of a real cube on to a 3D cube on
the screen, presses Solve, and follows the moves in the box under it while the screen
cube turns with each move. It runs as an installed Windows app (Tauri 2 over WebView2,
like Simple Chess in `../SimpleChess` and the Repertoire Trainer in `../London`) and,
later, as an iPad Home Screen app (a PWA on Cloudflare Pages, like Conquest in
`../Conquest`), from one React, TypeScript and Vite code base. The shell, the theme,
the settings helpers, the installer and the testing rules are copied from those apps.

Current state: specified and planned 2026-09-11. Phase 0 (the scaffold: the header,
the theme toggle, the two test projects) built 2026-09-11. Phase 1 (the model, the
validator, the vendored solver with its worker, the storage helpers) built 2026-09-12,
with nothing new on screen. Phase 2 (the cube drawn in CSS 3D, the picker, the colour
menu, the validation sentences, Reset and the two views) built 2026-09-12. Phase 3
(Solve, Hint, the box, the steps and the layer animation) built 2026-09-12, and Nick
solved a real cube by following the screen the same day. Phase 4 (the scenes, the
probe, the layout pass and painting over a filled sticker) built 2026-09-12: the
app now fits the 800 by 1000 window with a solution in the box, and any screen
state opens from the address bar in a development build. Phase 5 (the Tauri
window, the NSIS installer, the icon and the acceptance walk) built 2026-09-12:
version 1.0.0, `src-tauri/target/release/bundle/nsis/Cuber_1.0.0_x64-setup.exe`,
and the built window measured at 800 by 1000 with fifteen pixels to spare. Nick
installed it, solved a cube with it and uninstalled it the same day: version
1.0.0 is accepted. Phase 6 (the web app manifest, the service worker, the update
banner, the icon files and the deploy document) built 2026-09-12 at version
1.1.0: the built app opens and solves with the server stopped. What is left of it
is Nick's box 6.6: publish to Cloudflare Pages, add it to the iPad Home Screen,
and solve a cube in aeroplane mode. His steps are in
[docs/cuber-deploy.md](docs/cuber-deploy.md).

## Documents

- [docs/cuber-spec.md](docs/cuber-spec.md) - what the app does and how it is built.
  Authoritative. Section 2 records Nick's rulings Q1 to Q17; numbered decisions C1
  upward carry their reasons.
- [docs/cuber-build-plan.md](docs/cuber-build-plan.md) - the phases, their boxes, and
  the rules for the builder. Tick a box when the item lands with green tests and
  works on screen.
- [docs/testing.md](docs/testing.md) - the two kinds of test and the rules the suite
  keeps (arrives in phase 0).
- [docs/acceptance.md](docs/acceptance.md) - the acceptance walk: spec section 17
  item by item, what was done to check it, and what was seen, with the iPad walk
  after it.
- [docs/cuber-deploy.md](docs/cuber-deploy.md) - publishing the iPad app. Every
  step in it is Nick's: GitHub, Cloudflare Pages, the domain, the Home Screen and
  the aeroplane-mode check.
- `Cuber-brief.txt` - Nick's brief, kept for history. Build from the spec, not from
  this.
- `layout.jpg` - the drawing Nick's son made of the screen. The spec's section 4
  follows it.

## Who does what

- **The orchestrator** is a session started here that writes the spec, the plan and
  one chip per phase, reviews each phase after it lands, and keeps the docs current.
  It builds nothing substantial itself.
- **The builder** is an Opus session that works one phase from its chip, on `main`,
  in this folder, and never pushes. It asks Nick rather than guessing on anything a
  person would see or feel. The plan's "Rules for the builder" bind.
- **Nick** rules, pushes to GitHub, tests with a real cube, and does the Cloudflare,
  DNS, iPad and installer steps that need his accounts and his devices.

## Toolchain

- Node 22.12.0 (`.node-version`), npm. `.node-version` is what Cloudflare Pages will
  read in phase 6 and matches the trainer's; the node on this machine is 20.20.2 and
  everything is green on it (ruled at gate 5: leave both as they are). The Rust
  toolchain (`cargo 1.98`) is at `%USERPROFILE%\.cargo\bin` and is NOT on the shell's
  PATH: put it there before any `npm run tauri` command.
- `npm run dev` on port 5190 (`--strictPort`; 5173 is dc.web, 5175 is London, 5180
  and 5181 are Conquest, 5185 and 5186 are Simple Chess). `npm run preview` on 5191.
- `npx vitest run` runs both test projects. `tsc -b` type-checks. `npm run build`
  makes `dist/`, and from phase 6 that includes `manifest.webmanifest` and
  `sw.js`. `npm run icons` redraws the four PWA icon files from
  `public/icon.svg`; its output is committed, so it only runs when the drawing
  changes. `npm run tauri build` makes the installer, and needs
  `%USERPROFILE%\.cargo\bin` put on the shell's path first: it is not there by
  default, and the setting does not survive between tool calls.
- The solver is vendored: `src/solver/vendor/` holds cubejs 1.3.2's two files with an
  ES module edit each. Nothing is installed from npm for it. Spec C5.

## Architecture rules

- `src/model` and `src/solver` import no React and touch no browser global except
  the worker in `solver.ts`. `src/storage` is the only place that reads or writes
  storage. `src/ui` holds every component. Spec C17.
- Stickers are numbered in the library's facelet order, U R F D L B, nine each, and
  `src/model/geometry.ts` is the only place that says which sticker is where. Spec C7.
- The library's `move` is the only face-turn implementation. The validator is ours
  and runs before anything reaches the library. Spec C6, section 6.4.
- The solver runs in a web worker, warmed up when the app opens. Spec C10.
- The screen is drawn from the provider's state. A layer turn is a web animation on
  the nine cubies (`turn-layer.ts`, cancelled in a layout effect when the move
  commits), then the model applies the move and the cube is redrawn. Spec 9.4.
- Tauri is imported lazily behind `isDesktop()`, and only from `src/storage`. Spec C18.
- The service worker is never registered inside the Tauri window. `UpdateWatch` is
  the one caller of `useUpdate`, and `Shell` renders it only when `!isDesktop()`.
  The installed app takes a new version from the installer; a stored old copy
  inside its window would make a reinstall look like it had done nothing. Spec C21.

## Code quality (applies from the first line, never as a later pass)

- One implementation per algorithm. The homes: the library's `move` (every turn);
  `geometry.ts` (every "which sticker is where"); `validate.ts` (every rule about a
  possible cube); `moveSentence` (every sentence); `read`, `write`, `readOneOf` and
  `useRemembered` in `prefs.ts` (every stored setting); `ColourMenu` (the right-click
  and the long-press menu); the provider's `paint` (every way a sticker gets a
  colour). Never fork a second copy, and give any new repeated snippet a single home
  the moment it appears twice.
- Copied files are byte-identical to their origin plus one `Origin:` line; adapted
  files say what changed in that line. Spec C16.
- `main.tsx` stays free of test-harness code: the dev scenes live in `src/dev/`.
- Close every phase with a short reuse and duplication review of the new code, and
  refactor on the spot before the phase commit.
- Check every change a person can see in the pane inside the same phase, with the
  scenes and the layout probe of spec section 15. The page never scrolls sideways.

## Conventions

- Spec section 3 words, exactly: the user, the cube, sticker, face, centre, piece,
  colour, the scheme, the picker, the near view, the far view, move, the solution,
  step, the box, the solver, the validator. On screen: "the top face", never "the up
  face". One name for one thing.
- No em dashes anywhere under `src/`. Docs use plain hyphens.
- Australian English on screen and in docs.
- `npx vitest run` green and `tsc -b` clean before every commit. No snapshots, no
  fake timers, no worker in the DOM suite. Under twenty seconds, including the one
  slow solver test.
- Commits: short imperative subject, a body that says why. End the message with
  `Co-Authored-By: <the model you are> <noreply@anthropic.com>`. PowerShell 5.1
  mangles some multi-line messages: write the message to a scratch file and use
  `git commit -F` when in doubt.
- Never change anything under `../London`, `../SimpleChess` or `../Conquest`. Read
  and copy only.
- Never push. Nick pushes.

## Standing hazards

- **cubejs's `fromString` does not validate.** A bad string makes a broken cube that
  can hang `solve`. The validator runs first, always. Spec 6.4.
- **The library's facelet order is not the screen's order.** A sticker index is a
  library index. Any "which sticker is this" question goes through `geometry.ts`, and
  C19 item 1 pins the table against the library's own piece tables.
- **`initSolver` takes about a second here, and longer on an iPad.** It runs in the
  worker, never on the main thread, and never in more than one test.
- **A hidden or busy browser pane throttles React and CSS transitions.** Poll for the
  DOM to change; do not read once and conclude. The trainer met this twice, and at
  Cuber's phase 2 the provider reached the far view while the cube on screen was
  still turning for seconds more, which reads exactly like a wrong transform. Front
  the tab, wait, then read the computed transform against the inline one.
- **A background pane tab throttles the worker's timers and stalls animations.** At
  gate 3 the built app was ready in 1.1 s and solved in 10 ms with its tab in front,
  and 4.8 s and 1.0 s in the background. A builder session saw animations stall
  outright. Any number about time, and any check about motion, is taken with the
  tab fronted, and a check about motion is better asked in arithmetic
  (`turn-direction.test.ts`) than by eye.
- **A pane screenshot can show the previous page for minutes.** At phase 4 a
  navigation to `?theme=light` left the pane capturing the old dark frame through
  scrolls, waits and repeated captures, while `getComputedStyle` said the page was
  light. A real click on the theme toggle made it capture properly. A screenshot is
  not evidence on its own: read the computed styles beside it, believe the styles
  when the two disagree, and force a repaint with a click.
- **An offline check cannot go through the pane's tools.** `preview_stop` and the
  pane's `navigate` both refuse a dead server, so stop the server PROCESS (find it
  by port with `Get-NetTCPConnection`) and reload from inside the page with
  `location.reload()`. A pane whose page reports `document.visibilityState` as
  hidden registers no service worker and stalls its timers: check that first when
  a registration or a cache comes back empty (gate 6).
- **The pane's viewport emulation sends no `resize` event.** Anything that measures
  the fit rule after a `resize_window` must reload the page first, or the scene keeps
  its old size and the numbers lie.
- **Simple Chess's dev server may be running on 5185.** Confirm the served page shows
  this app's version before trusting any live check.
- **Never run `npm install --prefix <path>` with this folder's path.** npm takes the
  path as a package too: it added `"cuber": "file:"` to `dependencies` and made
  `node_modules/cuber` a link back to the repository, and a recursive delete through
  that link would have deleted the repository. Run npm from the folder itself. The
  `--prefix` in `.claude/launch.json` is safe because it comes before `run`.
- **The uninstall hook deletes a folder.** Its guard is copied from Tauri's own block
  and is not optional. `scripts/check-uninstall-hook.mjs` proves all four cases.
- **A rotation needs a `transform-origin`; a translation does not.** `.cube` is a
  zero-size point at the centre and a `.cubie` has no `left` or `top`, so a cubie's
  box starts at that point and its default origin is half a cubie down and right of
  the cube's axes. Translations ignore the origin, so the cube at rest drew
  correctly and the fault was invisible until a layer turned: the layer then swung
  about a point off centre and slid off the cube (Nick, 2026-09-14). `scene.css`
  sets `transform-origin: 0 0` and `turn-direction.test.ts` guards the rule by
  reading the file, because jsdom has no layout and no cascade and no other test
  can see it. Anything new that ROTATES inside the scene needs its pivot checked in
  the pane, not reasoned about.
