import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { FIXED_SCRAMBLE, applyMove, applyMoves, undo } from '../model/moves'
import { boxRows, colourAt, control, markedRow, renderApp, status } from '../test/dom'

/**
 * C19 item 11, with the fake solver: it always answers the moves that undo the
 * fixed scramble, so a cube scrambled that way really is solved at the end.
 */
const SCRAMBLED = applyMoves(solved(), FIXED_SCRAMBLE)
const SOLUTION = undo(FIXED_SCRAMBLE)

/** A few stickers from every face, which is enough to say the cube moved. */
const WATCHED = [0, 4, 8, 9, 13, 17, 18, 22, 26, 27, 31, 35, 36, 40, 44, 45, 49, 53]

function showing(): string[] {
  return WATCHED.map((index) => colourAt(index))
}

function asModel(cube: ReturnType<typeof solved>): string[] {
  return WATCHED.map((index) => cube[index] ?? 'blank')
}

function seedScrambled() {
  window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
}

async function solveIt(user: ReturnType<typeof renderApp>['user']) {
  await user.click(control('Solve'))
  await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
}

describe('Solve', () => {
  it('lists every move with its letter and sentence, and marks the first', async () => {
    seedScrambled()
    const { user } = renderApp()
    expect(status()).toBe('Ready. Press Solve.')

    await solveIt(user)

    expect(status()).toBe('Solved in 10 moves.')
    expect(boxRows()[0]).toBe("1. R' Turn the right face anticlockwise.")
    expect(boxRows()[9]).toBe("10. R' Turn the right face anticlockwise.")
    expect(markedRow()).toBe(boxRows()[0])
    expect(screen.getByText(/^Hold the cube as you entered it/)).toBeTruthy()
  })

  it('steps the cube forward and back, exactly as the model says', async () => {
    seedScrambled()
    const { user } = renderApp()
    await solveIt(user)
    expect(showing()).toEqual(asModel(SCRAMBLED))

    await user.click(control('Step forward'))
    await waitFor(() => expect(markedRow()).toBe(boxRows()[1]))
    expect(showing()).toEqual(asModel(applyMove(SCRAMBLED, SOLUTION[0])))

    await user.click(control('Step back'))
    await waitFor(() => expect(markedRow()).toBe(boxRows()[0]))
    expect(showing()).toEqual(asModel(SCRAMBLED))
  })

  it('jumps to the end, where the cube is solved, and back to the start', async () => {
    seedScrambled()
    const { user } = renderApp()
    await solveIt(user)

    await user.click(control('Jump to end'))
    await waitFor(() => expect(screen.getByText('Done. Your cube is solved.')).toBeTruthy())
    expect(showing()).toEqual(asModel(solved()))

    await user.click(control('Jump to start'))
    await waitFor(() => expect(markedRow()).toBe(boxRows()[0]))
    expect(showing()).toEqual(asModel(SCRAMBLED))
    expect(screen.queryByText('Done. Your cube is solved.')).toBeNull()
  })

  it('plays to the end on its own', async () => {
    seedScrambled()
    const { user } = renderApp()
    await solveIt(user)

    await user.click(control('Play'))
    await waitFor(() => expect(screen.getByText('Done. Your cube is solved.')).toBeTruthy())
    expect(showing()).toEqual(asModel(solved()))
    // It stops by itself at the end rather than waiting to be paused.
    expect(control('Play').disabled).toBe(true)
  })

  it('turns each control off where it would do nothing', async () => {
    seedScrambled()
    const { user } = renderApp()
    for (const name of ['Jump to start', 'Step back', 'Play', 'Step forward', 'Jump to end']) {
      expect(control(name).disabled, name).toBe(true)
    }

    await solveIt(user)
    expect(control('Jump to start').disabled).toBe(true)
    expect(control('Step back').disabled).toBe(true)
    expect(control('Step forward').disabled).toBe(false)
    expect(control('Jump to end').disabled).toBe(false)

    await user.click(control('Jump to end'))
    await waitFor(() => expect(control('Step forward').disabled).toBe(true))
    expect(control('Jump to end').disabled).toBe(true)
    expect(control('Step back').disabled).toBe(false)
    expect(control('Jump to start').disabled).toBe(false)
  })
})
