import { COLOURS, FACES, schemeFrom, standardScheme, type Colour, type Scheme } from './colours'
import { indexOf, placeOf } from './geometry'

/**
 * The cube: 54 stickers in the library's facelet order (spec C7), each a
 * colour or blank. Never changed in place: every change makes a new array,
 * so React sees it and a test can hold the cube it started with.
 */

/** One sticker: a colour, or null while it is blank. */
export type Sticker = Colour | null

export type Cube = readonly Sticker[]

/** The six centres, one per face, in the order of `FACES`: 4, 13, 22, 31, 40, 49. */
export const CENTRES: readonly number[] = FACES.map((face) => indexOf(face, 1, 1))

/** Every sticker the colour of its face's centre. */
export function solved(scheme: Scheme = standardScheme()): Cube {
  return Array.from({ length: 54 }, (_, index) => scheme[placeOf(index).face])
}

/** What Reset gives: 48 blank stickers and the standard centres (spec C14). */
export function blank(): Cube {
  const scheme = standardScheme()
  return Array.from({ length: 54 }, (_, index) =>
    CENTRES.includes(index) ? scheme[placeOf(index).face] : null,
  )
}

/** A new cube with one sticker painted, or blanked with null. */
export function paint(cube: Cube, index: number, colour: Sticker): Cube {
  if (!Number.isInteger(index) || index < 0 || index >= cube.length) {
    throw new Error(`There is no sticker ${index}.`)
  }
  const next = cube.slice()
  next[index] = colour
  return next
}

/** How many stickers carry each colour. */
export function counts(cube: Cube): Record<Colour, number> {
  const found = Object.fromEntries(COLOURS.map((colour) => [colour, 0])) as Record<Colour, number>
  for (const sticker of cube) if (sticker) found[sticker] += 1
  return found
}

/** How many of the 54 stickers have a colour, centres included. */
export function filled(cube: Cube): number {
  return cube.filter((sticker) => sticker !== null).length
}

export function isComplete(cube: Cube): boolean {
  return filled(cube) === cube.length
}

/** The scheme the centres say, or null when a centre is blank or two match. */
export function schemeOf(cube: Cube): Scheme | null {
  return schemeFrom(CENTRES.map((index) => cube[index]))
}
