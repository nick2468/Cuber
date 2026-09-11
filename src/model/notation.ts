import { faceWord, type Face } from './colours'
import type { Move } from './moves'

/**
 * The sentence beside each move in the box (spec 8, C11). The only place the
 * words come from.
 *
 * A half turn goes either way, so its sentence does not say which.
 */
export function moveSentence(move: Move): string {
  const face = faceWord(move[0] as Face)
  if (move.endsWith('2')) return `Turn ${face} a half turn.`
  if (move.endsWith("'")) return `Turn ${face} anticlockwise.`
  return `Turn ${face} clockwise.`
}
