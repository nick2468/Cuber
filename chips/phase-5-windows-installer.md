# Chip: phase 5 - the Windows app and the installer

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push. This chip is
self-contained: it carries everything you need, because your session may have been
compacted and the earlier phases' context may be gone.

## Where things stand

Cuber is a Rubik's Cube solver. The user paints the colours of a real cube on to a
CSS 3D cube on the screen, presses Solve, and follows the moves in the box under
it while the screen cube turns with each move. It is React 19, TypeScript, Vite 8
and vitest 4, with a vendored Kociemba solver (`src/solver/vendor/`, from the cubejs
library) running in a web worker. Phases 0 to 4 are built and passed their review
gates (latest commit on `main` before this chip: `892ff91`). The web app is
complete against the spec: Nick solved a real cube by following the screen. The
suite is 33 files, 182 tests, about 10 seconds. `npm run build` makes `dist/` with
the solver's worker as its own chunk.

This phase wraps that web app as an installed Windows app: a Tauri 2 window over
WebView2, an NSIS installer, an uninstaller that removes the app's one data folder
when asked, version 1.0.0, and the acceptance walk. Nothing about the web app's
behaviour changes.

## Read first, in this order

1. `CLAUDE.md` in this folder. Every rule in it binds. The ones that matter most
   here: never `npm install --prefix <path>` with this folder's path (it once added
   the repository to itself as a dependency); no screenshot files except the one
   this phase makes with `packaged-eval.mjs --shot`; never start a headless browser;
   Nick's own files are not yours.
2. `docs/cuber-spec.md` sections 10, 11 (all of it), 13, 15.3 and 17.
3. `docs/cuber-build-plan.md`: "Rules for the builder", the gate 4 findings at the
   end of the phase notes, and the whole of "Phase 5 - the Windows app and the
   installer". Boxes 5.1 to 5.8 are your work list.
4. Under `C:\Users\nick2\Code\London` (the Repertoire Trainer, which this wrapper is
   copied from): `src-tauri/tauri.conf.json`, `Cargo.toml`, `build.rs`,
   `src/main.rs`, `src/lib.rs`, `capabilities/default.json`, `installer-hooks.nsh`,
   `.gitignore`; `scripts/check-uninstall-hook.mjs`; `src/version.test.ts`. Read
   each in full: every comment in them says why something is the way it is, and
   the copies keep those comments where they still apply.
5. In this folder: `src/version.test.ts` (two tests are `it.skip` until this phase),
   `src/storage/paths.ts` (`LOCAL_FOLDER = 'Cuber Data'`), `scripts/packaged-eval.mjs`
   (London's, already copied, byte-identical plus an origin line),
   `scripts/probes/layout.js` (the layout probe), `package.json`, `vite.config.ts`,
   `index.html`, `README.md`, `docs/testing.md`.

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## Facts verified by the orchestrator on 2026-09-12

- **The Rust toolchain is installed but not on this shell's PATH.** `cargo 1.98.0`
  and `rustc 1.98.0` are at `%USERPROFILE%\.cargo\bin`. In PowerShell, before any
  `npm run tauri ...`: `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"`. In
  Git Bash: `export PATH="$HOME/.cargo/bin:$PATH"`. Do this in every shell that
  runs a Tauri command; the setting does not persist between tool calls.
- **NSIS is already cached** at `%LOCALAPPDATA%\tauri\NSIS\makensis.exe`, which is
  the first place `check-uninstall-hook.mjs` looks. The trainer's last installer
  built there on 2026-09-06, so the toolchain works on this machine.
- **The first `tauri build` compiles the Rust side from scratch** and takes several
  minutes. Run it with a long timeout (ten minutes) or in the background and wait
  for it. Later builds are fast.
- **The trainer's wrapper uses two Tauri plugins, `fs` and `dialog`. Cuber uses
  neither.** Cuber reads and writes no files: everything it keeps is in
  `localStorage`, which lives in the window's WebView2 profile. So the plugin
  crates, the `.plugin(...)` lines, the `plugins` block in `tauri.conf.json` and
  every `fs:` and `dialog:` permission are left out.
- **The trainer keeps two data folders; Cuber keeps one.** The trainer's hook
  removes `$APPDATA\Repertoire Trainer` and `$LOCALAPPDATA\Repertoire Trainer
  Data`. Cuber's removes only `$LOCALAPPDATA\Cuber Data`, which holds the WebView2
  profile and nothing else.
- **The dev scenes do not exist in a built app** (they are dead in production by
  design). To put a cube into the installed window, write storage through
  `packaged-eval.mjs`: `localStorage.setItem('cuber.cube', '<54 chars>')` then
  `location.reload()`. The scrambled cube's text is
  `yyogwgryryoggrbwobwrgygwyogryrbywowyorbrobwobwggwbborb`.
- **The built app's solver is ready about 1.1 seconds after the page opens** and a
  solve takes about 10 ms, measured at gate 3 with the page in a fronted tab. In
  the Tauri window there is no tab to front; measure and record what you see.
- **The page fits 800 by 1000 with nine pixels to spare in a browser** (gate 4). The
  Tauri window's inner size is what `innerHeight` reports; measure it with the
  probe and say whether the page still fits.

## The files, exactly

Write these. Where a line is the trainer's, keep the trainer's comment beside it
and add an `Origin:` line at the top of the file's header comment (JSON files have
no comments, so they carry none). Where a line is Cuber's, the comment describes
Cuber.

