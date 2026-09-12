import { describe, expect, it } from 'vitest'
import Library from '../solver/vendor/cube.js'
import { standardScheme } from './colours'
import { blank, solved } from './cube'
import { SOLVED_FACELETS, fromFacelets } from './facelets'
import { sticker } from './geometry'
import { FIXED_SCRAMBLE, MOVES, applyMove, applyMoves, inverse, isMove, undo } from './moves'

const scrambled = applyMoves(solved(), FIXED_SCRAMBLE)

describe('the moves', () => {
  it('are the eighteen face turns', () => {
    expect(MOVES.join(' ')).toBe("U U' U2 R R' R2 F F' F2 D D' D2 L L' L2 B B' B2")
  })

  it('are told apart from anything else a solver might say', () => {
    for (const move of MOVES) expect(isMove(move), move).toBe(true)
    for (const other of ['', 'x', 'R3', "r'", 'RU', 'M2']) expect(isMove(other), other).toBe(false)
  })

  it('each have an inverse, and a half turn is its own', () => {
    expect(MOVES.map(inverse).join(' ')).toBe("U' U U2 R' R R2 F' F F2 D' D D2 L' L L2 B' B B2")
    for (const move of MOVES) expect(inverse(inverse(move))).toBe(move)
  })

  it('undo the fixed scramble with the solution the fake solver gives', () => {
    expect(undo(FIXED_SCRAMBLE).join(' ')).toBe("R' U2 B2 L D' F2 U R U' R'")
    expect(applyMoves(scrambled, undo(FIXED_SCRAMBLE))).toEqual(solved())
  })

  it('turn the cube as the library does', () => {
    const letters = Library.fromString(SOLVED_FACELETS).move(FIXED_SCRAMBLE.join(' ')).asString()
    expect(scrambled).toEqual(fromFacelets(letters, standardScheme()))
    expect(scrambled).not.toEqual(solved())
  })

  // C19 item 4.
  it.each(MOVES)('%s then its inverse gives the cube back', (move) => {
    expect(applyMove(applyMove(scrambled, move), inverse(move))).toEqual(scrambled)
    expect(applyMove(scrambled, move)).not.toEqual(scrambled)
  })

  // R is clockwise as seen from the right, so the front face's right column
  // goes up to the top. The screen's animation turns the same way (spec 9.4).
  it('turn R clockwise as seen from the right', () => {
    const cube = applyMove(solved(), 'R')
    expect(['U3', 'U6', 'U9'].map((name) => cube[sticker(name)])).toEqual(['green', 'green', 'green'])
    expect(['F3', 'F6', 'F9'].map((name) => cube[sticker(name)])).toEqual(['yellow', 'yellow', 'yellow'])
    expect(applyMoves(solved(), ['R', 'R', 'R', 'R'])).toEqual(solved())
  })

  it('refuse a cube the validator refuses, with its sentence', () => {
    expect(() => applyMove(blank(), 'R')).toThrow(
      'Only a possible cube can be turned. Fill in every sticker. 48 to go.',
    )
  })
})
