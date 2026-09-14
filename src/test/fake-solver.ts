import { FIXED_SCRAMBLE, undo } from '../model/moves'
import type { Answer, Solver, Stage } from '../solver/solver'

/**
 * The solver the tests hand the provider in place of `createSolver`
 * (docs/testing.md, "What is faked, and why").
 *
 * Ready at once, and it answers every cube with the moves that undo the fixed
 * scramble, `R' U2 B2 L D' F2 U R U' R'`, whatever it is given. So the
 * scrambled scene's fake solution really solves it, and a test on any other
 * cube is testing the steps, not the solving.
 *
 * The three methods give the same ten moves: what differs between them belongs
 * to the solver, which the string tests cover. The beginner method also gets
 * one stage over all ten, so the box's headings have something to draw, and
 * `note` can be asked for so the fewest-moves fallback sentence can be seen.
 */

/** One stage over the whole fake solution, so a heading shows above the rows. */
export const FAKE_STAGE: Stage = {
  name: 'The whole cube',
  sentence: 'A fake solution.',
  from: 0,
  to: 10,
}

export function fakeSolver(options: { note?: 'quick' } = {}): Solver {
  return {
    ready: Promise.resolve(),
    solve: async (_facelets, method): Promise<Answer> => ({
      moves: undo(FIXED_SCRAMBLE),
      stages: method === 'beginner' ? [FAKE_STAGE] : [],
      labels: [],
      note: options.note ?? null,
    }),
    terminate: () => {},
  }
}
