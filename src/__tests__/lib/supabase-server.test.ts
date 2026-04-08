import { describe, it, expect, vi, beforeEach } from 'vitest'

// @supabase/ssr をモック
const mockCreateServerClient = vi.fn().mockReturnValue({
  auth: { getSession: vi.fn() },
})

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

// next/headers をモック
const mockGetAll = vi.fn().mockReturnValue([])
const mockSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: mockGetAll,
    set: mockSet,
  }),
}))

describe('supabase server createClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('Supabaseクライアントを作成する', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const client = await createClient()
    expect(client).toBeDefined()
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    )
  })

  it('cookiesのgetAllを正しく委譲する', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    await createClient()

    // createServerClientに渡されたcookiesオプションを取得
    const cookiesOption = mockCreateServerClient.mock.calls[0][2].cookies
    cookiesOption.getAll()
    expect(mockGetAll).toHaveBeenCalled()
  })

  it('cookiesのsetAllがcookieを設定する', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    await createClient()

    const cookiesOption = mockCreateServerClient.mock.calls[0][2].cookies
    const testCookies = [
      { name: 'session', value: 'abc123', options: { path: '/' } },
    ]
    // setAllがエラーなく動作する（Server Componentではcatchされる）
    cookiesOption.setAll(testCookies)
    expect(mockSet).toHaveBeenCalledWith('session', 'abc123', { path: '/' })
  })

  it('cookiesのsetAllでエラーが発生しても例外にならない', async () => {
    // setでエラーを発生させる
    mockSet.mockImplementationOnce(() => {
      throw new Error('Server Component error')
    })

    const { createClient } = await import('@/lib/supabase/server')
    await createClient()

    const cookiesOption = mockCreateServerClient.mock.calls[0][2].cookies
    // エラーが発生しても例外にならないことを確認
    expect(() =>
      cookiesOption.setAll([
        { name: 'test', value: 'val', options: {} },
      ])
    ).not.toThrow()
  })
})
