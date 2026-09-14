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

/** Whether a string the solver sent back is one of the eighteen moves. */
export function isMove(text: string): text is Move {
  return (MOVES as readonly string[]).includes(text)
}

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
 * The facelets after some moves, written the way the library writes them and
 * separated by spaces. The one place in the app that turns a cube (spec C6).
 *
 * It takes facelets rather than a cube because the beginner method works in
 * facelets and turns a cube thousands of times to find one solution: going
 * through colours and the validator each time would cost more than the search
 * itself. The caller has already proved the cube is a possible one.
 */
export function turnFacelets(facelets: string, letters: string): string {
  return Library.fromString(facelets).move(letters).asString()
}

/**
 * The cube after some moves. The cube must be a possible one: a cube the
 * validator refuses throws here, with its sentence, so a mistake fails in a
 * test rather than reaching a library that assumes a real cube.
 */
export function applyMoves(cube: Cube, moves: readonly Move[]): Cube {
  const verdict = validate(cube)
  if (!verdict.ok) throw new Error(`Only a possible cube can be turned. ${verdict.message}`)
  return fromFacelets(turnFacelets(verdict.facelets, moves.join(' ')), schemeOf(cube)!)
}

export function applyMove(cube: Cube, move: Move): Cube {
  return applyMoves(cube, [move])
}
