import { useTheme } from './theme'
import './app.css'

/**
 * Origin: SimpleChess src/ui/App.tsx (London's, adapted), adapted: the name.
 * The app shell: the header, and the one screen under it (spec section 4).
 *
 * The header holds the name with the version beside it, and the theme toggle.
 * Reset cube, Solve and Hint join it in phases 2 and 3. There is no nav to a
 * second screen, because there is no second screen (spec C1).
 */
export function App() {
  const { theme, toggle } = useTheme()
  const switchTo = theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Cuber <span className="app-version">v{__APP_VERSION__}</span>
        </h1>
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

      <main />
    </div>
  )
}
