import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { sticker } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves, undo } from '../model/moves'
import { boxRows, control, markedRow, renderApp, stickerAt } from '../test/dom'

const SCRAMBLED = applyMoves(solved(), FIXED_SCRAMBLE)
const SOLUTION = undo(FIXED_SCRAMBLE)

/** Puts the focus somewhere that is not a control, as a click on the page would. */
async function lookAway(user: ReturnType<typeof renderApp>['user']) {
  await user.click(screen.getByText(/^Hold the cube as you entered it/))
}

describe('the keyboard over a solution', () => {
  it('steps with the arrows and plays with the space bar', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()
    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))

    // The arrows work with Solve still focused, because a button ignores them.
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(markedRow()).toBe(boxRows()[1]))
    await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(markedRow()).toBe(boxRows()[0]))

    // Space on a focused button belongs to the button, not to Play.
    await user.keyboard(' ')
    expect(markedRow()).toBe(boxRows()[0])

    await lookAway(user)
    await user.keyboard(' ')
    await waitFor(() => expect(screen.getByText('Done. Your cube is solved.')).toBeTruthy())
  })

  it('says nothing while the colour menu is open', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()
    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))

    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('U1')) })
    expect(screen.getByRole('menu')).toBeTruthy()

    await user.keyboard('{ArrowRight}')
    expect(markedRow()).toBe(boxRows()[0])
  })
})
