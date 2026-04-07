import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/status/route'

// Mock the storage module
vi.mock('@/lib/storage', () => {
  let store: Record<string, string> = {}
  return {
    getStorageData: vi.fn(() => {
      const raw = store['houchi-calendar']
      if (!raw) return { records: {}, settings: { notifyEnabled: false, notifyTime: '21:00', theme: 'system' }, onboarded: false }
      return JSON.parse(raw)
    }),
    setStorageData: vi.fn((data: unknown) => {
      store['houchi-calendar'] = JSON.stringify(data)
    }),
    __resetStore: () => { store = {} },
  }
})

function createRequest(url: string, options?: RequestInit) {
  return new Request(url, options)
}

describe('GET /api/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty days array when no records exist', async () => {
    const req = createRequest('http://localhost/api/status?year=2026&month=4')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.days).toEqual([])
  })

  it('returns 400 when year or month is missing', async () => {
    const req = createRequest('http://localhost/api/status')
    const res = await GET(req)

    expect(res.status).toBe(400)
  })
})

describe('POST /api/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('records a day status', async () => {
    const req = createRequest('http://localhost/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-04-07', did_action: true }),
    })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.date).toBe('2026-04-07')
    expect(json.did_action).toBe(true)
  })

  it('returns 400 when date is missing', async () => {
    const req = createRequest('http://localhost/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ did_action: true }),
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 when did_action is missing', async () => {
    const req = createRequest('http://localhost/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-04-07' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})
