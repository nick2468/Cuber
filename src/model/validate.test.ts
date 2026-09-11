import { describe, expect, it } from 'vitest'
import Library from '../solver/vendor/cube.js'
import { standardScheme, type Colour } from './colours'
import { CENTRES, blank, paint, solved, type Cube } from './cube'
import { SOLVED_FACELETS, fromFacelets } from './facelets'
import { CORNERS, EDGES, sticker } from './geometry'
import { checkPartial, validate, type Verdict } from './validate'

/** A cube with some stickers painted, each named the spec's way: `{ U9: 'white' }`. */
function with_(cube: Cube, changes: Record<string, Colour | null>): Cube {
  return Object.entries(changes).reduce((next, [name, colour]) => paint(next, sticker(name), colour), cube)
}

const URF = CORNERS[0].stickers
const UFL = CORNERS[1].stickers
const UF = EDGES[1].stickers

function refused(verdict: Verdict) {
  if (verdict.ok) throw new Error('The validator passed a cube it should have refused.')
  return verdict
}

describe('checkPartial, while entering', () => {
  it('finds nothing wrong with the blank cube, the solved cube or a correct part of a piece', () => {
    expect(checkPartial(blank())).toBeNull()
    expect(checkPartial(solved())).toBeNull()
    expect(checkPartial(with_(blank(), { U9: 'white', R1: 'red' }))).toBeNull()
  })

  it('rule 1: guards a tenth sticker of a colour', () => {
    const tenReds = ['U1', 'U2', 'U3', 'U6', 'U7', 'U8', 'U9', 'R1', 'R2']
    const cube = with_(blank(), Object.fromEntries(tenReds.map((name) => [name, 'red'])))
    const problem = checkPartial(cube)
    expect(problem?.message).toBe('There are ten red stickers. A cube has nine of each.')
    expect(problem?.stickers).toHaveLength(10)
  })

  it('rule 2: two centres with one colour', () => {
    const problem = checkPartial(paint(blank(), 13, 'white'))
    expect(problem).toEqual({
      message: 'Two centres have the same colour. Every centre is different.',
      stickers: [4, 13],
    })
  })

  it('rule 3: a piece with two stickers the same colour', () => {
    expect(checkPartial(with_(blank(), { U9: 'red', R1: 'red' }))).toEqual({
      message: 'A corner cannot have two stickers the same colour.',
      stickers: URF,
    })
    expect(checkPartial(with_(blank(), { U8: 'green', F2: 'green' }))).toEqual({
      message: 'An edge cannot have two stickers the same colour.',
      stickers: UF,
    })
  })

  it('rule 4: a piece with two opposite colours', () => {
    expect(checkPartial(with_(blank(), { U9: 'white', R1: 'yellow' }))).toEqual({
      message: 'A corner cannot have white and yellow: they are on opposite sides.',
      stickers: URF,
    })
    expect(checkPartial(with_(blank(), { U8: 'green', F2: 'blue' }))?.message).toBe(
      'An edge cannot have green and blue: they are on opposite sides.',
    )
  })

  it('rule 5: a mirrored corner is not a real piece', () => {
    expect(checkPartial(with_(blank(), { U9: 'white', R1: 'green', F3: 'red' }))).toEqual({
      message: 'That corner is not a real piece. Check its three colours.',
      stickers: URF,
    })
  })
})

