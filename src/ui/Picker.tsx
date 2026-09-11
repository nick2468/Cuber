import { COLOURS, hexOf } from '../model/colours'
import { useCube } from './cube-state'

/**
 * The six colours at the top right, in the drawing's order, each with how
 * many stickers carry it (spec 4).
 *
 * A colour already on nine stickers is greyed and cannot be picked, which is
 * the first validation rule: the commonest mistake cannot be made at all
 * (spec C9).
 */
export function Picker() {
  const { counts, selected, select } = useCube()

  return (
    <fieldset className="picker">
      <legend>Colours</legend>
      <div className="swatches">
        {COLOURS.map((colour) => {
          const used = counts[colour]
          const usedUp = used >= 9
          return (
            <button
              key={colour}
              type="button"
              className={selected === colour ? 'swatch chosen' : 'swatch'}
              aria-label={colour}
              aria-pressed={selected === colour}
              aria-disabled={usedUp || undefined}
              onClick={() => {
                if (!usedUp) select(colour)
              }}
            >
              <span className="swatch-colour" style={{ background: hexOf(colour) }} />
              <span className="swatch-count">{used}/9</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
