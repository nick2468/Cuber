import { describe, expect, it } from 'vitest'
import { CENTRES, counts, filled, isComplete, solved } from '../model/cube'
import { CORNERS } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves } from '../model/moves'
import { checkPartial, validate } from '../model/validate'
import { SCENES, sceneCube, sceneFromLocation } from './scenes'

/**
 * The scenes are what every screenshot in this project starts from, so a scene
 * that quietly stopped being what it says it is would take the screenshots
 * with it. Each one is checked for the thing it exists to show.
 */
describe('the scenes', () => {
  it('gives a cube for every name, and the same cube each time', () => {
    for (const name of SCENES) {
      expect(sceneCube(name), name).toHaveLength(54)
      expect(sceneCube(name), name).toEqual(sceneCube(name))
    }
  })

  it('blank is 48 blanks and the six centres', () => {
    const cube = sceneCube('blank')
    expect(filled(cube)).toBe(6)
    expect(CENTRES.every((index) => cube[index] !== null)).toBe(true)
  })

  it('solved and scrambled are both real cubes, and only one is solved', () => {
    expect(sceneCube('solved')).toEqual(solved())
    expect(validate(sceneCube('solved')).ok).toBe(true)

    const scrambled = sceneCube('scrambled')
    expect(scrambled).toEqual(applyMoves(solved(), FIXED_SCRAMBLE))
    expect(validate(scrambled).ok).toBe(true)
    expect(scrambled).not.toEqual(solved())
  })

  it("solution shows the scrambled cube, because Solve is the hook's half", () => {
    expect(sceneCube('solution')).toEqual(sceneCube('scrambled'))
  })

  it('mirrored is complete, counts right, and fails on the URF corner', () => {
    const cube = sceneCube('mirrored')
    expect(isComplete(cube)).toBe(true)
    // Two stickers swapped, so no colour is off nine: the mistake is the
    // corner itself, not the counting.
    expect(Object.values(counts(cube)).every((n) => n === 9)).toBe(true)

    const problem = checkPartial(cube)
    expect(problem?.message).toBe('That corner is not a real piece. Check its three colours.')
    expect(problem?.stickers).toEqual(CORNERS[0].stickers)
  })

  it('partial has twenty stickers blank, none of them a centre', () => {
    const cube = sceneCube('partial')
    expect(filled(cube)).toBe(54 - 20)
    expect(CENTRES.every((index) => cube[index] !== null)).toBe(true)
    // Blanks only: every sticker still filled is the scrambled cube's.
    const scrambled = sceneCube('scrambled')
    cube.forEach((sticker, index) => {
      if (sticker !== null) expect(sticker, String(index)).toBe(scrambled[index])
    })
    // A cube part way through being entered has nothing wrong with it yet.
    expect(checkPartial(cube)).toBeNull()
  })
})

describe('reading the address bar', () => {
  it('reads every scene name', () => {
    for (const name of SCENES) {
      expect(sceneFromLocation(`?scene=${name}`)?.scene, name).toBe(name)
    }
  })

  it('reads the view, the theme and the speed', () => {
    expect(sceneFromLocation('?scene=scrambled&view=far&theme=light&speed=slow')).toEqual({
      scene: 'scrambled',
      view: 'far',
      theme: 'light',
      speed: 'slow',
    })
  })

  it('falls back to how the app opens', () => {
    expect(sceneFromLocation('?scene=blank')).toEqual({
      scene: 'blank',
      view: 'near',
      theme: 'dark',
      speed: 'normal',
    })
  })

  it('ignores a view, theme or speed it does not know', () => {
    const asked = sceneFromLocation('?scene=blank&view=sideways&theme=beige&speed=instant')
    expect(asked).toEqual({ scene: 'blank', view: 'near', theme: 'dark', speed: 'normal' })
  })

  it('gives null when there is no scene, or one it does not know', () => {
    expect(sceneFromLocation('')).toBeNull()
    expect(sceneFromLocation('?view=far')).toBeNull()
    expect(sceneFromLocation('?scene=')).toBeNull()
    expect(sceneFromLocation('?scene=muddled')).toBeNull()
  })
})
