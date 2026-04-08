import { describe, it, expect, vi } from 'vitest'

// next/navigation の redirect をモック
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

import LoginPage from '@/app/login/page'

describe('LoginPage', () => {
  it('ホームにリダイレクトする', () => {
    LoginPage()
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
})
