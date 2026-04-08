import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// @supabase/ssr をモック
const mockGetSession = vi.fn()
const mockCreateServerClient = vi.fn().mockReturnValue({
  auth: { getSession: mockGetSession },
})

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

import { proxy } from '@/proxy'

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    mockGetSession.mockResolvedValue({ data: { session: null } })
  })

  it('認証不要のパスは通過する', async () => {
    const request = new NextRequest('http://localhost:3000/')
    const response = await proxy(request)
    expect(response.status).toBe(200)
  })

  it('保護パスに未認証でアクセスするとリダイレクトする', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    const request = new NextRequest('http://localhost:3000/history')
    const response = await proxy(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/')
  })

  it('保護パスに認証済みでアクセスすると通過する', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: '123' } } },
    })
    const request = new NextRequest('http://localhost:3000/history')
    const response = await proxy(request)
    expect(response.status).toBe(200)
  })

  it('/settingsパスも保護されている', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    const request = new NextRequest('http://localhost:3000/settings')
    const response = await proxy(request)
    expect(response.status).toBe(307)
  })

  it('cookie操作のsetAllが正しく動作する', async () => {
    const request = new NextRequest('http://localhost:3000/')
    await proxy(request)

    // createServerClientに渡されたcookiesオプションのsetAllをテスト
    const cookiesOption = mockCreateServerClient.mock.calls[0][2].cookies

    // getAll
    const cookies = cookiesOption.getAll()
    expect(Array.isArray(cookies)).toBe(true)

    // setAll - cookieを設定
    cookiesOption.setAll([
      { name: 'test-cookie', value: 'test-value', options: { path: '/' } },
    ])

    // リクエストのcookieにセットされたことを確認
    expect(request.cookies.get('test-cookie')?.value).toBe('test-value')
  })
})
