import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CENTRES, solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { sticker } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves } from '../model/moves'
import { colourAt, menuItem, renderApp, status, stickerAt, swatch } from '../test/dom'

const SCRAMBLED = applyMoves(solved(), FIXED_SCRAMBLE)
/** A blue sticker that is not the blue centre, for painting red over. */
const BLUE = SCRAMBLED.findIndex((colour, index) => colour === 'blue' && !CENTRES.includes(index))

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

  it('still paints on the click straight after the menu', async () => {
    // A right click sends no click of its own, so it must arm nothing. It used
    // to arm the flag that swallows a long press's trailing click, and that
    // flag then ate the user's next real click on the same sticker.
    const { user } = renderApp()
    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    await user.click(menuItem('blue'))
    await user.click(stickerAt(sticker('F1')))
    expect(colourAt(sticker('F1'))).toBe('red')
  })

  it('closes the menu on Escape, painting nothing', async () => {
    const { user } = renderApp()
    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    expect(screen.getByRole('menu')).toBeTruthy()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(colourAt(sticker('F1'))).toBe('blank')
  })

  it('refuses a colour at nine on a blank sticker, and says so', async () => {
    const { user } = renderApp()
    await user.click(swatch('white'))
    // The white centre makes nine with these eight.
    for (const name of ['U1', 'U2', 'U3', 'U4', 'U6', 'U7', 'U8', 'U9']) {
      await user.click(stickerAt(sticker(name)))
    }
    expect(within(swatch('white')).getByText('9/9')).toBeTruthy()
    // Still a colour the user can pick, because it can go over a filled
    // sticker; it is only the blank one that refuses it (spec C9).
    expect(swatch('white').getAttribute('aria-disabled')).toBeNull()

    await user.click(stickerAt(sticker('F1')))
    expect(colourAt(sticker('F1'))).toBe('blank')
    expect(status()).toBe('White is already on nine stickers.')

    // And the menu says the same, because painting has one home.
    await user.pointer({ keys: '[MouseRight]', target: stickerAt(sticker('F1')) })
    expect(menuItem('white').getAttribute('aria-disabled')).toBeNull()
    await user.click(menuItem('white'))
    expect(colourAt(sticker('F1'))).toBe('blank')
    expect(status()).toBe('White is already on nine stickers.')

    // The next paint that works takes the line back.
    await user.click(swatch('green'))
    await user.click(stickerAt(sticker('F1')))
    expect(colourAt(sticker('F1'))).toBe('green')
    expect(status()).toBe('Fill in the stickers. 9 of 48 done.')
  })

  it('paints a colour at nine over a filled sticker, and counts it', async () => {
    window.localStorage.setItem('cuber.cube', toText(SCRAMBLED))
    const { user } = renderApp()
    expect(status()).toBe('Ready. Press Solve.')
    expect(colourAt(BLUE)).toBe('blue')

    // Red is on nine stickers, as every colour is on a complete cube. It
    // still goes over a blue one, and the count rule then says what is off.
    await user.click(swatch('red'))
    await user.click(stickerAt(BLUE))
    expect(colourAt(BLUE)).toBe('red')
    expect(status()).toBe('There are ten red stickers. A cube has nine of each.')
  })
})
