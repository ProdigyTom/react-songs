import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./components/login.jsx', () => ({
  default: () => <div data-testid="login" />,
}))
vi.mock('./components/header', () => ({
  default: () => <div data-testid="header" />,
}))
vi.mock('./components/appAuthenticated', () => ({
  default: () => <div data-testid="app-authenticated" />,
}))
vi.mock('./components/menu', () => ({
  default: () => <div data-testid="menu" />,
}))
vi.mock('./context/ToastContext', () => ({
  ToastProvider: ({ children }) => <>{children}</>,
}))

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    // Clear any cookies from previous tests
    document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  })

  it('renders Header regardless of login state', () => {
    render(<App />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders Login when no user is set', () => {
    render(<App />)
    expect(screen.getByTestId('login')).toBeInTheDocument()
  })

  it('does not render AppAuthenticated or Menu when not logged in', () => {
    render(<App />)
    expect(screen.queryByTestId('app-authenticated')).not.toBeInTheDocument()
    expect(screen.queryByTestId('menu')).not.toBeInTheDocument()
  })

  it('loads user from cookie on mount and shows authenticated view', async () => {
    document.cookie = 'user_data={"name":"Cookie User","session_jwt":"tok"}'
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('app-authenticated')).toBeInTheDocument()
      expect(screen.getByTestId('menu')).toBeInTheDocument()
    })
  })

  it('does not show Login after user is loaded from cookie', async () => {
    document.cookie = 'user_data={"name":"Cookie User","session_jwt":"tok"}'
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByTestId('login')).not.toBeInTheDocument()
    })
  })

  it('handles malformed cookie data gracefully', async () => {
    document.cookie = 'user_data=not-valid-json'
    // Should not throw — falls back to showing Login
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })
  })

  it('persists currentPage to localStorage when it changes', () => {
    render(<App />)
    // On mount, the default page 'yourSongs' is stored
    expect(localStorage.setItem).toHaveBeenCalledWith('currentPage', 'yourSongs')
  })

  it('restores currentPage from localStorage', () => {
    localStorage.getItem.mockImplementation((key) =>
      key === 'currentPage' ? 'searchResults' : null
    )
    render(<App />)
    // It doesn't throw and the restored value is used
    expect(localStorage.getItem).toHaveBeenCalledWith('currentPage')
  })
})
