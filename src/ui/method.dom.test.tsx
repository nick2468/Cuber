import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { FIXED_SCRAMBLE, applyMoves, undo } from '../model/moves'
import { FAKE_STAGE, fakeSolver } from '../test/fake-solver'
import { boxRows, control, renderApp, status } from '../test/dom'

/**
 * Choosing the method in the box (spec 7.3, 9.5, C22).
 *
 * The fake solver answers every method with the same ten moves, so what is
 * tested here is the choosing and the drawing. What each method works out is
 * the solver's own business, and the string tests cover it.
 */

const SCRAMBLED = applyMoves(solved(), FIXED_SCRAMBLE)
const SOLUTION = undo(FIXED_SCRAMBLE)

function methodRadio(name: string): HTMLInputElement {
  return within(screen.getByRole('group', { name: 'Method' })).getByRole('radio', {
    name,
  }) as HTMLInputElement
}

/** What the box shows that is not a move: the headings and the labels. */
function headings(): string[] {
  return [...document.querySelectorAll('.stage-row, .label-row')].map((row) =>
    [...row.children].map((part) => part.textContent).join(' '),
  )
}

describe('the method', () => {
  it('offers the three of spec 7.3, with the quick one chosen', () => {
    renderApp()
    const group = within(screen.getByRole('group', { name: 'Method' }))
    expect(group.getAllByRole('radio')).toHaveLength(3)
    for (const word of ['Quick solve', 'Fewest moves', 'Beginner method']) {
      expect(methodRadio(word).checked).toBe(word === 'Quick solve')
    }
  })

  it('is remembered across a remount', async () => {
    const { user, unmount } = renderApp()
    await user.click(methodRadio('Beginner method'))
    expect(methodRadio('Beginner method').checked).toBe(true)
    unmount()

    renderApp()
    expect(methodRadio('Beginner method').checked).toBe(true)
  })

  // C22: the moves in the box were worked out by the method that was chosen
  // before, so they are no longer the answer to the question on the screen.
  it('empties the box when it changes with a solution showing', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))

    await user.click(methodRadio('Fewest moves'))
    expect(boxRows()).toEqual([])
    expect(screen.getByText('Press Solve and the steps appear here.')).toBeTruthy()
    expect(status()).toBe('Ready. Press Solve.')
  })

  it('keeps the solution when the method it is already on is pressed again', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
    await user.click(methodRadio('Quick solve'))
    expect(boxRows()).toHaveLength(SOLUTION.length)
  })
})

describe('a beginner solution in the box', () => {
  it('heads its stages and says how to hold the cube', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    window.localStorage.setItem('cuber.method', 'beginner')
    const { user } = renderApp()

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))

    expect(headings()).toEqual([`${FAKE_STAGE.name} ${FAKE_STAGE.sentence}`])
    expect(screen.getByText(/Most guides start with white/)).toBeTruthy()
    // The rows themselves are the rows they always were.
    expect(boxRows()[0]).toBe("1. R' Turn the right face anticlockwise.")
  })

  it('shows a heading only once the first move under it is shown', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    window.localStorage.setItem('cuber.method', 'beginner')
    const { user } = renderApp()

    await user.click(control('Hint'))
    await waitFor(() => expect(boxRows()).toHaveLength(1))
    expect(headings()).toEqual([`${FAKE_STAGE.name} ${FAKE_STAGE.sentence}`])
  })

  it('says nothing about holding white at the bottom for the other methods', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
    expect(screen.queryByText(/Most guides start with white/)).toBeNull()
    expect(headings()).toEqual([])
  })
})

describe('fewest moves that could not find a shorter answer', () => {
  // Spec 7.4: a person who asked for the fewest is told when they did not get
  // them. The solver says so; the screen never works it out for itself.
  it('says so in the status line', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    window.localStorage.setItem('cuber.method', 'fewest')
    const { user } = renderApp({ createSolver: () => fakeSolver({ note: 'quick' }) })

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
    expect(status()).toBe(
      'Solved in 10 moves. No shorter answer was found in five seconds, so this is the quick one.',
    )
  })

  it('says only the count when it did find one', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    window.localStorage.setItem('cuber.method', 'fewest')
    const { user } = renderApp()

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
    expect(status()).toBe('Solved in 10 moves.')
  })
})
