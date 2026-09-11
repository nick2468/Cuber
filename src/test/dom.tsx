import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../ui/App'

/**
 * Origin: SimpleChess src/test/dom.tsx (London's, adapted), adapted: the last sentence names this app's provider and phases.
 * The app in jsdom, driven the way a person drives it.
 *
 * The real components, so the code under test is the code that ships. There
 * are no providers yet, so this renders `App` itself. The trainer renders a
 * `Shell` inside its providers, with a fake engine handed to `PlayProvider`;
 * here the cube's provider arrives in phase 2, with a fake solver from phase 3.
 */
export function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  return { user }
}
