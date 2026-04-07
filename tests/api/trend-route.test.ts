import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch for GLM API
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Must import after mocking
const { GET } = await import('@/app/api/trend/route')

describe('GET /api/trend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns trend analysis from GLM API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: '今月は20日中15日（75%）行動しています。',
                suggestions: ['週末は事前に計画を立てましょう'],
              }),
            },
          },
        ],
      }),
    })

    const req = new Request('http://localhost/api/trend?year=2026&month=4')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.summary).toBeDefined()
    expect(json.suggestions).toBeDefined()
    expect(Array.isArray(json.suggestions)).toBe(true)
  })

  it('returns fallback when GLM API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const req = new Request('http://localhost/api/trend?year=2026&month=4')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.summary).toBeDefined()
    expect(json.suggestions).toBeDefined()
  })
})
