import { Box } from './Box'
import { ColourMenu } from './ColourMenu'
import { useCube } from './cube-state'
import { Picker } from './Picker'
import { Scene } from './Scene'
import { StatusLine } from './StatusLine'
import { useKeys } from './useKeys'

/**
 * The one screen, in the drawing's order (spec 4, C1): the picker at the top
 * right with the button that turns the cube round under it, the cube beside
 * them, the status line, and the box across the bottom.
 */
export function Screen() {
  const { view, changeView, viewChanging, turning } = useCube()
  useKeys()

  return (
    <div className="screen">
      {/* The cube and the picker share a row (Nick, 2026-09-14). The drawing
          has the picker at the top right with the cube under it, and the space
          to the picker's left was empty: the cube moved up into it, which gives
          the page back the whole height of the picker. That is what pays for
          the Method choice, which needs a second line in the box. */}
      <div className="cube-row">
        <Scene />

        {/* The picker, and the button that turns the cube round under it
            (Nick, 2026-09-14). It was centred under the cube; beside it, it
            costs the page no height of its own either. */}
        <div className="picker-column">
          <Picker />

          <button
            type="button"
            className="view-button"
            onClick={changeView}
            disabled={viewChanging || turning !== null}
          >
            {view === 'near' ? 'Show the other side' : 'Show the first side'}
          </button>
        </div>
      </div>

      <StatusLine />

      <Box />

      <ColourMenu />
    </div>
  )
}
