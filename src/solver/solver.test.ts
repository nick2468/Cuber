import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { SOLVED_FACELETS } from '../model/facelets'
import { FIXED_SCRAMBLE, applyMoves, type Move } from '../model/moves'
import { FAKE_STAGE, fakeSolver } from '../test/fake-solver'
import {
  createSolver,
  plainAnswer,
  type SolveRequest,
  type SolverWorker,
  type WorkerReply,
} from './solver'

/** A stand-in for the worker: it records what it is sent, and the test replies for it. */
function aWorker() {
  const sent: SolveRequest[] = []
  const worker: SolverWorker = {
    postMessage: (request) => {
      sent.push(request)
    },
    onmessage: null,
  }
  const reply = (data: WorkerReply) => worker.onmessage?.({ data })
  return { worker, sent, reply }
}

const SCRAMBLED = 'DUUBULDBFRBFRRULLLBRDFFFBLURDBFDFDRFRULBLUFDURRBLBDUDL'

describe('the solver adapter', () => {
  it('starts one worker, and is ready when the worker says so', async () => {
    const { worker, reply } = aWorker()
    let started = 0
    const solver = createSolver(() => {
      started += 1
      return worker
    })
    let ready = false
    void solver.ready.then(() => {
      ready = true
    })
    await Promise.resolve()
    expect(ready).toBe(false)
    reply({ type: 'ready' })
    await solver.ready
    expect(ready).toBe(true)
    expect(started).toBe(1)
  })

  it('sends the facelets and the method, and answers with the moves', async () => {
    const { worker, sent, reply } = aWorker()
    const solver = createSolver(() => worker)
    const answer = solver.solve(SCRAMBLED, 'fewest')
    expect(sent).toEqual([{ type: 'solve', facelets: SCRAMBLED, method: 'fewest' }])
    reply({ type: 'solution', ...plainAnswer(['R', "U'"]) })
    expect((await answer).moves).toEqual(['R', "U'"])
  })

  // The stages, the labels and the note come back untouched: the adapter
  // carries what the method worked out, and never works any of it out itself.
  it('carries the stages, the labels and the note through', async () => {
    const { worker, reply } = aWorker()
    const answer = createSolver(() => worker).solve(SCRAMBLED, 'beginner')
    const stages = [{ name: 'The white cross', sentence: 'Make a cross.', from: 0, to: 2 }]
    const labels = [{ at: 0, text: "The righty move, front-right: R U R' U'" }]
    reply({ type: 'solution', moves: ['R', "U'"], stages, labels, note: 'quick' })
    expect(await answer).toEqual({ moves: ['R', "U'"], stages, labels, note: 'quick' })
  })

  it('pairs the replies with the requests in order', async () => {
    const { worker, reply } = aWorker()
    const solver = createSolver(() => worker)
    const first = solver.solve(SCRAMBLED, 'quick')
    const second = solver.solve(SCRAMBLED.split('').reverse().join(''), 'quick')
    reply({ type: 'solution', ...plainAnswer(['R']) })
    reply({ type: 'solution', ...plainAnswer(['U2']) })
    expect((await first).moves).toEqual(['R'])
    expect((await second).moves).toEqual(['U2'])
  })

  it('rejects when the worker finds nothing', async () => {
    const { worker, reply } = aWorker()
    const answer = createSolver(() => worker).solve(SCRAMBLED, 'quick')
    reply({ type: 'failed' })
    await expect(answer).rejects.toThrow('The solver found no solution.')
  })

  it('does not send a solved cube, and answers it with no moves', async () => {
    const { worker, sent } = aWorker()
    expect((await createSolver(() => worker).solve(SOLVED_FACELETS, 'quick')).moves).toEqual([])
    expect(sent).toEqual([])
  })
})

describe('the real path', () => {
  // The other half of the worker guard: the DOM suite proves no worker is ever
  // built there, and this proves the app's own path does build one, so the
  // guard cannot pass because the code stopped starting a worker at all.
  it('builds a worker when it is given no maker', () => {
    const real = (globalThis as { Worker?: unknown }).Worker
    let built = 0
    class Stub {
      onmessage: unknown = null
      constructor() {
        built += 1
      }
      postMessage() {}
      terminate() {}
    }
    Object.defineProperty(globalThis, 'Worker', { value: Stub, configurable: true, writable: true })

    try {
      const solver = createSolver()
      expect(built).toBe(1)
      solver.terminate()
    } finally {
      Object.defineProperty(globalThis, 'Worker', { value: real, configurable: true, writable: true })
    }
  })
})

describe('the fake solver', () => {
  it('is ready at once and its answer solves the scrambled cube', async () => {
    const solver = fakeSolver()
    await solver.ready
    const moves = (await solver.solve(SCRAMBLED, 'quick')).moves as Move[]
    expect(applyMoves(applyMoves(solved(), FIXED_SCRAMBLE), moves)).toEqual(solved())
  })

  it('gives the beginner method one stage, and the others none', async () => {
    const solver = fakeSolver()
    expect((await solver.solve(SCRAMBLED, 'beginner')).stages).toEqual([FAKE_STAGE])
    expect((await solver.solve(SCRAMBLED, 'quick')).stages).toEqual([])
  })

  it('says nothing about falling back unless it is asked to', async () => {
    expect((await fakeSolver().solve(SCRAMBLED, 'fewest')).note).toBeNull()
    expect((await fakeSolver({ note: 'quick' }).solve(SCRAMBLED, 'fewest')).note).toBe('quick')
  })
})
