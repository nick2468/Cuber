import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Colour } from '../model/colours'
import { solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { sticker } from '../model/geometry'
import { FIXED_SCRAMBLE, applyMoves } from '../model/moves'
import { renderApp, status, stickerAt, swatch } from '../test/dom'

type User = ReturnType<typeof renderApp>['user']

/** Paints one sticker, named the spec's way, by picking the colour first. */
async function paint(user: User, name: string, colour: Colour) {
  await user.click(swatch(colour))
  await user.click(stickerAt(sticker(name)))
}

// C19 item 10.
describe('validation on screen', () => {
  it('outlines a mirrored corner and says what is wrong', async () => {
    const { user } = renderApp()
    // The real URF corner is white, red, green clockwise. This is the mirror.
    await paint(user, 'U9', 'white')
    await paint(user, 'R1', 'green')
    await paint(user, 'F3', 'red')

    expect(status()).toBe('That corner is not a real piece. Check its three colours.')
    for (const name of ['U9', 'R1', 'F3']) {
      expect(stickerAt(sticker(name)).className).toContain('marked')
    }

    // Putting the two round the right way fixes it.
    await paint(user, 'R1', 'red')
    await paint(user, 'F3', 'green')
    expect(status()).toBe('Fill in the stickers. 3 of 48 done.')
    expect(stickerAt(sticker('U9')).className).not.toContain('marked')
  })

  it('marks two centres of one colour', async () => {
    const { user } = renderApp()
    await paint(user, 'R5', 'white')
    expect(status()).toBe('Two centres have the same colour. Every centre is different.')
    expect(stickerAt(sticker('U5')).className).toContain('marked')
    expect(stickerAt(sticker('R5')).className).toContain('marked')
  })

  it('says a piece cannot have two stickers the same colour', async () => {
    const { user } = renderApp()
    await paint(user, 'U8', 'green')
    await paint(user, 'F2', 'green')
    expect(status()).toBe('An edge cannot have two stickers the same colour.')
  })

  it('says a piece cannot have two opposite colours', async () => {
    const { user } = renderApp()
    await paint(user, 'U9', 'white')
    await paint(user, 'R1', 'yellow')
    expect(status()).toBe('A corner cannot have white and yellow: they are on opposite sides.')
  })

  it('says a complete, possible cube is ready, and Solve waits for phase 3', () => {
    window.localStorage.setItem('cuber.cube', toText(applyMoves(solved(), FIXED_SCRAMBLE)))
    renderApp()

    expect(status()).toBe('Ready. Press Solve.')
    expect(screen.getByRole('button', { name: 'Solve' }).hasAttribute('disabled')).toBe(true)
  })

  it('says what is wrong with a complete cube that cannot exist', () => {
    // A solved cube with one corner turned: every count is right and no piece
    // is impossible on its own, so only the whole-cube rules can see it.
    const cube = solved().slice()
    cube[sticker('U9')] = 'green'
    cube[sticker('R1')] = 'white'
    cube[sticker('F3')] = 'red'
    window.localStorage.setItem('cuber.cube', toText(cube))
    renderApp()

    expect(status()).toBe("One corner is twisted. Check the corners' colours.")
  })
})
