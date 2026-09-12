import { useCallback, useState } from 'react'
import { blank, type Cube } from '../model/cube'
import { fromText, toText } from '../model/cube-text'
import { SPEEDS, type Speed } from '../model/speeds'

/**
 * Origin: London src/ui/prefs.ts, adapted: the four helpers only, exported, without useRemembered's unused `show`, with this app's keys and two hooks; the comments describe this app.
 * What the app remembers between sessions (spec 10): the speed and the cube
 * here, and the theme in `src/ui/theme.ts` through the same helpers.
 *
 * In `localStorage`, read once when a hook mounts and written on every
 * change. On Windows it lives in the WebView2 profile under
 * `%LOCALAPPDATA%\Cuber Data\WebView2`, which survives an upgrade and goes on a
 * ticked uninstall, and that is the right life for a preference.
 *
 * Storage can be refused outright, in a private window or a locked-down
 * profile. Every read and write here catches and carries on: the app works, it
 * just forgets.
 *
 * This is the only module that touches storage (spec C17).
 */

const SPEED_KEY = 'cuber.speed'
const CUBE_KEY = 'cuber.cube'

export function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Not worth telling anyone about: the choice just will not be remembered.
  }
}

/** One of a fixed set of words, or the default when storage says anything else. */
export function readOneOf<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const saved = read(key)
  return allowed.includes(saved as T) ? (saved as T) : fallback
}

/**
 * A remembered choice: read once when the hook mounts, written on change.
 *
 * Never read during a render. Storage is not React state, and a component
 * that read it while rendering would be one that renders differently for
 * reasons React cannot see.
 */
export function useRemembered<T>(initial: () => T, save: (value: T) => void) {
  const [value, setStored] = useState<T>(initial)
  const set = useCallback(
    (next: T) => {
      setStored(next)
      save(next)
    },
    [save],
  )
  // The trainer's third helper, `show`, is not here: it sets the value without
  // writing it down, for a chess game resumed at a strength the trainee did
  // not choose. Nothing in this app shows a setting it has not been given, and
  // an unused helper is a thing to keep working for no reason (gate 1's watch
  // item, removed in phase 3).
  return [value, set] as const
}

/** How fast the steps play. Normal until the user picks another. */
export function useSpeed(): { speed: Speed; setSpeed: (speed: Speed) => void } {
  const [speed, setSpeed] = useRemembered<Speed>(
    () => readOneOf(SPEED_KEY, SPEEDS, 'normal'),
    useCallback((next: Speed) => write(SPEED_KEY, next), []),
  )
  return { speed, setSpeed }
}

/**
 * The cube as the user left it (spec C15: the cube is remembered, the
 * solution is not). A stored value that is not a cube's 54 characters is
 * dropped silently and the blank cube is shown.
 */
export function useRememberedCube(): { cube: Cube; setCube: (cube: Cube) => void } {
  const [cube, setCube] = useRemembered<Cube>(
    () => fromText(read(CUBE_KEY)) ?? blank(),
    useCallback((next: Cube) => write(CUBE_KEY, toText(next)), []),
  )
  return { cube, setCube }
}
