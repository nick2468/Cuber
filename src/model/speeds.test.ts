import { describe, expect, it } from 'vitest'
import { SPEEDS, SPEED_TIMES, speedWord } from './speeds'

describe('the three speeds', () => {
  it('are slow, normal and fast, with the times of spec 9.2', () => {
    expect(SPEEDS).toEqual(['slow', 'normal', 'fast'])
    expect(SPEEDS.map((speed) => SPEED_TIMES[speed])).toEqual([
      { interval: 1600, turn: 900 },
      { interval: 800, turn: 450 },
      { interval: 400, turn: 220 },
    ])
  })

  it('turn faster than they step, so there is a pause between moves', () => {
    for (const speed of SPEEDS) {
      expect(SPEED_TIMES[speed].turn, speed).toBeLessThan(SPEED_TIMES[speed].interval)
    }
  })

  it('have a word for the radio', () => {
    expect(SPEEDS.map(speedWord)).toEqual(['Slow', 'Normal', 'Fast'])
  })
})
