import { describe, expect, it } from 'vitest'
import { SCENE_MAX, SCENE_MIN, cubieSize, sceneSize } from './fit'

// The three viewports of spec 15.2.
describe('the scene fits the window', () => {
  it('is 440 in the Windows window and on an upright iPad', () => {
    expect(sceneSize(800, 1000)).toBe(SCENE_MAX)
    expect(sceneSize(820, 1180)).toBe(SCENE_MAX)
  })

  it('shrinks on an iPad held sideways', () => {
    expect(sceneSize(1180, 820)).toBe(300)
  })

  it('is never under 280, however little room there is', () => {
    expect(sceneSize(320, 480)).toBe(SCENE_MIN)
    expect(sceneSize(200, 200)).toBe(SCENE_MIN)
  })

  it('never grows past 440, however much room there is', () => {
    expect(sceneSize(2560, 1440)).toBe(SCENE_MAX)
  })

  // The divisor is measured, not derived: see `cubieSize`. A cubie is still
  // far bigger than the 36 px a finger needs, at every viewport.
  it('gives the turned cube room to fit inside the scene', () => {
    expect(cubieSize(440)).toBe(91)
    expect(cubieSize(300)).toBe(62)
    expect(cubieSize(SCENE_MIN)).toBe(58)
  })
})
