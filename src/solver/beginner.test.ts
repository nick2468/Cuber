import { describe, expect, it } from 'vitest'
import { SOLVED_FACELETS } from '../model/facelets'
import { CORNERS, EDGES } from '../model/geometry'
import { FIXED_SCRAMBLE, turnFacelets, type Move } from '../model/moves'
import Library from './vendor/cube.js'
import {
  CORNER_MOVE,
  CROSS_MOVE,
  EDGE_MOVE,
  INSERTIONS,
  RIGHTY,
  SOLVED_GOAL,
  TWIST_MOVE,
  solveBeginner,
  solveStage,
  type Item,
  type Macro,
} from './beginner'

/**
 * The beginner method (spec 7.5).
 *
 * These are string tests and they are fast: the method never calls the
 * library's solver, so nothing here builds its tables. Everything below is
 * written from the specification's two tables rather than from the code, so
 * that a test failing means the code and the guide disagree, rather than the
 * code disagreeing with a copy of itself.
 */

// --- reading a cube, the way the specification describes a piece -----------

const PIECES = [...CORNERS, ...EDGES]

function stickersOf(name: string): readonly number[] {
  const piece = PIECES.find((each) => each.name === name)
  if (!piece) throw new Error(`There is no piece called ${name}.`)
  return piece.stickers
}

/** Which piece is sitting at this position, whichever way round it is. */
function pieceAt(state: string, where: string): string {
  const sorted = (letters: string) =>
    stickersOf(where)
      .map((at) => letters[at])
      .sort()
      .join('')
  const here = sorted(state)
  const found = PIECES.find(
    (each) =>
      each.stickers
        .map((at) => SOLVED_FACELETS[at])
        .sort()
        .join('') === here,
  )
  return found?.name ?? '?'
}

/** True when every sticker of every one of these positions is the right colour. */
function placed(state: string, names: readonly string[]): boolean {
  return names.every((name) => stickersOf(name).every((at) => state[at] === SOLVED_FACELETS[at]))
}

const turn = (state: string, letters: string) => turnFacelets(state, letters)
const from = (letters: string) => turnFacelets(SOLVED_FACELETS, letters)
const lettersOf = (macro: Macro) => macro.moves.join(' ')

// --- the named sequences ---------------------------------------------------

describe('the named sequences', () => {
  // Spec 7.5's second table, written out. The righty moves and the insertions
  // are built from a formula rather than typed, so this is the test that the
  // formula gives the guide's letters and not something one turn out.
  it('are the letters the specification names', () => {
    expect(RIGHTY.map((each) => [each.name, lettersOf(each)])).toEqual([
      ['The righty move, front-right', "R U R' U'"],
      ['The righty move, front-left', "F U F' U'"],
      ['The righty move, back-left', "L U L' U'"],
      ['The righty move, back-right', "B U B' U'"],
    ])
    expect(INSERTIONS.map((each) => [each.name, lettersOf(each)])).toEqual([
      ['Insert to the right, from the front face', "U R U' R' U' F' U F"],
      ['Insert to the left, from the front face', "U' L' U L U F U' F'"],
      ['Insert to the right, from the right face', "U B U' B' U' R' U R"],
      ['Insert to the left, from the right face', "U' F' U F U R U' R'"],
      ['Insert to the right, from the back face', "U L U' L' U' B' U B"],
      ['Insert to the left, from the back face', "U' R' U R U B U' B'"],
      ['Insert to the right, from the left face', "U F U' F' U' L' U L"],
      ['Insert to the left, from the left face', "U' B' U B U L U' L'"],
    ])
    expect(lettersOf(CROSS_MOVE)).toBe("F R U R' U' F'")
    expect(lettersOf(EDGE_MOVE)).toBe("R U R' U R U2 R'")
    expect(lettersOf(CORNER_MOVE)).toBe("U R U' L' U R' U' L")
    expect(lettersOf(TWIST_MOVE)).toBe("R' D' R D")
  })

  // What the table says each one is FOR. The letters could be a real sequence
  // and still be the wrong one, which is what these catch.
  it.each([
    ['front-right', 'DFR', 'URF'],
    ['front-left', 'DLF', 'UFL'],
    ['back-left', 'DBL', 'ULB'],
    ['back-right', 'DRB', 'UBR'],
  ])('drops the corner waiting above the %s slot into it', (where, slot, above) => {
    const righty = RIGHTY.find((each) => each.name.endsWith(where))!
    expect(pieceAt(from(lettersOf(righty)), slot)).toBe(above)
  })

  it.each([
    ['front', 'UF', 'FR', 'FL'],
    ['right', 'UR', 'BR', 'FR'],
    ['back', 'UB', 'BL', 'BR'],
    ['left', 'UL', 'FL', 'BL'],
  ])('takes the edge above the %s face right or left', (face, above, right, left) => {
    const named = (side: string) => INSERTIONS.find((each) => each.name === `Insert to the ${side}, from the ${face} face`)!
    expect(pieceAt(from(lettersOf(named('right'))), right)).toBe(above)
    expect(pieceAt(from(lettersOf(named('left'))), left)).toBe(above)
  })

  it('leaves everything below the top face alone, in the three top moves', () => {
    const below = ['DF', 'DL', 'DB', 'DR', 'DFR', 'DLF', 'DBL', 'DRB', 'FR', 'FL', 'BL', 'BR']
    for (const each of [CROSS_MOVE, EDGE_MOVE, CORNER_MOVE]) {
      expect(placed(from(lettersOf(each)), below), each.name).toBe(true)
    }
  })

  it('moves three top corners round and nothing else, in the corner move', () => {
    const after = from(lettersOf(CORNER_MOVE))
    expect(pieceAt(after, 'UFL')).toBe('ULB')
    expect(pieceAt(after, 'ULB')).toBe('UBR')
    expect(pieceAt(after, 'UBR')).toBe('UFL')
    expect(placed(after, ['URF'])).toBe(true)
  })

  // Stage 7 leans on this: the twist move puts a BOTTOM corner in the
  // front-right top slot after an odd number of goes, and no bottom corner
  // carries a top-colour sticker, so a corner that shows the top colour there
  // has had whole pairs. Six goes are the whole way round.
  it('turns the front-right corner in pairs, six goes being none', () => {
    const twice = from(`${lettersOf(TWIST_MOVE)} ${lettersOf(TWIST_MOVE)}`)
    expect(pieceAt(twice, 'URF')).toBe('URF')
    expect(placed(twice, ['URF'])).toBe(false)
    expect(pieceAt(from(lettersOf(TWIST_MOVE)), 'URF')).toBe('DFR')
    expect(from(Array(6).fill(lettersOf(TWIST_MOVE)).join(' '))).toBe(SOLVED_FACELETS)
  })
})

