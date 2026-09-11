# Cuber

Cuber solves a Rubik's Cube. Copy the colours of your cube on to the cube on the
screen, press Solve, and follow the moves in the box under it. The cube on the screen
turns with each move so you can follow along on the real one. Hint gives you one move
at a time instead.

It runs as an installed Windows app, and later as an iPad Home Screen app, from one
code base.

## Running it

Nothing is built yet. When phase 0 lands:

- `npm install`, then `npm run dev` and open `http://localhost:5190`.
- `npx vitest run` runs the tests. `npm run build` makes `dist/`.
- `npx tauri build` makes the Windows installer (phase 5).

## Documents

- [docs/cuber-spec.md](docs/cuber-spec.md) - what the app does and why. Start here.
- [docs/cuber-build-plan.md](docs/cuber-build-plan.md) - the phases and their boxes.
- [CLAUDE.md](CLAUDE.md) - the house rules for sessions working in this folder.
- `layout.jpg` - the drawing the screen follows.
