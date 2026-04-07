import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetSession = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
  })),
}))

describe('middleware', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    mockGetSession.mockReset()
  })

  it('allows public paths without session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost:3000/')
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })

  it('redirects protected paths when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost:3000/history')
    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/')
  })

  it('allows protected paths when authenticated', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    })

    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost:3000/settings')
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })

  it('exports correct matcher config', async () => {
    const { config } = await import('@/middleware')
    expect(config.matcher).toBeDefined()
    expect(config.matcher.length).toBeGreaterThan(0)
  })
})
