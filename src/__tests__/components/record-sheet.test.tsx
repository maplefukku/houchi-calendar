import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({ children, open }: any) => (open ? <div>{children}</div> : null),
    Trigger: ({ children }: any) => <div>{children}</div>,
    Close: ({ children, render, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    Portal: ({ children }: any) => <div>{children}</div>,
    Backdrop: ({ children }: any) => <div>{children}</div>,
    Popup: ({ children }: any) => <div>{children}</div>,
    Title: ({ children, className }: any) => (
      <h2 className={className}>{children}</h2>
    ),
    Description: ({ children, className }: any) => (
      <p className={className}>{children}</p>
    ),
  },
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
