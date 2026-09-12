/**
 * Origin: Conquest src/ui/updates.ts, adapted: one notice.
 * Telling the user when a new version is ready.
 *
 * The service worker is set to WAIT rather than update on its own, because an
 * automatic reload would land in the middle of stepping through a solution.
 * See the comment in vite.config.ts.
 *
 * The cost of waiting is that an update is invisible: there is no way to know
 * whether the iPad is running the newest version short of looking for a
 * feature and guessing. This makes it visible without making it forced.
 *
 * ONE notice, where Conquest has two. Conquest asks whether a game is in
 * progress, because a game lives only in memory and loading a new version ends
 * it. Cuber remembers the cube, the theme and the speed in storage (spec 10),
 * so loading a new version costs nothing and there is only one thing to say.
 *
 * No React here, so the wording is tested without a browser.
 */

export interface UpdateNotice {
  readonly heading: string
  readonly detail: string
  readonly confirmLabel: string
}

/** What to say about a waiting update. */
export function updateNotice(): UpdateNotice {
  return {
    heading: 'A new version is ready',
    detail: 'Your cube and settings are remembered, so loading it loses nothing.',
    confirmLabel: 'Load it',
  }
}
