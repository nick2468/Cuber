# Chip: phase 6 - the iPad Home Screen app

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push. This chip is
self-contained: it carries everything you need, because your session may have been
compacted and the earlier phases' context may be gone.

## Where things stand

Cuber is a Rubik's Cube solver. The user paints the colours of a real cube on to a
CSS 3D cube on the screen, presses Solve, and follows the moves in the box under
it while the screen cube turns with each move. It is React 19, TypeScript, Vite 8
and vitest 4, with a vendored Kociemba solver (`src/solver/vendor/`) running in a
web worker. Phases 0 to 5 are built and passed their review gates (latest commit on
`main` before this chip: `01b9174`). Version 1.0.0 is accepted: Nick installed the
Windows app (Tauri 2 over WebView2, `src-tauri/`), solved a real cube with it, and
uninstalled it. The suite is 33 files, 184 tests, about 8 seconds. `npm run build`
makes `dist/` with the solver's worker as its own 17 kB chunk.

This phase makes the same web app installable on an iPad as a Home Screen app that
works with no internet: a web app manifest, a service worker that stores the whole
app, an update banner that offers a new version rather than forcing it, the icon
files iPadOS wants, and a deploy document for the steps that need Nick's Cloudflare
account and his iPad. It ships as version 1.1.0. Nothing about how the app solves a
cube changes.

## Read first, in this order

1. `CLAUDE.md` in this folder. Every rule binds. The ones that matter most here:
   never `npm install --prefix <path>` with this folder's path; run npm from this
   folder; no screenshot files; never start a headless browser; a background pane
   tab throttles timers and stalls animations, so front the tab; reload after
   `resize_window`; Nick's own files are not yours.
