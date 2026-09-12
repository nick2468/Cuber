import { describe, expect, it } from 'vitest'
import { FACES } from '../model/colours'
import { positionOf, sticker } from '../model/geometry'
import { MOVES } from '../model/moves'
import { cubieTransform, layerTurn, stickerTransform, viewTransform, type Stage } from './transforms'

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
    // y of 1 is -120 on screen. Cubies touch: there is no gap between them.
    expect(cubieTransform(positionOf(sticker('U9')), 120)).toBe(
      'translate3d(120px, -120px, 120px) translate(-50%, -50%)',
    )
    expect(cubieTransform({ x: 0, y: 0, z: -1 }, 120)).toBe(
      'translate3d(0px, 0px, -120px) translate(-50%, -50%)',
    )
  })

  it('carries a layer turn in front of its place, so the layer turns about the centre', () => {
    expect(cubieTransform({ x: 1, y: 0, z: 0 }, 100, 'rotateX(90deg)')).toBe(
      'rotateX(90deg) translate3d(100px, 0px, 0px) translate(-50%, -50%)',
    )
  })
})

describe('a layer turn', () => {
  it('names an axis and a direction for all eighteen moves', () => {
    expect(MOVES.map((move) => `${move} ${layerTurn(move)}`)).toEqual([
      'U rotateY(-90deg)',
      "U' rotateY(90deg)",
      'U2 rotateY(-180deg)',
      'R rotateX(90deg)',
      "R' rotateX(-90deg)",
      'R2 rotateX(180deg)',
      'F rotateZ(90deg)',
      "F' rotateZ(-90deg)",
      'F2 rotateZ(180deg)',
      'D rotateY(90deg)',
      "D' rotateY(-90deg)",
      'D2 rotateY(180deg)',
      'L rotateX(-90deg)',
      "L' rotateX(90deg)",
      'L2 rotateX(-180deg)',
      'B rotateZ(-90deg)',
      "B' rotateZ(90deg)",
      'B2 rotateZ(-180deg)',
    ])
  })

  // Both keyframes of the turn must name the same rotate function, or the
  // browser interpolates between two matrices, which for a half turn has no
  // single answer.
  it('gives the same function at zero degrees, for the start of the animation', () => {
    for (const move of MOVES) {
      const axis = layerTurn(move).slice(0, 7)
      expect(layerTurn(move, 0), move).toBe(`${axis}(0deg)`)
    }
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
