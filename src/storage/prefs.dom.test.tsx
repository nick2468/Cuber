import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { blank, solved } from '../model/cube'
import { toText } from '../model/cube-text'
import { useRememberedCube, useSpeed } from './prefs'

describe('the speed', () => {
  it('is normal at first, and a choice is written down and read back on the next mount', () => {
    const first = renderHook(() => useSpeed())
    expect(first.result.current.speed).toBe('normal')
    act(() => first.result.current.setSpeed('fast'))
    expect(first.result.current.speed).toBe('fast')
    expect(window.localStorage.getItem('cuber.speed')).toBe('fast')
    first.unmount()

    expect(renderHook(() => useSpeed()).result.current.speed).toBe('fast')
  })

  it('falls back to normal when storage says something else', () => {
    window.localStorage.setItem('cuber.speed', 'warp')
    expect(renderHook(() => useSpeed()).result.current.speed).toBe('normal')
  })
})

// C19 item 7, the hook half: a scrambled stored value gives the blank cube.
describe('the remembered cube', () => {
  it('is blank at first, and a change is written down and read back on the next mount', () => {
    const first = renderHook(() => useRememberedCube())
    expect(first.result.current.cube).toEqual(blank())
    act(() => first.result.current.setCube(solved()))
    expect(window.localStorage.getItem('cuber.cube')).toBe(toText(solved()))
    first.unmount()

    expect(renderHook(() => useRememberedCube()).result.current.cube).toEqual(solved())
  })

  it('is the blank cube when the stored value is scrambled', () => {
    window.localStorage.setItem('cuber.cube', 'not a cube')
    expect(renderHook(() => useRememberedCube()).result.current.cube).toEqual(blank())
  })
})
