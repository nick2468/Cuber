import { useState } from 'react'
import { applyDevScene } from '../dev/apply-scene'
import type { Scene } from '../dev/scenes'
import { useDevScene } from '../dev/use-dev-scene'
import { isDesktop } from '../storage/paths'
import { CubeProvider } from './cube-context'
import { HeaderButtons } from './HeaderButtons'
import { Screen } from './Screen'
import { useTheme } from './theme'
import { UpdateWatch } from './UpdateWatch'
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
export function Shell({ scene = null }: { scene?: Scene | null }) {
  const { theme, toggle } = useTheme()
  useDevScene(scene)
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

      {/* Only off the desktop. The Tauri window updates by installer, so it
          registers no service worker at all (spec C21, and UpdateWatch says
          why). The condition is on the component, not inside it, so no hook is
          called conditionally. */}
      {isDesktop() ? null : <UpdateWatch />}
    </div>
  )
}

export function App() {
  // A development build reads the address bar for a scene and writes it to
  // storage here, before the provider mounts, so the hooks that read storage
  // read the scene (spec 15.1). A `useState` initialiser runs once, which is
  // what "before the provider mounts" needs. In a production build
  // `import.meta.env.DEV` is the constant false, so the branch and everything
  // it reaches are gone from the bundle.
  const [scene] = useState<Scene | null>(() =>
    import.meta.env.DEV ? applyDevScene(window.location.search) : null,
  )

  return (
    <CubeProvider initialView={scene?.view ?? 'near'}>
      <Shell scene={scene} />
    </CubeProvider>
  )
}
