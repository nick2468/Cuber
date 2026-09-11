import { describe, expect, it } from 'vitest'
import { VIEW_MOVEMENTS, viewFaces, type Slot } from './views'

// C19 item 6.
describe('the two views', () => {
  it('show Up, Front and Right near, and Down, Left and Back far', () => {
    expect(viewFaces('near')).toEqual(['U', 'F', 'R'])
    expect(viewFaces('far')).toEqual(['D', 'L', 'B'])
  })

  it('change with two movements, each moving every face to a different slot', () => {
    const slots: Slot[] = ['top', 'bottom', 'front', 'back', 'left', 'right']
    expect(VIEW_MOVEMENTS).toHaveLength(2)
    for (const movement of VIEW_MOVEMENTS) {
      expect(slots.map((slot) => movement.moves[slot]).sort()).toEqual([...slots].sort())
    }
  })

  it('say what to do with the real cube, each way (spec 5.2)', () => {
    expect(VIEW_MOVEMENTS.map((movement) => movement.forward)).toEqual([
      'Roll your cube over sideways so the top goes to the bottom.',
      'Turn it a quarter turn so the face on your right comes to the front.',
    ])
    // Played back, last first.
    expect([...VIEW_MOVEMENTS].reverse().map((movement) => movement.back)).toEqual([
      'Turn it back a quarter turn so the face on your left comes to the front.',
      'Roll your cube back over so the top goes to the bottom.',
    ])
  })
})
