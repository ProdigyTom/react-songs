import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoogleAuth from '../googleAuth'

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button
      data-testid="google-login-button"
      onClick={() => onSuccess({ credential: 'mock-credential' })}
    >
      Sign in with Google
    </button>
  ),
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    email: 'test@example.com',
    name: 'Test User',
  })),
}))

describe('GoogleAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  it('renders GoogleLogin component', () => {
    render(<GoogleAuth setUser={vi.fn()} />)
    expect(screen.getByTestId('google-login-button')).toBeInTheDocument()
  })

  it('calls API on successful Google login', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'Test User', email: 'test@example.com' }),
    })

    const setUser = vi.fn()
    render(<GoogleAuth setUser={setUser} />)

    screen.getByTestId('google-login-button').click()

    await vi.waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/google',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'mock-credential' }),
        })
      )
    })
  })

  it('sets user and cookie on successful API response', async () => {
    const userData = { name: 'Test User', email: 'test@example.com', session_jwt: 'jwt123' }
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(userData),
    })

    const setUser = vi.fn()
    render(<GoogleAuth setUser={setUser} />)

    screen.getByTestId('google-login-button').click()

    await vi.waitFor(() => {
      expect(setUser).toHaveBeenCalledWith(userData)
    })
  })

  it('does not call setUser when API returns error', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    const setUser = vi.fn()
    render(<GoogleAuth setUser={setUser} />)

    screen.getByTestId('google-login-button').click()

    await vi.waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
    })

    expect(setUser).not.toHaveBeenCalled()
  })
})
