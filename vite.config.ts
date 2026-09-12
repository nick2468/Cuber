import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// Origin: SimpleChess vite.config.ts (London's, adapted), adapted: the port is 5190, with strictPort.
// The version the app shows comes from package.json, read here at BUILD time
// and substituted into the bundle. Not from a Tauri call: the browser build has
// no Tauri, and a number the app has to ask for at runtime is a number that can
// be missing on the one screen that shows it.
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // What turns the page into something you add to the Home Screen. It writes
    // the manifest and a service worker that stores the whole app, so it opens
    // and solves a cube with no internet at all (spec 12).
    VitePWA({
      // 'prompt', NOT 'autoUpdate'. An automatic update reloads the page the
      // moment a new version arrives, which would throw away a step part way
      // through a solution. Waiting means the user is offered the new version
      // and chooses when to take it (src/ui/updates.ts).
      registerType: 'prompt',
      // The app registers the worker itself, through useRegisterSW, so it can
      // show a bar when a new version is waiting. 'auto' would register it
      // behind our back and the app would never hear about the update.
      injectRegister: null,
      includeAssets: ['apple-touch-icon.png', 'favicon-32.png', 'icon.svg'],

      manifest: {
        name: 'Cuber',
        short_name: 'Cuber',
        description: 'Solves a Rubik\'s Cube from its colours.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        // The dark ground, and the same value as --ground in src/index.css and
        // the theme-color meta in index.html. iPadOS paints it around the app
        // before the page has loaded, so a different value here would show as a
        // flash of the wrong colour.
        background_color: '#16181c',
        theme_color: '#16181c',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      // The solver's worker is its own chunk of about 17 kB, so the js glob
      // stores it like any other and no size limit is needed.
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'] },

      // No service worker while developing. A cached old build during
      // development wastes hours and teaches nothing.
      devOptions: { enabled: false },
    }),
  ],
  define: { __APP_VERSION__: JSON.stringify(version) },
  // Honour PORT so a launcher can place the dev server. The default is 5190,
  // not Vite's own 5173: 5173 is dc.web, 5175 is the trainer, 5180 and 5181
  // are Conquest, and 5185 and 5186 are Simple Chess, all on this machine, and
  // the `dev` script names 5190 with --strictPort. A config that still said
  // 5173 was one bare `npx vite` away from serving this app where another
  // project answers, which is how the trainer's window once showed someone
  // else's site.
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5190, strictPort: true },
  test: {
    /**
     * Two kinds of test, and they want different rooms.
     *
     * The `.test.ts` files render React to a STRING and assert on the markup.
     * They need no DOM, they run in milliseconds, and they are the bar that
     * runs on every change.
     *
     * The `.dom.test.tsx` files mount the app in jsdom and drive it the way a
     * person does, because three identity bugs in the trainer's
     * `play-context.tsx` passed every string test and were found only by
     * playing in the browser. They cost seconds rather than milliseconds,
     * which is why they are a separate kind rather than the default.
     *
     * `projects` rather than `environmentMatchGlobs`: the glob form is
     * deprecated, and two projects also keep the node tests from paying for
     * jsdom's globals. `npx vitest run` still runs both, which is the point.
     */
    projects: [
      {
        extends: true,
        test: {
          name: 'string',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.dom.test.tsx'],
          setupFiles: ['src/test/dom-setup.ts'],
        },
      },
    ],
  },
})
