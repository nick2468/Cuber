import { describe, expect, it } from 'vitest'
import { SCENE_MAX, SCENE_MIN, cubieSize, sceneSize } from './fit'

// The three viewports of spec 15.2. The numbers changed at phase 4's layout
// pass, when the height budget stopped being estimates and became what
// `scripts/probes/layout.js` measures.
describe('the scene fits the window', () => {
  it('is 400 in the Windows window and on an upright iPad', () => {
    expect(sceneSize(800, 1000)).toBe(SCENE_MAX)
    expect(sceneSize(820, 1180)).toBe(SCENE_MAX)
  })

  it('shrinks on an iPad held sideways', () => {
    // 820 tall leaves 229 after everything else, so the floor takes over and
    // the page scrolls down a little, which spec 4.1 allows.
    expect(sceneSize(1180, 820)).toBe(SCENE_MIN)
  })

  it('is never under 280, however little room there is', () => {
    expect(sceneSize(320, 480)).toBe(SCENE_MIN)
    expect(sceneSize(200, 200)).toBe(SCENE_MIN)
  })

  it('never grows past 400, however much room there is', () => {
    expect(sceneSize(2560, 1440)).toBe(SCENE_MAX)
  })

  it('is held down by the height before the width, on a wide short window', () => {
    expect(sceneSize(1600, 900)).toBe(309)
  })

  // The divisor is measured, not derived: see `cubieSize`. A cubie is still
  // far bigger than the 36 px a finger needs, at every viewport.
  it('gives the turned cube room to fit inside the scene', () => {
    expect(cubieSize(SCENE_MAX)).toBe(83)
    expect(cubieSize(300)).toBe(62)
    expect(cubieSize(SCENE_MIN)).toBe(58)
  })
})
