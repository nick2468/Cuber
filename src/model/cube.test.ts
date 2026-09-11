import { describe, expect, it } from 'vitest'
import { standardScheme } from './colours'
import { CENTRES, blank, counts, filled, isComplete, paint, schemeOf, solved } from './cube'

describe('the cube', () => {
  it('has its centres at 4, 13, 22, 31, 40 and 49', () => {
    expect(CENTRES).toEqual([4, 13, 22, 31, 40, 49])
  })

  it('starts blank with the standard centres', () => {
    const cube = blank()
    expect(cube).toHaveLength(54)
    expect(filled(cube)).toBe(6)
    expect(CENTRES.map((index) => cube[index])).toEqual(['white', 'red', 'green', 'yellow', 'orange', 'blue'])
    expect(schemeOf(cube)).toEqual(standardScheme())
  })

  it('is solved when every face is its centre colour', () => {
    const cube = solved()
    expect(cube.slice(0, 9).every((sticker) => sticker === 'white')).toBe(true)
    expect(cube.slice(9, 18).every((sticker) => sticker === 'red')).toBe(true)
    expect(cube.slice(45, 54).every((sticker) => sticker === 'blue')).toBe(true)
    expect(isComplete(cube)).toBe(true)
    expect(isComplete(blank())).toBe(false)
  })

  it('paints into a new cube and leaves the old one alone', () => {
    const before = blank()
    const after = paint(before, 0, 'red')
    expect(after[0]).toBe('red')
    expect(before[0]).toBeNull()
    expect(paint(after, 0, null)[0]).toBeNull()
    expect(() => paint(before, 54, 'red')).toThrow('There is no sticker 54.')
  })

  it('counts each colour', () => {
    expect(counts(blank())).toEqual({ red: 1, green: 1, yellow: 1, white: 1, blue: 1, orange: 1 })
    expect(counts(paint(blank(), 0, 'red')).red).toBe(2)
    expect(Object.values(counts(solved()))).toEqual([9, 9, 9, 9, 9, 9])
  })

  it('has no scheme when two centres match', () => {
    expect(schemeOf(paint(blank(), 13, 'white'))).toBeNull()
  })
})
