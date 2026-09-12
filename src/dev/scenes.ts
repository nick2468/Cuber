import { blank, paint, solved, type Cube } from '../model/cube'
import { CORNERS } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves } from '../model/moves'
import { SPEEDS, type Speed } from '../model/speeds'
import type { View } from '../model/views'
import { oneOf } from '../storage/prefs'
import type { Theme } from '../ui/theme'

/**
 * The six scenes of spec 15.1, and the address bar that asks for one.
 *
 * A screenshot is only worth taking if the same picture comes back tomorrow,
 * so every scene is built from fixed data: the solved cube, the fixed scramble
 * and a list of sticker indices. Nothing here reads the clock or a random
 * number.
 *
 * Development builds only. `import.meta.env.DEV` guards every call, and
 * nothing outside `App.tsx` and `Shell` imports this folder (spec 13.3).
 */

export const SCENES = ['blank', 'solved', 'scrambled', 'mirrored', 'partial', 'solution'] as const

export type SceneName = (typeof SCENES)[number]

/** What the address bar asked for, with the defaults filled in. */
export interface Scene {
  readonly scene: SceneName
  readonly view: View
  readonly theme: Theme
  readonly speed: Speed
}

const SCRAMBLED: Cube = applyMoves(solved(), FIXED_SCRAMBLE)

/**
 * The twenty stickers the `partial` scene blanks: the top row of every face,
 * and two more. None of them is a centre, so the scheme still reads and the
 * validator judges the pieces rather than giving up.
 */
const BLANKED: readonly number[] = [
  0, 1, 2, 9, 10, 11, 18, 19, 20, 27, 28, 29, 36, 37, 38, 45, 46, 47, 5, 14,
]

/**
 * A corner that is no real piece: the URF corner's first two stickers swapped.
 *
 * Spec 15.1 says "rotated the wrong way", which a cube cannot tell from an
 * ordinary twist: rotating a corner's three stickers gives a corner that IS
 * real, just turned, and that is rule 10 on a complete cube, whose sentence
 * carries no stickers to outline. Swapping two of the three gives the mirror
 * image of a corner, which is no piece in any turn, so rule 5 fires while the
 * cube is still being entered and outlines the three stickers. The outline is
 * the thing a screenshot of a validation failure is for.
 */
function mirrored(): Cube {
  const [a, b] = CORNERS[0].stickers
  return paint(paint(SCRAMBLED, a, SCRAMBLED[b]), b, SCRAMBLED[a])
}

/** The cube a scene shows. Pure: the same name always gives the same cube. */
export function sceneCube(name: SceneName): Cube {
  switch (name) {
    case 'blank':
      return blank()
    case 'solved':
      return solved()
    case 'mirrored':
      return mirrored()
    case 'partial':
      return BLANKED.reduce((cube, index) => paint(cube, index, null), SCRAMBLED)
    // `solution` is the scrambled cube with Solve pressed, which is the hook's
    // half of the job, not the cube's.
    default:
      return SCRAMBLED
  }
}

/**
 * What `?scene=scrambled&view=far&theme=light&speed=slow` asks for, or null
 * when there is no scene named. Only the scene has to be there and has to be
 * one of the six: the rest fall back to how the app opens.
 */
export function sceneFromLocation(search: string): Scene | null {
  const asked = new URLSearchParams(search)
  const scene = asked.get('scene')
  if (!SCENES.includes(scene as SceneName)) return null
  return {
    scene: scene as SceneName,
    view: oneOf(asked.get('view'), ['near', 'far'] as const, 'near'),
    theme: oneOf(asked.get('theme'), ['dark', 'light'] as const, 'dark'),
    speed: oneOf(asked.get('speed'), SPEEDS, 'normal'),
  }
}
