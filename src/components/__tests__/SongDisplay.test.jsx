import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SongDisplay from '../songDisplay'
import * as api from '../../services/api'

vi.mock('../../services/api')
vi.mock('../../css/songDisplay.css', () => ({}))

describe('SongDisplay', () => {
  const mockUser = { name: 'Test User', session_jwt: 'token123' }
  const mockSong = { id: 1, title: 'Test Song', artist: 'Test Artist' }
  const mockTab = { text: 'Am  G  C\nHello world' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays song title and artist', () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    expect(screen.getByText('Test Song - Test Artist')).toBeInTheDocument()
  })

  it('fetches tab on mount', async () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(api.fetchTabForSong).toHaveBeenCalledWith(mockUser, mockSong.id)
    })
  })

  it('displays tab content in textarea', async () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('Am  G  C\nHello world')
    })
  })

  it('has readonly textarea', () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('shows Start Scrolling button initially', () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    expect(screen.getByRole('button', { name: /start scrolling/i })).toBeInTheDocument()
  })

  it('toggles to Stop Scrolling when clicked', async () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    fireEvent.click(screen.getByRole('button', { name: /start scrolling/i }))

    expect(screen.getByRole('button', { name: /stop scrolling/i })).toBeInTheDocument()
  })

  it('toggles back to Start Scrolling when clicked again', async () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    fireEvent.click(screen.getByRole('button', { name: /start scrolling/i }))
    fireEvent.click(screen.getByRole('button', { name: /stop scrolling/i }))

    expect(screen.getByRole('button', { name: /start scrolling/i })).toBeInTheDocument()
  })

  it('renders plus button for speed increase', () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('renders minus button for speed decrease', () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    render(<SongDisplay user={mockUser} song={mockSong} />)

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    api.fetchTabForSong.mockRejectedValue(new Error('Network error'))

    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('refetches when song.id changes', async () => {
    api.fetchTabForSong.mockResolvedValue(mockTab)
    const { rerender } = render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(api.fetchTabForSong).toHaveBeenCalledWith(mockUser, 1)
    })

    const newSong = { id: 2, title: 'New Song', artist: 'New Artist' }
    api.fetchTabForSong.mockResolvedValue({ text: 'New tab content' })
    rerender(<SongDisplay user={mockUser} song={newSong} />)

    await waitFor(() => {
      expect(api.fetchTabForSong).toHaveBeenCalledWith(mockUser, 2)
    })
  })
})
