import { CubeProvider } from './cube-context'
import { HeaderButtons } from './HeaderButtons'
import { Screen } from './Screen'
import { useTheme } from './theme'
import './app.css'

/**
 * Origin: SimpleChess src/ui/App.tsx (London's, adapted), adapted: the name, and split into the shell and the provider around it.
 * The app: the header, and the one screen under it (spec section 4).
 *
 * `Shell` is everything a person sees. `App` is the shell with the cube's
 * provider around it, which is what `main.tsx` renders. They are split the way
 * the trainer splits them, so a test can put the shell inside a provider of
 * its own with the animations turned down.
 */
export function Shell() {
  const { theme, toggle } = useTheme()
  const switchTo = theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Cuber <span className="app-version">v{__APP_VERSION__}</span>
        </h1>

        <HeaderButtons />

        <nav className="app-nav">
          <button
            type="button"
            className="nav-link theme-toggle"
            onClick={toggle}
            title={switchTo}
            aria-label={switchTo}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </header>

      <main>
        <Screen />
      </main>
    </div>
  )
}

export function App() {
  return (
    <CubeProvider>
      <Shell />
    </CubeProvider>
  )
}
