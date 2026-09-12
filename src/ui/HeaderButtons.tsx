import { useCube } from './cube-state'

/**
 * The three buttons in the header: Reset cube, Solve and Hint (spec 4, Q16).
 *
 * Solve and Hint are off until the cube is one a real cube could be and the
 * solver has built its tables, and while they are off their tooltip says which
 * of those it is waiting for (spec 9.1, C9). Reset asks once before it throws
 * 48 clicks away (spec C14).
 */
export function HeaderButtons() {
  const { reset, resetArmed, solve, hint, whyNotSolve } = useCube()
  const off = whyNotSolve !== null

  return (
    <div className="header-buttons">
      <button type="button" onClick={reset}>
        {resetArmed ? 'Press again to clear' : 'Reset cube'}
      </button>
      <button type="button" onClick={solve} disabled={off} title={whyNotSolve ?? undefined}>
        Solve
      </button>
      <button
        type="button"
        className="hint-button"
        aria-label="Hint"
        title={whyNotSolve ?? 'Hint: the next move, one at a time'}
        onClick={hint}
        disabled={off}
      >
        {/* A light bulb, as the drawing has it. */}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path
            d="M9 21h6M10 18h4M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1 1 1.8l.1.8h4.8l.1-.8c.1-.7.4-1.3 1-1.8A6 6 0 0 0 12 3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
