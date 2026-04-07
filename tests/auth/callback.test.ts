import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}))

describe('auth/callback route', () => {
  beforeEach(() => {
    mockExchangeCodeForSession.mockReset()
  })

  it('redirects to next path on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-code&next=/dashboard',
    )
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe(
      '/dashboard',
    )
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-code')
  })

  it('redirects to / when next is not specified', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-code',
    )
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/')
  })

  it('redirects to origin on error', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: new Error('Invalid code'),
    })

    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request(
      'http://localhost:3000/auth/callback?code=bad-code',
    )
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/')
  })

  it('redirects to origin when no code provided', async () => {
    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request('http://localhost:3000/auth/callback')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/')
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })
})
