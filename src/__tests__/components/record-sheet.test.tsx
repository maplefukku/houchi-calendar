import { describe, it, expect, vi } from 'vitest'
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
