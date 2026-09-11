/**
 * The six colours, the six faces, and the scheme that joins them (spec 3, 4.3).
 *
 * A colour is what the user paints. A face is where a sticker is. The scheme
 * says which colour belongs on which face, and it is read from the six
 * centres, so a cube with a non-standard scheme can still be entered.
 */

export type Colour = 'red' | 'green' | 'yellow' | 'white' | 'blue' | 'orange'

/** In the picker's order, which is the drawing's (spec 4). */
export const COLOURS: readonly Colour[] = ['red', 'green', 'yellow', 'white', 'blue', 'orange']

/**
 * The sticker colours, the same in both themes (spec 4.3). They live here
 * rather than in `index.css` because they belong to the cube, not the theme:
 * the frame changes with the theme, the stickers do not.
 */
const HEX: Readonly<Record<Colour, string>> = {
  white: '#f5f5f5',
  yellow: '#ffd500',
  red: '#c41e3a',
  orange: '#ff5800',
  blue: '#0051ba',
  green: '#009e60',
}

export function hexOf(colour: Colour): string {
  return HEX[colour]
}

/** One letter per colour, for the remembered form of the cube (spec 10). */
const LETTERS: Readonly<Record<Colour, string>> = {
  white: 'w',
  yellow: 'y',
  red: 'r',
  orange: 'o',
  blue: 'b',
  green: 'g',
}

export function letterOf(colour: Colour): string {
  return LETTERS[colour]
}

/** The colour a letter stands for, or null for any other character. */
export function colourOfLetter(letter: string): Colour | null {
  return COLOURS.find((colour) => LETTERS[colour] === letter) ?? null
}

export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

/** In the library's order, which is the sticker order (spec C7). */
export const FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

/** The words for a face, on screen and in every sentence (spec 3). */
const WORDS: Readonly<Record<Face, string>> = {
  U: 'the top face',
  R: 'the right face',
  F: 'the front face',
  D: 'the bottom face',
  L: 'the left face',
  B: 'the back face',
}

export function faceWord(face: Face): string {
  return WORDS[face]
}

const OPPOSITE: Readonly<Record<Face, Face>> = { U: 'D', D: 'U', F: 'B', B: 'F', L: 'R', R: 'L' }

export function opposite(face: Face): Face {
  return OPPOSITE[face]
}

/** Which colour is on which face. */
export type Scheme = Readonly<Record<Face, Colour>>

/** White up, yellow down, green front, blue back, red right, orange left. */
export function standardScheme(): Scheme {
  return { U: 'white', R: 'red', F: 'green', D: 'yellow', L: 'orange', B: 'blue' }
}

/**
 * The scheme from the six centres, given in the order of `FACES`, or null
 * when a centre is blank or two centres share a colour.
 */
export function schemeFrom(centres: readonly (Colour | null)[]): Scheme | null {
  if (centres.length !== FACES.length || centres.includes(null)) return null
  if (new Set(centres).size !== FACES.length) return null
  return Object.fromEntries(FACES.map((face, i) => [face, centres[i]])) as Record<Face, Colour>
}

/** The face a colour belongs on. A scheme holds all six colours, so there always is one. */
export function faceOf(scheme: Scheme, colour: Colour): Face {
  return FACES.find((face) => scheme[face] === colour)!
}
