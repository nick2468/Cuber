/**
 * The three ways of solving, chosen in the box and remembered (spec 7.3, C22).
 *
 * Quick solve is the library's two-phase method at its default depth: short,
 * but never the shortest. Fewest moves asks the same library for one move,
 * then two, and so on, so a lightly scrambled cube comes back as the undo of
 * the scrambling. The beginner method is the layer-by-layer one every guide
 * teaches: far longer, and the point of it is that a person learns it.
 */

export type Method = 'quick' | 'fewest' | 'beginner'

/** In the order the radios are drawn (spec 9.5). */
export const METHODS: readonly Method[] = ['quick', 'fewest', 'beginner']

/** The word on the radio. The only place these words are written. */
const WORDS: Readonly<Record<Method, string>> = {
  quick: 'Quick solve',
  fewest: 'Fewest moves',
  beginner: 'Beginner method',
}

export function methodWord(method: Method): string {
  return WORDS[method]
}
