import { useEffect } from 'react'
import { COLOURS, hexOf } from '../model/colours'
import { useCube } from './cube-state'

/**
 * The six colours and Clear, at the pointer (spec 5.3).
 *
 * One component for both ways in: the right click and the long press open the
 * same menu, so there is one list of colours and one way to blank a sticker.
 */

/** Roughly the menu's size, for keeping it inside the window. */
const WIDTH = 180
const HEIGHT = 96

export function ColourMenu() {
  const { menu, cube, counts, paint, closeMenu } = useCube()

  useEffect(() => {
    if (!menu) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    const onDown = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest('.colour-menu')) closeMenu()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown, true)
    }
  }, [closeMenu, menu])

  if (!menu) return null

  const here = cube[menu.index]
  const left = Math.max(0, Math.min(menu.x, window.innerWidth - WIDTH))
  const top = Math.max(0, Math.min(menu.y, window.innerHeight - HEIGHT))

  return (
    <div className="colour-menu" role="menu" aria-label="Paint this sticker" style={{ left, top }}>
      {COLOURS.map((colour) => {
        const usedUp = counts[colour] >= 9 && here !== colour
        return (
          <button
            key={colour}
            type="button"
            role="menuitem"
            className={usedUp ? 'menu-swatch used-up' : 'menu-swatch'}
            aria-label={colour}
            aria-disabled={usedUp || undefined}
            onClick={() => {
              if (usedUp) return
              paint(menu.index, colour)
              closeMenu()
            }}
          >
            <span className="swatch-colour" style={{ background: hexOf(colour) }} />
          </button>
        )
      })}
      <button
        type="button"
        role="menuitem"
        className="menu-clear"
        onClick={() => {
          paint(menu.index, null)
          closeMenu()
        }}
      >
        Clear
      </button>
    </div>
  )
}
