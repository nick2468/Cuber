import { describe, expect, it } from 'vitest'
import { LONG_PRESS_MS, down, elapsed, move, opened, up } from './long-press'

describe('a press on a sticker', () => {
  it('is a click when it is let go before the wait is up', () => {
    const press = down(100, 100, 1000)
    expect(elapsed(press, 1000 + LONG_PRESS_MS - 1)).toBe('nothing')
    expect(up(press, 1200)).toBe('click')
  })

  it('opens the menu once the wait is up, and letting go then does nothing', () => {
    const press = down(100, 100, 1000)
    expect(elapsed(press, 1500)).toBe('menu')
    expect(up(opened(press), 1600)).toBe('nothing')
  })

  it('opens the menu on letting go late, when the timer never fired', () => {
    expect(up(down(100, 100, 1000), 1700)).toBe('menu')
  })

  it('is a scroll, not a press, once the pointer slides more than 8 px', () => {
    const press = move(down(100, 100, 1000), 109, 100)
    expect(elapsed(press, 1500)).toBe('nothing')
    expect(up(press, 1600)).toBe('click')
  })

  it('allows a little wobble', () => {
    const press = move(down(100, 100, 1000), 108, 92)
    expect(press.moved).toBe(false)
    expect(elapsed(press, 1500)).toBe('menu')
  })
})
