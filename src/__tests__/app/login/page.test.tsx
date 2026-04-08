import { describe, it, expect, vi } from 'vitest'

const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
  },
}))

import LoginPage from '@/app/login/page'

describe('LoginPage', () => {
  it('redirects to home page', () => {
    LoginPage()
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
})
