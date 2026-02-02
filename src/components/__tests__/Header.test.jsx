import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../header'

vi.mock('../../css/header.css', () => ({}))

describe('Header', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  describe('when user is not logged in', () => {
    it('shows "Please log in" message', () => {
      render(<Header user={null} setUser={vi.fn()} toggleMenu={vi.fn()} />)
      expect(screen.getByText('Please log in')).toBeInTheDocument()
    })

    it('does not show logout button', () => {
      render(<Header user={null} setUser={vi.fn()} toggleMenu={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
    })
  })

  describe('when user is logged in', () => {
    const mockUser = { name: 'John Doe' }

    it('shows welcome message with user name', () => {
      render(<Header user={mockUser} setUser={vi.fn()} toggleMenu={vi.fn()} />)
      expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument()
    })

    it('shows the project title', () => {
      render(<Header user={mockUser} setUser={vi.fn()} toggleMenu={vi.fn()} />)
      expect(screen.getByText('Song Project')).toBeInTheDocument()
    })

    it('shows logout button', () => {
      render(<Header user={mockUser} setUser={vi.fn()} toggleMenu={vi.fn()} />)
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    it('calls setUser with null when logout is clicked', () => {
      const setUser = vi.fn()
      render(<Header user={mockUser} setUser={setUser} toggleMenu={vi.fn()} />)

      fireEvent.click(screen.getByRole('button', { name: /logout/i }))

      expect(setUser).toHaveBeenCalledWith(null)
    })

    it('clears user_data cookie when logout is clicked', () => {
      render(<Header user={mockUser} setUser={vi.fn()} toggleMenu={vi.fn()} />)

      fireEvent.click(screen.getByRole('button', { name: /logout/i }))

      expect(document.cookie).toContain('user_data=')
      expect(document.cookie).toContain('expires=Thu, 01 Jan 1970')
    })

    it('shows menu icon', () => {
      render(<Header user={mockUser} setUser={vi.fn()} toggleMenu={vi.fn()} />)
      expect(screen.getByText('☰')).toBeInTheDocument()
    })

    it('calls toggleMenu when menu icon is clicked', () => {
      const toggleMenu = vi.fn()
      render(<Header user={mockUser} setUser={vi.fn()} toggleMenu={toggleMenu} />)

      fireEvent.click(screen.getByText('☰'))

      expect(toggleMenu).toHaveBeenCalled()
    })
  })
})
