import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getStorageData, setStorageData } from '@/lib/storage'
import { DEFAULT_CALENDAR_DATA } from '@/lib/types'

function createMockStorage(): Storage {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
}

describe('storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMockStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getStorageData', () => {
    it('returns default data when storage is empty', () => {
      expect(getStorageData()).toEqual(DEFAULT_CALENDAR_DATA)
    })

    it('returns stored data', () => {
      const data = {
        ...DEFAULT_CALENDAR_DATA,
        records: { '2026-04-07': 'yes' as const },
        onboarded: true,
      }
      localStorage.setItem('houchi-calendar', JSON.stringify(data))
      expect(getStorageData()).toEqual(data)
    })

    it('returns default on invalid JSON', () => {
      localStorage.setItem('houchi-calendar', 'not json')
      expect(getStorageData()).toEqual(DEFAULT_CALENDAR_DATA)
    })
  })

  describe('setStorageData', () => {
    it('saves data to localStorage', () => {
      const data = {
        ...DEFAULT_CALENDAR_DATA,
        records: { '2026-04-07': 'no' as const },
      }
      setStorageData(data)
      const stored = JSON.parse(localStorage.getItem('houchi-calendar')!)
      expect(stored.records['2026-04-07']).toBe('no')
    })
  })
})
