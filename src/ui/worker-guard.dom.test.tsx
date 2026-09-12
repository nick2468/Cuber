import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/dom'
import { control } from '../test/dom'

/**
 * No worker in the DOM suite, ever (docs/testing.md).
 *
 * The tests hand the provider `fakeSolver`, and this pins that: a `Worker`
 * that throws the moment it is built is put on the global, the whole app is
 * mounted and driven, and it is never constructed. The other half of the
 * guard, that the real path does build one, is in `solver.test.ts`.
 */
describe('the DOM suite', () => {
  it('never constructs a worker', async () => {
    const real = globalThis.Worker
    let built = 0
    class Exploding {
      constructor() {
        built += 1
        throw new Error('A DOM test must never start a worker.')
      }
    }
    Object.defineProperty(globalThis, 'Worker', { value: Exploding, configurable: true, writable: true })

    try {
      const { user } = renderApp()
      await user.click(control('Reset cube'))
      expect(built).toBe(0)
    } finally {
      Object.defineProperty(globalThis, 'Worker', { value: real, configurable: true, writable: true })
    }
  })
})
