import { UpdateBanner } from './UpdateBanner'
import { useUpdate } from './useUpdate'

/**
 * Watches for a new version and offers it.
 *
 * This exists so that `useUpdate` is called in ONE place that the shell can
 * leave out entirely. In the Tauri window there must be no service worker at
 * all (spec C21): a WebView2 app updates by installer, and a worker holding an
 * old bundle inside it would make "new code reaches the window after a
 * reinstall" untrue. The shell renders this component only when
 * `!isDesktop()`, so the hook is never called there, and the rule of hooks is
 * kept because the condition is on the component and not inside it.
 *
 * The wrapper div is always rendered, empty until a version is waiting, so a
 * test can tell "mounted and quiet" from "not mounted at all".
 */
export function UpdateWatch() {
  const update = useUpdate()

  return (
    <div className="update-watch">
      {update.waiting ? <UpdateBanner onUpdate={update.take} onLater={update.later} /> : null}
    </div>
  )
}
