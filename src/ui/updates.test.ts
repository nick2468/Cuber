import { describe, expect, it } from 'vitest'

import { updateNotice } from './updates'

/**
 * Origin: Conquest src/ui/updates.test.ts, adapted: one notice, and it promises
 * nothing is lost rather than warning that something is.
 */
describe('telling the user a new version is ready', () => {
  it('says so', () => {
    expect(updateNotice().heading).toContain('new version')
  })

  /**
   * The one thing this must not do is leave the user wondering what pressing
   * it costs. Conquest had to warn that a game would end. Cuber can promise the
   * opposite, because the cube is in storage (spec 10), and a promise only
   * holds while that stays true: if the cube ever stops being remembered, this
   * test is the thing that should fail.
   */
  it('says the cube is remembered and nothing is lost', () => {
    const notice = updateNotice()

    expect(notice.detail).toContain('remembered')
    expect(notice.detail).toContain('loses nothing')
  })

  it('labels the button', () => {
    expect(updateNotice().confirmLabel).toBe('Load it')
  })
})
