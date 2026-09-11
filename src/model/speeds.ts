/**
 * The three speeds of the steps (spec 9.2), remembered as `cuber.speed`.
 *
 * Phase 3 adds each speed's interval between moves and its turn duration
 * here, as one table.
 */

export type Speed = 'slow' | 'normal' | 'fast'

export const SPEEDS: readonly Speed[] = ['slow', 'normal', 'fast']
