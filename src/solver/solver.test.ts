import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { SOLVED_FACELETS } from '../model/facelets'
import { FIXED_SCRAMBLE, applyMoves, type Move } from '../model/moves'
import { fakeSolver } from '../test/fake-solver'
import { createSolver, type SolveRequest, type SolverWorker, type WorkerReply } from './solver'

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

  it('sends the facelets and answers with the moves', async () => {
    const { worker, sent, reply } = aWorker()
    const solver = createSolver(() => worker)
    const answer = solver.solve(SCRAMBLED)
    expect(sent).toEqual([{ type: 'solve', facelets: SCRAMBLED }])
    reply({ type: 'solution', moves: ['R', "U'"] })
    expect(await answer).toEqual(['R', "U'"])
  })

  it('pairs the replies with the requests in order', async () => {
    const { worker, reply } = aWorker()
    const solver = createSolver(() => worker)
    const first = solver.solve(SCRAMBLED)
    const second = solver.solve(SCRAMBLED.split('').reverse().join(''))
    reply({ type: 'solution', moves: ['R'] })
    reply({ type: 'solution', moves: ['U2'] })
    expect(await first).toEqual(['R'])
    expect(await second).toEqual(['U2'])
  })

  it('rejects when the worker finds nothing', async () => {
    const { worker, reply } = aWorker()
    const answer = createSolver(() => worker).solve(SCRAMBLED)
    reply({ type: 'failed' })
    await expect(answer).rejects.toThrow('The solver found no solution.')
  })

  it('does not send a solved cube, and answers it with no moves', async () => {
    const { worker, sent } = aWorker()
    expect(await createSolver(() => worker).solve(SOLVED_FACELETS)).toEqual([])
    expect(sent).toEqual([])
  })
})

describe('the fake solver', () => {
  it('is ready at once and its answer solves the scrambled cube', async () => {
    const solver = fakeSolver()
    await solver.ready
    const moves = (await solver.solve(SCRAMBLED)) as Move[]
    expect(applyMoves(applyMoves(solved(), FIXED_SCRAMBLE), moves)).toEqual(solved())
  })
})
