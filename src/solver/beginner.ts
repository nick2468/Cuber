import { faceWord, type Face } from '../model/colours'
import { SOLVED_FACELETS } from '../model/facelets'
import { CORNERS, EDGES, type Piece } from '../model/geometry'
import { MOVES, isMove, turnFacelets, type Move } from '../model/moves'
import type { Label, Stage } from './solver'

/**
 * The beginner method: the cube solved layer by layer, the way the official
 * guide and nearly every "how to solve a cube" page teach it (spec 7.5).
 *
 * This is the app's own code, because the library has nothing like it. It is
 * long, around 170 moves against the quick method's twenty, and that is the
 * point: a person following it learns a method they can use without the app.
 *
 * Nothing is ever turned over. The guides build the first layer on top and
 * then say "turn the cube over"; this builds it on the BOTTOM face as it was
 * entered, so the holding rule holds all the way through (spec C11) and every
 * move is one of the eighteen face turns.
 *
 * It works in facelets rather than colours: a solved sticker is one whose
 * letter is the letter of the face it sits on, which is what "carries the
 * colour of that sticker's face in the scheme" comes to once the colours have
 * been turned into letters. `SOLVED_FACELETS` is that test, one character at a
 * time.
 */

/** A named sequence of moves, which the box labels where it starts (spec 7.5). */
export interface Macro {
  readonly name: string
  readonly moves: readonly Move[]
}

/** One entry in a stage's vocabulary: a plain move, or a named sequence. */
export type Item = Move | Macro

/** What the method worked out, for the box as much as for the cube. */
export interface Beginner {
  readonly moves: Move[]
  readonly stages: Stage[]
  readonly labels: Label[]
}

function movesIn(item: Item): readonly Move[] {
  return typeof item === 'string' ? [item] : item.moves
}

/**
 * A named sequence from its letters. The letters are checked here, once, at
 * the only place they are written down: a typing mistake in the table below
 * fails at import rather than as a strange solution hours later.
 */
function macro(name: string, letters: string): Macro {
  const moves = letters.split(' ')
  for (const move of moves) {
    if (!isMove(move)) throw new Error(`"${move}" in "${name}" is not one of the eighteen moves.`)
  }
  return { name, moves: moves as Move[] }
}

// ---------------------------------------------------------------------------
// The pieces, and what it means for one to be where it belongs
// ---------------------------------------------------------------------------

const PIECES: readonly Piece[] = [...CORNERS, ...EDGES]
const PIECE_BY_NAME = new Map(PIECES.map((piece) => [piece.name, piece]))

function pieceNamed(name: string): Piece {
  const piece = PIECE_BY_NAME.get(name)
  if (!piece) throw new Error(`There is no piece called ${name}.`)
  return piece
}

/** Every sticker of these positions, which a goal asks to be in place together. */
function stickersOf(names: readonly string[]): number[] {
  return names.flatMap((name) => pieceNamed(name).stickers)
}

/**
 * Every way a real piece can read, to its name: a corner shows its three
 * letters in one of three rotations, an edge its two either way round.
 */
const NAME_OF = new Map<string, string>()
for (const piece of PIECES) {
  const letters = piece.stickers.map((at) => SOLVED_FACELETS[at])
  for (let turned = 0; turned < letters.length; turned += 1) {
    NAME_OF.set([...letters.slice(turned), ...letters.slice(0, turned)].join(''), piece.name)
  }
}

/**
 * What a stage is trying to reach, and what it can tell apart.
 *
 * `mark` is the second half of the search and the reason it finishes. A goal
 * about four edges cannot see the other sixteen pieces, so two cubes whose
 * four edges sit the same way are the same cube as far as that goal goes: a
 * face turn moves whole pieces, so where those four go next depends on where
 * they are now and on nothing else. Marking the rest out and looking at each
 * mark once turns a search that could be millions of cubes deep into one
 * bounded by the handful of places four edges can be. Without it a hard cross
 * takes seconds on its own.
 */
export interface Goal {
  reached(state: string): boolean
  mark(state: string): string
}

