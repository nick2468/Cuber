import { useEffect, useRef } from 'react'
import type { Face } from '../model/colours'
import { inLayer, stickersAt, type Position } from '../model/geometry'
import { useCube } from './cube-state'
import { cubieSize, useSceneSize } from './fit'
import { Sticker } from './Sticker'
import { cubieTransform, viewTransform } from './transforms'
import { turnCubie } from './turn-layer'
import './scene.css'

/**
 * The cube, drawn corner-on in CSS 3D (spec C4).
 *
 * Twenty-six cubies, each carrying only the stickers on its outside, all
 * drawn from the model: the cubie at each place shows the model's stickers
 * for that place. Changing the view is one transform on the cube, so every
 * sticker is always there and the far side is simply turned towards the user.
 *
 * A move turns the nine cubies of its layer and nothing else; when the
 * provider applies the move, the turn is cancelled and the new drawing has
 * the same colours where the turn left them (spec 9.4).
 */

/**
 * How far the cube is lifted inside its scene, as a share of a cubie.
 *
 * Turned corner-on, the cube does not sit in the middle of its box: the tilt
 * brings the bottom corner towards the viewer and the perspective magnifies
 * it, so the silhouette hangs low. Measured in the pane at 22 px with a 91 px
 * cubie, which is about a quarter of one. Without the lift the bottom corner
 * covers the top of the view button.
 */
const HANGS_LOW = 0.24

/** Every place a piece sits, from the geometry. The core has no stickers. */
const PIECES: { key: string; position: Position; stickers: number[] }[] = [-1, 0, 1].flatMap((x) =>
  [-1, 0, 1].flatMap((y) =>
    [-1, 0, 1]
      .filter((z) => x !== 0 || y !== 0 || z !== 0)
      .map((z) => ({ key: `${x} ${y} ${z}`, position: { x, y, z }, stickers: stickersAt(x, y, z) })),
  ),
)

export function Scene() {
  const { stage, view, durations, turning } = useCube()
  const scene = useSceneSize()
  const cubie = cubieSize(scene)
  const cubies = useRef(new Map<string, HTMLElement>())

  useEffect(() => {
    if (!turning) return
    const face = turning.move[0] as Face
    const playing: Animation[] = []
    for (const { key, position } of PIECES) {
      if (!inLayer(face, position)) continue
      const element = cubies.current.get(key)
      if (!element) continue
      const animation = turnCubie(element, position, cubie, turning.move, turning.ms)
      if (animation) playing.push(animation)
    }
    // Cancelled when the provider commits the move and `turning` goes away:
    // the cubies fall back to their plain places, which now carry the turned
    // colours, so nothing jumps.
    return () => {
      for (const animation of playing) animation.cancel()
    }
  }, [cubie, turning])

  return (
    <div className="scene" style={{ width: scene, height: scene }}>
      <div
        className="cube"
        data-view={view}
        data-stage={stage}
        style={{
          top: `calc(50% - ${Math.round(cubie * HANGS_LOW)}px)`,
          transform: viewTransform(stage),
          transitionDuration: `${durations.movement}ms`,
        }}
      >
        {PIECES.map(({ key, position, stickers }) => (
          <div
            key={key}
            ref={(element) => {
              if (element) cubies.current.set(key, element)
              else cubies.current.delete(key)
            }}
            className="cubie"
            style={{
              width: cubie,
              height: cubie,
              transform: cubieTransform(position, cubie),
            }}
          >
            {stickers.map((index) => (
              <Sticker key={index} index={index} cubie={cubie} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
