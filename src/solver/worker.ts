import type { SolveRequest, WorkerReply } from './solver'
import Cube from './vendor/cube.js'
import './vendor/solve.js'

/**
 * The solver's web worker (spec C10): builds the tables when it starts, says
 * so, then answers each request in turn.
 *
 * Kept this small because it is not unit tested: it needs a worker global,
 * and the suite never starts a worker. The adapter in `solver.ts` is tested
 * with a stand-in, and the one slow test proves the library itself solves.
 */

const scope = self as unknown as {
  postMessage(reply: WorkerReply): void
  onmessage: ((event: { data: SolveRequest }) => void) | null
}

Cube.initSolver()
scope.postMessage({ type: 'ready' })

scope.onmessage = ({ data }) => {
  let reply: WorkerReply = { type: 'failed' }
  try {
    const moves = Cube.fromString(data.facelets).solve().split(' ').filter(Boolean)
    if (moves.length > 0) reply = { type: 'solution', moves }
  } catch {
    // The library throws rather than answering when it finds nothing. The
    // validator makes that unreachable, and the adapter still hears "failed".
  }
  scope.postMessage(reply)
}
