import { describe, expect, it } from 'vitest'
import { FACES } from '../model/colours'
import { positionOf, sticker } from '../model/geometry'
import { cubieTransform, stickerTransform, viewTransform, type Stage } from './transforms'

describe('the view', () => {
  it('is the same four turns at every stage, so a transition can interpolate them', () => {
    const stages: Stage[] = ['near', 'rolled', 'far']
    for (const stage of stages) {
      expect(viewTransform(stage)).toMatch(
        /^rotateX\(-28deg\) rotateY\(-38deg\) rotateY\(-?\d+deg\) rotateZ\(\d+deg\)$/,
      )
    }
  })

  it('rolls the cube over, then brings the right face to the front (spec C2)', () => {
    expect(viewTransform('near')).toBe('rotateX(-28deg) rotateY(-38deg) rotateY(0deg) rotateZ(0deg)')
    expect(viewTransform('rolled')).toBe('rotateX(-28deg) rotateY(-38deg) rotateY(0deg) rotateZ(180deg)')
    expect(viewTransform('far')).toBe('rotateX(-28deg) rotateY(-38deg) rotateY(-90deg) rotateZ(180deg)')
  })
})

describe('a cubie', () => {
  it('is moved out by its place and centred on it', () => {
    // U9 is the corner at (1, 1, 1). The screen's y runs down, so the model's
    // y of 1 is -124 on screen.
    expect(cubieTransform(positionOf(sticker('U9')), 120)).toBe(
      'translate3d(124px, -124px, 124px) translate(-50%, -50%)',
    )
    expect(cubieTransform({ x: 0, y: 0, z: -1 }, 120)).toBe(
      'translate3d(0px, 0px, -124px) translate(-50%, -50%)',
    )
  })

  it('carries a layer turn in front of its place, so the layer turns about the centre', () => {
    expect(cubieTransform({ x: 1, y: 0, z: 0 }, 100, 'rotateX(90deg)')).toBe(
      'rotateX(90deg) translate3d(104px, 0px, 0px) translate(-50%, -50%)',
    )
  })
})

describe('a sticker', () => {
  it('is turned on to its face and pushed out half a cubie', () => {
    expect(FACES.map((face) => stickerTransform(face, 120))).toEqual([
      'rotateX(90deg) translateZ(60px)',
      'rotateY(90deg) translateZ(60px)',
      'translateZ(60px)',
      'rotateX(-90deg) translateZ(60px)',
      'rotateY(-90deg) translateZ(60px)',
      'rotateY(180deg) translateZ(60px)',
    ])
  })
})
