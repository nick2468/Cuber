import { SOLVED_FACELETS } from '../model/facelets'

/**
 * The solver, as the app sees it (spec 7.2, C10).
 *
 * `initSolver` takes seconds and would freeze the screen on the main thread,
 * so the library runs in a web worker (`worker.ts`), started when the app
 * opens. This adapter turns the worker's messages into two promises: `ready`,
 * when the tables are built, and one per `solve`.
 *
 * The provider takes `createSolver` as an option, and the tests hand it
 * `fakeSolver` instead, so no worker is ever started in the suite.
 */

/** What the app sends the worker. */
export interface SolveRequest {
  readonly type: 'solve'
  readonly facelets: string
}

/** What the worker sends back. */
export type WorkerReply =
  | { readonly type: 'ready' }
  | { readonly type: 'solution'; readonly moves: string[] }
  | { readonly type: 'failed' }

/** The part of a worker the adapter uses, so a test can hand it a plain object. */
export interface SolverWorker {
  postMessage(request: SolveRequest): void
  onmessage: ((event: { data: WorkerReply }) => void) | null
  /** A real worker has one; a stand-in in a test need not. */
  terminate?(): void
}

export interface Solver {
  /** Settles once the worker has built its tables. */
  readonly ready: Promise<void>
  /** The moves that solve these facelets, as the library writes them. */
  solve(facelets: string): Promise<string[]>
  /** Stops the worker. The provider calls it when the app goes away. */
  terminate(): void
}

/** The real worker. The one browser global in `src/model` and `src/solver` (spec C17). */
function startWorker(): SolverWorker {
  // A Worker's own `onmessage` takes a full MessageEvent; this adapter reads only `data`.
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as unknown as SolverWorker
}

export function createSolver(makeWorker: () => SolverWorker = startWorker): Solver {
  const worker = makeWorker()
  // A worker handles one message at a time, in order, so the replies come
  // back in the order the requests went out and a queue pairs them up.
  const waiting: { resolve: (moves: string[]) => void; reject: (error: Error) => void }[] = []
  let markReady = () => {}
  const ready = new Promise<void>((resolve) => {
    markReady = resolve
  })

  worker.onmessage = ({ data }) => {
    if (data.type === 'ready') {
      markReady()
      return
    }
    const next = waiting.shift()
    if (data.type === 'solution') next?.resolve(data.moves)
    else next?.reject(new Error('The solver found no solution.'))
  }

  return {
    ready,
    terminate() {
      worker.terminate?.()
    },
    solve(facelets) {
      // A solved cube is not sent: there is nothing to work out (spec 7.2).
      if (facelets === SOLVED_FACELETS) return Promise.resolve([])
      return new Promise((resolve, reject) => {
        waiting.push({ resolve, reject })
        worker.postMessage({ type: 'solve', facelets })
      })
    },
  }
}
