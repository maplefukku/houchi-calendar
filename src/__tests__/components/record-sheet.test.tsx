import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({ children, open }: { children?: ReactNode; open?: boolean }) => (open ? <div>{children}</div> : null),
    Trigger: ({ children }: { children?: ReactNode }) => <div className="dialog-trigger">{children}</div>,
    Close: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
      <button {...props}>{children}</button>
    ),
    Portal: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Backdrop: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Popup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Title: ({ children, className }: { children?: ReactNode; className?: string }) => (
      <h2 className={className}>{children}</h2>
    ),
    Description: ({ children, className }: { children?: ReactNode; className?: string }) => (
      <p className={className}>{children}</p>
    ),
  },
}))

vi.mock('lucide-react', () => ({
  X: (props: { [key: string]: unknown }) => <span data-testid="x-icon" {...props} />,
  XIcon: (props: { [key: string]: unknown }) => <span data-testid="x-icon" {...props} />,
}))

vi.mock('./ui/button', () => ({
  Button: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <button className={className} data-testid="mock-button">
      {children}
    </button>
  ),
}))

import { RecordSheet } from '@/components/record-sheet'

describe('RecordSheet', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    date: new Date(2026, 3, 7), // 2026-04-07
    onRecord: vi.fn(),
  }

  function renderSheet(props = {}) {
    return render(<RecordSheet {...defaultProps} {...props} />)
  }

  it('renders the question when open', () => {
    renderSheet()
    expect(
      screen.getByText('今日、自分の未来のために何かやった？')
    ).toBeInTheDocument()
  })

  it('renders yes and no buttons when open', () => {
    renderSheet()
    expect(screen.getByText('やった')).toBeInTheDocument()
    expect(screen.getByText('やらなかった')).toBeInTheDocument()
  })

  it('calls onRecord with yes when clicked', async () => {
    const user = userEvent.setup()
    const onRecord = vi.fn()
    renderSheet({ onRecord })

    await user.click(screen.getByText('やった'))
    expect(onRecord).toHaveBeenCalledWith('yes')
  })

  it('calls onRecord with no when clicked', async () => {
    const user = userEvent.setup()
    const onRecord = vi.fn()
    renderSheet({ onRecord })

    await user.click(screen.getByText('やらなかった'))
    expect(onRecord).toHaveBeenCalledWith('no')
  })
})
