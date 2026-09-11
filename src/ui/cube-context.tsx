import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Colour } from '../model/colours'
import {
  blank,
  counts as countsOf,
  filled as filledOf,
  isComplete,
  paint as paintSticker,
} from '../model/cube'
import { checkPartial, validate } from '../model/validate'
import { VIEW_MOVEMENTS, type View } from '../model/views'
import { useRememberedCube } from '../storage/prefs'
import { CubeContext, DEFAULT_DURATIONS, type CubeState, type Durations, type Menu } from './cube-state'
import type { Stage } from './transforms'

/**
 * The cube everything on the screen is drawn from.
 *
 * One place holds the cube, the view and what the user is doing to them, and
 * one action paints (spec 13.3): a left click, the right-click menu and the
 * long-press menu all call `paint`, so the rules about painting are written
 * once. The cube is read from storage on mount and written on every change,
 * through `useRememberedCube`.
 */
export function CubeProvider({
  children,
  durations = DEFAULT_DURATIONS,
}: {
  children: ReactNode
  durations?: Durations
}) {
  const { cube, setCube } = useRememberedCube()
  const [view, setView] = useState<View>('near')
  const [stage, setStage] = useState<Stage>('near')
  const [selected, setSelected] = useState<Colour>('red')
  const [viewChanging, setViewChanging] = useState(false)
  /** What the view change is saying, which takes the status line while it plays. */
  const [sentence, setSentence] = useState<string | null>(null)
  const [resetArmed, setResetArmed] = useState(false)
  const [menu, setMenu] = useState<Menu | null>(null)

  // The provider owns the waiting, so nothing is left running after a reset or
  // an unmount. `transitionend` is not used: a transition that never starts,
  // which is what a reduced-motion setting gives, never ends either.
  const timers = useRef<number[]>([])
  const clearTimers = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer)
    timers.current = []
  }, [])
  useEffect(() => clearTimers, [clearTimers])
  const later = useCallback((ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms))
  }, [])

  const counts = useMemo(() => countsOf(cube), [cube])
  const problem = useMemo(() => checkPartial(cube), [cube])
  const verdict = useMemo(() => validate(cube), [cube])
  const complete = isComplete(cube)

  const paint = useCallback(
    (index: number, colour: Colour | null) => {
      if (viewChanging) return
      // The tenth sticker of a colour is refused here as well as being greyed
      // in the picker, because the menu can ask for one too (spec C9).
      if (colour !== null && cube[index] !== colour && counts[colour] >= 9) return
      setCube(paintSticker(cube, index, colour))
    },
    [counts, cube, setCube, viewChanging],
  )

  const select = useCallback(
    (colour: Colour) => {
      if (counts[colour] >= 9) return
      setSelected(colour)
    },
    [counts],
  )

  const openMenu = useCallback((index: number, x: number, y: number) => setMenu({ index, x, y }), [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const reset = useCallback(() => {
    // Forty-eight clicks are a lot to lose to one slip, so the first press
    // only arms the button (spec C14).
    if (!resetArmed) {
      setResetArmed(true)
      later(durations.arm, () => setResetArmed(false))
      return
    }
    clearTimers()
    setResetArmed(false)
    setCube(blank())
    setView('near')
    setStage('near')
    setSentence(null)
    setViewChanging(false)
    setMenu(null)
  }, [clearTimers, durations.arm, later, resetArmed, setCube])

  const changeView = useCallback(() => {
    if (viewChanging) return
    const toFar = view === 'near'
    const [roll, quarter] = VIEW_MOVEMENTS
    // Towards the far view the two movements play in order; coming back they
    // play in reverse, with the sentences that describe them that way round.
    const steps: { stage: Stage; sentence: string }[] = toFar
      ? [
          { stage: 'rolled', sentence: roll.forward },
          { stage: 'far', sentence: quarter.forward },
        ]
      : [
          { stage: 'rolled', sentence: quarter.back },
          { stage: 'near', sentence: roll.back },
        ]

    setViewChanging(true)
    setMenu(null)
    setStage(steps[0].stage)
    setSentence(steps[0].sentence)

    later(durations.movement + durations.pause, () => {
      setStage(steps[1].stage)
      setSentence(steps[1].sentence)
      later(durations.movement, () => {
        setView(toFar ? 'far' : 'near')
        setViewChanging(false)
        setSentence('Check the centres: they should match your cube.')
        later(durations.check, () => setSentence(null))
      })
    })
  }, [durations, later, view, viewChanging])

  // What the status line says, worked out rather than stored, so it cannot
  // fall out of step with the cube it describes (spec 4).
  const trouble = problem?.message ?? (complete && !verdict.ok ? verdict.message : null)
  const status =
    sentence ??
    trouble ??
    (verdict.ok ? 'Ready. Press Solve.' : `Fill in the stickers. ${filledOf(cube) - 6} of 48 done.`)
  const marked = problem?.stickers ?? (complete && !verdict.ok ? verdict.stickers : [])

  // A fresh object every render, with no useMemo around it, which is the
  // trainer's hard-won rule. React skips a provider's children unless the
  // context value changes, and a memo has to list everything that can change
  // it; one thing left out of that list means the cube moves and the screen
  // does not. This provider only renders when something has happened, so one
  // object per render is the cheap half of the trade.
  const value: CubeState = {
    cube,
    view,
    stage,
    selected,
    counts,
    status,
    marked,
    viewChanging,
    ready: verdict.ok,
    resetArmed,
    menu,
    durations,
    paint,
    select,
    reset,
    changeView,
    openMenu,
    closeMenu,
  }

  return <CubeContext.Provider value={value}>{children}</CubeContext.Provider>
}
