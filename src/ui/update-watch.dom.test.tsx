import { afterEach, describe, expect, it } from 'vitest'

import { renderApp } from '../test/dom'

/**
 * The one rule the Tauri window depends on: no service worker inside it.
 *
 * A WebView2 app takes a new version from the installer. A service worker
 * holding an old bundle inside that window would make "new code reaches the
 * window after a reinstall" untrue, and the person who reinstalled would have
 * no way to tell (spec C21). So `UpdateWatch`, which is the only caller of
 * `useUpdate`, is rendered only when `isDesktop()` is false.
 *
 * `isDesktop()` reads `__TAURI_INTERNALS__` off the window, which is what Tauri
 * itself puts there, so the test sets and removes exactly that.
 */
function pretendTauriWindow() {
  ;(window as unknown as Record<string, unknown>)['__TAURI_INTERNALS__'] = {}
}

afterEach(() => {
  delete (window as unknown as Record<string, unknown>)['__TAURI_INTERNALS__']
})

describe('watching for a new version', () => {
  it('is mounted in a browser', () => {
    renderApp()

    expect(document.querySelector('.update-watch')).not.toBeNull()
  })

  it('is not mounted inside the Tauri window', () => {
    pretendTauriWindow()
    renderApp()

    expect(document.querySelector('.update-watch')).toBeNull()
  })
})
