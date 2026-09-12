import { useEffect, useRef } from 'react'
import { faceWord, hexOf } from '../model/colours'
import { placeOf } from '../model/geometry'
import { useCube } from './cube-state'
import { LONG_PRESS_MS, down, elapsed, move, opened, up, type Press } from './long-press'
import { stickerTransform } from './transforms'

/**
 * One sticker: click to paint it, right click or press and hold for the menu
 * (spec 5.3).
 *
 * Painting happens on the click, which every browser and jsdom agree about.
 * The pointer events are only here to notice a long press; when one opens the
 * menu, the click that follows it is skipped, so a press never paints and
 * opens the menu at the same time.
 */
export function Sticker({ index, cubie }: { index: number; cubie: number }) {
  const { cube, selected, marked, paint, openMenu, viewChanging } = useCube()
  const { face, row, column } = placeOf(index)
  const colour = cube[index]

  const press = useRef<Press | null>(null)
  const timer = useRef<number | null>(null)
  const skipClick = useRef(false)

  const stopWaiting = () => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }
  useEffect(() => stopWaiting, [])

  /**
   * A long press opens the menu, and the browser sends a click straight after
   * it, which would paint the sticker the press was only asking about. So the
   * press arms this and the click that follows is spent clearing it.
   *
   * A right click arms nothing. It sends no click of its own, so an armed flag
   * would sit there and eat the user's NEXT left click on that sticker: right
   * click, choose a colour, click the sticker, nothing happens. Found in phase
   * 4 by box 4.5's test, which paints through the menu and then clicks.
   */
  const openHere = (x: number, y: number, fromPress: boolean) => {
    if (fromPress) skipClick.current = true
    openMenu(index, x, y)
  }

  return (
    <button
      type="button"
      className={marked.includes(index) ? 'sticker marked' : 'sticker'}
      data-sticker={index}
      data-face={face}
      style={{ transform: stickerTransform(face, cubie) }}
      aria-label={`${faceWord(face)}, row ${row + 1}, column ${column + 1}, ${colour ?? 'blank'}`}
      disabled={viewChanging}
      onContextMenu={(event) => {
        event.preventDefault()
        openHere(event.clientX, event.clientY, false)
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        const started = down(event.clientX, event.clientY, event.timeStamp)
        press.current = started
        timer.current = window.setTimeout(() => {
          const held = press.current
          if (held && elapsed(held, held.at + LONG_PRESS_MS) === 'menu') {
            press.current = opened(held)
            openHere(held.x, held.y, true)
          }
        }, LONG_PRESS_MS)
      }}
      onPointerMove={(event) => {
        if (press.current) press.current = move(press.current, event.clientX, event.clientY)
      }}
      onPointerUp={(event) => {
        stopWaiting()
        const held = press.current
        press.current = null
        if (held && up(held, event.timeStamp) === 'menu') openHere(event.clientX, event.clientY, true)
      }}
      onPointerCancel={() => {
        stopWaiting()
        press.current = null
      }}
      onClick={() => {
        if (skipClick.current) {
          skipClick.current = false
          return
        }
        paint(index, selected)
      }}
    >
      <span
        className={colour ? 'sticker-face' : 'sticker-face blank'}
        style={colour ? { background: hexOf(colour) } : undefined}
      />
    </button>
  )
}
