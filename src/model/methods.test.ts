import { describe, expect, it } from 'vitest'
import { METHODS, methodWord } from './methods'

describe('the methods', () => {
  it('are the three of spec 7.3, in the order the box draws them', () => {
    expect(METHODS).toEqual(['quick', 'fewest', 'beginner'])
  })

  it('are worded as the radios read', () => {
    expect(METHODS.map(methodWord)).toEqual(['Quick solve', 'Fewest moves', 'Beginner method'])
  })
})
