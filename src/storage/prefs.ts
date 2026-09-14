import { useCallback, useState } from 'react'
import { blank, type Cube } from '../model/cube'
import { fromText, toText } from '../model/cube-text'
import { METHODS, type Method } from '../model/methods'
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

/**
 * The four keys, together, because they are what storage is keyed by and
 * this is the module that owns storage. `src/ui/theme.ts` reads the theme
 * through the helpers below, and the dev scenes write the first three.
 */
export const THEME_KEY = 'cuber.theme'
export const SPEED_KEY = 'cuber.speed'
export const CUBE_KEY = 'cuber.cube'
export const METHOD_KEY = 'cuber.method'

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

/**
 * One of a fixed set of words, or the default for anything else.
 *
 * Pure, and separate from the reading, because the same question is asked of
 * two different places a word can come from: storage here, and the address
 * bar in `src/dev/scenes.ts`. Both answer it the same way, so both ask here.
 */
export function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/** One of a fixed set of words, or the default when storage says anything else. */
export function readOneOf<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  return oneOf(read(key), allowed, fallback)
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

/** Which method solves the cube. The quick one until the user picks another (spec 7.3). */
export function useMethod(): { method: Method; setMethod: (method: Method) => void } {
  const [method, setMethod] = useRemembered<Method>(
    () => readOneOf(METHOD_KEY, METHODS, 'quick'),
    useCallback((next: Method) => write(METHOD_KEY, next), []),
  )
  return { method, setMethod }
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
