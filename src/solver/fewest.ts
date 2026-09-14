/**
 * Fewest moves: the same library, asked for shorter and shorter answers
 * (spec 7.4).
 *
 * The quick method stops at the first solution it finds under 22 moves, which
 * is why a cube scrambled with four turns comes back with nineteen. Asking for
 * a solution of at most one move, then at most two, and so on, gives the
 * shortest answer the two-phase method can find: the library returns "" when
 * nothing fits in the depth it was given, so the first non-empty answer is the
 * shortest.
 *
 * It promises the shortest that method can find, not the true minimum, which
 * needs a different and much heavier solver and is out of scope. For the case
 * Nick raised, a few scrambling turns, the two are the same.
 *
 * The search gets slow past about fourteen moves on a fully scrambled cube, so
 * it is bounded twice: a depth, and a time budget checked before each depth.
 * When either runs out, the caller gets the quick solution and is told so, and
 * the status line passes that on rather than quietly answering a different
 * question from the one that was asked.
 */

import { movesOf } from './solver'

/** How long to look for something shorter before settling for the quick answer. */
export const BUDGET_MS = 5000

/** The deepest the search asks for. Past this the quick answer is no worse. */
export const MAX_DEPTH = 20

/** The part of the library's cube this needs, so a test can hand it a stand-in. */
export interface Solvable {
  solve(maxDepth?: number): string
}

export interface Fewest {
  readonly moves: string[]
  /** `'quick'` when the depth or the budget ran out and this is the quick answer. */
  readonly note: 'quick' | null
}

/**
 * One depth, answering "" for a depth nothing fits in.
 *
 * The library does not answer "" there, whatever its shape suggests: it leaves
 * its `solution` null and then reads `.length` off it, so asking a six-turn
 * cube for a one-move answer throws a TypeError from inside `solveUpright`.
 * Found here at phase 7, and the worker has always caught it for the same
 * reason. A depth nothing fits in is the ordinary case of this search, not a
 * fault, so it is caught at the one place that can tell the difference: a real
 * fault comes from the quick call below, which is not wrapped.
 */
function tryDepth(cube: Solvable, depth: number): string {
  try {
    return cube.solve(depth)
  } catch {
    return ''
  }
}

/**
 * The clock is injected rather than read here, so a test can prove the budget
 * without waiting five real seconds for it.
 */
export function solveFewest(
  cube: Solvable,
  now: () => number,
  budgetMs: number = BUDGET_MS,
  maxDepth: number = MAX_DEPTH,
): Fewest {
  const started = now()
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (now() - started > budgetMs) break
    const said = tryDepth(cube, depth)
    if (said) return { moves: movesOf(said), note: null }
  }
  return { moves: movesOf(cube.solve()), note: 'quick' }
}
