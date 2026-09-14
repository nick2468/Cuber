import { SOLVED_FACELETS } from '../model/facelets'
import type { Method } from '../model/methods'

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
  /** Which method to use (spec 7.3). The worker never chooses one itself. */
  readonly method: Method
}

/**
 * One stage of the beginner method, over the moves it covers: `from` is the
 * first move's index and `to` is one past the last, so a stage that needed no
 * moves has `from === to` (spec 7.5). The other two methods return none.
 */
export interface Stage {
  readonly name: string
  readonly sentence: string
  readonly from: number
  readonly to: number
}

/** A named sequence, at the move it starts on: "The righty move, front-right: R U R' U', twice". */
export interface Label {
  readonly at: number
  readonly text: string
}

/** What every method answers with. The stepping and the animation read only `moves`. */
export interface Answer {
  readonly moves: string[]
  readonly stages: Stage[]
  readonly labels: Label[]
  /**
   * `'quick'` when fewest moves ran out of depth or time and gave the quick
   * answer instead, which the status line says out loud (spec 7.4). The
   * solver says so; nothing on the screen guesses it.
   */
  readonly note: 'quick' | null
}

/** What the worker sends back. */
export type WorkerReply =
  | { readonly type: 'ready' }
  | ({ readonly type: 'solution' } & Answer)
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
  /** How this method solves these facelets, with the moves as the library writes them. */
  solve(facelets: string, method: Method): Promise<Answer>
  /** Stops the worker. The provider calls it when the app goes away. */
  terminate(): void
}

/** What a method with no stages and nothing to say answers with. */
export function plainAnswer(moves: string[]): Answer {
  return { moves, stages: [], labels: [], note: null }
}

/**
 * The library's answer split into moves. It writes them separated by spaces
 * and gives back "" when it found nothing, which has to read as no moves
 * rather than as one empty one. Both methods that call the library come
 * through here.
 */
export function movesOf(said: string): string[] {
  return said.split(' ').filter(Boolean)
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
  const waiting: { resolve: (answer: Answer) => void; reject: (error: Error) => void }[] = []
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
    if (data.type === 'solution') {
      next?.resolve({ moves: data.moves, stages: data.stages, labels: data.labels, note: data.note })
    }
    else next?.reject(new Error('The solver found no solution.'))
  }

  return {
    ready,
    terminate() {
      worker.terminate?.()
    },
    solve(facelets, method) {
      // A solved cube is not sent: there is nothing to work out (spec 7.2).
      if (facelets === SOLVED_FACELETS) return Promise.resolve(plainAnswer([]))
      return new Promise((resolve, reject) => {
        waiting.push({ resolve, reject })
        worker.postMessage({ type: 'solve', facelets, method })
      })
    },
  }
}
