import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/dom'

/**
 * The header: the name, the version and the theme toggle (spec 4 and 4.3).
 *
 * The version is `__APP_VERSION__` rather than a second read of package.json:
 * `version.test.ts` already holds that constant to package.json, so the two
 * tests together say the header shows the declared number.
 */
describe('the header', () => {
  it('names the app and shows its version', () => {
    renderApp()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Cuber')
    expect(heading.textContent).toContain(`v${__APP_VERSION__}`)
  })

  it('opens dark, switches the theme, remembers it, and switches back', async () => {
    const { user } = renderApp()
    expect(document.documentElement.dataset.theme).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Switch to the light theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('cuber.theme')).toBe('light')

    await user.click(screen.getByRole('button', { name: 'Switch to the dark theme' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('cuber.theme')).toBe('dark')
  })
})
