import { FIXED_SCRAMBLE, undo } from '../model/moves'
import type { Solver } from '../solver/solver'

/**
 * The solver the tests hand the provider in place of `createSolver`
 * (docs/testing.md, "What is faked, and why").
 *
 * Ready at once, and it answers every cube with the moves that undo the fixed
 * scramble, `R' U2 B2 L D' F2 U R U' R'`, whatever it is given. So the
 * scrambled scene's fake solution really solves it, and a test on any other
 * cube is testing the steps, not the solving.
 */
export function fakeSolver(): Solver {
  return {
    ready: Promise.resolve(),
    solve: async () => undo(FIXED_SCRAMBLE),
  }
}
