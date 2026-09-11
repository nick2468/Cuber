import { describe, expect, it } from 'vitest'
import Library from '../solver/vendor/cube.js'
import { FACES } from './colours'
import { CORNERS, EDGES, indexOf, placeOf, positionOf, stickersAt, type Piece } from './geometry'

const ALL = Array.from({ length: 54 }, (_, index) => index)

/** Every position a piece can have, the core included. */
const POSITIONS = [-1, 0, 1].flatMap((x) => [-1, 0, 1].flatMap((y) => [-1, 0, 1].map((z) => ({ x, y, z }))))

describe('the geometry', () => {
  it('numbers the faces as the library does: U1 0, R1 9, F1 18, D1 27, L1 36, B1 45', () => {
    expect(FACES.map((face) => indexOf(face, 0, 0))).toEqual([0, 9, 18, 27, 36, 45])
  })

  it('reads every sticker back to the same place', () => {
    for (const index of ALL) {
      const { face, row, column } = placeOf(index)
      expect(indexOf(face, row, column)).toBe(index)
    }
  })

  it('finds every sticker on the piece it says it is on, and nowhere else', () => {
    for (const index of ALL) {
      const { x, y, z } = positionOf(index)
      expect(stickersAt(x, y, z)).toContain(index)
    }
    const found = POSITIONS.flatMap(({ x, y, z }) => stickersAt(x, y, z))
    expect(found.sort((a, b) => a - b)).toEqual(ALL)
  })

  it('gives a corner three stickers, an edge two, a centre one and the core none', () => {
    for (const { x, y, z } of POSITIONS) {
      const outside = Math.abs(x) + Math.abs(y) + Math.abs(z)
      expect(stickersAt(x, y, z)).toHaveLength(outside)
    }
  })

  it('puts U9, R1 and F3 at the corner (1, 1, 1)', () => {
    expect(stickersAt(1, 1, 1)).toEqual([indexOf('U', 2, 2), indexOf('R', 0, 0), indexOf('F', 0, 2)])
  })

  it.each([
    ['corner', CORNERS, 8],
    ['edge', EDGES, 12],
  ] as const)('puts each %s on one piece, on the faces its name says', (_, pieces: readonly Piece[], count) => {
    expect(pieces).toHaveLength(count)
    const seen = new Set<string>()
    for (const { name, stickers } of pieces) {
      const { x, y, z } = positionOf(stickers[0])
      expect(stickersAt(x, y, z), name).toEqual([...stickers].sort((a, b) => a - b))
      expect(stickers.map((index) => placeOf(index).face).join(''), name).toBe(name)
      seen.add(`${x},${y},${z}`)
    }
    expect(seen.size).toBe(count)
  })

  // C19 item 1, with the library as the oracle. On any cube the library makes,
  // the stickers of a corner position, read from its Up-or-Down sticker, are
  // one of the eight corners in the library's clockwise order, and an edge
  // position holds one of the twelve edges either way round. A wrong grouping
  // would mix letters from two pieces, and a wrong order would read a corner
  // anticlockwise.
  it('agrees with the library on 200 random cubes', () => {
    const corners = CORNERS.map((corner) => corner.name)
    const edges = EDGES.map((edge) => edge.name)
    for (let n = 0; n < 200; n += 1) {
      const facelets = Library.random().asString()
      for (const corner of CORNERS) {
        const letters = corner.stickers.map((index) => facelets[index])
        const turn = letters.findIndex((letter) => letter === 'U' || letter === 'D')
        const read = [0, 1, 2].map((k) => letters[(turn + k) % 3]).join('')
        expect(corners, `${corner.name} in ${facelets}`).toContain(read)
      }
      for (const edge of EDGES) {
        const letters = edge.stickers.map((index) => facelets[index])
        const either = [letters.join(''), [...letters].reverse().join('')]
        expect(either.some((read) => edges.includes(read)), `${edge.name} in ${facelets}`).toBe(true)
      }
    }
  })
})
