import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SongDisplay from '../songDisplay'
import * as api from '../../services/api'

vi.mock('../../services/api')
vi.mock('../../css/songDisplay.css', () => ({}))
vi.mock('../../css/videoPanel.css', () => ({}))

describe('SongDisplay', () => {
  const mockUser = { name: 'Test User', session_jwt: 'token123' }
  const mockSong = { id: 1, title: 'Test Song', artist: 'Test Artist' }
  const mockTab = { text: 'Am  G  C\nHello world' }
  const mockVideos = [
    { id: 1, video_type: 'Official Video', url: 'https://www.youtube.com/embed/abc123' },
    { id: 2, video_type: 'Live Version', url: 'https://www.youtube.com/embed/def456' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    api.fetchTabForSong.mockResolvedValue(mockTab)
    api.fetchVideosForSong.mockResolvedValue(mockVideos)
  })

  // Helper to wait for the initial fetch to complete
  const waitForFetch = () => waitFor(() => {
    expect(api.fetchTabForSong).toHaveBeenCalled()
  })

  it('displays song title and artist', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(screen.getByText('Test Song - Test Artist')).toBeInTheDocument()
  })

  it('fetches tab on mount', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(api.fetchTabForSong).toHaveBeenCalledWith(mockUser, mockSong.id)
    })
  })

  it('displays tab content in textarea', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('Am  G  C\nHello world')
    })
  })

  it('has readonly textarea', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('shows Start Scrolling button initially', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(screen.getByRole('button', { name: /start scrolling/i })).toBeInTheDocument()
  })

  it('toggles to Stop Scrolling when clicked', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: /start scrolling/i }))

    expect(screen.getByRole('button', { name: /stop scrolling/i })).toBeInTheDocument()
  })

  it('toggles back to Start Scrolling when clicked again', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: /start scrolling/i }))
    fireEvent.click(screen.getByRole('button', { name: /stop scrolling/i }))

    expect(screen.getByRole('button', { name: /start scrolling/i })).toBeInTheDocument()
  })

  it('renders plus button for speed increase', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('renders minus button for speed decrease', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

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

  describe('Video Panel', () => {
    it('renders Show Videos button', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      expect(screen.getByRole('button', { name: /show videos/i })).toBeInTheDocument()
    })

    it('opens video panel when toggle button is clicked', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))

      expect(screen.getByRole('button', { name: /hide videos/i })).toBeInTheDocument()
    })

    it('fetches videos when panel opens', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))

      await waitFor(() => {
        expect(api.fetchVideosForSong).toHaveBeenCalledWith(mockUser, mockSong.id)
      })
    })

    it('displays video buttons when videos are fetched', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Official Video' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Live Version' })).toBeInTheDocument()
      })
    })

    it('shows no videos message when no videos available', async () => {
      api.fetchVideosForSong.mockResolvedValue([])
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))

      await waitFor(() => {
        expect(screen.getByText(/no videos available/i)).toBeInTheDocument()
      })
    })

    it('selects first video by default', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))

      await waitFor(() => {
        const iframe = document.querySelector('iframe')
        expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123')
      })
    })

    it('changes iframe src when video button is clicked', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Live Version' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Live Version' }))

      const iframe = document.querySelector('iframe')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/def456')
    })

    it('closes video panel when toggle button is clicked again', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(screen.getByRole('button', { name: /show videos/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hide videos/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /hide videos/i }))
      expect(screen.getByRole('button', { name: /show videos/i })).toBeInTheDocument()
    })
  })
})
