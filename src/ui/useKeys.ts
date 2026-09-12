import { useEffect } from 'react'
import { useCube } from './cube-state'

/**
 * The keyboard over the solution (spec 9.2): the arrows step, space plays and
 * pauses.
 *
 * One listener on the document, so the keys work wherever the eye is. Two
 * things stop it. A key press while the colour menu is open belongs to the
 * menu. And a control that answers the key itself keeps it: a radio group
 * answers the arrows, so nothing passes from an input; a button answers the
 * space bar, so space on a focused button is left alone, or pressing Solve
 * with the mouse and then pressing space would both press Solve again and
 * start playing. The arrows do nothing to a button, so they still pass, and
 * the arrows keep working after a button has been clicked.
 */
const TYPING = ['INPUT', 'SELECT', 'TEXTAREA']

export function useKeys() {
  const { menu, playing, play, pause, stepBack, stepForward } = useCube()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (menu) return
      const on = event.target as HTMLElement | null
      if (on && TYPING.includes(on.tagName)) return
      if (on?.tagName === 'BUTTON' && event.key === ' ') return

      if (event.key === 'ArrowRight') stepForward()
      else if (event.key === 'ArrowLeft') stepBack()
      else if (event.key === ' ') {
        if (playing) pause()
        else play()
      } else return

      event.preventDefault()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menu, pause, play, playing, stepBack, stepForward])
}