**`src-tauri/tauri.conf.json`** (adapted from the trainer's):

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Cuber",
  "version": "1.0.0",
  "identifier": "com.nick.cuber",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5190",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "create": false,
        "title": "Cuber",
        "width": 800,
        "height": 1000,
        "minWidth": 680,
        "minHeight": 800,
        "resizable": true,
        "center": true,
        "label": "main"
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "icon": ["icons/icon.ico"],
    "shortDescription": "Solves a Rubik's Cube from its colours",
    "longDescription": "Paint the colours of your cube, press Solve, and follow the moves while the cube on the screen turns with you.",
    "windows": {
      "nsis": {
        "installMode": "currentUser",
        "installerHooks": "installer-hooks.nsh"
      }
    }
  }
}
```

`"create": false` is deliberate and the trainer's `lib.rs` says why: the window is
declared here and built in Rust from this same declaration, so its WebView2 profile
can be pointed at a folder with a readable name.

**`src-tauri/Cargo.toml`**: the trainer's with `name = "cuber"`, `version =
"1.0.0"`, `description = "Solves a Rubik's Cube from its colours"`, `[lib] name =
"cuber_lib"`, the same `crate-type`, `build-dependencies`, `serde`, `serde_json`,
`tauri = { version = "2", features = [] }`, NO `tauri-plugin-fs` or
`tauri-plugin-dialog`, and the trainer's `[profile.release]` block unchanged.
`Cargo.lock` is generated by the first build and committed, as the trainer's is.

**`src-tauri/build.rs`**: the trainer's, identical (three lines).

**`src-tauri/src/main.rs`**: the trainer's, with `cuber_lib::run()`.

**`src-tauri/src/lib.rs`**: the trainer's, with `LOCAL_FOLDER` = `"Cuber Data"`,
`WEBVIEW_FOLDER` = `"WebView2"`, the two `.plugin(...)` lines removed, the
`expect` messages naming Cuber, and the header comment rewritten for Cuber: it
still explains that the window is built from the config's declaration so the
profile folder can be named `Cuber Data` rather than `com.nick.cuber`, and that
`Cuber Data` is NOT the install folder (the NSIS installer's `InstallLocation` is
`%LOCALAPPDATA%\Cuber` for `installMode: currentUser`, so a sibling folder is what
an uninstall without the ticked box leaves alone). The same literal is in
`src/storage/paths.ts`; say so in both.

**`src-tauri/capabilities/default.json`**:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "What the Cuber window is allowed to do: nothing beyond the core. The app keeps everything it remembers in localStorage inside its own WebView2 profile, so it reads and writes no files and needs no plugin.",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

**`src-tauri/installer-hooks.nsh`**: the trainer's macro with ONE folder. Keep the
trainer's explanation of the guard word for word where it applies (the two
variables, why the guard is not optional, why the `!ifndef` exists), remove the
sentences about the roaming data folder, and define only:

```
!ifndef APP_LOCAL_FOLDER
  !define APP_LOCAL_FOLDER "$LOCALAPPDATA\Cuber Data"
