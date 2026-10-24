import { useState } from 'react'
import { isDesktop } from '../storage/paths'
import { CUBEJS_TEXT, MIT_TEXT, REPOSITORY_SHOWN, REPOSITORY_URL } from './licences'
import './about.css'

/**
 * Origin: Tabiya src/ui/About.tsx, adapted: Cuber's words, two MIT notices and no GPL, and no opener plugin.
 * Who made this, how it solves, and the notices the program owes.
 *
 * It is a view in place of the cube rather than a dialog, for the reason
 * Tabiya's is: it is something to read, and it sits in the nav beside the
 * theme toggle. The cube and any solution stay exactly as they were behind it,
 * because the provider holds them and this only replaces what `main` shows.
 *
 * The version is `__APP_VERSION__`, the build-time value the header shows. A
 * version written here by hand would be wrong by the next release.
 *
 * The repository address is a link in a browser and plain text in the desktop
 * window. Cuber ships no Tauri plugins (spec 11.4), and a `target="_blank"`
 * anchor inside the window would be blocked or would navigate the app itself,
 * so the address is shown to be typed rather than clicked.
 */
export function About() {
  const [licences, setLicences] = useState(false)
  return (
    <div className="about">
      <h2>
        Cuber <span className="app-version">v{__APP_VERSION__}</span>
      </h2>
      <p>
        Made by Nick Walker. The screen follows a drawing by his son, who wanted an app that
        would solve his cube. The source code is at <RepositoryAddress />.
      </p>

      <h3>How it solves</h3>
      <p>
        Quick solve and Fewest moves use Kociemba's two-phase algorithm, from the cubejs
        library by Petri Lehtinen and Ludovic Fernandez. Quick solve takes the first answer
        under 22 moves; Fewest moves asks for one move, then two, and so on, so a lightly
        scrambled cube comes back as its own undo. The Beginner method is Cuber's own code:
        the layer-by-layer method every guide teaches, in seven named stages, so you learn
        the method rather than copy the moves.
      </p>

      <h3>Licence</h3>
      <p>
        Cuber is copyright (c) 2026 Nick Walker and is free software under the MIT licence:
        you may use it, copy it, change it and share it, and it comes with no warranty. The
        solver library it contains is MIT too, under its own authors' copyright.
      </p>
      <p>
        <button
          type="button"
          aria-expanded={licences}
          aria-controls="about-licences"
          onClick={() => setLicences(!licences)}
        >
          View the licences
        </button>
      </p>
      {licences ? <Licences /> : null}
    </div>
  )
}

/** The full texts, offline, read from the two licence files at build time. */
export function Licences() {
  return (
    <div id="about-licences" className="licences">
      <h4>Cuber: the MIT licence</h4>
      <pre>{MIT_TEXT}</pre>
      <h4>cubejs, the solver: the MIT licence</h4>
      <pre>{CUBEJS_TEXT}</pre>
    </div>
  )
}

function RepositoryAddress() {
  if (isDesktop()) return <span className="about-address">{REPOSITORY_SHOWN}</span>
  return (
    <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
      {REPOSITORY_SHOWN}
    </a>
  )
}
