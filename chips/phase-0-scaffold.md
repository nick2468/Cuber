# Chip: phase 0 - the scaffold

You are a Claude Opus 5 builder session in `C:\Users\nick2\Code\Cuber`, working on
`main` in this folder. There is no worktree and no remote. Never push.

## Read first, in this order

1. `CLAUDE.md` in this folder. Every rule in it binds.
2. `docs/cuber-spec.md` sections 1 to 4, 10, 13 and 14. Skim the rest so you know
   what is coming.
3. `docs/cuber-build-plan.md`: "Rules for the builder", "Standing discipline" and
   the whole of "Phase 0 - the scaffold". The boxes there are your work list.
4. The files you will copy, all under `C:\Users\nick2\Code\London`: `package.json`,
   `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`,
   `.oxlintrc.json`, `.gitignore`, `index.html`, `src/main.tsx`, `src/index.css`,
   `src/globals.d.ts`, `src/version.test.ts`, `src/ui/theme.ts`, `src/ui/app.css`,
   `src/test/dom-setup.ts`, `docs/testing.md`. And under `C:\Users\nick2\Code\Conquest`:
   `index.html`, `.node-version`, `.vscode/`, `.claude/launch.json`.
5. If `C:\Users\nick2\Code\SimpleChess` has a `package.json` by the time you start,
   its phase 0 did this same scaffold a day earlier from the same origins. Copy from
   SimpleChess where it differs from London, and say in your notes which you used.

Never change anything under `../London`, `../SimpleChess` or `../Conquest`. Read and
copy only.

## What this phase delivers

`npm run dev` opens a page titled Cuber with the app name, the version and a theme
toggle. `npx vitest run` is green. `tsc -b` is clean. `npm run build` makes `dist/`.
Nothing else is on the screen yet.

## Settled decisions you do not revisit

- Name `cuber`, version `0.1.0`, dev port 5190 with `--strictPort`, preview port
  5191. Spec section 2 and CLAUDE.md "Toolchain".
- Storage key for the theme is `cuber.theme`. Dark by default. Spec section 10.
- `index.html` takes Conquest's head (lang `en-AU`, `viewport-fit=cover`,
  theme-color `#16181c`, the two `mobile-web-app-capable` metas, the icon links)
  with the title Cuber. The icon files do not exist yet. The links may point at
  files that are not there. Spec 4.2.
- No PWA plugin, no Tauri folder, no solver, no dependencies beyond `react`,
  `react-dom` and `@tauri-apps/api` at the trainer's versions, plus the trainer's
  dev dependencies. Pin the four testing-library and jsdom versions exactly as the
  trainer does. Plan 0.1.
- Copied files are byte-identical to their origin plus one `Origin:` line at the
  top of the header comment, for example `Origin: London src/index.css,
  identical.` An adapted file says `Origin: London src/ui/theme.ts, adapted: the
  storage key.` Spec C16.
- `app.css` is cut to `.app`, `.app-header`, `.app-version`, `.nav-link`,
  `.theme-toggle`, `button`, `button:disabled` and the `@media (min-width: 900px)
  and (min-height: 700px)` block. Plan 0.7.
- `version.test.ts` is the trainer's. Its two tests that read the Tauri files are
  marked `it.skip` with a comment naming phase 5. Plan 0.9.
- `docs/testing.md` is the trainer's, adapted: drop the content checkers and the
  board stub, keep the two kinds of test, what is faked and why (the solver, from
  phase 3), and the rules, naming the one slow solver test as the exception to the
  no-slow-test rule. Plan 0.11.
- Australian English on screen and in docs. No em dashes under `src/`.

## Decision rules for the small things

- Where a copied config names a thing this app does not have (the engine copy
  script, `public/engine/`, `ts-fsrs`, chess packages), leave it out. Do not leave
  a dead script or a dead dependency behind.
- Where the trainer's `tsconfig` does not check JavaScript, add nothing for the
  vendor folder now. Phase 1 handles it.
- `App.tsx` is the header and an empty `<main>`. No provider, no context, no state
  beyond the theme hook.
- The `.claude/launch.json` entries are `cuber-dev` (`npm run dev`, port 5190) and
  `cuber-preview` (`npm run preview`, port 5191), in Conquest's shape with the
  `--prefix` flag pointing at this folder.

## Steps

1. `git status` is meaningless until `git init`. Run `git init`, then make the first
   commit from what is already here: `CLAUDE.md`, `README.md`, `Cuber-brief.txt`,
   `layout.jpg`, `docs/`, `chips/`. Subject: "Add the spec, the plan and the house
   rules". Stage explicit paths. Never `git add -A`.
2. Work through plan boxes 0.1 to 0.14 in order. Tick each box in
   `docs/cuber-build-plan.md` in the same sitting it lands with green tests.
3. Write the one DOM test of box 0.12: the header shows "Cuber" and the version,
   and the theme toggle flips `data-theme` on the root and writes `cuber.theme`.
4. Update `README.md`'s "Running it" section to say the commands now work (box
   0.13).
5. Start the dev server through `.claude/launch.json` (`cuber-dev`) and open it in
   the browser pane. Confirm the served page's version is `0.1.0` from this
   folder's `package.json` before trusting what you see (Simple Chess may be
   serving on 5185). Screenshot the header in both themes at 800 by 1000. Clear the
   pane's storage afterwards.
6. Reuse and duplication review of everything new. Refactor on the spot. Say in the
   phase notes what it found, even if nothing.
7. `npx vitest run` green, `tsc -b` clean, `npm run build` produces `dist/`. Then
   commit the scaffold. One commit is fine. Subject: "Scaffold the app from the
   trainer's shell".
8. Append the phase 0 notes under "Phase notes" in `docs/cuber-build-plan.md`: what
   you copied and from where, what you adapted, what the review found, the two
   screenshots' names, anything you asked Nick and what he said. Set the Progress
   table's phase 0 row to "Done, <date>".

## Out of scope

Anything on the screen beyond the header. The model, the solver, the cube, the
picker, the box, Tauri, the PWA, icons, scenes, the probe. All of those have their
own phases.

## If something does not fit

Stop that item, write the contradiction under the phase 0 notes, and carry on with
the items that do not depend on it. Ask Nick when the choice would change what a
person sees. Decide small matters of code shape yourself and say what you decided.

## Conventions

- Commits: short imperative subject, a body that says why. End every message with
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (name the model you
  actually are). PowerShell 5.1 mangles some multi-line messages: write the message
  to a scratch file and use `git commit -F`.
- Stage explicit paths. Never `git add -A`. Never `git clean`. Never push.

## Done when

The plan's phase 0 "Done when" line is true: the dev page shows the header in both
themes, the suite is green, `dist/` exists, every box 0.1 to 0.14 is ticked, and the
phase notes are written. Finish with a short report: what landed, the commit hashes,
what you asked, and anything left for the orchestrator's review.