function goalOf(names: readonly string[], reached: (state: string) => boolean): Goal {
  const wanted = new Set(names)
  const slots = PIECES.map((piece) => piece.stickers)
  return {
    reached,
    mark(state) {
      let out = ''
      for (const slot of slots) {
        const letters =
          slot.length === 2
            ? state[slot[0]] + state[slot[1]]
            : state[slot[0]] + state[slot[1]] + state[slot[2]]
        out += wanted.has(NAME_OF.get(letters) ?? '') ? letters : '.'
      }
      return out
    },
  }
}

/** The goal that these positions are all in place, and nothing else matters. */
function allInPlace(names: readonly string[]): Goal {
  const stickers = stickersOf(names)
  return goalOf(names, (state) => inPlace(state, stickers))
}

/** True when each of these stickers carries the colour of the face it is on. */
function inPlace(state: string, stickers: readonly number[]): boolean {
  return stickers.every((at) => state[at] === SOLVED_FACELETS[at])
}

/**
 * True when the piece at this position is the one that belongs there, in any
 * rotation. Stage 6 asks for this and nothing more: turning the corners is
 * stage 7's work, and asking for both at once would ask the corner move to do
 * something it cannot.
 */
function inItsSlot(state: string, name: string): boolean {
  const { stickers } = pieceNamed(name)
  const sorted = (letters: string) =>
    stickers
      .map((at) => letters[at])
      .sort()
      .join('')
  return sorted(state) === sorted(SOLVED_FACELETS)
}

// ---------------------------------------------------------------------------
// The named sequences (spec 7.5's second table)
// ---------------------------------------------------------------------------

/** The four sides, in the order a clockwise turn of the top face takes them. */
const AROUND: readonly Face[] = ['F', 'R', 'B', 'L']

const clockwiseOf = (face: Face): Face => AROUND[(AROUND.indexOf(face) + 1) % AROUND.length]
const anticlockwiseOf = (face: Face): Face => AROUND[(AROUND.indexOf(face) + 3) % AROUND.length]

/**
 * The four bottom corner slots, in the order the method fills them, each with
 * the face whose righty move drops a corner into it. The four righty moves are
 * one shape seen from the four sides: turn the whole cube a quarter turn and
 * `R U R' U'` becomes `B U B' U'`, because the top face is the same top face
 * from every side.
 */
const BOTTOM_CORNERS = [
  { slot: 'DFR', where: 'front-right', face: 'R' },
  { slot: 'DLF', where: 'front-left', face: 'F' },
  { slot: 'DBL', where: 'back-left', face: 'L' },
  { slot: 'DRB', where: 'back-right', face: 'B' },
] as const

export const RIGHTY: readonly Macro[] = BOTTOM_CORNERS.map(({ where, face }) =>
  macro(`The righty move, ${where}`, `${face} U ${face}' U'`),
)

/**
 * The eight insertions: an edge waiting on the top face, above the face whose
 * centre its side sticker matches, going down into that face's right-hand or
 * left-hand slot. Two shapes seen from the four sides.
 */
export const INSERTIONS: readonly Macro[] = AROUND.flatMap((face) => [
  macro(
    `Insert to the right, from ${faceWord(face)}`,
    `U ${clockwiseOf(face)} U' ${clockwiseOf(face)}' U' ${face}' U ${face}`,
  ),
  macro(
    `Insert to the left, from ${faceWord(face)}`,
    `U' ${anticlockwiseOf(face)}' U ${anticlockwiseOf(face)} U ${face} U' ${face}'`,
  ),
])

export const CROSS_MOVE = macro('The cross move', "F R U R' U' F'")
export const EDGE_MOVE = macro('The edge move', "R U R' U R U2 R'")
export const CORNER_MOVE = macro('The corner move', "U R U' L' U R' U' L")
export const TWIST_MOVE = macro('The twist move', "R' D' R D")

/** Turning the top face is not a named sequence, so it gets no label. */
const TOP_TURNS: readonly Item[] = ['U', "U'", 'U2']

/** All eighteen face turns, which is stage 1's whole vocabulary. */
const EVERY_MOVE: readonly Item[] = MOVES

// ---------------------------------------------------------------------------
// The search
// ---------------------------------------------------------------------------