!endif

!macro NSIS_HOOK_POSTUNINSTALL
  ${If} $DeleteAppDataCheckboxState = 1
  ${AndIf} $UpdateMode <> 1
    SetShellVarContext current
    RMDir /r "${APP_LOCAL_FOLDER}"
  ${EndIf}
!macroend
```

The guard is not optional. It is what stops an upgrade from deleting the user's
remembered cube and settings.

**`src-tauri/.gitignore`**: `target/`. (`src-tauri/gen/` is already in the root
`.gitignore`.)

**`scripts/check-uninstall-hook.mjs`**: the trainer's, adapted to one folder. The
harness defines `APP_LOCAL_FOLDER` only (delete the `APP_DATA_FOLDER` define and
the `data` fixture, report line and check), the fixture file can stay named
`progress.json` or become `settings.json` (it only has to exist), the four cases
stay exactly as they are, and the pass test is `seen.local === each.want`. The
header comment describes Cuber. Run it: `node scripts/check-uninstall-hook.mjs`.
All four cases must behave, and only the "ticked, ordinary uninstall" case may
remove the scratch folder. Paste its output into the phase notes.

**`public/icon.svg`**: a square 1024 by 1024 SVG. The dark ground `#16181c`
filling the square with a 160 px corner radius, and a corner-on cube drawn as
three rhombus faces meeting at a corner (top, front-left, front-right), each split
into nine stickers by 24 px dark gaps in `#111`, the top face's nine in white
`#f5f5f5`, the front-left's in green `#009e60`, the front-right's in red `#c41e3a`,
each sticker with a 20 px corner radius. Plain geometry, no gradients, no text.
This is the source for every icon on both platforms. Then:
`npx tauri icon public/icon.svg` writes `src-tauri/icons/` (the `.ico`, the PNG
sizes, the Store logos, `icon.icns`, and `android/` and `ios/` folders). Commit
what it writes except `android/` and `ios/`, which this app does not build for;
delete those two folders and say so.

**`src/version.test.ts`**: remove the two `it.skip`s so the four tests run. Set the
version to `1.0.0` in `package.json`, `src-tauri/tauri.conf.json` and
`src-tauri/Cargo.toml` (and `package-lock.json` follows `package.json`; run `npm
install` from this folder, with no `--prefix`, to update it).

**`docs/acceptance.md`**: the acceptance walk. Spec section 17's eleven items, each
with what was done to check it, what was seen, the date, and one of `Passed`,
`Nick: pending` (items that need Nick's hands: 8's install and uninstall) or `Waits
for phase 6` (item 9, the iPad). Item 5 is already true: Nick solved a real cube on
2026-09-12 from the dev server; say so, and phase 5's box 5.6 repeats it on the
installed app.

## Steps

1. `git status` first. Clean, with the commit that added this chip on top of
   `892ff91`. If not, stop and report what is there. Never stash, reset or discard.
2. Boxes 5.1 and 5.2 (the wrapper, the hook, the check script), and run the check.
   Commit: "Wrap the app in a Tauri window with a one-folder uninstall hook".
3. Box 5.3 (the icon SVG and `tauri icon`) and 5.4 (version 1.0.0, the two tests
   unskipped). `npx vitest run` green. Commit: "Draw the icon and set version
   1.0.0".
