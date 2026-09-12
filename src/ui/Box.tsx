import { useEffect, useRef } from 'react'
import type { Move } from '../model/moves'
import { moveSentence } from '../model/notation'
import { Controls } from './Controls'
import { useCube } from './cube-state'
import './box.css'

/**
 * The box across the bottom: the controls, how to hold the cube, and the
 * moves (spec 8, 9.1).
 *
 * Every move is a letter and a sentence, because the letters are the standard
 * every cube book uses and the sentence means nobody has to learn them first
 * (spec C11). The move the cube is standing on is the one to make next, and it
 * is the one marked.
 */

const HOLDING =
  'Hold the cube as you entered it: the same face at the front and the same face on top. Clockwise means as you look straight at that face.'

export function Box() {
  const { solution, step, solving } = useCube()
  // While only some of the moves are shown, they are hints rather than steps
  // of a solution, and the box does not give away how many are left (spec C13).
  const hinting = solution !== null && solution.revealed < solution.moves.length

  return (
    <div className="box">
      <Controls />

      {solving ? <p className="box-empty">Working it out...</p> : null}

      {!solving && !solution ? (
        <p className="box-empty">Press Solve and the steps appear here.</p>
      ) : null}

      {!solving && solution ? (
        <>
          <p className="holding">{HOLDING}</p>
          <ol className="moves">
            {solution.moves.slice(0, solution.revealed).map((move, at) => (
              <MoveRow key={at} at={at} move={move} hinting={hinting} current={at === step} />
            ))}
          </ol>
          {step === solution.moves.length ? (
            <p className="done">Done. Your cube is solved.</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function MoveRow({
  at,
  move,
  hinting,
  current,
}: {
  at: number
  move: Move
  hinting: boolean
  current: boolean
}) {
  const row = useRef<HTMLLIElement>(null)

  useEffect(() => {
    // A long solution scrolls inside the box, so the move to make next has to
    // be brought to where it can be seen. jsdom has no layout, hence the guard.
    if (current) row.current?.scrollIntoView?.({ block: 'nearest' })
  }, [current])

  return (
    <li
      ref={row}
      className={current ? 'move-row here' : 'move-row'}
      aria-current={current ? 'step' : undefined}
    >
      <span className="move-number">{hinting ? `Hint ${at + 1}:` : `${at + 1}.`}</span>
      <span className="move-chip">{move}</span>
      <span className="move-sentence">{moveSentence(move)}</span>
    </li>
  )
}
