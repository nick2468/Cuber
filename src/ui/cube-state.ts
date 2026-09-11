import { createContext, useContext } from 'react'
import type { Colour } from '../model/colours'
import type { Cube } from '../model/cube'
import type { View } from '../model/views'
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
}

export const DEFAULT_DURATIONS: Durations = { movement: 1200, pause: 400, check: 2000, arm: 3000 }

/** An open colour menu: which sticker it is for, and where the pointer was. */
export interface Menu {
  index: number
  x: number
  y: number
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
  paint: (index: number, colour: Colour | null) => void
  select: (colour: Colour) => void
  reset: () => void
  changeView: () => void
  openMenu: (index: number, x: number, y: number) => void
  closeMenu: () => void
}

export const CubeContext = createContext<CubeState | null>(null)

export function useCube(): CubeState {
  const value = useContext(CubeContext)
  if (!value) throw new Error('This needs to be inside a CubeProvider.')
  return value
}
