import { describe, expect, it } from 'vitest'
import { SOLVED_FACELETS } from '../model/facelets'
import { FIXED_SCRAMBLE } from '../model/moves'
import Cube from './vendor/cube.js'
import './vendor/solve.js'

/**
 * The one slow test (spec C5, C19 item 8), and the only one that calls
 * `initSolver`, which spends about a second building the solver's tables
 * (measured at phase 1; the library's README says four to five). It proves the vendored files load as ES modules and really solve:
 * each solution is applied with the library's own `move` and the result is
 * checked with its own `isSolved`.
 */
describe('the vendored solver', () => {
  it('solves the fixed scramble and a random cube in 22 moves or fewer', () => {
    Cube.initSolver()
    const cubes = [Cube.fromString(SOLVED_FACELETS).move(FIXED_SCRAMBLE.join(' ')), Cube.random()]
    for (const cube of cubes) {
      const start = cube.asString()
      expect(cube.isSolved(), start).toBe(false)
      const solution = cube.solve()
      expect(solution.split(' ').length, solution).toBeLessThanOrEqual(22)
      expect(cube.move(solution).isSolved(), `${start} with ${solution}`).toBe(true)
    }
  }, 30_000)
})
