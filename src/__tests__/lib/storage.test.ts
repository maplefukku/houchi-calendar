import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DEFAULT_CALENDAR_DATA } from '@/lib/types'

const STORAGE_KEY = 'houchi-calendar'

function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

describe('storage', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    mockStorage = createLocalStorageMock()
    vi.stubGlobal('localStorage', mockStorage)
  })

  // Re-import the module fresh each time to avoid stale closures
  async function importStorage() {
    // Dynamic import to get fresh references that use the mocked localStorage
    const mod = await import('@/lib/storage')
    return mod
  }

  describe('getStorageData', () => {
    it('returns default data when localStorage is empty', async () => {
      const { getStorageData } = await importStorage()
      const data = getStorageData()
      expect(data).toEqual(DEFAULT_CALENDAR_DATA)
    })

    it('returns default data when localStorage has invalid JSON', async () => {
      mockStorage.setItem(STORAGE_KEY, '{{not-json}}')
      const { getStorageData } = await importStorage()
      const data = getStorageData()
      expect(data).toEqual(DEFAULT_CALENDAR_DATA)
    })

    it('merges partial data with defaults', async () => {
      const partial = { onboarded: true }
      mockStorage.setItem(STORAGE_KEY, JSON.stringify(partial))
      const { getStorageData } = await importStorage()
      const data = getStorageData()
      expect(data).toEqual({
        ...DEFAULT_CALENDAR_DATA,
        onboarded: true,
      })
    })
  })

  describe('setStorageData / getStorageData roundtrip', () => {
    it('writes to localStorage and reads it back', async () => {
      const { getStorageData, setStorageData } = await importStorage()
      const custom = {
        records: { '2026-04-07': 'yes' as const },
        settings: {
          notifyEnabled: true,
          notifyTime: '08:00',
          theme: 'dark' as const,
        },
        onboarded: true,
      }
      setStorageData(custom)
      const data = getStorageData()
      expect(data).toEqual(custom)
    })
  })
})
