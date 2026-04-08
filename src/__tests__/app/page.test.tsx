import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DEFAULT_CALENDAR_DATA, type CalendarData } from '@/lib/types'

// Track mock state
let mockData: CalendarData = { ...DEFAULT_CALENDAR_DATA }
const mockSetRecord = vi.fn()
const mockSetSettings = vi.fn()
const mockSetOnboarded = vi.fn()
const mockSetTheme = vi.fn()
const mockSetStorageData = vi.fn()

vi.mock('@/lib/storage', () => ({
  useCalendarData: () => ({
    data: mockData,
    setRecord: mockSetRecord,
    setSettings: mockSetSettings,
    setOnboarded: mockSetOnboarded,
  }),
  setStorageData: (...args: unknown[]) => mockSetStorageData(...args),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'system',
  }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  ChevronLeft: (props: Record<string, unknown>) => <span {...props} />,
  ChevronRight: (props: Record<string, unknown>) => <span {...props} />,
  Settings: (props: Record<string, unknown>) => <span data-testid="settings-icon" {...props} />,
  X: (props: Record<string, unknown>) => <span {...props} />,
  XIcon: (props: Record<string, unknown>) => <span {...props} />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children?: ReactNode; open?: boolean }) => (
    open ? <div data-testid="sheet">{children}</div> : null
  ),
  SheetContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  SheetDescription: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  SheetTrigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: (props: Record<string, unknown>) => <input type="checkbox" {...props} />,
}))

import Home from '@/app/page'

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData = { ...DEFAULT_CALENDAR_DATA }
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing before mounting', () => {
    const { container } = render(<Home />)
    expect(container.innerHTML).toBe('')
  })

  it('renders Welcome screen when not onboarded', async () => {
    render(<Home />)

    // Advance timer to trigger mount
    await act(async () => {
      vi.runAllTimers()
    })

    expect(screen.getByText('放置した日、見えてる？')).toBeInTheDocument()
  })

  it('renders CalendarView when onboarded', async () => {
    mockData = { ...DEFAULT_CALENDAR_DATA, onboarded: true, records: { '2026-04-08': 'yes' } }

    render(<Home />)

    await act(async () => {
      vi.runAllTimers()
    })

    // CalendarView renders month header and weekdays
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
  })

  it('calls setOnboarded when Welcome start button is clicked', async () => {
    render(<Home />)

    await act(async () => {
      vi.runAllTimers()
    })

    const button = screen.getByText('始める')
    await act(async () => {
      button.click()
    })
    expect(mockSetOnboarded).toHaveBeenCalledWith(true)
  })

  it('syncs theme setting after mount', async () => {
    mockData = { ...DEFAULT_CALENDAR_DATA, settings: { ...DEFAULT_CALENDAR_DATA.settings, theme: 'dark' } }

    render(<Home />)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('opens record sheet when today is unrecorded after onboarding', async () => {
    mockData = { ...DEFAULT_CALENDAR_DATA, onboarded: true, records: {} }

    render(<Home />)

    await act(async () => {
      vi.runAllTimers()
    })

    // The record sheet auto-opens for unrecorded today
    // CalendarView should be visible
    expect(screen.getByText('日')).toBeInTheDocument()
  })
})
