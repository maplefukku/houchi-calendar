import { describe, it, expect, vi } from 'vitest'

// next/navigation の redirect をモック
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

import SignupPage from '@/app/signup/page'

describe('SignupPage', () => {
  it('ホームにリダイレクトする', () => {
    SignupPage()
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
})
