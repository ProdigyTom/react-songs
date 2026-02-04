import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VideoPanel from '../videoPanel'
import * as api from '../../services/api'

vi.mock('../../services/api')
vi.mock('../../css/videoPanel.css', () => ({}))

describe('VideoPanel', () => {
  const mockUser = { name: 'Test User', session_jwt: 'token123' }
  const mockSongId = 1
  const mockPanelWidth = 200
  const mockOnPanelWidthChange = vi.fn()
  const mockVideos = [
      { id: 1, video_type: 'Official Video', url: 'https://www.youtube.com/embed/abc123' },
      { id: 2, video_type: 'Live Version', url: 'https://www.youtube.com/embed/def456' }
    ]

  const renderVideoPanel = (props = {}) => {
    return render(
      <VideoPanel
        user={mockUser}
        songId={mockSongId}
        panelWidth={mockPanelWidth}
        onPanelWidthChange={mockOnPanelWidthChange}
        {...props}
      />
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    api.fetchVideosForSong.mockResolvedValue(mockVideos)
  })

  it('fetches videos on mount', async () => {
    renderVideoPanel()

    await waitFor(() => {
      expect(api.fetchVideosForSong).toHaveBeenCalledWith(mockUser, mockSongId)
    })
  })

  it('displays video buttons when videos are fetched', async () => {
    renderVideoPanel()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Official Video' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Live Version' })).toBeInTheDocument()
    })
  })

  it('shows no videos message when no videos available', async () => {
    api.fetchVideosForSong.mockResolvedValue([])
    renderVideoPanel()

    await waitFor(() => {
      expect(screen.getByText(/no videos available/i)).toBeInTheDocument()
    })
  })

  it('selects first video by default', async () => {
    renderVideoPanel()

    await waitFor(() => {
      const iframe = document.querySelector('iframe')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123')
    })
  })

  it('changes iframe src when video button is clicked', async () => {
    renderVideoPanel()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Live Version' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Live Version' }))

    const iframe = document.querySelector('iframe')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/def456')
  })

  it('marks selected video button as active', async () => {
    renderVideoPanel()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Official Video' })).toHaveClass('active')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Live Version' }))

    expect(screen.getByRole('button', { name: 'Live Version' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Official Video' })).not.toHaveClass('active')
  })

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    api.fetchVideosForSong.mockRejectedValue(new Error('Network error'))

    renderVideoPanel()

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    expect(screen.getByText(/no videos available/i)).toBeInTheDocument()
    consoleSpy.mockRestore()
  })

  it('refetches when songId changes', async () => {
    const { rerender } = renderVideoPanel()

    await waitFor(() => {
      expect(api.fetchVideosForSong).toHaveBeenCalledWith(mockUser, 1)
    })

    api.fetchVideosForSong.mockResolvedValue([
      { id: 3, video_type: 'New Video', url: 'https://www.youtube.com/embed/xyz789' }
    ])
    rerender(
      <VideoPanel
        user={mockUser}
        songId={2}
        panelWidth={mockPanelWidth}
        onPanelWidthChange={mockOnPanelWidthChange}
      />
    )

    await waitFor(() => {
      expect(api.fetchVideosForSong).toHaveBeenCalledWith(mockUser, 2)
    })
  })

  it('renders resize handle', async () => {
    renderVideoPanel()

    await waitFor(() => {
      expect(document.querySelector('.video-panel-resize-handle')).toBeInTheDocument()
    })
  })

  it('renders iframe container', async () => {
    renderVideoPanel()

    await waitFor(() => {
      expect(document.querySelector('.video-iframe-container')).toBeInTheDocument()
    })
  })
})