/**
 * The shortest sequence of vocabulary items that reaches the goal, or null
 * past the limit.
 *
 * Breadth first, level by level, so the first sequence that reaches the goal
 * is the shortest one there is. A cube the goal cannot tell from one already
 * looked at is not looked at again, which is what `Goal.mark` is for. The path
 * is kept as a parent for each cube rather than a list per cube, which is the
 * same answer without copying the whole path at every step.
 */
export function solveStage(
  facelets: string,
  vocabulary: readonly Item[],
  goal: Goal,
  limit: number,
): Item[] | null {
  if (goal.reached(facelets)) return []

  const steps = vocabulary.map((item) => ({ item, letters: movesIn(item).join(' ') }))
  const states = [facelets]
  const cameFrom = [-1]
  // One item per cube: the one that made it. The cube it all starts from was
  // not made by anything, and `pathTo` stops before reading that entry.
  const takenBy: Item[] = ['U']
  const seen = new Set([goal.mark(facelets)])
  let frontier = [0]

  for (let depth = 1; depth <= limit; depth += 1) {
    const next: number[] = []
    for (const at of frontier) {
      const last = at > 0 ? takenBy[at] : null
      for (const { item, letters } of steps) {
        // Two turns of one face in a row are one turn of that face, so a
        // shortest answer never has them and looking at them only costs time.
        // Only for plain moves: a named sequence starting with the face the
        // move before ended on is an ordinary thing to do.
        if (typeof item === 'string' && typeof last === 'string' && item[0] === last[0]) continue
        const after = turnFacelets(states[at], letters)
        const mark = goal.mark(after)
        if (seen.has(mark)) continue
        seen.add(mark)
        states.push(after)
        cameFrom.push(at)
        takenBy.push(item)
        const here = states.length - 1
        if (goal.reached(after)) return pathTo(here, cameFrom, takenBy)
        next.push(here)
      }
    }
    // Nowhere left to go: another level would look at exactly the same cubes.
    if (next.length === 0) return null
    frontier = next
  }
  return null
}

function pathTo(end: number, cameFrom: readonly number[], takenBy: readonly Item[]): Item[] {
  const path: Item[] = []
  for (let at = end; at > 0; at = cameFrom[at]) path.push(takenBy[at])
  return path.reverse()
}

// ---------------------------------------------------------------------------
// The seven stages (spec 7.5's first table and its sentences)
// ---------------------------------------------------------------------------

interface StageWords {
  /** The heading in the box. */
  readonly name: string
  /** What to do, under the heading. */
  readonly sentence: string
  /** The one line instead, when the stage was already done. */
  readonly done: string
}

const WORDS: readonly StageWords[] = [
  {
    name: 'The white cross',
    sentence:
      'Make a cross on the bottom face: four edges with both colours matching their centres.',
    done: 'The white cross was already there.',
  },
  {
    name: 'The white corners',
    sentence:
      'Put each bottom corner in place. A corner waits above its slot on the top layer, then the righty move drops it in; repeat until its colours match.',
    done: 'The white corners were already in place.',
  },
  {
    name: 'The middle layer',
    sentence:
      'Fill the middle layer. Find a top edge with no top colour, turn the top until its front colour matches a centre, then insert it right or left.',
    done: 'The middle layer was already done.',
  },
  {
    name: 'The yellow cross',
    sentence: 'Make a cross on the top face with the cross move. It may take up to three goes.',
    done: 'The yellow cross was already there.',
  },
  {
    name: 'The yellow edges',
    sentence:
      'Turn the top until two edges match their centres, then the edge move puts the rest right.',
    done: 'The yellow edges were already in place.',
  },
  {
    name: 'The yellow corners in place',
    sentence: 'The corner move moves three corners round until each is in its own slot.',
    done: 'The yellow corners were already in their own slots.',
  },
  {
    name: 'The yellow corners turned',
    sentence:
      'The twist move, done in pairs, turns the corner at the front-right until it is right. Then turn the top to bring the next corner there. The cube looks broken until the last corner; that is normal.',
    done: 'The yellow corners were already turned the right way.',
  },
]