describe('validate, before Solve', () => {
  it('passes the solved cube with its facelets', () => {
    expect(validate(solved())).toEqual({ ok: true, facelets: SOLVED_FACELETS })
  })

  it('rule 2: two centres with one colour, before any count', () => {
    expect(refused(validate(paint(solved(), 13, 'white'))).message).toBe(
      'Two centres have the same colour. Every centre is different.',
    )
  })

  it('rules 3 to 5 on a complete cube', () => {
    expect(refused(validate(with_(solved(), { R1: 'white' }))).message).toBe(
      'A corner cannot have two stickers the same colour.',
    )
    expect(refused(validate(with_(solved(), { R1: 'yellow' }))).message).toBe(
      'A corner cannot have white and yellow: they are on opposite sides.',
    )
    expect(refused(validate(with_(solved(), { R1: 'green', F3: 'red' }))).message).toBe(
      'That corner is not a real piece. Check its three colours.',
    )
  })

  it('rule 6: every sticker filled', () => {
    expect(refused(validate(blank())).message).toBe('Fill in every sticker. 48 to go.')
    expect(refused(validate(with_(solved(), { U1: null, R2: null, B9: null }))).message).toBe(
      'Fill in every sticker. 3 to go.',
    )
  })

  it('rule 7: nine of each colour', () => {
    // The UB edge becomes white and red, a real edge, so only the count is wrong.
    expect(refused(validate(with_(solved(), { B2: 'red' }))).message).toBe(
      'There are ten red stickers and eight blue. A cube has nine of each.',
    )
  })

  it('rule 8: no two corners the same', () => {
    // UFL holds a second URF and DRB a second DBL. The counts still balance.
    const cube = with_(solved(), { F1: 'red', L3: 'green', R9: 'blue', B7: 'orange' })
    const verdict = refused(validate(cube))
    expect(verdict.message).toBe('Two corners have the same three colours.')
    expect(verdict.stickers).toEqual(expect.arrayContaining([...URF, ...UFL]))
  })

  it('rule 9: no two edges the same', () => {
    // UF holds a second UR and DR a second DF.
    expect(refused(validate(with_(solved(), { F2: 'red', R8: 'green' }))).message).toBe(
      'Two edges have the same two colours.',
    )
  })

  it('rule 10: the corner twists add up to a multiple of three', () => {
    expect(refused(validate(with_(solved(), { U9: 'green', R1: 'white', F3: 'red' }))).message).toBe(
      "One corner is twisted. Check the corners' colours.",
    )
  })

  it('rule 11: the edge flips add up to an even number', () => {
    expect(refused(validate(with_(solved(), { U8: 'green', F2: 'white' }))).message).toBe(
      "One edge is flipped. Check the edges' colours.",
    )
  })

  it('rule 12: the corner and edge permutations have the same parity', () => {
    // URF and UFL swap places, each the right way up.
    const cube = with_(solved(), { R1: 'green', F3: 'orange', F1: 'red', L3: 'green' })
    expect(refused(validate(cube)).message).toBe(
      'Two pieces are swapped. A real cube cannot be solved from here.',
    )
  })
})

// The library is the oracle (spec 6.4). Every cube it makes is real, and
// swapping two differently coloured stickers of a real cube never is.
describe('validate, with the library as the oracle', () => {
  it('passes 200 random library cubes', () => {
    for (let n = 0; n < 200; n += 1) {
      const letters = Library.random().asString()
      expect(validate(fromFacelets(letters, standardScheme())), letters).toEqual({ ok: true, facelets: letters })
    }
  })

  it('refuses 100 random library cubes with two differently coloured stickers swapped', () => {
    const outside = Array.from({ length: 54 }, (_, index) => index).filter((index) => !CENTRES.includes(index))
    for (let n = 0; n < 100; n += 1) {
      const letters = Library.random().asString()
      const cube = fromFacelets(letters, standardScheme())
      // A fixed walk, so a failure names the same two stickers on a rerun of that cube.
      const a = outside[(n * 7) % outside.length]
      const b = outside
        .map((_, k) => outside[(outside.indexOf(a) + 1 + ((k + n) % (outside.length - 1))) % outside.length])
        .find((other) => cube[other] !== cube[a])!
      const swapped = paint(paint(cube, a, cube[b]), b, cube[a])
      expect(validate(swapped).ok, `${letters} with ${a} and ${b} swapped`).toBe(false)
    }
  })
})
