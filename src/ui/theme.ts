import { useCallback, useEffect, useState } from 'react'
import { readOneOf, write } from '../storage/prefs'

/**
 * Origin: London src/ui/theme.ts, adapted: the storage key, the comment (the trainer's spoke of its progress file), and storage read and written through src/storage/prefs.ts.
 * Dark or light, remembered between sessions.
 *
 * The choice is a display preference, kept in `localStorage` like every other
 * setting (spec section 10). Losing it costs one click. `read` and `write`
 * catch a browser that refuses storage, so the app opens dark and just forgets.
 */

export type Theme = 'dark' | 'light'

const KEY = 'cuber.theme'

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => readOneOf(KEY, ['dark', 'light'] as const, 'dark'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    write(KEY, theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}
