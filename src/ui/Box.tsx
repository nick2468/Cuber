import { useEffect, useRef } from 'react'
import type { Move } from '../model/moves'
import { moveSentence } from '../model/notation'
import { Controls } from './Controls'
import { useCube, type Solution } from './cube-state'
import './box.css'

/**
 * The box across the bottom: the controls, how to hold the cube, and the
 * moves (spec 8, 9.1, 9.5).
 *
 * Every move is a letter and a sentence, because the letters are the standard
 * every cube book uses and the sentence means nobody has to learn them first
 * (spec C11). The move the cube is standing on is the one to make next, and it
 * is the one marked.
 *
 * A beginner solution is the same list with headings in it: a stage's name and
 * what it is for before its first move, and the name of a sequence before the
 * moves that make it up. Nothing else changes, and the stepping, Play and Hint
 * know nothing about any of it.
 */

const HOLDING =
  'Hold the cube as you entered it: the same face at the front and the same face on top. Clockwise means as you look straight at that face.'

/** The beginner method's one extra sentence (spec 7.5). */
const START_WITH_WHITE =
  'Most guides start with white: hold the cube with white at the bottom before you enter it.'

export function Box() {
  const { solution, step, solving, method } = useCube()
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
          <p className="holding">
            {HOLDING}
            {method === 'beginner' ? ` ${START_WITH_WHITE}` : ''}
          </p>
          <ol className="moves">
            {rowsOf(solution).map((row) =>
              row.kind === 'move' ? (
                <MoveRow
                  key={row.key}
                  at={row.at}
                  move={row.move}
                  hinting={hinting}
                  current={row.at === step}
                />
              ) : row.kind === 'stage' ? (
                <StageRow key={row.key} name={row.name} sentence={row.sentence} />
              ) : (
                <LabelRow key={row.key} text={row.text} />
              ),
            )}
          </ol>
          {step === solution.moves.length ? (
            <p className="done">Done. Your cube is solved.</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

type Row =
  | { kind: 'move'; key: string; at: number; move: Move }
  | { kind: 'stage'; key: string; name: string | null; sentence: string }
  | { kind: 'label'; key: string; text: string }

/**
 * The rows the box draws, in order: every move that has been revealed, with
 * each stage's heading and each named sequence's label where the solver put
 * them.
 *
 * A heading waits for the first move under it to be revealed, so that Hint
 * gives nothing away about what is coming; a stage that needed no moves has
 * nothing to wait for and shows as soon as the box has reached it. Quick and
 * fewest-moves solutions carry no stages and no labels, so this is the same
 * list of moves it has always been.
 */
function rowsOf(solution: Solution): Row[] {
  const rows: Row[] = []
  const { moves, revealed, stages, labels } = solution
  let stage = 0
  let label = 0

  for (let at = 0; at <= revealed; at += 1) {
    while (stage < stages.length && stages[stage].from === at) {
      const each = stages[stage]
      const empty = each.from === each.to
      if (at === revealed && !empty) break
      rows.push({
        kind: 'stage',
        key: `stage-${stage}`,
        name: empty ? null : each.name,
        sentence: each.sentence,
      })
      stage += 1
    }
    while (label < labels.length && labels[label].at === at && at < revealed) {
      rows.push({ kind: 'label', key: `label-${label}`, text: labels[label].text })
      label += 1
    }
    if (at < revealed) rows.push({ kind: 'move', key: `move-${at}`, at, move: moves[at] })
  }
  return rows
}

function StageRow({ name, sentence }: { name: string | null; sentence: string }) {
  return (
    <li className={name ? 'stage-row' : 'stage-row already'}>
      {name ? <span className="stage-name">{name}</span> : null}
      <span className="stage-sentence">{sentence}</span>
    </li>
  )
}

/**
 * One named sequence, above the moves that make it up.
 *
 * The solver writes the label as "<name>: <letters>", so the letters are what
 * follows the first colon and they get the same fixed-width look the moves
 * have. A label without one reads as plain words, which is what it would be.
 */
function LabelRow({ text }: { text: string }) {
  const split = text.indexOf(': ')
  const name = split < 0 ? text : text.slice(0, split)
  const letters = split < 0 ? null : text.slice(split + 2)

  return (
    <li className="label-row">
      <span className="label-name">{name}</span>
      {letters ? <span className="label-letters">{letters}</span> : null}
    </li>
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
