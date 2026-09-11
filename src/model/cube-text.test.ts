import { describe, expect, it } from 'vitest'
import { blank, solved } from './cube'
import { fromText, toText } from './cube-text'
import { FIXED_SCRAMBLE, applyMoves } from './moves'

// C19 item 7, the string half. The hook's fall back to the blank cube is in
// src/storage/prefs.dom.test.tsx.
describe('the remembered form of the cube', () => {
  it('is one character per sticker', () => {
    expect(toText(solved())).toBe(
      'wwwwwwwww' + 'rrrrrrrrr' + 'ggggggggg' + 'yyyyyyyyy' + 'ooooooooo' + 'bbbbbbbbb',
    )
    const text = toText(blank())
    expect(text).toHaveLength(54)
    expect([4, 13, 22, 31, 40, 49].map((index) => text[index]).join('')).toBe('wrgyob')
    expect(text.replaceAll('-', '')).toBe('wrgyob')
  })

  it('goes there and back', () => {
    for (const cube of [blank(), solved(), applyMoves(solved(), FIXED_SCRAMBLE)]) {
      expect(fromText(toText(cube))).toEqual(cube)
    }
  })

  it('refuses anything that is not 54 of its characters', () => {
    const good = toText(solved())
    expect(fromText(null)).toBeNull()
    expect(fromText('')).toBeNull()
    expect(fromText(good.slice(1))).toBeNull()
    expect(fromText(`${good}w`)).toBeNull()
    expect(fromText(`x${good.slice(1)}`)).toBeNull()
    expect(fromText(`W${good.slice(1)}`)).toBeNull()
  })
})
