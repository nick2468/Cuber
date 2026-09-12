import { useEffect, useRef } from 'react'
import { useCube } from '../ui/cube-state'
import type { Scene } from './scenes'

/**
 * The half of a scene that cannot be written into storage: pressing Solve.
 *
 * `applyDevScene` has already put the cube, the theme and the speed there, so
 * five of the six scenes are complete before this runs. The `solution` scene
 * needs the real solver, which takes about a second to build its tables, so it
 * waits for `solverReady` and then presses Solve exactly once.
 *
 * Development builds only, and the guard is inside rather than at the call
 * site: `Shell` calls this every render, so a caller's guard would be a
 * conditional hook. `import.meta.env.DEV` is a constant at build time, so in a
 * production build `waiting` is the constant false and everything the test
 * reaches, the word `solution` included, is dropped from the bundle.
 */
export function useDevScene(scene: Scene | null): void {
  const { solverReady, solve } = useCube()
  // `solve` is a fresh function every render, so the effect runs again after
  // each one. This says the asking has happened, whatever the effect is told.
  const asked = useRef(false)
  const waiting = import.meta.env.DEV && scene?.scene === 'solution'

  useEffect(() => {
    if (!waiting || asked.current || !solverReady) return
    asked.current = true
    solve()
  }, [solve, solverReady, waiting])
}
