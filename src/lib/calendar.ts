const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

/**
 * Returns all days in the given month as Date objects.
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const count = new Date(year, month, 0).getDate()
  for (let day = 1; day <= count; day++) {
    days.push(new Date(year, month - 1, day))
  }
  return days
}

/**
 * Returns the day-of-week index for the first day of the month,
 * using Monday-start convention: 0=Mon, 1=Tue, ..., 6=Sun.
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  const jsDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Formats a Date as "YYYY-MM-DD".
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Formats a Date in Japanese style, e.g. "4月7日（月）".
 */
export function formatJapaneseDate(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAY_LABELS[date.getDay()]
  return `${month}月${day}日（${weekday}）`
}

/**
 * Formats year and month in Japanese style, e.g. "2026年4月".
 */
export function formatJapaneseMonth(year: number, month: number): string {
  return `${year}年${month}月`
}

/**
 * Returns true if the given date is today (local time).
 */
export function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}
