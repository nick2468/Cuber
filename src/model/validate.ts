import { COLOURS, FACES, faceOf, opposite, type Colour, type Face, type Scheme } from './colours'
import { CENTRES, counts, schemeOf, type Cube } from './cube'
import { toFacelets } from './facelets'
import { CORNERS, EDGES, type Piece } from './geometry'

/**
 * The validator: whether 54 stickers make a possible cube (spec 6.4).
 *
 * This app's own code, because the library does none: its `fromString`
 * silently makes a broken cube from a bad string, and a broken cube can hang
 * `solve`. So nothing reaches the library until `validate` has passed it.
 *
 * Two questions at two times (spec C8). `checkPartial` runs after every paint
 * and finds a mistake while it is still one click old. `validate` runs on the
 * whole cube before Solve, and adds the rules that need all 54 stickers.
 * Every sentence is the spec's, word for word.
 */

/** What is wrong, and the stickers to outline on screen. */
export interface Problem {
  readonly message: string
  readonly stickers: readonly number[]
}

export type Verdict = { readonly ok: true; readonly facelets: string } | ({ readonly ok: false } & Problem)

/** The problem while entering, or null. Rules 1 to 5. */
export function checkPartial(cube: Cube): Problem | null {
  return tooMany(cube) ?? pieceRules(cube)
}

/**
 * The whole cube: rules 2 to 5, then 6 to 12, the first failure winning.
 *
 * Rule 1 is not run here, because on a complete cube any colour off nine is
 * rule 7, and rule 7's sentence names both sides of the mistake.
 */
export function validate(cube: Cube): Verdict {
  const problem = pieceRules(cube) ?? wholeRules(cube)
  if (problem) return { ok: false, ...problem }
  return { ok: true, facelets: toFacelets(cube)! }
}

const NUMBERS = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
]

