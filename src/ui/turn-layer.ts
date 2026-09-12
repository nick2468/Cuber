import type { Position } from '../model/geometry'
import type { Move } from '../model/moves'
import { cubieTransform, layerTurn } from './transforms'

/**
 * Turning a layer on screen (spec 9.4).
 *
 * A web animation, not a CSS transition. The cube is drawn from the model: a
 * move turns the nine cubies of the layer, and then the provider applies the
 * move and the cube is drawn again with no rotation. A transition would
 * animate that second half too, spinning the cubie back to where it started,
 * which is the jump this design exists to avoid. It would also interpolate a
 * half turn by matrix, which has no single answer.
 *
 * `fill: 'forwards'` holds the turned pose until `Scene` cancels the
 * animation, which it does when the move commits: by then the new drawing has
 * the same colours in the same places, so nothing moves.
 *
 * jsdom has no `element.animate`, so this answers null there and the DOM
 * tests read the model rather than the pose.
 */
export function turnCubie(
  element: Element,
  position: Position,
  cubie: number,
  move: Move,
  ms: number,
): Animation | null {
  const place = cubieTransform(position, cubie)
  const keyframes = [
    { transform: `${layerTurn(move, 0)} ${place}` },
    { transform: `${layerTurn(move)} ${place}` },
  ]
  return element.animate?.(keyframes, { duration: ms, easing: 'ease-in-out', fill: 'forwards' }) ?? null
}
