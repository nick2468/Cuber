import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * Origin: London src/test/dom-setup.ts, identical.
 * What every DOM test gets before it starts.
 *
 * `cleanup` unmounts between tests: jsdom keeps one document for the whole
 * file, so without it the second test in a file finds two copies of the app
 * and every query is ambiguous.
 *
 * `localStorage` is real here and also shared across a file, so it is emptied
 * too. The identity tests write records and read them back; one leaking into
 * the next would make them pass for the wrong reason, which is worse than
 * failing.
 *
 * No `jest-dom` matchers. `toBeDisabled` reads well and is one more dependency
 * to keep in step with React and vitest, and `expect(button.disabled).toBe(true)`
 * says the same thing about the same property.
 */
/**
 * jsdom has no layout, so it has no `scrollIntoView` either, and calling the
 * missing method throws. The move list calls it to keep the replayed move
 * visible, which is a question about layout and therefore has no answer here:
 * a no-op is the honest stand-in rather than a gap being papered over.
 */
Element.prototype.scrollIntoView = () => {}

/**
 * `virtual:pwa-register/react`, which `useUpdate` imports, has no file behind
 * it: `vite-plugin-pwa` makes the module up while it builds. Vitest resolves
 * the name to `file:///@vite-plugin-pwa/virtual:pwa-register/react` and then
 * fails to load it, which took every DOM test in the suite down with it, not
 * just the ones about updating.
 *
 * So the hook it exports is stood in for. The stand-in says no new version is
 * waiting, which is the ordinary case and the one the rest of the suite needs:
 * a banner appearing over the app would make `getByRole('status')` ambiguous
 * everywhere. The waiting case is tested by rendering `UpdateBanner` itself
 * (`update-banner.dom.test.tsx`), and the real registration is proved in a
 * browser against the built app, which is the only place it exists at all.
 */
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [false], updateServiceWorker: async () => {} }),
}))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
