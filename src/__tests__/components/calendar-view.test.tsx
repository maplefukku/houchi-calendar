import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
}))

vi.mock('lucide-react', () => ({
  ChevronLeft: (props: { [key: string]: unknown }) => <span data-testid="chevron-left" {...props} />,
  ChevronRight: (props: { [key: string]: unknown }) => <span data-testid="chevron-right" {...props} />,
  Settings: (props: { [key: string]: unknown }) => <span data-testid="settings-icon" {...props} />,
}))

import { CalendarView } from '@/components/calendar-view'
import { formatDateKey, formatJapaneseMonth } from '@/lib/calendar'

describe('CalendarView', () => {
  const defaultProps = {
    records: {} as Record<string, 'yes' | 'no'>,
    onRecordToday: vi.fn(),
    onOpenSettings: vi.fn(),
  }

  function renderCalendar(props = {}) {
    return render(<CalendarView {...defaultProps} {...props} />)
  }

  it('renders the header', () => {
    renderCalendar()
    expect(screen.getByText('放置カレンダー')).toBeInTheDocument()
  })

  it('renders the settings button with aria-label', () => {
    renderCalendar()
    expect(screen.getByLabelText('設定')).toBeInTheDocument()
  })

  it('shows the current month in Japanese format', () => {
    const now = new Date()
    const expected = formatJapaneseMonth(now.getFullYear(), now.getMonth() + 1)
    renderCalendar()
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('renders weekday headers', () => {
    renderCalendar()
    for (const day of ['月', '火', '水', '木', '金', '土', '日']) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  it('shows the record today button when today is unrecorded', () => {
    renderCalendar({ records: {} })
    expect(screen.getByText('今日を記録する')).toBeInTheDocument()
  })

  it('does NOT show the record today button when today is recorded', () => {
    const today = new Date()
    const todayKey = formatDateKey(today)
    renderCalendar({ records: { [todayKey]: 'yes' } })
    expect(screen.queryByText('今日を記録する')).not.toBeInTheDocument()
  })

  it('calls onRecordToday when the button is clicked', async () => {
    const user = userEvent.setup()
    const onRecordToday = vi.fn()
    renderCalendar({ onRecordToday })

    await user.click(screen.getByText('今日を記録する'))
    expect(onRecordToday).toHaveBeenCalledOnce()
  })

  it('calls onOpenSettings when settings button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    renderCalendar({ onOpenSettings })

    await user.click(screen.getByLabelText('設定'))
    expect(onOpenSettings).toHaveBeenCalledOnce()
  })

  it('shows summary counts', () => {
    const today = new Date()
    const todayKey = formatDateKey(today)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = formatDateKey(yesterday)

    renderCalendar({
      records: { [todayKey]: 'yes', [yesterdayKey]: 'no' },
    })

    expect(screen.getByText('放置した日')).toBeInTheDocument()
    expect(screen.getByText('やった日')).toBeInTheDocument()
  })
})
