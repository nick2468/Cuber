import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sticker } from '../model/geometry'
import { colourAt, renderApp, status, stickerAt } from '../test/dom'

// C19 item 14.
describe('Reset cube', () => {
  it('asks once, and the second press clears to the blank cube', async () => {
    const { user } = renderApp()
    await user.click(stickerAt(sticker('U1')))
    expect(colourAt(sticker('U1'))).toBe('red')

    await user.click(screen.getByRole('button', { name: 'Reset cube' }))
    const armed = screen.getByRole('button', { name: 'Press again to clear' })
    expect(colourAt(sticker('U1'))).toBe('red')

    await user.click(armed)
    expect(colourAt(sticker('U1'))).toBe('blank')
    // The centres stay, which is what a new cube looks like (spec C14).
    expect(colourAt(sticker('U5'))).toBe('white')
    expect(status()).toBe('Fill in the stickers. 0 of 48 done.')
    expect(screen.getByRole('button', { name: 'Reset cube' })).toBeTruthy()
  })

  it('forgets one press on its own, and the cube is untouched', async () => {
    const { user } = renderApp({ durations: { arm: 20 } })
    await user.click(stickerAt(sticker('U1')))

    await user.click(screen.getByRole('button', { name: 'Reset cube' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reset cube' })).toBeTruthy())
    expect(colourAt(sticker('U1'))).toBe('red')
  })
})
