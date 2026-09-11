# Cuber

Cuber solves a Rubik's Cube. Copy the colours of your cube on to the cube on the
screen, press Solve, and follow the moves in the box under it. The cube on the screen
turns with each move so you can follow along on the real one. Hint gives you one move
at a time instead.

It runs as an installed Windows app, and later as an iPad Home Screen app, from one
code base.

## Running it

Phase 0 is built: the page shows the header (the name, the version and the theme
toggle) and nothing else yet. These commands work now:

- `npm install`, then `npm run dev` and open `http://localhost:5190`. The port is
  fixed: if something else holds 5190 the command fails rather than moving.
- `npx vitest run` runs both kinds of test (see [docs/testing.md](docs/testing.md)).
  `npx tsc -b` type-checks. `npm run build` makes `dist/`, and `npm run preview`
  serves it on `http://localhost:5191`.

Later:

- `npx tauri build` makes the Windows installer (phase 5).
- The iPad Home Screen app waits for Nick's word (phase 6).

## Documents

- [docs/cuber-spec.md](docs/cuber-spec.md) - what the app does and why. Start here.
- [docs/cuber-build-plan.md](docs/cuber-build-plan.md) - the phases and their boxes.
- [CLAUDE.md](CLAUDE.md) - the house rules for sessions working in this folder.
- `layout.jpg` - the drawing the screen follows.
