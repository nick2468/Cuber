import { describe, expect, it } from 'vitest'
import { SOLVED_FACELETS } from '../model/facelets'
import { FIXED_SCRAMBLE } from '../model/moves'
import { solveFewest } from './fewest'
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

/**
 * Fewest moves (spec 7.4), here rather than in a file of its own because it
 * needs the solver's tables and those take about a second to build: one slow
 * file, and `initSolver` is idempotent, so the test above has already paid for
 * these.
 */
describe('fewest moves', () => {
  const scrambled = (moves: string) => Cube.fromString(SOLVED_FACELETS).move(moves)

  it.each([
    ['one turn', 'R', "R'"],
    ['three turns', "R U F", "F' U' R'"],
    ['six turns', "R U F L D B", "B' D' L' F' U' R'"],
  ])('undoes %s exactly', (_name, scramble, expected) => {
    Cube.initSolver()
    expect(solveFewest(scrambled(scramble), () => performance.now())).toEqual({
      moves: expected.split(' '),
      note: null,
    })
  }, 30_000)

  // The budget, without waiting five real seconds for it: the clock jumps past
  // the budget before the first depth is asked for, so the only call the
  // library gets is the quick one.
  it('gives the quick answer, and says so, when the budget is gone', () => {
    Cube.initSolver()
    let asked = 0
    const cube = {
      solve(maxDepth?: number) {
        asked += 1
        expect(maxDepth).toBeUndefined()
        return "R' U'"
      },
    }
    const ticks = [0, 6000]
    expect(solveFewest(cube, () => ticks.shift() ?? 6000)).toEqual({
      moves: ["R'", "U'"],
      note: 'quick',
    })
    expect(asked).toBe(1)
  })

  // The other end of the same rule: a depth limit of zero leaves no depth to
  // try, so it falls back for that reason instead.
  it('gives the quick answer when no depth is allowed', () => {
    Cube.initSolver()
    expect(solveFewest(scrambled('R'), () => 0, 5000, 0).note).toBe('quick')
  })
})
