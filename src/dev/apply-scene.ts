import { toText } from '../model/cube-text'
import { CUBE_KEY, SPEED_KEY, THEME_KEY, write } from '../storage/prefs'
import { sceneCube, sceneFromLocation, type Scene } from './scenes'

/**
 * Puts a scene into storage, which is how the app comes up in it.
 *
 * Storage rather than state, because the theme, the speed and the cube are
 * each read once by a hook when it mounts (spec 10). Writing them first means
 * the app opens in the scene by its own ordinary path: no second way to set
 * the cube, and nothing on screen that only exists for a screenshot.
 *
 * So `App` calls this ONCE, before the provider mounts. It is a real write to
 * real storage, so a drive that used a scene leaves the browser holding that
 * cube: clear the storage afterwards (the plan's rule 12).
 *
 * Development builds only. The caller guards with `import.meta.env.DEV`.
 */
export function applyDevScene(search: string): Scene | null {
  const scene = sceneFromLocation(search)
  if (!scene) return null
  write(CUBE_KEY, toText(sceneCube(scene.scene)))
  write(THEME_KEY, scene.theme)
  write(SPEED_KEY, scene.speed)
  return scene
}
