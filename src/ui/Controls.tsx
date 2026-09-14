import { METHODS, methodWord } from '../model/methods'
import { SPEEDS, speedWord } from '../model/speeds'
import { useCube } from './cube-state'

/**
 * The row at the top of the box: five buttons that walk the solution, the
 * three speeds and the three methods (spec 9.2, 9.5).
 *
 * The arrows are shapes, so each carries a written name for a screen reader
 * and for its tooltip, the way the trainer's stepping arrows do.
 */
export function Controls() {
  const {
    solution,
    step,
    playing,
    turning,
    viewChanging,
    speed,
    setSpeed,
    method,
    setMethod,
    jumpToStart,
    stepBack,
    play,
    pause,
    stepForward,
    jumpToEnd,
  } = useCube()

  // One place decides whether the controls are live: there has to be a
  // solution, and the cube has to be standing still.
  const live = solution !== null && turning === null && !viewChanging
  const canGoBack = live && step > 0
  const canGoOn = live && step < (solution?.revealed ?? 0)

  return (
    <div className="controls">
      <div className="control-buttons">
        <button
          type="button"
          aria-label="Jump to start"
          title="Jump to start"
          disabled={!canGoBack}
          onClick={jumpToStart}
        >
          |&lt;
        </button>
        <button
          type="button"
          aria-label="Step back"
          title="Step back"
          disabled={!canGoBack}
          onClick={stepBack}
        >
          &lt;
        </button>
        <button
          type="button"
          className="play-button"
          disabled={playing ? !live : !canGoOn}
          onClick={playing ? pause : play}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          aria-label="Step forward"
          title="Step forward"
          disabled={!canGoOn}
          onClick={stepForward}
        >
          &gt;
        </button>
        <button
          type="button"
          aria-label="Jump to end"
          title="Jump to end"
          disabled={!canGoOn}
          onClick={jumpToEnd}
        >
          &gt;|
        </button>
      </div>

      <fieldset className="choices">
        <legend>Speed</legend>
        {SPEEDS.map((each) => (
          <label key={each}>
            <input
              type="radio"
              name="speed"
              checked={speed === each}
              onChange={() => setSpeed(each)}
            />
            {speedWord(each)}
          </label>
        ))}
      </fieldset>

      <fieldset className="choices">
        <legend>Method</legend>
        {METHODS.map((each) => (
          <label key={each}>
            <input
              type="radio"
              name="method"
              checked={method === each}
              onChange={() => setMethod(each)}
            />
            {methodWord(each)}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
