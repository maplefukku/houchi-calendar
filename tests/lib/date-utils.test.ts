import { describe, it, expect } from 'vitest'
import {
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  getActionRate,
} from '@/lib/date-utils'

describe('formatDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDate(new Date(2026, 3, 7))).toBe('2026-04-07')
  })

  it('pads single-digit month and day', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('getDaysInMonth', () => {
  it('returns 30 for April', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30)
  })

  it('returns 28 for February in non-leap year', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28)
  })

  it('returns 29 for February in leap year', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29)
  })
})

describe('getFirstDayOfMonth', () => {
  it('returns day of week for first day of month', () => {
    // 2026-04-01 is Wednesday (3)
    expect(getFirstDayOfMonth(2026, 4)).toBe(3)
  })
})

describe('getActionRate', () => {
  it('calculates percentage', () => {
    expect(getActionRate(15, 20)).toBe(75)
  })

  it('returns 0 for no total days', () => {
    expect(getActionRate(0, 0)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(getActionRate(1, 3)).toBe(33)
  })
})
