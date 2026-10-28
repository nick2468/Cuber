# Cuber

Cuber solves a Rubik's Cube. Copy the colours of your cube on to the cube on the
screen, press Solve, and follow the moves in the box under it. The cube on the screen
turns with each move so you can follow along on the real one. Hint gives you one move
at a time instead.

Three methods, chosen in the box and remembered. **Quick solve** is about twenty moves
of computer's shorthand. **Fewest moves** is the shortest answer the same solver can
find, so a cube scrambled with three turns comes back as those three turns undone.
**Beginner method** is the layer-by-layer method every guide teaches, about 170 moves
in seven named stages, so you learn the method rather than just following it.

It runs as an installed Windows app and as an iPad Home Screen app, from one code base.

## Download

Windows: get `Cuber_<version>_x64-setup.exe` from the
[latest release](https://github.com/nick2468/Cuber/releases/latest) and run it. It installs
for the current user with no administrator prompt. From 1.2.2 the installer is signed with a
code signing certificate, so Windows names the publisher as **Open Source Developer
Nicholas Walker**. SmartScreen may still warn on a new file while it builds up a reputation
for it: choose **More info**, then **Run anyway**. The source is all here if you would
rather build it yourself. Each release lists its SHA-256 checksum, and
[docs/releasing.md](docs/releasing.md) says how a release is signed.

## Licence

Cuber is copyright (c) 2026 Nicholas Walker and is free software under the
[MIT licence](LICENSE). The solver it contains, cubejs, is MIT too, under its own authors'
copyright (`src/solver/vendor/LICENSE`). The About screen in the app shows both texts.

## Running it

Phases 0 to 7 are built: the app is complete, version 1.2.0, with a Windows installer,
a Home Screen app that works with no internet, and the three methods. These commands
work now:

- `npm install`, then `npm run dev` and open `http://localhost:5190`. The port is
  fixed: if something else holds 5190 the command fails rather than moving.
- In a development build the address bar can open the app in a fixed state, which is
  how its pictures are taken: `http://localhost:5190/?scene=scrambled&view=far&theme=light&speed=slow`.
  The six scenes are `blank`, `solved`, `scrambled`, `mirrored`, `partial` and
  `solution` (spec 15.1). None of it is in a built app.
- `npx vitest run` runs both kinds of test (see [docs/testing.md](docs/testing.md)).
  `npx tsc -b` type-checks. `npm run build` makes `dist/`, and `npm run preview`
  serves it on `http://localhost:5191`.

## Building the Windows app

`npm run tauri build` makes the installer. It needs the Rust toolchain, which on this
machine is at `%USERPROFILE%\.cargo\bin` and is not on the shell's path by default:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
npm run tauri build
```

It lands two things under `src-tauri/target/release/`: `cuber.exe`, which runs the app
straight from the folder, and `bundle/nsis/Cuber_<version>_x64-setup.exe`, which
installs it for the current user. The first build compiles the Rust side from scratch
and takes several minutes; later ones are quick.

The installer is unsigned, so Windows SmartScreen warns the first time it runs. The
uninstaller offers to delete application data; ticking that box removes
`%LOCALAPPDATA%\Cuber Data`, which holds the remembered cube, theme and speed, and
nothing else. `node scripts/check-uninstall-hook.mjs` proves that guard against
scratch folders, all four cases.

## The iPad app

The same code makes a Home Screen app that works with no internet. `npm run build`
writes the manifest and the service worker beside the app, and `npm run icons` redraws
the four icon files from `public/icon.svg` after a change to the drawing.

To see it work offline: `npm run build`, then `npm run preview`, open
`http://localhost:5191`, reload once so the service worker takes control, then stop the
server and reload again. The app opens and solves.

[docs/cuber-deploy.md](docs/cuber-deploy.md) has the rest, which is Nick's: GitHub,
Cloudflare Pages at its own `pages.dev` address, adding it to the Home Screen, and
the aeroplane-mode check.

## Documents

- [docs/cuber-spec.md](docs/cuber-spec.md) - what the app does and why. Start here.
- [docs/cuber-build-plan.md](docs/cuber-build-plan.md) - the phases and their boxes.
- [docs/acceptance.md](docs/acceptance.md) - the acceptance walk: every line of spec
  section 17, what was done to check it, and what was seen, and the iPad walk after it.
- [docs/cuber-deploy.md](docs/cuber-deploy.md) - publishing the iPad app: Nick's steps,
  in order.
- [CLAUDE.md](CLAUDE.md) - the house rules for sessions working in this folder.
- `layout.jpg` - the drawing the screen follows.
