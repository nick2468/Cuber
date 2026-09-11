import { colourOfLetter, letterOf } from './colours'
import type { Cube, Sticker } from './cube'

/**
 * The cube as it is remembered: 54 characters, one per sticker, `w y r o b g`
 * for the colours and `-` for a blank (spec 10).
 *
 * Anything read back that is not exactly that is refused, the rule Conquest's
 * `recallSetup` applies: a damaged stored value must never stop the app
 * opening, so it is quietly dropped and the caller starts from the blank cube.
 */

const BLANK = '-'

export function toText(cube: Cube): string {
  return cube.map((sticker) => (sticker ? letterOf(sticker) : BLANK)).join('')
}

/** The cube these characters say, or null for anything that is not 54 of them. */
export function fromText(text: string | null): Cube | null {
  if (text === null || text.length !== 54) return null
  const cube: Sticker[] = []
  for (const letter of text) {
    if (letter === BLANK) {
      cube.push(null)
      continue
    }
    const colour = colourOfLetter(letter)
    if (!colour) return null
    cube.push(colour)
  }
  return cube
}
