import CUBEJS_TEXT from '../solver/vendor/LICENSE?raw'
import MIT_TEXT from '../../LICENSE?raw'

/**
 * Origin: Tabiya src/ui/licences.ts, adapted: two MIT texts and no GPL, because Cuber contains no GPL library.
 * The licence texts the About screen shows, read from their files at build
 * time and never typed in.
 *
 * Cuber's own code is MIT, from the repository's LICENSE. The solver it
 * contains, cubejs 1.3.2 (spec C5), is MIT too, under its own authors'
 * copyright, and that notice must travel with the copies; so the vendored
 * LICENSE is shown here word for word. Everything else the app depends on is
 * MIT as well (React, Vite, Tauri's API), and the installer's Rust side is
 * Apache-2.0 or MIT at the user's choice, which is what Tauri's crates say.
 */
export { CUBEJS_TEXT, MIT_TEXT }

/** The one web address the About screen names. */
export const REPOSITORY_URL = 'https://github.com/nick2468/Cuber'

/** The address as a person reads it, without the scheme. */
export const REPOSITORY_SHOWN = 'github.com/nick2468/Cuber'