2. `docs/cuber-spec.md` sections 4.2, 10, 12 (all of it, it is this phase's design),
   13, 17 and the "Left out on purpose, and later" table in 16.
3. `docs/cuber-build-plan.md`: "Rules for the builder", the gate 5 findings at the
   end of the phase notes, and the whole of "Phase 6 - the iPad Home Screen app".
   Boxes 6.1 to 6.7 are your work list; 6.6 is Nick's.
4. Under `C:\Users\nick2\Code\Conquest` (the app this phase is copied from):
   `vite.config.ts` (the `VitePWA` block and its comments), `src/ui/useUpdate.ts`,
   `src/ui/UpdateBanner.tsx`, `src/ui/updates.ts` and `updates.test.ts`,
   `src/ui/App.tsx` around lines 116 and 349 (how the banner is used),
   `src/ui/styles.css` around lines 895 to 930 (the `.update-bar` rules),
   `src/vite-env.d.ts` (the one reference line), `tools/make-icons.mjs`,
   `package.json` (the versions of `vite-plugin-pwa` and `sharp`),
   `docs/conquest-deploy.md` in full.
5. In this folder: `index.html` (the iPad meta tags and icon links are already
   there, pointing at files this phase makes), `public/icon.svg` (the icon drawn at
   phase 5, a 1024 square with a rounded dark ground), `src/ui/App.tsx` (`Shell`
   and `App`), `src/storage/paths.ts` (`isDesktop()`), `src/ui/app.css`,
   `src/index.css` (the palette variables), `src/test/dom.tsx`, `src/version.test.ts`,
   `docs/acceptance.md`, `README.md`, `.gitignore` (`dev-dist/` is already there).

Never change anything under `../London`, `../SimpleChess` or `../Conquest`.

## Facts verified by the orchestrator on 2026-09-12

- Conquest's `useUpdate.ts` is generic: nothing in it is about Conquest, so it is
  copied byte for byte plus one `Origin:` line. It has a dev-only `?pretendUpdate`
  query that shows the banner without a real update, which is how the banner is
  checked in the pane.
- Conquest's `updates.ts` has two notices because a Conquest game lives only in
  memory. Cuber remembers the cube, the theme and the speed in `localStorage` (spec
  10), so loading a new version costs nothing and there is ONE notice.
- Conquest calls `useUpdate()` unconditionally in its `App`. Cuber must not call it
  inside the Tauri window (spec C21, and Simple Chess's rule S12 for the same
  reason): a WebView2 app updates by installer, and a service worker holding an
  old bundle inside it would make "new code reaches the window after a reinstall"
  untrue. `isDesktop()` in `src/storage/paths.ts` says whether the app is inside
  the Tauri window.
- The solver's worker chunk is `dist/assets/worker-*.js`, about 17 kB minified, so
  the `js` glob precaches it and no `maximumFileSizeToCacheInBytes` is needed
  (Simple Chess needs one for a 7 MB engine; Cuber does not).
- The local node is 20.20.2 and `.node-version` says 22.12.0: the file is what
  Cloudflare Pages reads, and the local node is fine (ruled at gate 5). Conquest's
  `sharp ^0.35.4` and `vite-plugin-pwa ^1.3.0` run on both.
- `public/icon.svg` from phase 5 has `rx="160"` on its ground rect. iPadOS rounds
  Home Screen icons itself, so `apple-touch-icon.png` must be drawn SQUARE or its
  corners are clipped twice (Conquest's `make-icons.mjs` says so and draws a
  square variant). The other three files keep the rounded ground.
- `npm run preview` serves `dist/` on 5191 with `--strictPort`. A service worker
  runs on `localhost` without HTTPS, which is what makes the offline proof possible
  on this machine. `npm run dev` has no service worker, by design.
- The pane's `preview_stop` tool stops a server started by `preview_start`; a page
  already loaded keeps running, which is how "stop the server, then reload" is
  done for the offline proof.

## What this phase delivers

- `npm run build` writes `dist/manifest.webmanifest` and `dist/sw.js` beside the
  app, and `dist/index.html` links the manifest.
- Served by `npm run preview`, the app opens after the server is stopped and solves
  the scrambled cube with no server at all.
- A new version shows a banner, "A new version is ready", with "Load it" and "Not
  now", and never inside the Tauri window.
- `public/` holds `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180,
  square) and `favicon-32.png`, made by `npm run icons` from `public/icon.svg`.
- `docs/cuber-deploy.md` walks Nick through GitHub, Cloudflare Pages, the custom
  domain, the Home Screen and the aeroplane-mode check.
- Version 1.1.0 in `package.json`, `src-tauri/tauri.conf.json` and
  `src-tauri/Cargo.toml`, with the four version tests green.

## The pieces, exactly

**Dependencies.** `npm install --save-dev vite-plugin-pwa@^1.3.0 sharp@^0.35.4`,
from this folder. `package.json` gains the script `"icons": "node tools/make-icons.mjs"`.

**`src/pwa.d.ts`** (new, one line plus a comment): `/// <reference types="vite-plugin-pwa/react" />`,
so `virtual:pwa-register/react` type-checks. A new file rather than a line in
`src/globals.d.ts`, which is an identical copy of London's and stays one.

**`vite.config.ts`**: import `VitePWA` from `vite-plugin-pwa` and add it after
`react()`, in Conquest's shape and with Conquest's two comments (why `prompt` and
why `injectRegister: null`), reworded for Cuber where they speak of a game:

```ts
VitePWA({
  registerType: 'prompt',
  injectRegister: null,
  includeAssets: ['apple-touch-icon.png', 'favicon-32.png', 'icon.svg'],
  manifest: {
    name: 'Cuber',
    short_name: 'Cuber',
    description: 'Solves a Rubik\'s Cube from its colours.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#16181c',
    theme_color: '#16181c',
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'] },
  devOptions: { enabled: false },
}),
```

The `test` block stays as it is. If the plugin makes the vitest run slower or
noisier, say so in the notes with the numbers.

**`src/ui/useUpdate.ts`**: Conquest's, identical, plus `Origin: Conquest
src/ui/useUpdate.ts, identical.` at the top of its header comment.

**`src/ui/updates.ts`**: one function, `updateNotice(): UpdateNotice`, returning
`{ heading: 'A new version is ready', detail: 'Your cube and settings are
remembered, so loading it loses nothing.', confirmLabel: 'Load it' }`. The header
comment says why there is one notice (spec 10: the cube is remembered), where
Conquest needs two. `Origin: Conquest src/ui/updates.ts, adapted: one notice`.
`updates.test.ts`: the heading contains "new version", the detail says
"remembered" and "loses nothing", the button reads "Load it".

**`src/ui/UpdateBanner.tsx`**: Conquest's without the `gameInProgress` prop:
props `onUpdate` and `onLater`, an `<aside className="update-bar" role="status"
aria-label="A new version is ready">` with the heading, the detail, "Not now" and
"Load it". Its CSS: Conquest's `.update-bar`, `.update-words`, `.update-buttons`
and `.primary` rules copied into `app.css` under a "the update banner" comment,
with Conquest's colour variables replaced by this app's (`--surface` for the
panel, `--line` for the edge, `--text` and `--text-dim` for the words,
`--accent-solid` and `--accent-edge` for the primary button) and its safe-area
padding kept: the banner sits at the bottom of the screen, above the home
indicator.

**`src/ui/UpdateWatch.tsx`** (new): a component that calls `useUpdate()` and
renders `<UpdateBanner>` when `waiting`, else nothing, inside a
`<div className="update-watch">` so a test can see it is mounted. `Shell` renders
`<UpdateWatch />` only when `!isDesktop()`. The hook is therefore never called in
the Tauri window, and the rule of hooks is not broken, because the condition is on
the component, not inside it.

**`tools/make-icons.mjs`**: adapted from Conquest's. It reads `public/icon.svg`
(no map, no drawing code), makes the square variant by replacing `rx="160"` with
`rx="0"` in the SVG text, and writes with `sharp`: `icon-192.png` (192, rounded),
`icon-512.png` (512, rounded), `apple-touch-icon.png` (180, square),
`favicon-32.png` (32, rounded), all into `public/`. `Origin: Conquest
tools/make-icons.mjs, adapted: reads the icon SVG rather than drawing the map`.
Run `npm run icons` and commit the four files.

**Version 1.1.0** in the three files (`package-lock.json` follows after `npm
install`). `src/version.test.ts` needs no change.

**`docs/cuber-deploy.md`**: Conquest's deploy document adapted, in the same shape
and order. Project `cuber`, repository `nick2468/Cuber` (private), domain
`cuber.datacrafter.net`, build command `npm run build`, output `dist`, Node 22.12.0
from `.node-version` and a `NODE_VERSION` variable. Steps 1 to 3 are not done yet
here (Conquest's say "(done)"; Cuber's do not), and step 1 starts with creating the
repository, because this repository has no remote: `gh repo create Cuber --private
--source . --remote origin --push` or the two-command form. Keep Conquest's
warning about the "Complete DNS setup" panel and its Node version note. Step 4 is
the Home Screen, step 5 the aeroplane-mode check, and "Getting a new version onto
the iPad" describes the banner: open the app, and if a new version is waiting the
banner offers "Load it"; nothing is lost because the cube is remembered. Every step
that needs his account or his iPad says "Nick". Nothing in it is a step for a
session.

**`docs/acceptance.md`**: a new section at the end, "The iPad walk", with three
lines: the offline proof (done here), the Home Screen and aeroplane-mode check
(Nick: pending), and the update banner seen (done here with `?pretendUpdate`).

## Steps

1. `git status` first. Clean, with the commit that added this chip on top of
   `01b9174`. If not, stop and report. Never stash, reset or discard.
2. Box 6.1: the two dependencies, `tools/make-icons.mjs`, `npm run icons`, the
   four files committed. Look at `apple-touch-icon.png` and `icon-192.png` (the
   Read tool shows images): a corner-on cube, white top, green left, red right,
   the first square-cornered and the second rounded. Commit: "Make the icons the
   iPad wants".
3. Boxes 6.2 and 6.3: the plugin, `src/pwa.d.ts`, the hook, the notice, the
   banner, `UpdateWatch`, the CSS, the tests. Tests: `updates.test.ts` as above;
   `update-banner.dom.test.tsx` renders `UpdateBanner` with two spies and clicks
   both buttons; `update-watch.dom.test.tsx` renders `Shell` inside the provider
   once with `window.__TAURI_INTERNALS__ = {}` set before render (and deleted
   after) and asserts `.update-watch` is absent, and once without it and asserts
   it is present. **If `virtual:pwa-register/react` cannot be imported under
   vitest** (the plugin is in the Vite config, so it should resolve; Conquest's
   suite runs with it), add `vi.mock('virtual:pwa-register/react', () => ({
   useRegisterSW: () => ({ needRefresh: [false], updateServiceWorker: async () =>
   {} }) }))` to `src/test/dom-setup.ts` with a comment, and say so. Commit:
   "Store the app for the Home Screen and offer new versions".
4. Version 1.1.0 in three files, `npm install`, the version tests green. Commit:
   "Set version 1.1.0 for the iPad app".
5. Box 6.4, the offline proof, in the pane with the tab FRONTED:
   - `npm run build`. Check `dist/sw.js` and `dist/manifest.webmanifest` exist,
     `dist/index.html` has a `<link rel="manifest">`, and the precache list in
     `dist/sw.js` names `assets/worker-*.js` (search the file for `worker-`).
     Record the number of precached entries.
   - Start `cuber-preview` from `.claude/launch.json` (port 5191). Open the pane
     at `http://localhost:5191`, wait for the page, then in the JavaScript tool
     wait for `navigator.serviceWorker.ready` and record `controller !== null`
     after one reload.
   - Seed the scrambled cube: `localStorage.setItem('cuber.cube',
     'yyogwgryryoggrbwobwrgygwyogryrbywowyorbrobwobwggwbborb')`, reload, wait for
     Solve to be enabled.
   - **Stop the preview server** (`preview_stop`). Reload the page. It must open
     from the service worker. Press Solve. Nineteen moves must appear ("Solved in
     19 moves."), which proves the worker chunk was precached too. Step forward
     once. Record all of it. If the page does not open, the first thing to check
     is the glob; if it opens and Solve never enables, the worker chunk is missing
     from the precache.
   - Clear the pane's storage and unregister the service worker afterwards
     (`(await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister())`),
     so later phases' pane drives do not meet a cached build.
6. The banner in the pane: start `cuber-dev` (5190), open
   `http://localhost:5190/?pretendUpdate`, and see the banner at the bottom with
   its two buttons; press "Not now" and it goes; open again and press "Load it" and
   the page reloads. Say what you saw. Both themes.
7. Box 6.5, `docs/cuber-deploy.md`; the acceptance section; `README.md` ("The iPad
   app" with the two commands and a pointer to the deploy doc; the "Later" line
   goes); `CLAUDE.md`'s "Current state" and its toolchain line (the icons script);
   `docs/testing.md` if a mock was added. Box 6.7's reuse review: one notice, one
   banner, the icon drawn once (`public/icon.svg`) and only resized here, no
   second copy of the manifest's colours (`#16181c` is the ground in `index.css`;
   say in the config comment that it must match). Commit: "Write Nick's iPad
   steps and finish the docs for 1.1.0".
8. Append the phase 6 notes to the plan (what was measured: precache count, the
   offline solve, the banner; what was decided; what was asked; what is left), tick
   the boxes, set the Progress row to "Done, <date>, the iPad itself waits for
   Nick". Box 6.6 stays open for Nick.

## Decision rules for the small things

- The banner's words are the ones above, exactly. Australian English.
- The banner sits at the bottom, full width, above the safe area, and never
  covers the box's controls when it shows: it is a fixed bar and the page keeps
  its own scroll.
- The service worker must never be registered in the Tauri window. If you find a
  way it could be (the manifest link in `index.html` is fine; a registration is
  not), close it and say so.
- No Tauri build is needed this phase. The version files change and the four
  version tests hold them together; the next Tauri build picks 1.1.0 up.
- If `sharp` fails to install on this machine's node, stop and report the message
  rather than trying another package.
- Nothing under `src/model`, `src/solver` or `src-tauri/src` changes.

## Out of scope

Creating the GitHub repository, the Cloudflare project, the DNS record, adding to
the Home Screen and the aeroplane-mode check: Nick's, in the deploy document. A
Tauri build. The non-standard cube colours, the photo entry and the beginner method
(spec 16, later phases).

## If something does not fit

Stop that item, write the contradiction under the phase 6 notes in
`docs/cuber-build-plan.md`, and carry on with the items that do not depend on it.
Ask Nick when a choice would change what a person sees. Decide small matters of
code shape yourself and say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.
- `npx vitest run` green under twenty seconds, `tsc -b` clean and `npx oxlint`
  silent before every commit. No em dashes under `src/`. Copied files carry one
  `Origin:` line; adapted files say what changed in it.

## Done when

Boxes 6.1 to 6.5 and 6.7 ticked; the offline solve proven in the pane with the
server stopped; the banner seen both ways; the four icon files, the manifest and the
service worker in the build; version 1.1.0 in three files with the version tests
green; the deploy document written for Nick; the phase notes written. Finish with a
short report: what landed, the commit hashes, the precache count and the offline
solve, and exactly which steps in `docs/cuber-deploy.md` are Nick's, in order.
