import { stickersAt, type Position } from '../model/geometry'
import { useCube } from './cube-state'
import { cubieSize, useSceneSize } from './fit'
import { Sticker } from './Sticker'
import { cubieTransform, viewTransform } from './transforms'
import './scene.css'

/**
 * The cube, drawn corner-on in CSS 3D (spec C4).
 *
 * Twenty-six cubies, each carrying only the stickers on its outside, all
 * drawn from the model: the cubie at each place shows the model's stickers
 * for that place. Changing the view is one transform on the cube, so every
 * sticker is always there and the far side is simply turned towards the user.
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
const PIECES: { position: Position; stickers: number[] }[] = [-1, 0, 1].flatMap((x) =>
  [-1, 0, 1].flatMap((y) =>
    [-1, 0, 1]
      .filter((z) => x !== 0 || y !== 0 || z !== 0)
      .map((z) => ({ position: { x, y, z }, stickers: stickersAt(x, y, z) })),
  ),
)

export function Scene() {
  const { stage, view, durations } = useCube()
  const scene = useSceneSize()
  const cubie = cubieSize(scene)

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
        {PIECES.map(({ position, stickers }) => (
          <div
            key={`${position.x} ${position.y} ${position.z}`}
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
