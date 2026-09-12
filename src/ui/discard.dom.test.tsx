import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { sticker } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves, undo } from '../model/moves'
import { boxRows, colourAt, control, markedRow, renderApp, stickerAt } from '../test/dom'

/**
 * C19 item 13. The cube here is complete, so every colour is already on nine
 * stickers. Since gate 3 that is no bar to painting over one: a filled sticker
 * takes any colour, which is how a user fixes one they entered wrongly (spec
 * C9). So this paints the ordinary way, with a click.
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

    // Red is the colour the picker opens with, and this sticker is not red.
    expect(atStepThree[sticker('U1')]).not.toBe('red')
    await user.click(stickerAt(sticker('U1')))

    expect(screen.getByText('Press Solve and the steps appear here.')).toBeTruthy()
    expect(boxRows()).toHaveLength(0)
    // The cube keeps the colours it had, with that one sticker repainted.
    expect(colourAt(sticker('U1'))).toBe('red')
    for (let index = 1; index < 54; index += 1) {
      expect(colourAt(index), String(index)).toBe(atStepThree[index])
    }
  })
})
