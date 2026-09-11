# How this app is tested

Origin: London `docs/testing.md`, adapted (by way of Simple Chess's copy): the content
checkers and the board stub are gone, the trainer's history is shortened, the solver is
what is faked, the one slow solver test is named, and each helper names the phase that
brings it.

Two kinds of test, one command. `npx vitest run` runs everything.

## The two kinds of test

**String tests** (`src/**/*.test.ts`) run in node. They call a function, or render a
component to a string with `renderToStaticMarkup`, and read the result. They are the
bulk of the suite and they are fast because they are cheap: no browser, no layout, no
effects. The geometry, the facelet mapping, the validator, the moves, the sentences, the
views, the remembered form and the fit rule are all string tests (spec section 14).

That last one is the limit. Rendering to a string mounts nothing, so no `useEffect`
ever runs. A component that loads something on mount is always caught in its empty
starting state, and anything reached by clicking is not reached at all.

**DOM tests** (`src/**/*.dom.test.tsx`) run in jsdom, a JavaScript implementation of a
browser's document. They render the real app with
[testing-library](https://testing-library.com), click its buttons with `user-event`, and
read the screen and what was stored afterwards. Effects run. State changes. A test can
paint a sticker, press Solve, step forward and look. Stickers are found by their
`data-sticker` index.

The two are separate vitest **projects**, declared in `vite.config.ts`. That is what
lets the node tests stay in node: a single config with a jsdom environment would make
every pure test pay for a document it never touches.

## Why the DOM kind exists

The trainer built it at its phase 29, after the same class of bug shipped there three
times. Each was in the provider that runs a game, which no string test could reach:

- **Phase 23.** The provider's value was memoised and the session's change counter was
  not in the dependencies. React skips a provider's children unless the value changes,
  so Undo moved the game and left the screen showing the position before it.
- **Phase 25.** `finish` minted a fresh timestamp on every review, and the timestamp is
  what says two reviews are one game. A game reviewed twice appeared twice on Progress.
- **Phase 27.** Replay both minted an identity and wrote its scan back, so reading a
  game left a second record and drifted its recorded ending.

Every one of those passed the whole suite and was found by a person pressing a button.
This app has a provider of the same shape (the cube, the solution, the step, the view),
so it has the rig from the first phase.

## What is faked, and why

**The solver.** The cube's provider (`src/ui/cube-context.tsx`, from phase 2) takes an
optional `createSolver`, defaulting to the real one, which starts a web worker and spends
four to five seconds in `initSolver` (spec C10). Tests pass `fakeSolver` from
`src/test/fake-solver.ts` (phase 1), which is ready at once and answers `solve` with a
fixed list of moves. A real solver in the DOM suite would mean a worker per test and five
seconds before the first click. From phase 3 one DOM test puts a throwing stub on
`globalThis.Worker` and asserts it was never constructed, so this cannot rot quietly.

**The animations.** Not faked, but shortened. The provider takes its durations (the view
change, the pause, the layer turn) as an option, and tests pass zeros, so a step lands at
once and `vi.waitFor` does the waiting.

Nothing else is faked. The provider, the model, the validator, the storage and the
screen are the code that ships.

## The rules this suite keeps

- **No snapshots.** A snapshot records what the code did, not what it should do, and it
  is updated by pressing a key.
- **No fake timers.** Waiting is done with `vi.waitFor`, on the thing being waited for.
- **No worker in the DOM suite, ever**, per the guard above.
- **Under twenty seconds.** The whole suite, both projects, on this machine. The rule
  exists for one reason: a bar nobody waits for is a bar nobody runs, so the suite has to
  stay fast enough that a builder runs it after every change. The trainer's limit was
  ten until Nick raised it to twenty there (2026-09-05), when 1003 tests took 9.5
  seconds and the next DOM file would have crossed it: a rule that blocks a better app
  is the wrong rule. The number is a ceiling, not a target.
- **One slow test, and only one.** The string test that proves the vendored solver runs
  (spec C5, from phase 1) calls the real `Cube.initSolver()`, which takes four to six
  seconds, and then solves two cubes. It is the one exception to "fast because cheap",
  and it counts inside the twenty seconds. No other test calls `initSolver`: the
  validator's property tests use `Cube.random()`, which needs no initialisation.
- **A regression test is shown red first.** Write it against the commit before the fix,
  or put the bug back and watch it fail. A test that has never failed proves nothing.

## Writing one

`src/test/dom.tsx` has the helpers. Today that is `renderApp`, which renders the app and
returns a `user-event` user. From phase 2 it puts the real provider around the screen
with zero durations, and from phase 3 with the fake solver.

One thing to know. `src/test/dom-setup.ts` empties `localStorage` after every test, so
each test starts from a fresh install unless it writes storage before `renderApp`.

The first run after `npm install` can take twenty-five seconds, most of it jsdom
starting on a cold disk cache (measured in Simple Chess's phase 0). Every run after it
is quick. Do not read a first-run time as a breach of the twenty-second rule.
