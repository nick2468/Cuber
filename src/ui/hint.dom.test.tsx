import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { FIXED_SCRAMBLE, applyMoves, undo } from '../model/moves'
import { boxRows, control, markedRow, renderApp } from '../test/dom'

// C19 item 12.
const SCRAMBLED = applyMoves(solved(), FIXED_SCRAMBLE)
const SOLUTION = undo(FIXED_SCRAMBLE)

describe('Hint', () => {
  it('gives one move at a time, and Solve then shows the rest', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()

    await user.click(control('Hint'))
    await waitFor(() => expect(boxRows()).toHaveLength(1))
    expect(boxRows()[0]).toBe("Hint 1: R' Turn the right face anticlockwise.")
    // The cube has made that move, so nothing is marked to make next.
    expect(markedRow()).toBeNull()
    // How many moves are left is not shown, so a hint stays a hint.
    expect(screen.queryByText(/Solved in/)).toBeNull()

    await user.click(control('Hint'))
    await waitFor(() => expect(boxRows()).toHaveLength(2))
    expect(boxRows()[1]).toBe(`Hint 2: ${SOLUTION[1]} Turn the top face a half turn.`)

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
    // The same solution and the same place in it: the rows are simply numbered
    // as steps now, and the cube is still standing after the second move.
    expect(boxRows()[0]).toBe("1. R' Turn the right face anticlockwise.")
    expect(markedRow()).toBe(boxRows()[2])
  })
})
