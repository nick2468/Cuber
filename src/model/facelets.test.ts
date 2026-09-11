import { describe, expect, it } from 'vitest'
import Library from '../solver/vendor/cube.js'
import { standardScheme, type Scheme } from './colours'
import { blank, paint, schemeOf, solved } from './cube'
import { SOLVED_FACELETS, fromFacelets, toFacelets } from './facelets'

/** A cube held with blue at the front and white still on top. */
const BLUE_FRONT: Scheme = { U: 'white', D: 'yellow', F: 'blue', B: 'green', R: 'orange', L: 'red' }

describe('the facelets', () => {
  it('of a solved cube are nine of each face letter', () => {
    expect(SOLVED_FACELETS).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB')
    expect(toFacelets(solved())).toBe(SOLVED_FACELETS)
    expect(toFacelets(solved(BLUE_FRONT))).toBe(SOLVED_FACELETS)
  })

  it('go there and back for a hand-made cube in another scheme', () => {
    let cube = solved(BLUE_FRONT)
    cube = paint(paint(cube, 0, 'red'), 36, 'white')
    const letters = toFacelets(cube)!
    expect(letters.slice(0, 10)).toBe('LUUUUUUUUR')
    expect(letters[36]).toBe('U')
    expect(fromFacelets(letters, schemeOf(cube)!)).toEqual(cube)
  })

  it('go there and back for library cubes', () => {
    for (let n = 0; n < 20; n += 1) {
      const letters = Library.random().asString()
      expect(toFacelets(fromFacelets(letters, standardScheme()))).toBe(letters)
    }
  })

  it('do not exist for a cube with a blank sticker or two matching centres', () => {
    expect(toFacelets(blank())).toBeNull()
    expect(toFacelets(paint(solved(), 13, 'white'))).toBeNull()
  })

  it('refuse a letter that is not a face', () => {
    expect(() => fromFacelets('X', standardScheme())).toThrow('"X" is not a face letter.')
  })
})
