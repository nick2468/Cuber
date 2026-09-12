import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { sticker } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves, undo } from '../model/moves'
import { boxRows, colourAt, control, markedRow, menuItem, renderApp, stickerAt } from '../test/dom'

/**
 * C19 item 13. On a complete cube every colour is already on nine stickers, so
 * the one paint that can change it is Clear (spec C9): a tenth sticker of a
 * colour cannot be made, and clearing one frees that colour to be painted
 * again.
 */
const SCRAMBLED = applyMoves(solved(), FIXED_SCRAMBLE)
const SOLUTION = undo(FIXED_SCRAMBLE)

describe('painting while a solution is showing', () => {
  it('discards the solution and keeps the cube as it is on screen', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()

    await user.click(control('Solve'))
    await waitFor(() => expect(boxRows()).toHaveLength(SOLUTION.length))
    for (let n = 0; n < 3; n += 1) {
      await user.click(control('Step forward'))
      await waitFor(() => expect(markedRow()).toBe(boxRows()[n + 1]))
    }
    const atStepThree = [...Array(54).keys()].map((index) => colourAt(index))

    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('U1')) })
    await user.click(menuItem('Clear'))

    expect(screen.getByText('Press Solve and the steps appear here.')).toBeTruthy()
    expect(boxRows()).toHaveLength(0)
    // The cube keeps the colours it had, with that one sticker blank.
    expect(colourAt(sticker('U1'))).toBe('blank')
    for (let index = 1; index < 54; index += 1) {
      expect(colourAt(index), String(index)).toBe(atStepThree[index])
    }
  })
})
