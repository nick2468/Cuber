import { describe, expect, it } from 'vitest'
import { sticker } from '../model/geometry'
import { colourAt, renderApp, status, stickerAt, swatch } from '../test/dom'

// C19 item 15, the cube's half. The speed is phase 3's.
describe('the cube between sessions', () => {
  it('is still there when the app is opened again', async () => {
    const first = renderApp()
    await first.user.click(stickerAt(sticker('U1')))
    await first.user.click(swatch('blue'))
    await first.user.click(stickerAt(sticker('F1')))
    await first.user.click(stickerAt(sticker('B9')))
    first.unmount()

    renderApp()
    expect(colourAt(sticker('U1'))).toBe('red')
    expect(colourAt(sticker('F1'))).toBe('blue')
    expect(colourAt(sticker('B9'))).toBe('blue')
    expect(status()).toBe('Fill in the stickers. 3 of 48 done.')
  })

  it('starts from the blank cube when what was stored is not a cube', () => {
    window.localStorage.setItem('cuber.cube', 'not a cube at all')
    renderApp()

    expect(status()).toBe('Fill in the stickers. 0 of 48 done.')
    expect(colourAt(sticker('U5'))).toBe('white')
  })
})
