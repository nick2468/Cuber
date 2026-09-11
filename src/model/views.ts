import type { Face } from './colours'

/**
 * The two views of the cube (spec 5.1, C2, C3).
 *
 * A corner-on view shows three faces, and three are not enough, so there are
 * two. The near view shows Up on top, Front at the front-left and Right at
 * the front-right, as the drawing does. The far view is what the near view
 * becomes after two movements of the whole cube, and those movements are
 * written here as data: which slot each face moves to, and the sentence the
 * status line says while each one plays.
 */

export type View = 'near' | 'far'

/** Where a face is when the cube is held still in front of the user. */
export type Slot = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right'

export interface Movement {
  /** For each slot, the slot its face moves to. */
  readonly moves: Readonly<Record<Slot, Slot>>
  /** What the status line says while it plays towards the far view. */
  readonly forward: string
  /** What it says while it plays back towards the near view. */
  readonly back: string
}

/** The two movements, in the order they play towards the far view. Played back, last first. */
export const VIEW_MOVEMENTS: readonly Movement[] = [
  {
    // A half turn about the front-back axis.
    moves: { top: 'bottom', bottom: 'top', left: 'right', right: 'left', front: 'front', back: 'back' },
    forward: 'Roll your cube over sideways so the top goes to the bottom.',
    back: 'Roll your cube back over so the top goes to the bottom.',
  },
  {
    // A quarter turn about the vertical axis.
    moves: { right: 'front', front: 'left', left: 'back', back: 'right', top: 'top', bottom: 'bottom' },
    forward: 'Turn it a quarter turn so the face on your right comes to the front.',
    back: 'Turn it back a quarter turn so the face on your left comes to the front.',
  },
]

type Arrangement = Readonly<Record<Slot, Face>>

const NEAR: Arrangement = { top: 'U', bottom: 'D', front: 'F', back: 'B', left: 'L', right: 'R' }

function after(arrangement: Arrangement, movement: Movement): Arrangement {
  const next = {} as Record<Slot, Face>
  for (const [slot, face] of Object.entries(arrangement) as [Slot, Face][]) next[movement.moves[slot]] = face
  return next
}

/**
 * The three faces a view shows: the one on top, the one at the front-left
 * (the front face) and the one at the front-right (the right face).
 */
export function viewFaces(view: View): readonly [Face, Face, Face] {
  const arrangement = view === 'near' ? NEAR : VIEW_MOVEMENTS.reduce(after, NEAR)
  return [arrangement.top, arrangement.front, arrangement.right]
}
