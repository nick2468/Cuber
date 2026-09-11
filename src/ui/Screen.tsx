import { ColourMenu } from './ColourMenu'
import { useCube } from './cube-state'
import { Picker } from './Picker'
import { Scene } from './Scene'
import { StatusLine } from './StatusLine'

/**
 * The one screen, in the drawing's order (spec 4, C1): the picker at the top
 * right, the cube, the button that turns it round, the status line, and the
 * box across the bottom. Phase 3 fills the box.
 */
export function Screen() {
  const { view, changeView, viewChanging } = useCube()

  return (
    <div className="screen">
      <div className="picker-row">
        <Picker />
      </div>

      <Scene />

      <button type="button" className="view-button" onClick={changeView} disabled={viewChanging}>
        {view === 'near' ? 'Show the other side' : 'Show the first side'}
      </button>

      <StatusLine />

      <div className="box">
        <p className="box-empty">Press Solve and the steps appear here.</p>
      </div>

      <ColourMenu />
    </div>
  )
}