/** "There are ten red stickers and eight blue. A cube has nine of each." */
function countSentence(wrong: readonly (readonly [Colour, number])[]): string {
  const parts = wrong.map(([colour, n], i) => `${NUMBERS[n] ?? n} ${colour}${i === 0 ? ' stickers' : ''}`)
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`
  return `There are ${list}. A cube has nine of each.`
}

/** The colours off nine, those over first, each in the picker order. */
function offNine(cube: Cube, over: boolean): (readonly [Colour, number])[] {
  const found = counts(cube)
  const wrong = COLOURS.map((colour) => [colour, found[colour]] as const)
  return [
    ...wrong.filter(([, n]) => n > 9),
    ...(over ? [] : wrong.filter(([, n]) => n < 9)),
  ]
}

/** Rule 1, a guard: the picker refuses a tenth sticker of a colour. */
function tooMany(cube: Cube): Problem | null {
  const over = offNine(cube, true)
  if (over.length === 0) return null
  const colours = over.map(([colour]) => colour)
  return {
    message: countSentence(over),
    stickers: cube.flatMap((sticker, index) => (sticker && colours.includes(sticker) ? [index] : [])),
  }
}

/** The corners, then the edges, with the words each kind is named by. */
const KINDS = [
  { pieces: CORNERS, a: 'A corner', that: 'That corner', colours: 'three', plural: 'corners' },
  { pieces: EDGES, a: 'An edge', that: 'That edge', colours: 'two', plural: 'edges' },
] as const

/** A piece's colours on a solved cube in this scheme, in its stickers' order. */
function realColours(scheme: Scheme, piece: Piece): Colour[] {
  return Array.from(piece.name, (face) => scheme[face as Face])
}

/**
 * Which real piece these colours are, and how far it is turned: the number of
 * clockwise steps from the first sticker to the one carrying the piece's first
 * colour (its Up-or-Down colour, or for a middle edge its Front-or-Back
 * colour). That is the library's own twist and flip. Null when the colours
 * are no real piece in any turn, which is how a mirrored corner is caught.
 */
function readPiece(colours: readonly Colour[], real: readonly (readonly Colour[])[]) {
  for (let turn = 0; turn < colours.length; turn += 1) {
    const turned = colours.map((_, k) => colours[(turn + k) % colours.length])
    const piece = real.findIndex((each) => each.every((colour, k) => colour === turned[k]))
    if (piece >= 0) return { piece, turn }
  }
  return null
}

/** Rules 2 to 5: the centres, then each piece on its own. */
function pieceRules(cube: Cube): Problem | null {
  const centres = CENTRES.map((index) => cube[index])
  const shared = CENTRES.filter(
    (index) => cube[index] !== null && centres.filter((colour) => colour === cube[index]).length > 1,
  )
  if (shared.length > 0) {
    return { message: 'Two centres have the same colour. Every centre is different.', stickers: shared }
  }

  const filledOf = (piece: Piece) => piece.stickers.flatMap((index) => cube[index] ?? [])

  for (const kind of KINDS) {
    for (const piece of kind.pieces) {
      const colours = filledOf(piece)
      if (new Set(colours).size < colours.length) {
        return { message: `${kind.a} cannot have two stickers the same colour.`, stickers: piece.stickers }
      }
    }
  }

  // Rules 4 and 5 judge by the centres, so they wait until the centres say a scheme.
  const scheme = schemeOf(cube)
  if (!scheme) return null

  for (const kind of KINDS) {
    for (const piece of kind.pieces) {
      const faces = filledOf(piece).map((colour) => faceOf(scheme, colour))
      const pair = FACES.find((face) => faces.includes(face) && faces.includes(opposite(face)))
      if (pair) {
        return {
          message: `${kind.a} cannot have ${scheme[pair]} and ${scheme[opposite(pair)]}: they are on opposite sides.`,
          stickers: piece.stickers,
        }
      }
    }
  }

  for (const kind of KINDS) {
    const real = kind.pieces.map((piece) => realColours(scheme, piece))
    for (const piece of kind.pieces) {
      const colours = filledOf(piece)
      if (colours.length === piece.stickers.length && !readPiece(colours, real)) {
        return {
          message: `${kind.that} is not a real piece. Check its ${kind.colours} colours.`,
          stickers: piece.stickers,
        }
      }
    }
  }

  return null
}

/** Odd or even: the number of pairs out of order, modulo two. */
function parity(order: readonly number[]): number {
  let swaps = 0
  order.forEach((a, i) => order.slice(i + 1).forEach((b) => (swaps += a > b ? 1 : 0)))
  return swaps % 2
}

/** Rules 6 to 12. Rules 2 to 5 have passed, so every piece is a real one. */
function wholeRules(cube: Cube): Problem | null {
  const blanks = cube.filter((sticker) => sticker === null).length
  if (blanks > 0) return { message: `Fill in every sticker. ${blanks} to go.`, stickers: [] }

  const wrong = offNine(cube, false)
  if (wrong.length > 0) return { message: countSentence(wrong), stickers: [] }

  const scheme = schemeOf(cube)!
  const [corners, edges] = KINDS.map((kind) => {
    const real = kind.pieces.map((piece) => realColours(scheme, piece))
    return kind.pieces.map((piece) => readPiece(piece.stickers.map((index) => cube[index]!), real)!)
  })

  const same = ['Two corners have the same three colours.', 'Two edges have the same two colours.']
  for (const [k, reads] of [corners, edges].entries()) {
    const pieces = reads.map((read) => read.piece)
    const twice = KINDS[k].pieces.filter((_, i) => pieces.indexOf(pieces[i]) !== pieces.lastIndexOf(pieces[i]))
    if (twice.length > 0) return { message: same[k], stickers: twice.flatMap((piece) => piece.stickers) }
  }

  const turns = (reads: typeof corners) => reads.reduce((sum, read) => sum + read.turn, 0)
  if (turns(corners) % 3 !== 0) {
    return { message: "One corner is twisted. Check the corners' colours.", stickers: [] }
  }
  if (turns(edges) % 2 !== 0) {
    return { message: "One edge is flipped. Check the edges' colours.", stickers: [] }
  }

  const order = (reads: typeof corners) => reads.map((read) => read.piece)
  if (parity(order(corners)) !== parity(order(edges))) {
    return { message: 'Two pieces are swapped. A real cube cannot be solved from here.', stickers: [] }
  }

  return null
}
