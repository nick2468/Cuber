import { describe, expect, it } from 'vitest'
import { SCENE_MAX, SCENE_MIN, cubieSize, sceneSize } from './fit'

// The three viewports of spec 15.2. The numbers changed at phase 4's layout
// pass, when the height budget stopped being estimates and became what
// `scripts/probes/layout.js` measures, and again at phase 7, when the picker
// moved beside the cube and stopped costing the page its height.
describe('the scene fits the window', () => {
  it('is 400 in the Windows window and on an upright iPad', () => {
    expect(sceneSize(800, 1000)).toBe(SCENE_MAX)
    expect(sceneSize(820, 1180)).toBe(SCENE_MAX)
  })

  it('shrinks on an iPad held sideways, but no longer to the floor', () => {
    // 820 tall leaves 375 after everything else. Before phase 7 it left 229 and
    // the floor took over: the picker's 151 and the view button's 38 came off
    // the height, and now they come off the width, where there is room spare.
    expect(sceneSize(1180, 820)).toBe(375)
  })

  it('is never under 280, however little room there is', () => {
    expect(sceneSize(320, 480)).toBe(SCENE_MIN)
    expect(sceneSize(200, 200)).toBe(SCENE_MIN)
  })

  it('never grows past 400, however much room there is', () => {
    expect(sceneSize(2560, 1440)).toBe(SCENE_MAX)
  })

  it('is held down by the height before the width, on a wide short window', () => {
    // A window this wide has width to spare whatever the picker takes, so the
    // height is what decides. 900 leaves 455, which is over the 400 ceiling;
    // 845 is the first height that bites.
    expect(sceneSize(1600, 900)).toBe(SCENE_MAX)
    expect(sceneSize(1600, 800)).toBe(355)
  })

  // The picker now stands beside the cube, so a narrow window takes width off
  // the scene that it did not before. The 680 minimum window still holds 400.
  it('leaves the picker its room across the column', () => {
    expect(sceneSize(680, 1000)).toBe(SCENE_MAX)
    expect(sceneSize(600, 1000)).toBe(354)
  })

  // The divisor is measured, not derived: see `cubieSize`. A cubie is still
  // far bigger than the 36 px a finger needs, at every viewport.
  it('gives the turned cube room to fit inside the scene', () => {
    expect(cubieSize(SCENE_MAX)).toBe(83)
    expect(cubieSize(300)).toBe(62)
    expect(cubieSize(SCENE_MIN)).toBe(58)
  })
})
