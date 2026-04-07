import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

import { Welcome } from '@/components/welcome'

describe('Welcome', () => {
  it('renders the hero heading', () => {
    render(<Welcome onStart={() => {}} />)
    expect(
      screen.getByText('放置した日、見えてる？')
    ).toBeInTheDocument()
  })

  it('renders the subtext', () => {
    render(<Welcome onStart={() => {}} />)
    expect(
      screen.getByText('毎日ひとつだけ答える。やったか、やらなかったか。')
    ).toBeInTheDocument()
  })

  it('renders the start button', () => {
    render(<Welcome onStart={() => {}} />)
    expect(screen.getByText('始める')).toBeInTheDocument()
  })

  it('calls onStart when button is clicked', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<Welcome onStart={onStart} />)

    await user.click(screen.getByText('始める'))
    expect(onStart).toHaveBeenCalledOnce()
  })
})
