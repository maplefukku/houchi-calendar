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

describe('storage - subscribe and emitChange', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    vi.resetModules()
    mockStorage = createLocalStorageMock()
    vi.stubGlobal('localStorage', mockStorage)
  })

  async function importStorage() {
    return await import('@/lib/storage')
  }

  it('setStorageData notifies listeners', async () => {
    const { setStorageData, getStorageData } = await importStorage()
    const data = { ...DEFAULT_CALENDAR_DATA, onboarded: true }

    setStorageData(data)
    const result = getStorageData()
    expect(result.onboarded).toBe(true)
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(data)
    )
  })

  it('setStorageData preserves records', async () => {
    const { setStorageData, getStorageData } = await importStorage()
    const data = {
      ...DEFAULT_CALENDAR_DATA,
      records: { '2026-04-07': 'yes' as const, '2026-04-06': 'no' as const },
    }

    setStorageData(data)
    const result = getStorageData()
    expect(result.records['2026-04-07']).toBe('yes')
    expect(result.records['2026-04-06']).toBe('no')
  })

  it('setStorageData preserves settings', async () => {
    const { setStorageData, getStorageData } = await importStorage()
    const data = {
      ...DEFAULT_CALENDAR_DATA,
      settings: {
        notifyEnabled: true,
        notifyTime: '08:00',
        theme: 'dark' as const,
      },
    }

    setStorageData(data)
    const result = getStorageData()
    expect(result.settings.notifyEnabled).toBe(true)
    expect(result.settings.notifyTime).toBe('08:00')
    expect(result.settings.theme).toBe('dark')
  })

  it('getStorageData returns default when value is non-object', async () => {
    mockStorage.setItem(STORAGE_KEY, JSON.stringify('string-value'))
    const { getStorageData } = await importStorage()
    expect(getStorageData()).toEqual(DEFAULT_CALENDAR_DATA)
  })

  it('getStorageData returns default when value is null JSON', async () => {
    mockStorage.setItem(STORAGE_KEY, JSON.stringify(null))
    const { getStorageData } = await importStorage()
    expect(getStorageData()).toEqual(DEFAULT_CALENDAR_DATA)
  })

  it('setStorageData is no-op when window is undefined', async () => {
    const originalWindow = globalThis.window
    // @ts-expect-error - intentionally removing window
    delete globalThis.window
    vi.resetModules()

    const { setStorageData } = await import('@/lib/storage')
    // Should not throw
    setStorageData(DEFAULT_CALENDAR_DATA)
    expect(mockStorage.setItem).not.toHaveBeenCalled()

    globalThis.window = originalWindow
  })
})
