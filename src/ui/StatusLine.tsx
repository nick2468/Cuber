import { useCube } from './cube-state'

/**
 * The one line under the cube (spec 4): how many stickers are done, what is
 * wrong with the cube, what to do with the real one while the view changes,
 * or that it is ready to solve.
 *
 * `role="status"` so a screen reader hears it change without being sent there.
 */
export function StatusLine() {
  const { status } = useCube()
  return (
    <p className="status" role="status">
      {status}
    </p>
  )
}
