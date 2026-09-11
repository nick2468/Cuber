import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { toText } from '../model/cube-text'
import { blank } from '../model/cube'
import { isDesktop } from './paths'
import { read, readOneOf, useRememberedCube, useSpeed, write } from './prefs'

// Node has no `localStorage`, which is exactly a browser that refuses storage.
describe('the remembered choices, with no storage at all', () => {
  it('read nothing and write without complaint', () => {
    expect(read('cuber.speed')).toBeNull()
    expect(() => write('cuber.speed', 'fast')).not.toThrow()
    expect(readOneOf('cuber.speed', ['slow', 'normal', 'fast'] as const, 'normal')).toBe('normal')
  })

  it('start from the defaults: normal speed and the blank cube', () => {
    function Probe() {
      const { speed } = useSpeed()
      const { cube } = useRememberedCube()
      return createElement('p', null, `${speed} ${toText(cube)}`)
    }
    expect(renderToStaticMarkup(createElement(Probe))).toBe(`<p>normal ${toText(blank())}</p>`)
  })

  it('know this is not the desktop app', () => {
    expect(isDesktop()).toBe(false)
  })
})
