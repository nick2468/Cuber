import { solveFewest } from './fewest'
import { movesOf, plainAnswer, type Answer, type SolveRequest, type WorkerReply } from './solver'
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

/** What the chosen method makes of one cube. */
function answer(request: SolveRequest): Answer {
  const cube = Cube.fromString(request.facelets)
  if (request.method === 'fewest') {
    // The worker's own clock: the budget is wall time inside this thread, and
    // nothing on the main thread waits on it except the "Working it out..."
    // line (spec 7.4).
    const { moves, note } = solveFewest(cube, () => performance.now())
    return { ...plainAnswer(moves), note }
  }
  return plainAnswer(movesOf(cube.solve()))
}

scope.onmessage = ({ data }) => {
  let reply: WorkerReply = { type: 'failed' }
  try {
    const said = answer(data)
    if (said.moves.length > 0) reply = { type: 'solution', ...said }
  } catch {
    // The library throws rather than answering when it finds nothing. The
    // validator makes that unreachable, and the adapter still hears "failed".
  }
  scope.postMessage(reply)
}