4. Box 5.5: put cargo on the PATH, then `npm run tauri build`. Record the installer's
   path (`src-tauri/target/release/bundle/nsis/Cuber_1.0.0_x64-setup.exe`) and its
   size, and the executable's path and size. Then drive the built executable, NOT
   the installer (installing is Nick's step):
   - In PowerShell:
     `$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=9333"`
     then `Start-Process .\src-tauri\target\release\cuber.exe`.
   - `node scripts/packaged-eval.mjs "document.title"` must answer `Cuber`.
   - `node scripts/packaged-eval.mjs "document.querySelector('.app-version').textContent"`
     must answer `v1.0.0`.
   - Poll the Solve button's `title` until it is no longer "Getting ready..." and
     record how long the solver took from the window opening.
   - Seed the scrambled cube through `localStorage.setItem` and `location.reload()`
     (the text is above), then `node scripts/packaged-eval.mjs @scripts/probes/layout.js`
     and record every number. `innerWidth` should be 800 and `innerHeight` 1000; say
     if they are not, and whether `scrollHeight` is still within `innerHeight` with
     nineteen moves in the box (press Solve through `packaged-eval` by clicking the
     button: `document.querySelector('.header-buttons button:nth-child(2)').click()`).
   - `node scripts/packaged-eval.mjs --shot "$env:TEMP\cuber-window.png"` and look at
     the file. Describe it in the notes. Do not commit it.
   - Close the window (`Stop-Process -Name cuber`), and confirm
     `%LOCALAPPDATA%\Cuber Data\WebView2` now exists: that is the profile folder
     `lib.rs` chose, and it proves the folder name rather than the identifier.
5. Box 5.7, `docs/acceptance.md`, then box 5.8: the docs sweep. Spec 11 (say the
   measured window numbers if they differ from 800 by 1000), the plan (tick, notes,
   Progress row), `docs/testing.md` (the version test's four tests), `README.md`
   (how to build the installer and where it lands), `CLAUDE.md`'s "Current state".
   Reuse review: one `LOCAL_FOLDER` literal in `paths.ts`, one in `lib.rs`, one in
   the hook, each saying the others exist; nothing else new is duplicated. Commit:
   "Write the acceptance walk and finish the docs for 1.0.0".
6. Box 5.6 is Nick's. Tell him, in your report, exactly what to do: run the
   installer from its path, open Cuber from the Start menu, enter his cube, solve
   it, close and reopen to see the cube remembered, then uninstall from Windows
   Settings with "Delete application data" ticked and confirm
   `%LOCALAPPDATA%\Cuber Data` is gone. He records the date in the plan's box 5.6
   and in `docs/acceptance.md` item 8.

## Decision rules for the small things

- Where the trainer's comment speaks of its progress file, courses or trainee,
  rewrite it for Cuber or drop it; where it explains Tauri or NSIS, keep it.
- If `tauri icon` refuses the SVG, stop and report: do not install a package to
  rasterise it. (`sharp` arrives in phase 6, not now.)
- If the first build fails in the Rust toolchain (a missing MSVC component, a
  network fetch), stop and report the exact message: that is Nick's machine to
  fix, not yours.
- If `innerHeight` in the Tauri window is under 1000 and the page scrolls with a
  solution in the box, do not change the layout: report the numbers, and the
  orchestrator rules whether the window grows or the page shrinks.
- The window's `minWidth` 680 and `minHeight` 800 stay as spec 11.1 says.
- Nothing under `src/` changes in this phase except `version.test.ts`.

## Out of scope

Installing or uninstalling on this machine (Nick's). The PWA and the iPad (phase
6, waits for Nick). Code signing and auto-update (deferred on purpose, spec 16).
The photo feature, the beginner method, the non-standard cube colours (spec 16,
later phases).

## If something does not fit

Stop that item, write the contradiction under the phase 5 notes in
`docs/cuber-build-plan.md`, and carry on with the items that do not depend on it.
Ask Nick when a choice would change what a person sees. Decide small matters of
code shape yourself and say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- `npx vitest run` green and `tsc -b` clean before every commit. No em dashes under
  `src/` or `src-tauri/`. Australian English.
- Tick each plan box in the same sitting it lands, and append the phase 5 notes
  under "Phase notes": what was measured, what was decided, what was asked, what
  is left, what the reuse review found.

## Done when

Boxes 5.1 to 5.5, 5.7 and 5.8 ticked; the installer built and its path recorded;
the check script's four cases pasted; the built window driven and measured with
the probe, the solver's time recorded, the profile folder seen; `docs/acceptance.md`
written with every item marked; version 1.0.0 in three files with four version
tests green; the phase notes written. Finish with a short report: what landed, the
commit hashes, the installer's path and size, the probe's numbers from the built
window, and the exact steps for Nick's box 5.6.
