import { plainAnswer, type SolveRequest, type WorkerReply } from './solver'
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

/** The library's own answer, split into moves: "" when it found nothing. */
function movesOf(said: string): string[] {
  return said.split(' ').filter(Boolean)
}

scope.onmessage = ({ data }) => {
  let reply: WorkerReply = { type: 'failed' }
  try {
    const moves = movesOf(Cube.fromString(data.facelets).solve())
    if (moves.length > 0) reply = { type: 'solution', ...plainAnswer(moves) }
  } catch {
    // The library throws rather than answering when it finds nothing. The
    // validator makes that unreachable, and the adapter still hears "failed".
  }
  scope.postMessage(reply)
}
