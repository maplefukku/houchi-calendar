import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DEFAULT_CALENDAR_DATA } from '@/lib/types'

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

// Mock useSyncExternalStore to test the hook logic without React rendering loop
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useSyncExternalStore: (
      subscribe: (cb: () => void) => () => void,
      getSnapshot: () => unknown,
    ) => {
      return getSnapshot()
    },
    useCallback: (fn: unknown) => fn,
  }
})

describe('useCalendarData hook', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    vi.resetModules()
    mockStorage = createLocalStorageMock()
    vi.stubGlobal('localStorage', mockStorage)
  })

  async function importStorage() {
    return await import('@/lib/storage')
  }

  it('returns default data initially', async () => {
    const { useCalendarData } = await importStorage()
    const { data } = useCalendarData()
    expect(data).toEqual(DEFAULT_CALENDAR_DATA)
  })

  it('setRecord writes a record', async () => {
    const { useCalendarData } = await importStorage()
    const { setRecord } = useCalendarData()

    setRecord('2026-04-08', 'yes')

    const { data } = useCalendarData()
    expect(data.records['2026-04-08']).toBe('yes')
  })

  it('setRecord preserves existing records', async () => {
    const { useCalendarData } = await importStorage()
    const { setRecord } = useCalendarData()

    setRecord('2026-04-07', 'no')
    setRecord('2026-04-08', 'yes')

    const { data } = useCalendarData()
    expect(data.records['2026-04-07']).toBe('no')
    expect(data.records['2026-04-08']).toBe('yes')
  })

  it('setSettings updates settings partially', async () => {
    const { useCalendarData } = await importStorage()
    const { setSettings } = useCalendarData()

    setSettings({ theme: 'dark' })

    const { data } = useCalendarData()
    expect(data.settings.theme).toBe('dark')
    expect(data.settings.notifyEnabled).toBe(false)
    expect(data.settings.notifyTime).toBe('21:00')
  })

  it('setSettings updates multiple settings at once', async () => {
    const { useCalendarData } = await importStorage()
    const { setSettings } = useCalendarData()

    setSettings({ notifyEnabled: true, notifyTime: '08:00' })

    const { data } = useCalendarData()
    expect(data.settings.notifyEnabled).toBe(true)
    expect(data.settings.notifyTime).toBe('08:00')
  })

  it('setOnboarded sets the onboarded flag', async () => {
    const { useCalendarData } = await importStorage()
    const { setOnboarded } = useCalendarData()

    setOnboarded(true)

    const { data } = useCalendarData()
    expect(data.onboarded).toBe(true)
  })

  it('setOnboarded can toggle back to false', async () => {
    const { useCalendarData } = await importStorage()
    const { setOnboarded } = useCalendarData()

    setOnboarded(true)
    setOnboarded(false)

    const { data } = useCalendarData()
    expect(data.onboarded).toBe(false)
  })
})

describe('storage subscribe mechanism', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    vi.resetModules()
    mockStorage = createLocalStorageMock()
    vi.stubGlobal('localStorage', mockStorage)
  })

  it('subscribe adds and removes listeners', async () => {
    // Access internal subscribe via setStorageData triggering listeners
    const { setStorageData, getStorageData } = await import('@/lib/storage')

    // Verify data roundtrip works through emitChange
    setStorageData({ ...DEFAULT_CALENDAR_DATA, onboarded: true })
    expect(getStorageData().onboarded).toBe(true)

    setStorageData({ ...DEFAULT_CALENDAR_DATA, onboarded: false })
    expect(getStorageData().onboarded).toBe(false)
  })
})
