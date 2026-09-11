import { describe, expect, it } from 'vitest'
import {
  COLOURS,
  FACES,
  colourOfLetter,
  faceOf,
  faceWord,
  hexOf,
  letterOf,
  opposite,
  schemeFrom,
  standardScheme,
} from './colours'

describe('the colours', () => {
  it('are the six, in the picker order', () => {
    expect(COLOURS).toEqual(['red', 'green', 'yellow', 'white', 'blue', 'orange'])
  })

  it('keep the fixed sticker colours of spec 4.3', () => {
    expect(COLOURS.map(hexOf)).toEqual(['#c41e3a', '#009e60', '#ffd500', '#f5f5f5', '#0051ba', '#ff5800'])
  })

  it('each have one letter, and each letter gives its colour back', () => {
    expect(COLOURS.map(letterOf).join('')).toBe('rgywbo')
    for (const colour of COLOURS) expect(colourOfLetter(letterOf(colour))).toBe(colour)
    expect(colourOfLetter('-')).toBeNull()
    expect(colourOfLetter('x')).toBeNull()
  })
})

describe('the faces', () => {
  it('are in the library order', () => {
    expect(FACES).toEqual(['U', 'R', 'F', 'D', 'L', 'B'])
  })

  it('have the words of spec 3, never "the up face"', () => {
    expect(FACES.map(faceWord)).toEqual([
      'the top face',
      'the right face',
      'the front face',
      'the bottom face',
      'the left face',
      'the back face',
    ])
  })

  it('come in three opposite pairs', () => {
    expect(FACES.map(opposite)).toEqual(['D', 'L', 'B', 'U', 'R', 'F'])
  })
})

describe('the scheme', () => {
  it('is white up, yellow down, green front, blue back, red right, orange left by default', () => {
    expect(standardScheme()).toEqual({
      U: 'white',
      D: 'yellow',
      F: 'green',
      B: 'blue',
      R: 'red',
      L: 'orange',
    })
  })

  it('is read from six different centres', () => {
    const scheme = standardScheme()
    expect(schemeFrom(FACES.map((face) => scheme[face]))).toEqual(scheme)
    expect(faceOf(scheme, 'green')).toBe('F')
    expect(faceOf(scheme, 'orange')).toBe('L')
  })

  it('is null when a centre is blank or two centres match', () => {
    expect(schemeFrom(['white', 'red', 'green', 'yellow', 'orange', null])).toBeNull()
    expect(schemeFrom(['white', 'red', 'green', 'yellow', 'orange', 'white'])).toBeNull()
  })
})
