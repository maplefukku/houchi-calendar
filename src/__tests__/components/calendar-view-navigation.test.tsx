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
  ChevronLeft: (props: Record<string, unknown>) => <span data-testid="chevron-left" {...props} />,
  ChevronRight: (props: Record<string, unknown>) => <span data-testid="chevron-right" {...props} />,
  Settings: (props: Record<string, unknown>) => <span data-testid="settings-icon" {...props} />,
}))

import { CalendarView } from '@/components/calendar-view'

describe('CalendarView 月ナビゲーション', () => {
  const defaultProps = {
    records: {} as Record<string, 'yes' | 'no'>,
    onRecordToday: vi.fn(),
    onOpenSettings: vi.fn(),
  }

  it('前の月ボタンで月が切り替わる', async () => {
    const user = userEvent.setup()
    render(<CalendarView {...defaultProps} />)

    const now = new Date()
    const prevButton = screen.getByLabelText('前の月')

    await user.click(prevButton)

    // 前月に移動するので、現在月のテキストが変わっているはず
    // 今月が1月なら12月（前年）に、それ以外なら前月に
    const expectedMonth = now.getMonth() === 0 ? 12 : now.getMonth()
    const expectedYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    expect(screen.getByText(`${expectedYear}年${expectedMonth}月`)).toBeInTheDocument()
  })

  it('次の月ボタンで月が切り替わる', async () => {
    const user = userEvent.setup()
    render(<CalendarView {...defaultProps} />)

    const nextButton = screen.getByLabelText('次の月')

    await user.click(nextButton)

    const now = new Date()
    const expectedMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2
    const expectedYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    expect(screen.getByText(`${expectedYear}年${expectedMonth}月`)).toBeInTheDocument()
  })

  it('1月から前の月に移動すると前年12月になる', async () => {
    // 現在が1月でない場合、1月まで戻る必要がある
    const user = userEvent.setup()
    render(<CalendarView {...defaultProps} />)

    const now = new Date()
    const prevButton = screen.getByLabelText('前の月')

    // 現在月から1月まで戻る
    const clicksToJan = now.getMonth() // 0-based, so getMonth() clicks to reach January
    for (let i = 0; i < clicksToJan; i++) {
      await user.click(prevButton)
    }

    // 今は1月のはず - もう1回クリックで前年12月に
    await user.click(prevButton)
    expect(screen.getByText(`${now.getFullYear() - 1}年12月`)).toBeInTheDocument()
  })

  it('12月から次の月に移動すると翌年1月になる', async () => {
    const user = userEvent.setup()
    render(<CalendarView {...defaultProps} />)

    const now = new Date()
    const nextButton = screen.getByLabelText('次の月')

    // 現在月から12月まで進む
    const clicksToDec = 11 - now.getMonth()
    for (let i = 0; i < clicksToDec; i++) {
      await user.click(nextButton)
    }

    // 今は12月のはず - もう1回クリックで翌年1月に
    await user.click(nextButton)
    expect(screen.getByText(`${now.getFullYear() + 1}年1月`)).toBeInTheDocument()
  })

  it('別の月に移動すると「今日を記録する」ボタンが非表示', async () => {
    const user = userEvent.setup()
    render(<CalendarView {...defaultProps} records={{}} />)

    // 今月では表示されている
    expect(screen.getByText('今日を記録する')).toBeInTheDocument()

    // 前月に移動
    await user.click(screen.getByLabelText('前の月'))

    // 今日を記録するボタンは非表示
    expect(screen.queryByText('今日を記録する')).not.toBeInTheDocument()
  })
})
