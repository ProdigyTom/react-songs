import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SongDisplay from '../songDisplay'
import * as api from '../../services/api'

vi.mock('../../services/api')

const mockShowToast = vi.fn()
vi.mock('../../context/ToastContext', () => ({ useToast: () => mockShowToast }))

describe('SongDisplay', () => {
  const mockUser = { name: 'Test User', session_jwt: 'token123' }
  const mockSong = { id: 1, title: 'Test Song', artist: 'Test Artist' }
  const mockTab = { text: 'Am  G  C\nHello world', scroll_speed: 30 }
  const mockVideos = [
    { id: 1, video_type: 'Official Video', url: 'https://www.youtube.com/embed/abc123' },
    { id: 2, video_type: 'Live Version', url: 'https://www.youtube.com/embed/def456' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    api.fetchTabForSong.mockResolvedValue(mockTab)
    api.fetchVideosForSong.mockResolvedValue(mockVideos)
    api.saveScrollSpeed.mockResolvedValue({ song: { id: 1, scroll_speed: 30 } })
    mockShowToast.mockClear()
  })

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

  it('shows Start button for scrolling initially', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('toggles to Stop when scrolling starts', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
  })

  it('toggles back to Start when scrolling stops', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('renders speed increase control', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(document.querySelector('.plus')).toBeInTheDocument()
  })

  it('renders speed decrease control', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(document.querySelector('.minus')).toBeInTheDocument()
  })

  it('renders Save Speed button', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    expect(screen.getByRole('button', { name: 'Save Speed' })).toBeInTheDocument()
  })

  it('initialises scroll speed from tab scroll_speed', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(api.saveScrollSpeed).not.toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save Speed' }))

    await waitFor(() => {
      expect(api.saveScrollSpeed).toHaveBeenCalledWith(mockUser, mockSong.id, 30)
    })
  })

  it('falls back to speed 20 when tab has no scroll_speed', async () => {
    api.fetchTabForSong.mockResolvedValue({ text: 'Am G C', scroll_speed: null })
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Save Speed' }))

    await waitFor(() => {
      expect(api.saveScrollSpeed).toHaveBeenCalledWith(mockUser, mockSong.id, 20)
    })
  })

  it('calls saveScrollSpeed with current speed when Save Speed is clicked', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(document.querySelector('.plus'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Speed' }))

    await waitFor(() => {
      expect(api.saveScrollSpeed).toHaveBeenCalledWith(mockUser, mockSong.id, 40)
    })
  })

  it('shows success toast when scroll speed saves successfully', async () => {
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Save Speed' }))

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Scroll speed saved', 'success')
    })
  })

  it('shows error toast when scroll speed save fails', async () => {
    api.saveScrollSpeed.mockRejectedValue(new Error('Network error'))
    render(<SongDisplay user={mockUser} song={mockSong} />)
    await waitForFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Save Speed' }))

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Failed to save scroll speed')
    })
  })

  it('handles fetch error gracefully', async () => {
    api.fetchTabForSong.mockRejectedValue(new Error('Network error'))
    render(<SongDisplay user={mockUser} song={mockSong} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load tab')).toBeInTheDocument()
    })
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
    it('renders video toggle icon', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      expect(document.querySelector('.video-toggle-btn')).toBeInTheDocument()
    })

    it('mounts video panel and fetches videos when toggle icon is clicked', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(document.querySelector('.video-toggle-btn'))

      await waitFor(() => {
        expect(api.fetchVideosForSong).toHaveBeenCalledWith(mockUser, mockSong.id)
      })
    })

    it('displays video buttons when videos are fetched', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(document.querySelector('.video-toggle-btn'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Official Video' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Live Version' })).toBeInTheDocument()
      })
    })

    it('shows no videos message when no videos available', async () => {
      api.fetchVideosForSong.mockResolvedValue([])
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(document.querySelector('.video-toggle-btn'))

      await waitFor(() => {
        expect(screen.getByText(/no videos available/i)).toBeInTheDocument()
      })
    })

    it('selects first video by default', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(document.querySelector('.video-toggle-btn'))

      await waitFor(() => {
        const iframe = document.querySelector('iframe')
        expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123')
      })
    })

    it('changes iframe src when video button is clicked', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      fireEvent.click(document.querySelector('.video-toggle-btn'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Live Version' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Live Version' }))

      const iframe = document.querySelector('iframe')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/def456')
    })

    it('collapses video panel when toggle icon is clicked again', async () => {
      render(<SongDisplay user={mockUser} song={mockSong} />)
      await waitForFetch()

      const toggleIcon = document.querySelector('.video-toggle-btn')
      fireEvent.click(toggleIcon)

      await waitFor(() => {
        expect(document.querySelector('.video-panel')).toBeInTheDocument()
      })

      fireEvent.click(toggleIcon)

      // Panel stays mounted but collapses to width 0
      expect(document.querySelector('.video-panel').style.width).toBe('0px')
    })
  })
})