// --- the search ------------------------------------------------------------

describe('the search', () => {
  const solvedIn = SOLVED_GOAL

  it('gives nothing to do when the goal already holds', () => {
    expect(solveStage(SOLVED_FACELETS, ['U'], solvedIn, 3)).toEqual([])
  })

  it('finds the one item that reaches the goal', () => {
    const items: Item[] = ['U', "U'", 'U2', 'R']
    expect(solveStage(from("R'"), items, solvedIn, 1)).toEqual(['R'])
  })

  it('finds the shortest sequence, not the first one it stumbles on', () => {
    // `U2` and `U U` both undo `U2`. Level by level, the one item wins.
    expect(solveStage(from('U2'), ['U', 'U2'], solvedIn, 4)).toEqual(['U2'])
  })

  it('gives up past the limit rather than looking further', () => {
    expect(solveStage(from("R U R' U'"), ['R'], solvedIn, 3)).toBeNull()
  })

  it('gives up when there is nowhere left to go', () => {
    // `U` alone can only reach four cubes, so a fifth level would be the same
    // four again. It stops rather than spending the whole limit.
    expect(solveStage(from('R'), ['U'], solvedIn, 100)).toBeNull()
  })

  it('takes a named sequence as one item', () => {
    const six = Array(6).fill(TWIST_MOVE) as Item[]
    expect(solveStage(from(lettersOf(TWIST_MOVE)), [TWIST_MOVE], solvedIn, 6)).toEqual(six.slice(1))
  })
})

// --- the seven stages ------------------------------------------------------

const CROSS_EDGES = ['DF', 'DL', 'DB', 'DR']
const BOTTOM_CORNERS = ['DFR', 'DLF', 'DBL', 'DRB']
const MIDDLE_EDGES = ['FR', 'FL', 'BL', 'BR']
const TOP_EDGES = ['UR', 'UF', 'UL', 'UB']
const TOP_CORNERS = ['URF', 'UFL', 'ULB', 'UBR']
const FIRST_TWO_LAYERS = [...CROSS_EDGES, ...BOTTOM_CORNERS, ...MIDDLE_EDGES]

/** The sticker each top edge shows on the top face, which stage 4 is about. */
const TOP_EDGE_TOPS = TOP_EDGES.map((name) => stickersOf(name)[0])

/**
 * What each stage promises, written from spec 7.5's first table. Every stage
 * carries the ones before it, so each line only adds what its own row says.
 */
