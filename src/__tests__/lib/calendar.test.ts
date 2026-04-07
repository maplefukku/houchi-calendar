import { describe, it, expect } from 'vitest'
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  formatDateKey,
  formatJapaneseDate,
  formatJapaneseMonth,
  isToday,
} from '@/lib/calendar'

describe('getDaysInMonth', () => {
  it('returns 28 days for Feb 2026', () => {
    expect(getDaysInMonth(2026, 2).length).toBe(28)
  })

  it('returns 30 days for April 2026', () => {
    expect(getDaysInMonth(2026, 4).length).toBe(30)
  })

  it('returns 29 days for Feb 2024 (leap year)', () => {
    expect(getDaysInMonth(2024, 2).length).toBe(29)
  })
})

describe('getFirstDayOfWeek', () => {
  it('returns 2 (Wednesday) for April 2026', () => {
    expect(getFirstDayOfWeek(2026, 4)).toBe(2)
  })

  it('returns 3 (Thursday) for January 2026', () => {
    expect(getFirstDayOfWeek(2026, 1)).toBe(3)
  })
})

describe('formatDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date(2026, 3, 7))).toBe('2026-04-07')
  })
})

describe('formatJapaneseDate', () => {
  it('formats April 7 2026 (Tuesday) in Japanese', () => {
    expect(formatJapaneseDate(new Date(2026, 3, 7))).toBe('4月7日（火）')
  })
})

describe('formatJapaneseMonth', () => {
  it('formats year and month in Japanese', () => {
    expect(formatJapaneseMonth(2026, 4)).toBe('2026年4月')
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday)).toBe(false)
  })
})
