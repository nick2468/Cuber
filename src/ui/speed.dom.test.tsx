import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/dom'

/** The speed radio with that word on it. */
function radio(word: string): HTMLInputElement {
  return screen.getByRole('radio', { name: word }) as HTMLInputElement
}

// C19 item 15, the speed's half. The cube's half is remembered.dom.test.tsx.
describe('the speed', () => {
  it('is normal at first, and a choice survives the app being opened again', async () => {
    const first = renderApp()
    expect(radio('Normal').checked).toBe(true)

    await first.user.click(radio('Fast'))
    expect(radio('Fast').checked).toBe(true)
    expect(window.localStorage.getItem('cuber.speed')).toBe('fast')
    first.unmount()

    renderApp()
    expect(radio('Fast').checked).toBe(true)
  })

  it('falls back to normal when what was stored is not a speed', () => {
    window.localStorage.setItem('cuber.speed', 'warp')
    renderApp()
    expect(radio('Normal').checked).toBe(true)
  })
})
