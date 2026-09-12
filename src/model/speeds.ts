/**
 * The three speeds of the steps (spec 9.2), remembered as `cuber.speed`.
 *
 * The interval is the gap between the start of one move and the start of the
 * next; the turn is how long the cube takes to turn. The turn is shorter than
 * the interval at every speed, so a person sees the cube stop between moves
 * rather than one continuous spin.
 */

export type Speed = 'slow' | 'normal' | 'fast'

export const SPEEDS: readonly Speed[] = ['slow', 'normal', 'fast']

export interface SpeedTimes {
  readonly interval: number
  readonly turn: number
}

export const SPEED_TIMES: Readonly<Record<Speed, SpeedTimes>> = {
  slow: { interval: 1600, turn: 900 },
  normal: { interval: 800, turn: 450 },
  fast: { interval: 400, turn: 220 },
}

/** The word on the radio. */
const WORDS: Readonly<Record<Speed, string>> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' }

export function speedWord(speed: Speed): string {
  return WORDS[speed]
}
