import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../login'

vi.mock('../googleAuth', () => ({
  default: ({ setUser }) => <div data-testid="google-auth">GoogleAuth Mock</div>
}))

vi.mock('../../css/login.css', () => ({}))

describe('Login', () => {
  it('renders the login heading', () => {
    render(<Login setUser={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /please login/i })).toBeInTheDocument()
  })

  it('renders the GoogleAuth component', () => {
    render(<Login setUser={vi.fn()} />)
    expect(screen.getByTestId('google-auth')).toBeInTheDocument()
  })

  it('has login class on container', () => {
    const { container } = render(<Login setUser={vi.fn()} />)
    expect(container.querySelector('.login')).toBeInTheDocument()
  })
})
