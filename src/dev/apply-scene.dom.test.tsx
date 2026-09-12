import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { toText } from '../model/cube-text'
import { CUBE_KEY, SPEED_KEY, THEME_KEY, read } from '../storage/prefs'
import { colourAt, renderApp } from '../test/dom'
import { applyDevScene } from './apply-scene'
import { sceneCube } from './scenes'

/**
 * The scene reaches the screen through storage and nowhere else, which is the
 * point of doing it that way: the app opens in a scene by its own ordinary
 * path. So this writes a scene and then renders the app, which reads storage
 * the way it does on any other morning.
 *
 * A DOM test rather than a string test because storage is a browser thing.
 * `App` itself is not rendered here: it builds the real solver, and the DOM
 * suite never starts a worker (docs/testing.md).
 */
describe('applying a scene', () => {
  it('writes the cube, the theme and the speed, and the app comes up in them', () => {
    const asked = applyDevScene('?scene=scrambled&view=far&theme=light&speed=slow')
    expect(asked).toEqual({ scene: 'scrambled', view: 'far', theme: 'light', speed: 'slow' })
    expect(read(CUBE_KEY)).toBe(toText(sceneCube('scrambled')))
    expect(read(THEME_KEY)).toBe('light')
    expect(read(SPEED_KEY)).toBe('slow')

    renderApp()
    const scrambled = sceneCube('scrambled')
    for (let index = 0; index < 54; index += 1) {
      expect(colourAt(index), String(index)).toBe(scrambled[index])
    }
    expect(document.documentElement.dataset.theme).toBe('light')
    expect((screen.getByRole('radio', { name: 'Slow' }) as HTMLInputElement).checked).toBe(true)
  })

  it('writes nothing when the address bar names no scene', () => {
    expect(applyDevScene('?view=far')).toBeNull()
    expect(read(CUBE_KEY)).toBeNull()
    expect(read(THEME_KEY)).toBeNull()
    expect(read(SPEED_KEY)).toBeNull()
  })
})
