import { describe, expect, it } from 'vitest'
import { MOVES } from './moves'
import { moveSentence } from './notation'

// C19 item 5: every one of the eighteen, word for word (spec 8).
describe('the sentence beside a move', () => {
  it('says which face and which way, for all eighteen moves', () => {
    expect(MOVES.map((move) => `${move} ${moveSentence(move)}`)).toEqual([
      'U Turn the top face clockwise.',
      "U' Turn the top face anticlockwise.",
      'U2 Turn the top face a half turn.',
      'R Turn the right face clockwise.',
      "R' Turn the right face anticlockwise.",
      'R2 Turn the right face a half turn.',
      'F Turn the front face clockwise.',
      "F' Turn the front face anticlockwise.",
      'F2 Turn the front face a half turn.',
      'D Turn the bottom face clockwise.',
      "D' Turn the bottom face anticlockwise.",
      'D2 Turn the bottom face a half turn.',
      'L Turn the left face clockwise.',
      "L' Turn the left face anticlockwise.",
      'L2 Turn the left face a half turn.',
      'B Turn the back face clockwise.',
      "B' Turn the back face anticlockwise.",
      'B2 Turn the back face a half turn.',
    ])
  })
})
