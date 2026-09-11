/**
 * Origin: London src/storage/paths.ts, adapted: cut to isDesktop and LOCAL_FOLDER; the comments describe this app.
 * Where the app keeps its data.
 *
 * Cuber reads and writes no files (spec 11.4). All it keeps is in
 * `localStorage`, which on Windows lives in the window's browser profile, so
 * the one folder it owns is the one that profile sits in.
 *
 * Tauri is imported lazily, behind `isDesktop()`, and only from here (spec
 * C18). Version 1 makes no Tauri call at all, so there is nothing to import
 * yet; the rule is kept for when one arrives.
 */

/**
 * The app's folder under the user's LOCAL data folder, which holds the
 * window's browser profile: `%LOCALAPPDATA%\Cuber Data\WebView2`.
 *
 * The same literal goes into `src-tauri/src/lib.rs`, which builds the
 * window's profile folder from it, and into the uninstaller's hook, which
 * removes it on a ticked uninstall (phase 5).
 */
export const LOCAL_FOLDER = 'Cuber Data'

/** True when the app is running inside the Tauri window rather than a browser. */
export function isDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}
