import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp, status } from '../test/dom'

function cube(): HTMLElement {
  return document.querySelector<HTMLElement>('.cube')!
}

function sticker(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('.sticker')!
}

/**
 * C19 item 16. Which faces each view shows is `viewFaces`'s own string test;
 * here it is the button, the sentences and the turning.
 *
 * The movements are shortened rather than turned off. They are a sequence of
 * three sentences, and a sequence with no time in it is over before anything
 * can look at it. 150 ms is long enough to see each step and short enough to
 * keep the file under a second. No fake timers: `waitFor` does the waiting.
 */
const SLOW = { movement: 150, pause: 0, check: 150 }

describe('showing the other side', () => {
  it('turns the cube with the two movements, saying what to do with the real one', async () => {
    const { user } = renderApp({ durations: SLOW })
    expect(cube().dataset.view).toBe('near')
    expect(cube().dataset.stage).toBe('near')

    const button = screen.getByRole('button', { name: 'Show the other side' })
    await user.click(button)

    // The first movement, and nothing can be pressed while it plays.
    expect(status()).toBe('Roll your cube over sideways so the top goes to the bottom.')
    expect(cube().dataset.stage).toBe('rolled')
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(sticker().disabled).toBe(true)

    // Then the second, then the reminder to check the centres.
    await waitFor(() =>
      expect(status()).toBe('Turn it a quarter turn so the face on your right comes to the front.'),
    )
    expect(cube().dataset.stage).toBe('far')

    await waitFor(() => expect(status()).toBe('Check the centres: they should match your cube.'))
    expect(cube().dataset.view).toBe('far')
    expect(screen.getByRole('button', { name: 'Show the first side' })).toBeTruthy()
    expect(sticker().disabled).toBe(false)

    await waitFor(() => expect(status()).toBe('Fill in the stickers. 0 of 48 done.'))
  })

  it('plays the two movements backwards to come home', async () => {
    const { user } = renderApp({ durations: SLOW })
    await user.click(screen.getByRole('button', { name: 'Show the other side' }))
    await waitFor(() => expect(cube().dataset.view).toBe('far'))

    await user.click(screen.getByRole('button', { name: 'Show the first side' }))
    expect(status()).toBe('Turn it back a quarter turn so the face on your left comes to the front.')
    expect(cube().dataset.stage).toBe('rolled')

    await waitFor(() =>
      expect(status()).toBe('Roll your cube back over so the top goes to the bottom.'),
    )
    await waitFor(() => expect(cube().dataset.view).toBe('near'))
    expect(cube().dataset.stage).toBe('near')
  })
})
