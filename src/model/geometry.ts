import { FACES, type Face } from './colours'

/**
 * Which sticker is where. The only place in the app that answers it (spec C7).
 *
 * A sticker is an index from 0 to 53 in the library's facelet order: the faces
 * U R F D L B, nine stickers each, each face read row by row as the library's
 * diagram reads it. So `9 * face + 3 * row + column`, with `U1` at 0, `R1` at 9,
 * `F1` at 18, `D1` at 27, `L1` at 36 and `B1` at 45.
 *
 * In space, x runs to the right, y up and z towards the viewer, and each
 * piece sits at (x, y, z) with every coordinate -1, 0 or 1.
 */

/** A sticker by its face, its row (0 to 2, top first) and its column (0 to 2). */
export interface Place {
  readonly face: Face
  readonly row: number
  readonly column: number
}

/** Where a piece sits: each coordinate -1, 0 or 1. */
export interface Position {
  readonly x: number
  readonly y: number
  readonly z: number
}

export function indexOf(face: Face, row: number, column: number): number {
  return 9 * FACES.indexOf(face) + 3 * row + column
}

export function placeOf(index: number): Place {
  return { face: FACES[Math.floor(index / 9)], row: Math.floor((index % 9) / 3), column: index % 3 }
}

/**
 * Spec 6.1's table: where each face is, and which way its rows and columns run.
 *
 * | Face | Where  | Rows run                  | Columns run              |
 * | U    | y = 1  | back (z -1) to front      | left to right (x -1 to 1)|
 * | R    | x = 1  | top to bottom             | front (z 1) to back      |
 * | F    | z = 1  | top to bottom             | left to right            |
 * | D    | y = -1 | front (z 1) to back       | left to right            |
 * | L    | x = -1 | top to bottom             | back (z -1) to front     |
 * | B    | z = -1 | top to bottom             | right (x 1) to left      |
 */
const LAYOUT: Readonly<Record<Face, (row: number, column: number) => Position>> = {
  U: (row, column) => ({ x: column - 1, y: 1, z: row - 1 }),
  R: (row, column) => ({ x: 1, y: 1 - row, z: 1 - column }),
  F: (row, column) => ({ x: column - 1, y: 1 - row, z: 1 }),
  D: (row, column) => ({ x: column - 1, y: -1, z: 1 - row }),
  L: (row, column) => ({ x: -1, y: 1 - row, z: column - 1 }),
  B: (row, column) => ({ x: 1 - column, y: 1 - row, z: -1 }),
}

export function positionOf(index: number): Position {
  const { face, row, column } = placeOf(index)
  return LAYOUT[face](row, column)
}

const POSITIONS: readonly Position[] = Array.from({ length: 54 }, (_, index) => positionOf(index))

/** The stickers on the outside of the piece at (x, y, z), lowest index first. */
export function stickersAt(x: number, y: number, z: number): number[] {
  const found: number[] = []
  POSITIONS.forEach((at, index) => {
    if (at.x === x && at.y === y && at.z === z) found.push(index)
  })
  return found
}

/**
 * A corner or an edge: its name, and its stickers in the library's clockwise
 * order. The name's letters are the faces its stickers are on, in the same
 * order, so on a solved cube the stickers carry exactly those faces' colours.
 */
export interface Piece {
  readonly name: string
  readonly stickers: readonly number[]
}

/** A sticker named the way spec 6.1 names it, face letter then 1 to 9: `sticker('U9')` is 8. */
export function sticker(name: string): number {
  const n = Number(name.slice(1)) - 1
  return indexOf(name[0] as Face, Math.floor(n / 3), n % 3)
}

/** A piece written the way spec 6.1's table writes it: `piece('URF', 'U9 R1 F3')`. */
function piece(name: string, stickers: string): Piece {
  return { name, stickers: stickers.split(' ').map(sticker) }
}

/** The eight corners, as cube.js's `cornerFacelet` lists them (spec 6.1). */
export const CORNERS: readonly Piece[] = [
  piece('URF', 'U9 R1 F3'),
  piece('UFL', 'U7 F1 L3'),
  piece('ULB', 'U1 L1 B3'),
  piece('UBR', 'U3 B1 R3'),
  piece('DFR', 'D3 F9 R7'),
  piece('DLF', 'D1 L9 F7'),
  piece('DBL', 'D7 B9 L7'),
  piece('DRB', 'D9 R9 B7'),
]

/** The twelve edges, as cube.js's `edgeFacelet` lists them (spec 6.1). */
export const EDGES: readonly Piece[] = [
  piece('UR', 'U6 R2'),
  piece('UF', 'U8 F2'),
  piece('UL', 'U4 L2'),
  piece('UB', 'U2 B2'),
  piece('DR', 'D6 R8'),
  piece('DF', 'D2 F8'),
  piece('DL', 'D4 L8'),
  piece('DB', 'D8 B8'),
  piece('FR', 'F6 R4'),
  piece('FL', 'F4 L6'),
  piece('BL', 'B6 L4'),
  piece('BR', 'B4 R6'),
]

/**
 * Which way each face lies: the coordinate that is 1 for every piece in that
 * face's layer. A turn of a face moves those nine pieces and no others.
 */
const LAYER: Readonly<Record<Face, (position: Position) => number>> = {
  U: (position) => position.y,
  R: (position) => position.x,
  F: (position) => position.z,
  D: (position) => -position.y,
  L: (position) => -position.x,
  B: (position) => -position.z,
}

/** True when the piece at this place turns with that face. */
export function inLayer(face: Face, position: Position): boolean {
  return LAYER[face](position) === 1
}
