import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { renderApp } from '../test/dom'

/**
 * The About view: reached from the nav, says who and what, shows the two
 * licence texts on request, and goes away again with the cube untouched.
 */
afterEach(() => {
  delete (window as unknown as Record<string, unknown>)['__TAURI_INTERNALS__']
})

describe('About', () => {
  it('opens from the nav with the version and the two notices, and closes again', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: 'About' }))

    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain(`v${__APP_VERSION__}`)
    expect(
      screen.getByRole('link', { name: 'github.com/nick2468/Cuber' }).getAttribute('href'),
    ).toBe('https://github.com/nick2468/Cuber')
    expect(document.querySelector('.scene')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'View the licences' }))
    const texts = document.querySelectorAll('#about-licences pre')
    expect(texts).toHaveLength(2)
    expect(texts[0].textContent).toContain('Copyright (c) 2026 Nick Walker')
    expect(texts[1].textContent).toContain('Petri Lehtinen')

    await user.click(screen.getByRole('button', { name: 'Cube' }))
    expect(document.querySelector('.scene')).not.toBeNull()
  })

  it('shows the address as text in the desktop window, where nothing may open a link', async () => {
    ;(window as unknown as Record<string, unknown>)['__TAURI_INTERNALS__'] = {}
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: 'About' }))
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('github.com/nick2468/Cuber')).toBeTruthy()
  })
})
