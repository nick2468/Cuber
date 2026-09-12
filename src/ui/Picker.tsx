import { COLOURS, hexOf } from '../model/colours'
import { useCube } from './cube-state'

/**
 * The six colours at the top right, in the drawing's order, each with how
 * many stickers carry it (spec 4).
 *
 * Every colour can be picked, whatever its count. A colour already on nine
 * stickers shows its count faintly, because there is nothing left to fill in
 * with it, but it is still what a user paints over a sticker they got wrong
 * (spec C9, as ruled at gate 3).
 */
export function Picker() {
  const { counts, selected, select } = useCube()

  return (
    <fieldset className="picker">
      <legend>Colours</legend>
      <div className="swatches">
        {COLOURS.map((colour) => {
          const used = counts[colour]
          return (
            <button
              key={colour}
              type="button"
              className={selected === colour ? 'swatch chosen' : 'swatch'}
              aria-label={colour}
              aria-pressed={selected === colour}
              onClick={() => select(colour)}
            >
              <span className="swatch-colour" style={{ background: hexOf(colour) }} />
              <span className={used >= 9 ? 'swatch-count all-nine' : 'swatch-count'}>{used}/9</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
