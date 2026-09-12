import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Colour } from '../model/colours'
import {
  blank,
  counts as countsOf,
  filled as filledOf,
  isComplete,
  paint as paintSticker,
  type Cube,
} from '../model/cube'
import { applyMove, applyMoves, inverse, isMove, type Move } from '../model/moves'
import { SPEED_TIMES } from '../model/speeds'
import { checkPartial, validate } from '../model/validate'
import { VIEW_MOVEMENTS, type View } from '../model/views'
import { createSolver as startRealSolver, type Solver } from '../solver/solver'
import { useRememberedCube, useSpeed } from '../storage/prefs'
import {
  CubeContext,
  DEFAULT_DURATIONS,
  type CubeState,
  type Durations,
  type Menu,
  type Solution,
  type Turning,
} from './cube-state'
import type { Stage } from './transforms'

/**
 * The cube everything on the screen is drawn from.
 *
 * One place holds the cube, the view, the solution and what the user is doing
 * to them. One action paints (spec 13.3), and one action turns a layer, so the
 * rules about each are written once. The cube is read from storage on mount
 * and written on every paint and every step; the solution is not stored,
 * because it costs a second to ask for again (spec C15).
 */
export function CubeProvider({
  children,
  durations = DEFAULT_DURATIONS,
  createSolver = startRealSolver,
}: {
  children: ReactNode
  durations?: Durations
  /** The real worker in the app, `fakeSolver` in the tests (spec 7.2). */
  createSolver?: () => Solver
}) {
  const { cube, setCube } = useRememberedCube()
  const { speed, setSpeed } = useSpeed()
  const [view, setView] = useState<View>('near')
  const [stage, setStage] = useState<Stage>('near')
  const [selected, setSelected] = useState<Colour>('red')
  const [viewChanging, setViewChanging] = useState(false)
  /** What the view change is saying, which takes the status line while it plays. */
  const [sentence, setSentence] = useState<string | null>(null)
  const [resetArmed, setResetArmed] = useState(false)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [solution, setSolution] = useState<Solution | null>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [turning, setTurning] = useState<Turning | null>(null)
  const [solverReady, setSolverReady] = useState(false)
  const [solving, setSolving] = useState(false)
  /** What the solver last said, which takes the status line until the cube changes. */
  const [solverSaid, setSolverSaid] = useState<string | null>(null)

  // The provider owns the waiting, so nothing is left running after a reset or
  // an unmount. No animation event is relied on: the timer is the truth and
  // the turning on screen is decoration (spec 9.4).
  const timers = useRef<number[]>([])
  const clearTimers = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer)
    timers.current = []
  }, [])
  useEffect(() => clearTimers, [clearTimers])
  const later = useCallback((ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms))
  }, [])

  /**
   * Which view change is the current one.
   *
   * The last step of a change leaves "Check the centres" up for two seconds,
   * and that wait outlives the change itself. Without this, pressing the
   * button again inside those two seconds let the old wait clear the new
   * change's first sentence. Each change takes a number and every step of it
   * checks that the number is still the current one.
   */
  const viewRun = useRef(0)

  // The worker starts when the app opens and spends about a second building
  // its tables, which is why it is not on the main thread (spec C10).
  const solverRef = useRef<Solver | null>(null)
  useEffect(() => {
    const solver = createSolver()
    solverRef.current = solver
    let mounted = true
    void solver.ready.then(() => {
      if (mounted) setSolverReady(true)
    })
    return () => {
      mounted = false
      solverRef.current = null
      solver.terminate()
    }
  }, [createSolver])

  const counts = useMemo(() => countsOf(cube), [cube])
  const problem = useMemo(() => checkPartial(cube), [cube])
  const verdict = useMemo(() => validate(cube), [cube])
  const complete = isComplete(cube)

  const paint = useCallback(
    (index: number, colour: Colour | null) => {
      if (viewChanging || turning) return
      // The tenth sticker of a colour is refused here as well as being greyed
      // in the picker, because the menu can ask for one too (spec C9).
      if (colour !== null && cube[index] !== colour && counts[colour] >= 9) return
      // The cube on screen has changed, so the solution no longer applies to
      // it. It goes, and the user is back to entering, with the cube they can
      // see (spec C12).
      setSolution(null)
      setStep(0)
      setPlaying(false)
      setSolverSaid(null)
      setCube(paintSticker(cube, index, colour))
    },
    [counts, cube, setCube, turning, viewChanging],
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
    viewRun.current += 1
    setResetArmed(false)
    setCube(blank())
    setView('near')
    setStage('near')
    setSentence(null)
    setViewChanging(false)
    setMenu(null)
    setSolution(null)
    setStep(0)
    setPlaying(false)
    setTurning(null)
    setSolverSaid(null)
  }, [clearTimers, durations.arm, later, resetArmed, setCube])

  const changeView = useCallback(() => {
    if (viewChanging || turning) return
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

    const run = viewRun.current + 1
    viewRun.current = run

    setViewChanging(true)
    setMenu(null)
    setPlaying(false)
    setStage(steps[0].stage)
    setSentence(steps[0].sentence)

    later(durations.movement + durations.pause, () => {
      if (viewRun.current !== run) return
      setStage(steps[1].stage)
      setSentence(steps[1].sentence)
      later(durations.movement, () => {
        if (viewRun.current !== run) return
        setView(toFar ? 'far' : 'near')
        setViewChanging(false)
        setSentence('Check the centres: they should match your cube.')
        later(durations.check, () => {
          if (viewRun.current === run) setSentence(null)
        })
      })
    })
  }, [durations, later, turning, view, viewChanging])

  /**
   * One move on screen: the layer turns, and when it has turned the move is
   * applied to the model and the cube is drawn again. Both ways of stepping
   * come through here, so a step is one thing however it was asked for.
   */
  const turnLayer = useCallback(
    (move: Move, commit: () => void) => {
      const ms = Math.round(SPEED_TIMES[speed].turn * durations.speedScale)
      setTurning({ move, ms })
      later(ms, () => {
        setTurning(null)
        commit()
      })
    },
    [durations.speedScale, later, speed],
  )

  /** Every move the cube makes on screen goes through here, whoever asked. */
  const makeMove = useCallback(
    (move: Move, landsOn: number) => {
      turnLayer(move, () => {
        setCube(applyMove(cube, move))
        setStep(landsOn)
      })
    },
    [cube, setCube, turnLayer],
  )

  const stepForward = useCallback(() => {
    if (!solution || turning || viewChanging || step >= solution.revealed) return
    makeMove(solution.moves[step], step + 1)
  }, [makeMove, solution, step, turning, viewChanging])

  const stepBack = useCallback(() => {
    if (!solution || turning || viewChanging || step === 0) return
    setPlaying(false)
    // Back is the move before this one, undone.
    makeMove(inverse(solution.moves[step - 1]), step - 1)
  }, [makeMove, solution, step, turning, viewChanging])

  const jumpToStart = useCallback(() => {
    if (!solution || turning || viewChanging) return
    setPlaying(false)
    setCube(solution.start)
    setStep(0)
  }, [setCube, solution, turning, viewChanging])

  const jumpToEnd = useCallback(() => {
    if (!solution || turning || viewChanging || step >= solution.revealed) return
    setPlaying(false)
    setCube(applyMoves(cube, solution.moves.slice(step, solution.revealed)))
    setStep(solution.revealed)
  }, [cube, setCube, solution, step, turning, viewChanging])

  const play = useCallback(() => setPlaying(true), [])
  const pause = useCallback(() => setPlaying(false), [])

  /**
   * Whether the cube is actually stepping on its own.
   *
   * Worked out rather than stored, so reaching the last move stops it with
   * nothing to write down: an effect that turned `playing` off would be a
   * render asking for another render. Every way back to an earlier step
   * (Step back, Jump to start) turns it off for real.
   */
  const stepping = playing && solution !== null && step < solution.revealed

  // Play, one timer per move rather than one interval, which is the trainer's
  // shape: the effect runs again after each step, so it always reads the step
  // the cube is actually on, and the speed is in its dependencies so changing
  // the speed restarts the pending wait at the new gap.
  useEffect(() => {
    if (!stepping || turning) return
    const wait = Math.round(SPEED_TIMES[speed].interval * durations.speedScale)
    const timer = window.setTimeout(stepForward, wait)
    return () => clearTimeout(timer)
  }, [durations.speedScale, speed, stepForward, stepping, turning])

  /**
   * Asks the solver, once, for the moves that solve the cube as it stands.
   *
   * Solve and Hint both come through here and differ only in how much of the
   * answer the box shows. The cube is validated first, so nothing the library
   * cannot read ever reaches it (rule 13), and `finally` clears the waiting
   * flag however the promise ends.
   */
  const askSolver = useCallback(
    (whenSolved: (moves: Move[], from: Cube) => void) => {
      const solver = solverRef.current
      if (!solver) return
      const answer = validate(cube)
      if (!answer.ok) return
      const from = cube
      setSolving(true)
      setSolverSaid(null)
      solver
        .solve(answer.facelets)
        .then((said) => {
          const moves = said.filter(isMove)
          if (moves.length !== said.length) {
            setSolverSaid('The solver found no solution.')
            return
          }
          if (moves.length === 0) {
            setSolverSaid('Your cube is already solved.')
            return
          }
          whenSolved(moves, from)
        })
        .catch((trouble: unknown) => {
          setSolverSaid(trouble instanceof Error ? trouble.message : 'The solver found no solution.')
        })
        .finally(() => setSolving(false))
    },
    [cube],
  )

  /** Shows one more move and steps into it, which is what a hint is (spec C13). */
  const revealOne = useCallback(
    (shown: Solution) => {
      if (shown.revealed >= shown.moves.length) return
      setSolution({ ...shown, revealed: shown.revealed + 1 })
      makeMove(shown.moves[shown.revealed], shown.revealed + 1)
    },
    [makeMove],
  )

  const solve = useCallback(() => {
    if (solving || turning || viewChanging) return
    if (solution) {
      // A solution is already there, from Hint: show the rest of it.
      setSolution({ ...solution, revealed: solution.moves.length })
      setSolverSaid(`Solved in ${solution.moves.length} moves.`)
      return
    }
    askSolver((moves, from) => {
      setSolution({ start: from, moves, revealed: moves.length })
      setStep(0)
      setSolverSaid(`Solved in ${moves.length} moves.`)
    })
  }, [askSolver, solution, solving, turning, viewChanging])

  const hint = useCallback(() => {
    if (solving || turning || viewChanging) return
    if (solution) {
      // Standing on the last move shown, a hint reveals the next one. Standing
      // further back, the next move is already on the screen, so Hint does what
      // the person is asking for and makes it.
      if (step === solution.revealed) revealOne(solution)
      else stepForward()
      return
    }
    askSolver((moves, from) => {
      const fresh: Solution = { start: from, moves, revealed: 0 }
      setSolution(fresh)
      setStep(0)
      revealOne(fresh)
    })
  }, [askSolver, revealOne, solution, solving, step, stepForward, turning, viewChanging])

  // Why Solve and Hint are off, which is also what their titles say (spec 9.1).
  const whyNotSolve = solving
    ? 'Working it out...'
    : !solverReady
      ? 'Getting ready...'
      : turning || viewChanging
        ? 'Wait for the cube to stop turning.'
        : verdict.ok
          ? null
          : verdict.message

  // What the status line says, worked out rather than stored, so it cannot
  // fall out of step with the cube it describes (spec 4).
  const trouble = problem?.message ?? (complete && !verdict.ok ? verdict.message : null)
  const status =
    sentence ??
    solverSaid ??
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
    solution,
    step,
    playing: stepping,
    turning,
    solverReady,
    solving,
    speed,
    whyNotSolve,
    paint,
    select,
    reset,
    changeView,
    openMenu,
    closeMenu,
    solve,
    hint,
    stepForward,
    stepBack,
    jumpToStart,
    jumpToEnd,
    play,
    pause,
    setSpeed,
  }

  return <CubeContext.Provider value={value}>{children}</CubeContext.Provider>
}
