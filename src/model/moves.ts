import Library from '../solver/vendor/cube.js'
import { FACES, type Face } from './colours'
import { schemeOf, type Cube } from './cube'
import { fromFacelets } from './facelets'
import { validate } from './validate'

/**
 * The eighteen moves, and turning the cube with them (spec 6.3).
 *
 * The library's `move` is the only face turn in the app (spec C6). Sticker
 * tables written here by hand would be a second copy of the same algorithm,
 * and the one place the two could disagree is the one place no test could
 * see. So a move converts the cube to facelets, asks the library, and
 * converts back.
 */

/** A face letter, then nothing (clockwise), `'` (anticlockwise) or `2` (a half turn). */
export type Move = `${Face}${'' | "'" | '2'}`

export const MOVES: readonly Move[] = FACES.flatMap((face) =>
  (['', "'", '2'] as const).map((turn): Move => `${face}${turn}`),
)

/** The move that undoes this one: `R` and `R'` swap, `R2` stays. */
export function inverse(move: Move): Move {
  if (move.endsWith('2')) return move
  return move.endsWith("'") ? (move[0] as Face) : `${move[0] as Face}'`
}

/** The moves that undo these: each inverted, last first. */
export function undo(moves: readonly Move[]): Move[] {
  return [...moves].reverse().map(inverse)
}

/** The scramble the scenes and the tests share (spec 15.1). */
export const FIXED_SCRAMBLE: readonly Move[] = ['R', 'U', "R'", "U'", 'F2', 'D', "L'", 'B2', 'U2', 'R']

/**
 * The cube after some moves. The cube must be a possible one: a cube the
 * validator refuses throws here, with its sentence, so a mistake fails in a
 * test rather than reaching a library that assumes a real cube.
 */
export function applyMoves(cube: Cube, moves: readonly Move[]): Cube {
  const verdict = validate(cube)
  if (!verdict.ok) throw new Error(`Only a possible cube can be turned. ${verdict.message}`)
  const letters = Library.fromString(verdict.facelets).move(moves.join(' ')).asString()
  return fromFacelets(letters, schemeOf(cube)!)
}

export function applyMove(cube: Cube, move: Move): Cube {
  return applyMoves(cube, [move])
}
