import { describe, expect, it } from 'vitest'
import { FACES, type Face } from '../model/colours'
import { solved } from '../model/cube'
import { inLayer, placeOf, positionOf, stickersAt } from '../model/geometry'
import { FIXED_SCRAMBLE, MOVES, applyMove, applyMoves } from '../model/moves'
import { layerTurn } from './transforms'

/**
 * The layer turns the way the model moves the stickers.
 *
 * This is the test the pane cannot give. A layer turned the wrong way looks
 * right until the move commits, and then the picture jumps, because the
 * screen's rotation left each sticker somewhere the model does not agree
 * with. Watching for that by eye needs six faces, six animations and a
 * browser that runs them; a hidden pane clamps its timers and the check
 * becomes unreliable, which is how it was found here.
 *
 * So the same question is asked in arithmetic, of all eighteen moves. Take a
 * sticker in the turning layer, rotate its place and the way it faces by the
 * rotation `layerTurn` gives the browser, and see which sticker it has become.
 * The library, through `applyMove`, must have put that sticker's colour
 * exactly there.
 */

/** Which way each face looks, in the model's frame (y up, z towards the viewer). */
const NORMALS: Readonly<Record<Face, [number, number, number]>> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
}

/** `rotateX(90deg)` and the rest, read back as an axis and an angle. */
function readTurn(css: string): { axis: 'X' | 'Y' | 'Z'; degrees: number } {
  const found = /^rotate([XYZ])\((-?\d+)deg\)$/.exec(css)
  if (!found) throw new Error(`"${css}" is not a rotation this test can read.`)
  return { axis: found[1] as 'X' | 'Y' | 'Z', degrees: Number(found[2]) }
}

/**
 * A point turned the way the browser turns it.
 *
 * The screen's y runs down and the model's runs up, which is the minus in
 * `cubieTransform`. So the point goes into the screen's frame, turns there,
 * and comes back.
 */
function turned(point: readonly [number, number, number], css: string): [number, number, number] {
  const { axis, degrees } = readTurn(css)
  const radians = (degrees * Math.PI) / 180
  const cos = Math.round(Math.cos(radians))
  const sin = Math.round(Math.sin(radians))
  const [x, up, z] = point
  const y = -up
  const spun: [number, number, number] =
    axis === 'X'
      ? [x, y * cos - z * sin, y * sin + z * cos]
      : axis === 'Y'
        ? [x * cos + z * sin, y, -x * sin + z * cos]
        : [x * cos - y * sin, x * sin + y * cos, z]
  return [spun[0], -spun[1], spun[2]]
}

const same = (a: readonly number[], b: readonly number[]) => a.every((n, i) => n === b[i])

/** The sticker at this place, looking this way. */
function stickerFacing(place: readonly [number, number, number], normal: readonly number[]): number {
  const found = stickersAt(place[0], place[1], place[2]).find((index) =>
    same(NORMALS[placeOf(index).face], normal),
  )
  if (found === undefined) throw new Error(`No sticker at ${place.join(',')} faces ${normal.join(',')}.`)
  return found
}

describe('a layer turn', () => {
  const cube = applyMoves(solved(), FIXED_SCRAMBLE)

  it.each(MOVES)('%s carries each sticker where the model puts it', (move) => {
    const face = move[0] as Face
    const rotation = layerTurn(move)
    const after = applyMove(cube, move)
    let checked = 0

    for (let index = 0; index < 54; index += 1) {
      const at = positionOf(index)
      if (!inLayer(face, at)) continue
      const place = turned([at.x, at.y, at.z], rotation)
      const looking = turned(NORMALS[placeOf(index).face], rotation)
      const landsOn = stickerFacing(place, looking)
      expect(after[landsOn], `${move}: sticker ${index} lands on ${landsOn}`).toBe(cube[index])
      checked += 1
    }

    // Nine cubies turn, and between them they carry 21 stickers.
    expect(checked).toBe(21)
  })

  it('turns only the layer it names, and leaves the other pieces alone', () => {
    for (const move of MOVES) {
      const face = move[0] as Face
      const after = applyMove(cube, move)
      for (let index = 0; index < 54; index += 1) {
        if (inLayer(face, positionOf(index))) continue
        expect(after[index], `${move} moved sticker ${index}`).toBe(cube[index])
      }
    }
  })

  it('agrees with the drawing about which faces exist', () => {
    expect(Object.keys(NORMALS).sort()).toEqual([...FACES].sort())
  })
})
