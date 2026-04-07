import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({ children, open }: Record<string, unknown>) => (open ? <div>{children}</div> : null),
    Trigger: ({ children }: Record<string, unknown>) => <div>{children}</div>,
    Close: ({ children, ...props }: Record<string, unknown>) => (
      <button {...props}>{children}</button>
    ),
    Portal: ({ children }: Record<string, unknown>) => <div>{children}</div>,
    Backdrop: ({ children }: Record<string, unknown>) => <div>{children}</div>,
    Popup: ({ children }: Record<string, unknown>) => <div>{children}</div>,
    Title: ({ children, className }: Record<string, unknown>) => (
      <h2 className={className as string}>{children}</h2>
    ),
    Description: ({ children, className }: Record<string, unknown>) => (
      <p className={className as string}>{children}</p>
    ),
  },
}))

vi.mock('lucide-react', () => ({
  XIcon: () => <span data-testid="x-icon" />,
}))

import { SettingsSheet } from '@/components/settings-sheet'

describe('SettingsSheet', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    settings: {
      notifyEnabled: false,
      notifyTime: '21:00',
      theme: 'system' as const,
    },
    onSettingsChange: vi.fn(),
    onDeleteData: vi.fn(),
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function renderSheet(props = {}) {
    return render(<SettingsSheet {...defaultProps} {...props} />)
  }

  it('renders title when open', () => {
    renderSheet()
    expect(screen.getByText('設定')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderSheet({ open: false })
    expect(screen.queryByText('設定')).not.toBeInTheDocument()
  })

  it('renders theme buttons', () => {
    renderSheet()
    expect(screen.getByText('ライト')).toBeInTheDocument()
    expect(screen.getByText('ダーク')).toBeInTheDocument()
    expect(screen.getByText('自動')).toBeInTheDocument()
  })

  it('calls onSettingsChange with theme when theme button clicked', async () => {
    const user = userEvent.setup()
    const onSettingsChange = vi.fn()
    renderSheet({ onSettingsChange })

    await user.click(screen.getByText('ダーク'))
    expect(onSettingsChange).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('calls onSettingsChange with light theme', async () => {
    const user = userEvent.setup()
    const onSettingsChange = vi.fn()
    renderSheet({ onSettingsChange })

    await user.click(screen.getByText('ライト'))
    expect(onSettingsChange).toHaveBeenCalledWith({ theme: 'light' })
  })

  it('renders delete button', () => {
    renderSheet()
    expect(screen.getByText('すべてのデータを削除')).toBeInTheDocument()
  })

  it('calls onDeleteData when delete confirmed', async () => {
    const user = userEvent.setup()
    const onDeleteData = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderSheet({ onDeleteData })

    await user.click(screen.getByText('すべてのデータを削除'))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDeleteData).toHaveBeenCalled()
  })

  it('does not call onDeleteData when delete cancelled', async () => {
    const user = userEvent.setup()
    const onDeleteData = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderSheet({ onDeleteData })

    await user.click(screen.getByText('すべてのデータを削除'))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDeleteData).not.toHaveBeenCalled()
  })

  it('shows time input when notification enabled', () => {
    renderSheet({
      settings: { ...defaultProps.settings, notifyEnabled: true },
    })
    const timeInput = screen.getByDisplayValue('21:00')
    expect(timeInput).toBeInTheDocument()
  })

  it('does not show time input when notification disabled', () => {
    renderSheet()
    expect(screen.queryByDisplayValue('21:00')).not.toBeInTheDocument()
  })

  it('calls onSettingsChange when notification time changed', async () => {
    const user = userEvent.setup()
    const onSettingsChange = vi.fn()
    renderSheet({
      settings: { ...defaultProps.settings, notifyEnabled: true },
      onSettingsChange,
    })

    const timeInput = screen.getByDisplayValue('21:00')
    await user.clear(timeInput)
    await user.type(timeInput, '08:00')
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ notifyTime: expect.any(String) })
    )
  })
})
