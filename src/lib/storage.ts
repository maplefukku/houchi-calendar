'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { CalendarData, DEFAULT_CALENDAR_DATA } from './types'

const STORAGE_KEY = 'houchi-calendar'

type Listener = () => void
const listeners = new Set<Listener>()

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getStorageData(): CalendarData {
  if (typeof window === 'undefined') {
    return DEFAULT_CALENDAR_DATA
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CALENDAR_DATA
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) {
      return { ...DEFAULT_CALENDAR_DATA, ...(parsed as Partial<CalendarData>) }
    }
    return DEFAULT_CALENDAR_DATA
  } catch {
    return DEFAULT_CALENDAR_DATA
  }
}

export function setStorageData(data: CalendarData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  emitChange()
}

function getSnapshot(): CalendarData {
  return getStorageData()
}

function getServerSnapshot(): CalendarData {
  return DEFAULT_CALENDAR_DATA
}

export function useCalendarData(): {
  data: CalendarData
  setRecord: (date: string, value: 'yes' | 'no') => void
  setSettings: (settings: Partial<CalendarData['settings']>) => void
  setOnboarded: (value: boolean) => void
} {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setRecord = useCallback((date: string, value: 'yes' | 'no') => {
    const current = getStorageData()
    setStorageData({
      ...current,
      records: { ...current.records, [date]: value },
    })
  }, [])

  const setSettings = useCallback(
    (settings: Partial<CalendarData['settings']>) => {
      const current = getStorageData()
      setStorageData({
        ...current,
        settings: { ...current.settings, ...settings },
      })
    },
    []
  )

  const setOnboarded = useCallback((value: boolean) => {
    const current = getStorageData()
    setStorageData({
      ...current,
      onboarded: value,
    })
  }, [])

  return { data, setRecord, setSettings, setOnboarded }
}
