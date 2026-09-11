import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Colour } from '../model/colours'
import { Shell } from '../ui/App'
import { CubeProvider } from '../ui/cube-context'
import type { Durations } from '../ui/cube-state'

/**
 * Origin: SimpleChess src/test/dom.tsx (London's, adapted), adapted: the provider, the durations and this app's helpers.
 * The app in jsdom, driven the way a person drives it.
 *
 * The real components inside the real provider, so the code under test is the
 * code that ships. Only the durations change: a test that waited 1.2 seconds
 * for the view to turn would be a slow test of a `setTimeout`.
 */

/** Fast enough not to wait, slow enough that each step can be seen in turn. */
export const QUICK: Durations = { movement: 0, pause: 0, check: 0, arm: 3000 }

export function renderApp(options: { durations?: Partial<Durations> } = {}) {
  const user = userEvent.setup()
  const durations = { ...QUICK, ...options.durations }
  const view = render(
    <CubeProvider durations={durations}>
      <Shell />
    </CubeProvider>,
  )
  return { user, ...view }
}

/** One sticker, by the index the model numbers it with (spec C7). */
export function stickerAt(index: number): HTMLElement {
  const found = document.querySelector<HTMLElement>(`[data-sticker="${index}"]`)
  if (!found) throw new Error(`There is no sticker ${index} on the screen.`)
  return found
}

/** What a sticker is showing, as its accessible name says it. */
export function colourAt(index: number): string {
  return stickerAt(index).getAttribute('aria-label')?.split(', ').at(-1) ?? ''
}

/** A colour's swatch in the picker, which is a different button from the menu's. */
export function swatch(colour: Colour): HTMLElement {
  return within(screen.getByRole('group', { name: 'Colours' })).getByRole('button', { name: colour })
}

/** A colour, or Clear, in the open menu. */
export function menuItem(name: string): HTMLElement {
  return within(screen.getByRole('menu')).getByRole('menuitem', { name })
}

/** What the status line says under the cube. */
export function status(): string {
  return screen.getByRole('status').textContent ?? ''
}
