import { useEffect, useState } from 'react'

/**
 * How big the cube is drawn (spec 4.1, the fit rule).
 *
 * The scene is 400 square, or smaller when the window leaves less, and never
 * under 280. Each number it takes off is one thing on the screen above or
 * below it, named here so a change to the layout has an obvious line to
 * change.
 *
 * Every number below was MEASURED by `scripts/probes/layout.js` at 800 by 1000
 * with the `solution` scene, after phase 4's layout pass. They were estimates
 * until then, and three of them were wrong by enough to matter: the picker is
 * two-thirds taller than the 92 guessed for it, and the box holding nineteen
 * moves is 265 rather than 220. The estimates said the 440 scene fitted the
 * Windows window; it did not, by 75 pixels.
 */

/** The column of spec 4.1, and the page padding on each side of it. */
export const COLUMN_MAX = 720
export const PAGE_PADDING = 24

export const SCENE_MAX = 400
export const SCENE_MIN = 280

/** What the scene shares the height with, top to bottom (spec 4.1). */
/** `.app-header`, whose height carries its own padding. */
const HEADER = 45
/** The "Show the other side" button, which is `.status`'s neighbour. */
const VIEW_BUTTON = 38
/** `.status`, one line. */
const STATUS = 24
/** `.box` with a nineteen-move solution in it: the tallest it is asked to be. */
const BOX_MIN = 316
/** The header's margin, and the three gaps `.screen` puts between its children. */
const GAPS = 4 + 3 * 4

/**
 * The picker, which since phase 7 sits BESIDE the cube rather than above it
 * (Nick, 2026-09-14). So it takes width from the scene instead of height, and
 * it is 151 tall, which is shorter than the scene ever is: the row is as tall
 * as the cube and the picker costs the page nothing.
 */
const PICKER_WIDTH = 182
/** `.cube-row`'s gap, between the cube and the picker. */
const BESIDE = 16

const HEIGHT_TAKEN = 2 * PAGE_PADDING + HEADER + VIEW_BUTTON + STATUS + BOX_MIN + GAPS

/** The scene's side, in pixels, for a viewport. */
export function sceneSize(viewportWidth: number, viewportHeight: number): number {
  const acrossTheColumn =
    Math.min(viewportWidth, COLUMN_MAX) - 2 * PAGE_PADDING - PICKER_WIDTH - BESIDE
  const downThePage = viewportHeight - HEIGHT_TAKEN
  return Math.max(SCENE_MIN, Math.min(SCENE_MAX, acrossTheColumn, downThePage))
}

/**
 * A cubie's side, so that the whole cube fits inside the scene.
 *
 * Spec 4.1 divides by 3.67, which is three cubies and their gaps laid flat
 * with a little over. Measured in the pane, that is not enough: turned
 * corner-on and seen through a 1200 px perspective, the cube covers 552 by 571
 * in a 440 scene, about 1.30 times its flat width. It hid the view button and
 * the status line under it. So the divisor is that 3.67 times the 1.30 the
 * turn adds, which is 4.8, and the cube ends up just inside its scene.
 * A 400 scene gives an 83 px cubie, still far more than a finger needs.
 */
export function cubieSize(scene: number): number {
  return Math.floor(scene / 4.8)
}

/** The scene's side, re-measured when the window or the iPad turns. */
export function useSceneSize(): number {
  const [size, setSize] = useState(() => sceneSize(window.innerWidth, window.innerHeight))

  useEffect(() => {
    const measure = () => setSize(sceneSize(window.innerWidth, window.innerHeight))
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [])

  return size
}
