import { FACES, faceOf, type Face, type Scheme } from './colours'
import { schemeOf, type Cube } from './cube'

/**
 * Colours to letters and back (spec 6.2).
 *
 * The solver wants facelets: 54 letters, each the face whose centre carries
 * that sticker's colour. The user paints colours. These two functions are the
 * only crossing between the two.
 */

/** The facelets of a solved cube: nine of each face letter. */
export const SOLVED_FACELETS = FACES.map((face) => face.repeat(9)).join('')

/**
 * The facelets for a cube, or null when it has none: a blank sticker, a
 * blank centre, or two centres of one colour. It says so rather than guessing.
 */
export function toFacelets(cube: Cube): string | null {
  const scheme = schemeOf(cube)
  if (!scheme || cube.includes(null)) return null
  return cube.map((colour) => faceOf(scheme, colour!)).join('')
}

/** The cube for some facelets, painted in a scheme. */
export function fromFacelets(letters: string, scheme: Scheme): Cube {
  return Array.from(letters, (letter) => {
    if (!FACES.includes(letter as Face)) throw new Error(`"${letter}" is not a face letter.`)
    return scheme[letter as Face]
  })
}