const REACHED: readonly ((state: string) => boolean)[] = [
  (state) => placed(state, CROSS_EDGES),
  (state) => placed(state, [...CROSS_EDGES, ...BOTTOM_CORNERS]),
  (state) => placed(state, FIRST_TWO_LAYERS),
  (state) => placed(state, FIRST_TWO_LAYERS) && TOP_EDGE_TOPS.every((at) => state[at] === 'U'),
  (state) => placed(state, [...FIRST_TWO_LAYERS, ...TOP_EDGES]),
  (state) =>
    placed(state, [...FIRST_TWO_LAYERS, ...TOP_EDGES]) &&
    TOP_CORNERS.every((name) => pieceAt(state, name) === name),
  (state) => state === SOLVED_FACELETS,
]

/** The cube at each move of a solution, so a stage can be checked where it ends. */
function walk(start: string, moves: readonly Move[]): string[] {
  const along = [start]
  for (const move of moves) along.push(turn(along[along.length - 1], move))
  return along
}

describe('the beginner method', () => {
  const scrambled = from(FIXED_SCRAMBLE.join(' '))

  it('solves the fixed scramble, and each stage reaches what its row promises', () => {
    const { moves, stages } = solveBeginner(scrambled)
    const along = walk(scrambled, moves)
    expect(along[moves.length]).toBe(SOLVED_FACELETS)

    expect(stages.map((stage) => stage.name)).toEqual([
      'The white cross',
      'The white corners',
      'The middle layer',
      'The yellow cross',
      'The yellow edges',
      'The yellow corners in place',
      'The yellow corners turned',
    ])
    stages.forEach((stage, which) => {
      expect(REACHED[which](along[stage.to]), `${stage.name} at ${stage.to}`).toBe(true)
      // A stage that had work to do had not already reached its goal.
      if (stage.to > stage.from) {
        expect(REACHED[which](along[stage.from]), `${stage.name} at ${stage.from}`).toBe(false)
      }
    })
  })

  it('runs its stages end to end, with the labels inside them', () => {
    const { moves, stages, labels } = solveBeginner(scrambled)
    expect(stages[0].from).toBe(0)
    expect(stages[stages.length - 1].to).toBe(moves.length)
    stages.forEach((stage, which) => {
      if (which > 0) expect(stage.from).toBe(stages[which - 1].to)
      expect(stage.to).toBeGreaterThanOrEqual(stage.from)
    })
    for (const label of labels) {
      expect(label.at).toBeGreaterThanOrEqual(0)
      expect(label.at).toBeLessThan(moves.length)
      expect(label.text).toMatch(/^[A-Z].*: [URFDLB]/)
    }
    expect(labels.map((label) => label.at)).toEqual([...labels.map((label) => label.at)].sort((a, b) => a - b))
  })

  it('says a stage was already there rather than heading an empty list', () => {
    // One turn of the top face leaves everything below it, and the top face's
    // own colour, already right: the first four stages have nothing to do.
    const stages = solveBeginner(from('U')).stages
    expect(stages.slice(0, 4).map((stage) => stage.to - stage.from)).toEqual([0, 0, 0, 0])
    expect(stages[0].sentence).toBe('The white cross was already there.')
    for (const stage of stages.slice(0, 4)) expect(stage.sentence).toMatch(/already/)
  })

  /**
   * The run that keeps every limit above honest. Each of 200 real cubes is
   * solved, each stage reaches its row's promise where the stage ends, and the
   * whole solution is applied move by move rather than trusted.
   */
  it('solves 200 random cubes, in under 250 moves each', () => {
    const started = performance.now()
    const lengths: number[] = []
    for (let which = 0; which < 200; which += 1) {
      const start = Library.random().asString()
      const { moves, stages } = solveBeginner(start)
      const along = walk(start, moves)
      expect(along[moves.length], start).toBe(SOLVED_FACELETS)
      expect(moves.length, start).toBeLessThan(250)
      stages.forEach((stage, at) => {
        expect(REACHED[at](along[stage.to]), `${stage.name} on ${start}`).toBe(true)
      })
      lengths.push(moves.length)
    }
    const ms = performance.now() - started
    const mean = lengths.reduce((all, one) => all + one, 0) / lengths.length
    // The shape of the answer, not just that there was one. Measured at phase
    // 7: about 170 moves on average, 90 to 230, in 3.7 to 4.5 seconds. The bar
    // is set at double the measured time so that a busy machine does not fail
    // a test about solving cubes.
    expect(mean, `mean ${mean.toFixed(0)}`).toBeGreaterThan(100)
    expect(mean, `mean ${mean.toFixed(0)}`).toBeLessThan(220)
    expect(ms, `${ms.toFixed(0)} ms`).toBeLessThan(8000)
  }, 30_000)
})
