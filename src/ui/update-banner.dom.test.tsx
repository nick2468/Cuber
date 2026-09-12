import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UpdateBanner } from './UpdateBanner'
import { updateNotice } from './updates'

/**
 * The bar a person actually presses.
 *
 * `updates.test.ts` checks the words without a browser. This checks that both
 * buttons are there and that each one calls the right thing: the two are easy
 * to swap, and swapping them would make "Not now" reload the page, which is
 * the one outcome the waiting worker exists to avoid.
 */
describe('the update banner', () => {
  it('shows the notice with both buttons', () => {
    render(<UpdateBanner onUpdate={() => {}} onLater={() => {}} />)

    const notice = updateNotice()
    expect(screen.getByText(notice.heading)).toBeTruthy()
    expect(screen.getByText(notice.detail)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeTruthy()
    expect(screen.getByRole('button', { name: notice.confirmLabel })).toBeTruthy()
  })

  it('calls onLater for Not now and onUpdate for Load it', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onLater = vi.fn()
    render(<UpdateBanner onUpdate={onUpdate} onLater={onLater} />)

    await user.click(screen.getByRole('button', { name: 'Not now' }))
    expect(onLater).toHaveBeenCalledTimes(1)
    expect(onUpdate).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Load it' }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onLater).toHaveBeenCalledTimes(1)
  })
})
