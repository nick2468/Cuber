import type { Face } from '../model/colours'
import type { Position } from '../model/geometry'

/**
 * The CSS transforms that draw the cube (spec C4, 5.1).
 *
 * Every transform string in the app is built here, so the cube's shape is in
 * one place and phase 3's layer turn has one line to change. jsdom has no
 * layout and no CSS, so these are string-tested for what they say, and what
 * they look like is checked in the pane.
 */

/**
 * The space between two cubies, in pixels. Zero on purpose: a gap between
 * cubies is a hole through the cube, and the page ground shows through it as
 * bright lines in the light theme (found at gate 2). The dark plastic between
 * the stickers is the sticker's own inset, not a gap between cubies.
 */
export const GAP = 0

/** What the cube is turned to: the near view, half way, or the far view. */
export type Stage = 'near' | 'rolled' | 'far'

/**
 * The cube, at each stage, as four turns in a fixed order.
 *
 * The first two are the corner-on view itself and never change: `rotateX`
 * tilts the top towards the viewer, `rotateY` swings the front to the left so
 * the right face shows. The last two are the movements of spec C2:
 * `rotateZ(180)` rolls the cube over sideways, and `rotateY(-90)` then brings
 * the face on the right round to the front.
 *
 * The order is always these same four, so a CSS transition between two stages
 * interpolates each angle rather than decomposing a matrix.
 */
const TILT = -28
const SWING = -38

const STAGES: Readonly<Record<Stage, { turn: number; roll: number }>> = {
  near: { turn: 0, roll: 0 },
  rolled: { turn: 0, roll: 180 },
  far: { turn: -90, roll: 180 },
}

export function viewTransform(stage: Stage): string {
  const { turn, roll } = STAGES[stage]
  return `rotateX(${TILT}deg) rotateY(${SWING}deg) rotateY(${turn}deg) rotateZ(${roll}deg)`
}

/**
 * One cubie: moved out to its place, then centred on it.
 *
 * `layer` is the rotation of a turning layer, which phase 3 passes in. It goes
 * first, so the layer turns about the cube's own centre and carries the cubie
 * with it.
 */
export function cubieTransform(position: Position, cubie: number, layer?: string): string {
  const step = cubie + GAP
  const place = `translate3d(${position.x * step}px, ${-position.y * step}px, ${position.z * step}px)`
  // The model's y runs up and the screen's runs down, hence the minus.
  return `${layer ? `${layer} ` : ''}${place} translate(-50%, -50%)`
}

/** Which way each face points, and how far out from the cubie's centre. */
const FACING: Readonly<Record<Face, string>> = {
  U: 'rotateX(90deg)',
  D: 'rotateX(-90deg)',
  F: '',
  B: 'rotateY(180deg)',
  R: 'rotateY(90deg)',
  L: 'rotateY(-90deg)',
}

/** One sticker: turned on to its face and pushed out by half a cubie. */
export function stickerTransform(face: Face, cubie: number): string {
  const push = `translateZ(${cubie / 2}px)`
  return FACING[face] ? `${FACING[face]} ${push}` : push
}