/** The bottom edges, front, left, back, right: the white cross. */
const CROSS_EDGES = ['DF', 'DL', 'DB', 'DR']
/** The middle layer's four edges, in the same way round as the corners. */
const MIDDLE_EDGES = ['FR', 'FL', 'BL', 'BR']
const TOP_EDGES = ['UR', 'UF', 'UL', 'UB']
const TOP_CORNERS = ['URF', 'UFL', 'ULB', 'UBR']

const BOTTOM_SLOTS = BOTTOM_CORNERS.map(({ slot }) => slot)

/** The positions below the top face, which the last four stages leave alone. */
const LOWER_PIECES = [...CROSS_EDGES, ...BOTTOM_SLOTS, ...MIDDLE_EDGES]
/** Those and the top edges, which stages 4 and 5 are also about. */
const BELOW_THE_TOP_EDGES = [...LOWER_PIECES, ...TOP_EDGES]
const EVERY_PIECE = [...BELOW_THE_TOP_EDGES, ...TOP_CORNERS]

/** Every piece in place: the last stage's goal, and the only one a test needs. */
export const SOLVED_GOAL: Goal = allInPlace(EVERY_PIECE)

const FIRST_TWO_LAYERS = stickersOf(LOWER_PIECES)
const WITH_TOP_EDGES = stickersOf(BELOW_THE_TOP_EDGES)

/**
 * The sticker on the top face of each top edge. `EDGES` lists an edge's
 * stickers in the library's order, and for a top edge the first one is the one
 * on the top face, which is the only one stage 4 is about.
 */
const TOP_EDGE_TOPS = TOP_EDGES.map((name) => pieceNamed(name).stickers[0])

/** The sticker on the top face of the corner at the front-right, stage 7's one test. */
const FRONT_RIGHT_TOP = pieceNamed('URF').stickers[0]

/** The letter every sticker of the top face carries when the cube is solved. */
const TOP_LETTER = SOLVED_FACELETS[FRONT_RIGHT_TOP]

// ---------------------------------------------------------------------------
// Putting it together
// ---------------------------------------------------------------------------

/** How a run of the same named sequence reads: "twice", "three times". */
const TIMES: readonly string[] = ['', '', 'twice', 'three times', 'four times', 'five times']

function labelFor(item: Macro, run: number): string {
  const letters = item.moves.join(' ')
  if (run === 1) return `${item.name}: ${letters}`
  return `${item.name}: ${letters}, ${TIMES[run] ?? `${run} times`}`
}

/** The solution as it is built: the cube as it stands, and what to say about it. */
interface Working {
  state: string
  readonly moves: Move[]
  readonly stages: Stage[]
  readonly labels: Label[]
}

/** Turns the cube by these items and hands them back, so a stage can collect them. */
function advance(work: Working, items: readonly Item[]): readonly Item[] {
  const letters = items.flatMap(movesIn).join(' ')
  // The library is not asked to do nothing: an empty string is not a move.
  if (letters) work.state = turnFacelets(work.state, letters)
  return items
}

function search(
  work: Working,
  vocabulary: readonly Item[],
  goal: Goal,
  limit: number,
  stuck: string,
): readonly Item[] {
  const found = solveStage(work.state, vocabulary, goal, limit)
  // Not a case, a fault: every stage's limit is chosen so that no real cube
  // reaches it, and the 200-cube test is what keeps that true.
  if (!found) throw new Error(stuck)
  return advance(work, found)
}

/** Writes a whole stage down: its moves, the labels inside it, and its heading. */
function land(work: Working, words: StageWords, items: readonly Item[]): void {
  const from = work.moves.length
  for (let at = 0; at < items.length; ) {
    const item = items[at]
    let run = 1
    while (at + run < items.length && items[at + run] === item) run += 1
    if (typeof item !== 'string') work.labels.push({ at: work.moves.length, text: labelFor(item, run) })
    for (let again = 0; again < run; again += 1) work.moves.push(...movesIn(item))
    at += run
  }
  work.stages.push({
    name: words.name,
    sentence: items.length === 0 ? words.done : words.sentence,
    from,
    to: work.moves.length,
  })
}

