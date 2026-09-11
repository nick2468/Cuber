/**
 * Telling a long press from a tap (spec 5.3, Q10).
 *
 * A pure state machine, fed the time rather than reading the clock, so it is
 * string-tested with explicit milliseconds and no fake timers. `Sticker.tsx`
 * wires the pointer events and one `setTimeout` to it.
 *
 * A press that stays put for 500 ms opens the colour menu, the same menu a
 * right click opens. A finger that slides more than 8 px is scrolling, not
 * pressing, so the menu does not open, and letting go still paints.
 */

export const LONG_PRESS_MS = 500
export const MOVE_LIMIT = 8

export interface Press {
  readonly x: number
  readonly y: number
  /** When the pointer went down. */
  readonly at: number
  readonly moved: boolean
  /** True once the menu has been opened by this press. */
  readonly opened: boolean
}

export function down(x: number, y: number, at: number): Press {
  return { x, y, at, moved: false, opened: false }
}

export function move(press: Press, x: number, y: number): Press {
  if (press.moved) return press
  const far = Math.abs(x - press.x) > MOVE_LIMIT || Math.abs(y - press.y) > MOVE_LIMIT
  return far ? { ...press, moved: true } : press
}

/** What the wait came to, when the timer fires. */
export function elapsed(press: Press, at: number): 'menu' | 'nothing' {
  if (press.moved || press.opened) return 'nothing'
  return at - press.at >= LONG_PRESS_MS ? 'menu' : 'nothing'
}

/** Marks a press whose menu is now open, so letting go does nothing. */
export function opened(press: Press): Press {
  return { ...press, opened: true }
}

/**
 * What letting go means: nothing when the menu is already open, the menu when
 * it was a long press the timer missed, and otherwise a click, which paints.
 */
export function up(press: Press, at: number): 'menu' | 'click' | 'nothing' {
  if (press.opened) return 'nothing'
  if (!press.moved && at - press.at >= LONG_PRESS_MS) return 'menu'
  return 'click'
}
