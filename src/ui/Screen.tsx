import { Box } from './Box'
import { ColourMenu } from './ColourMenu'
import { useCube } from './cube-state'
import { Picker } from './Picker'
import { Scene } from './Scene'
import { StatusLine } from './StatusLine'
import { useKeys } from './useKeys'

/**
 * The one screen, in the drawing's order (spec 4, C1): the picker at the top
 * right, the cube, the button that turns it round, the status line, and the
 * box across the bottom.
 */
export function Screen() {
  const { view, changeView, viewChanging, turning } = useCube()
  useKeys()

  return (
    <div className="screen">
      <div className="picker-row">
        <Picker />
      </div>

      <Scene />

      <button
        type="button"
        className="view-button"
        onClick={changeView}
        disabled={viewChanging || turning !== null}
      >
        {view === 'near' ? 'Show the other side' : 'Show the first side'}
      </button>

      <StatusLine />

      <Box />

      <ColourMenu />
    </div>
  )
}