/** One stage that fills four positions, one at a time, keeping the ones before it. */
function fourPieces(
  work: Working,
  words: StageWords,
  targets: readonly string[],
  before: readonly string[],
  vocabulary: readonly Item[],
  limit: number,
): void {
  const items: Item[] = []
  for (let which = 0; which < targets.length; which += 1) {
    items.push(
      ...search(
        work,
        vocabulary,
        allInPlace([...before, ...targets.slice(0, which + 1)]),
        limit,
        `${words.name}: ${targets[which]} would not go in within ${limit}.`,
      ),
    )
  }
  land(work, words, items)
}

export function solveBeginner(facelets: string): Beginner {
  const work: Working = { state: facelets, moves: [], stages: [], labels: [] }

  fourPieces(work, WORDS[0], CROSS_EDGES, [], EVERY_MOVE, 6)
  fourPieces(work, WORDS[1], BOTTOM_SLOTS, CROSS_EDGES, [...RIGHTY, ...TOP_TURNS], 8)
  fourPieces(
    work,
    WORDS[2],
    MIDDLE_EDGES,
    [...CROSS_EDGES, ...BOTTOM_SLOTS],
    [...INSERTIONS, ...TOP_TURNS],
    8,
  )

  land(
    work,
    WORDS[3],
    search(
      work,
      [CROSS_MOVE, ...TOP_TURNS],
      goalOf(
        BELOW_THE_TOP_EDGES,
        (state) =>
          inPlace(state, FIRST_TWO_LAYERS) && TOP_EDGE_TOPS.every((at) => state[at] === TOP_LETTER),
      ),
      12,
      'The yellow cross would not come out within 12.',
    ),
  )

  land(
    work,
    WORDS[4],
    search(
      work,
      [EDGE_MOVE, ...TOP_TURNS],
      allInPlace(BELOW_THE_TOP_EDGES),
      12,
      'The yellow edges would not go in within 12.',
    ),
  )

  land(
    work,
    WORDS[5],
    search(
      work,
      [CORNER_MOVE, ...TOP_TURNS],
      goalOf(
        EVERY_PIECE,
        (state) =>
          inPlace(state, WITH_TOP_EDGES) && TOP_CORNERS.every((name) => inItsSlot(state, name)),
      ),
      12,
      'The yellow corners would not come round within 12.',
    ),
  )

  land(work, WORDS[6], turnTheCorners(work))

  const solution = work.moves.join(' ')
  if (turnFacelets(facelets, solution) !== SOLVED_FACELETS) {
    throw new Error('The beginner method worked something out that does not solve the cube.')
  }
  return { moves: work.moves, stages: work.stages, labels: work.labels }
}

/**
 * Stage 7, which is the guide's own loop rather than one search.
 *
 * Each corner is twisted where it stands, at the front-right of the top face,
 * and then the top is turned to bring the next one there. One search over all
 * four would be a search twenty items deep over five choices, which is not a
 * thing that finishes; the guide does not search either.
 *
 * The test for a finished corner is that its top sticker shows the top colour.
 * That is safe on its own: the twist move leaves a BOTTOM corner in that slot
 * after an odd number of goes, and no bottom corner carries a top-colour
 * sticker, so this can only be true after whole pairs, which is what "done in
 * pairs" means. The first two layers come back at the end of the stage and not
 * before, which is why the box warns that the cube looks broken until then.
 */
function turnTheCorners(work: Working): readonly Item[] {
  const items: Item[] = []
  for (const corner of TOP_CORNERS) {
    if (work.state === SOLVED_FACELETS) break
    items.push(
      ...search(
        work,
        [TWIST_MOVE],
        goalOf(EVERY_PIECE, (state) => state[FRONT_RIGHT_TOP] === TOP_LETTER),
        4,
        `The corner for ${corner} would not turn the right way up in four goes.`,
      ),
    )
    items.push(...advance(work, ['U']))
  }
  // Four corners means four turns of the top, which is where it started. The
  // last one is already in `items`; this only has anything to do when the
  // stage stopped early.
  items.push(
    ...search(
      work,
      TOP_TURNS,
      SOLVED_GOAL,
      1,
      'The top would not come round to finish the cube.',
    ),
  )
  return items
}
