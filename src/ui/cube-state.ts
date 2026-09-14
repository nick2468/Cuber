import { createContext, useContext } from 'react'
import type { Colour } from '../model/colours'
import type { Cube } from '../model/cube'
import type { Method } from '../model/methods'
import type { Move } from '../model/moves'
import type { Speed } from '../model/speeds'
import type { View } from '../model/views'
// The solver's stages are the seven of the beginner method; `Stage` on its own
// already means what the cube is turned to, so the longer name is the imported
// one and the older meaning keeps the short word it has had since phase 2.
import type { Label, Stage as SolutionStage } from '../solver/solver'
import type { Stage } from './transforms'

/**
 * What the screen reads: the shape of the cube's state, and the hook that
 * reaches it.
 *
 * Apart from the provider itself, which is `cube-context.tsx`, so that a file
 * holding a component holds nothing else.
 */

/** How long the moving parts take. Tests pass short ones and wait on the result. */
export interface Durations {
  /** One movement of the view change (spec 5.2). */
  movement: number
  /** The pause between the two movements. */
  pause: number
  /** How long "Check the centres" stays up afterwards. */
  check: number
  /** How long Reset stays armed after the first press (spec C14). */
  arm: number
  /**
   * What the speed's times are multiplied by: 1 in the app, 0 in the tests, so
   * a test steps at once and still steps through the same code (spec 9.2).
   */
  speedScale: number
}

export const DEFAULT_DURATIONS: Durations = {
  movement: 1200,
  pause: 400,
  check: 2000,
  arm: 3000,
  speedScale: 1,
}

/** An open colour menu: which sticker it is for, and where the pointer was. */
export interface Menu {
  index: number
  x: number
  y: number
}

/**
 * The solution Solve and Hint share (spec 9.3).
 *
 * `start` is the cube as it was when the solver answered, which is what Jump
 * to start goes back to. `revealed` is how many moves the box shows: all of
 * them after Solve, one more with each Hint.
 */
export interface Solution {
  readonly start: Cube
  readonly moves: readonly Move[]
  readonly revealed: number
  /** The beginner method's stages, in order. Empty for the other two (spec 7.5). */
  readonly stages: readonly SolutionStage[]
  /** The named sequences inside it, at the move each starts on. Empty for the other two. */
  readonly labels: readonly Label[]
  /** `'quick'` when fewest moves fell back, which the status line says (spec 7.4). */
  readonly note: 'quick' | null
}

/** The move turning on screen right now, and how long its turn lasts. */
export interface Turning {
  readonly move: Move
  readonly ms: number
}

export interface CubeState {
  cube: Cube
  /** Which side the user is entering: the settled view, not the animation. */
  view: View
  /** What the cube is turned to right now, which the CSS follows. */
  stage: Stage
  selected: Colour
  counts: Record<Colour, number>
  /** The sentence under the cube (spec 4). */
  status: string
  /** The stickers to outline, from the validator. */
  marked: readonly number[]
  /** True while the view change is playing: stickers and the button wait. */
  viewChanging: boolean
  /** True when the cube is complete and possible, which Solve waits for. */
  ready: boolean
  resetArmed: boolean
  menu: Menu | null
  durations: Durations
  solution: Solution | null
  /** Which step the cube on screen is at: 0 is the cube as it was entered. */
  step: number
  playing: boolean
  turning: Turning | null
  /** True once the worker has built its tables. */
  solverReady: boolean
  /** True while the solver is working one out. */
  solving: boolean
  speed: Speed
  /** Which method Solve and Hint use (spec 7.3). */
  method: Method
  /** Why Solve and Hint are off, or null when they are on. */
  whyNotSolve: string | null
  paint: (index: number, colour: Colour | null) => void
  select: (colour: Colour) => void
  reset: () => void
  changeView: () => void
  openMenu: (index: number, x: number, y: number) => void
  closeMenu: () => void
  solve: () => void
  hint: () => void
  stepForward: () => void
  stepBack: () => void
  jumpToStart: () => void
  jumpToEnd: () => void
  play: () => void
  pause: () => void
  setSpeed: (speed: Speed) => void
  setMethod: (method: Method) => void
}

export const CubeContext = createContext<CubeState | null>(null)

export function useCube(): CubeState {
  const value = useContext(CubeContext)
  if (!value) throw new Error('This needs to be inside a CubeProvider.')
  return value
}
