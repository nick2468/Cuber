import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sticker } from '../model/geometry'
import { colourAt, menuItem, renderApp, status, stickerAt, swatch } from '../test/dom'

// C19 item 9.
describe('painting the stickers', () => {
  it('paints with the picked colour, and the swatch counts it', async () => {
    const { user } = renderApp()
    expect(swatch('red').getAttribute('aria-pressed')).toBe('true')
    expect(status()).toBe('Fill in the stickers. 0 of 48 done.')

    await user.click(stickerAt(sticker('U1')))
    expect(colourAt(sticker('U1'))).toBe('red')
    expect(within(swatch('red')).getByText('2/9')).toBeTruthy()
    expect(status()).toBe('Fill in the stickers. 1 of 48 done.')

    await user.click(swatch('green'))
    await user.click(stickerAt(sticker('U3')))
    expect(colourAt(sticker('U3'))).toBe('green')
    expect(within(swatch('green')).getByText('2/9')).toBeTruthy()
    expect(status()).toBe('Fill in the stickers. 2 of 48 done.')
  })

  it('paints and clears through the right-click menu', async () => {
    const { user } = renderApp()

    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    await user.click(menuItem('blue'))
    expect(colourAt(sticker('F1'))).toBe('blue')
    expect(screen.queryByRole('menu')).toBeNull()

    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    await user.click(menuItem('Clear'))
    expect(colourAt(sticker('F1'))).toBe('blank')
  })

  it('closes the menu on Escape, painting nothing', async () => {
    const { user } = renderApp()
    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    expect(screen.getByRole('menu')).toBeTruthy()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(colourAt(sticker('F1'))).toBe('blank')
  })

  it('refuses a tenth sticker of a colour', async () => {
    const { user } = renderApp()
    await user.click(swatch('white'))
    // The white centre makes nine with these eight.
    for (const name of ['U1', 'U2', 'U3', 'U4', 'U6', 'U7', 'U8', 'U9']) {
      await user.click(stickerAt(sticker(name)))
    }
    expect(within(swatch('white')).getByText('9/9')).toBeTruthy()
    expect(swatch('white').getAttribute('aria-disabled')).toBe('true')

    await user.click(stickerAt(sticker('F1')))
    expect(colourAt(sticker('F1'))).toBe('blank')

    // And the menu refuses it too, because painting has one home.
    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    expect(menuItem('white').getAttribute('aria-disabled')).toBe('true')
    await user.click(menuItem('white'))
    expect(colourAt(sticker('F1'))).toBe('blank')
  })
})
