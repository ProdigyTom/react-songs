import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import YourSongs from '../yourSongs'
import * as api from '../../services/api'

vi.mock('../../services/api')
vi.mock('../../css/yourSongs.css', () => ({}))

describe('YourSongs', () => {
  const mockUser = { name: 'Test User', session_jwt: 'token123' }
  const mockSongs = [
    { id: 1, title: 'Song One', artist: 'Artist A' },
    { id: 2, title: 'Song Two', artist: 'Artist B' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    api.fetchSongs.mockImplementation(() => new Promise(() => {}))
    render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches songs on mount when user exists', async () => {
    api.fetchSongs.mockResolvedValue(mockSongs)
    render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

    await waitFor(() => {
      expect(api.fetchSongs).toHaveBeenCalledWith(mockUser, 10, 0)
    })
  })

  it('displays songs in a table after loading', async () => {
    api.fetchSongs.mockResolvedValue(mockSongs)
    render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument()
      expect(screen.getByText('Artist A')).toBeInTheDocument()
      expect(screen.getByText('Song Two')).toBeInTheDocument()
      expect(screen.getByText('Artist B')).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    api.fetchSongs.mockRejectedValue(new Error('Network error'))
    render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch songs')).toBeInTheDocument()
    })
  })

  it('renders table headers', async () => {
    api.fetchSongs.mockResolvedValue(mockSongs)
    render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Artist')).toBeInTheDocument()
    })
  })

  it('navigates to songDisplay when a song is clicked', async () => {
    api.fetchSongs.mockResolvedValue(mockSongs)
    const setCurrentPage = vi.fn()
    const setCurrentSong = vi.fn()
    render(<YourSongs user={mockUser} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />)

    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Song One'))

    expect(setCurrentPage).toHaveBeenCalledWith('songDisplay')
    expect(setCurrentSong).toHaveBeenCalledWith(mockSongs[0])
  })

  describe('pagination', () => {
    it('does not show Previous button on first page', async () => {
      api.fetchSongs.mockResolvedValue(mockSongs)
      render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Song One')).toBeInTheDocument()
      })

      expect(screen.queryByText('<- Previous page')).not.toBeInTheDocument()
    })

    it('shows Next button when songs equal limit', async () => {
      const tenSongs = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
      }))
      api.fetchSongs.mockResolvedValue(tenSongs)
      render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Next page ->')).toBeInTheDocument()
      })
    })

    it('does not show Next button when songs less than limit', async () => {
      api.fetchSongs.mockResolvedValue(mockSongs)
      render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Song One')).toBeInTheDocument()
      })

      expect(screen.queryByText('Next page ->')).not.toBeInTheDocument()
    })

    it('fetches next page when Next is clicked', async () => {
      const tenSongs = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
      }))
      api.fetchSongs.mockResolvedValue(tenSongs)
      render(<YourSongs user={mockUser} setCurrentPage={vi.fn()} setCurrentSong={vi.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Next page ->')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Next page ->'))

      await waitFor(() => {
        expect(api.fetchSongs).toHaveBeenCalledWith(mockUser, 10, 10)
      })
    })
  })
})
