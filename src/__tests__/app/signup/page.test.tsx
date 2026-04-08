import { describe, it, expect, vi } from 'vitest'

const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
  },
}))

import SignupPage from '@/app/signup/page'

describe('SignupPage', () => {
  it('redirects to home page', () => {
    SignupPage()
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
})
