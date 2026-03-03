import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SongTable from '../songTable'
import * as api from '../../services/api'

vi.mock('../../services/api')

const mockShowToast = vi.hoisted(() => vi.fn())
vi.mock('../../context/ToastContext', () => ({ useToast: () => mockShowToast }))

describe('SongTable', () => {
  const mockUser = { session_jwt: 'token' }
  const mockSongs = [
    { id: 1, title: 'Song One', artist: 'Artist A' },
    { id: 2, title: 'Song Two', artist: 'Artist B' },
  ]
  const defaultProps = {
    title: 'My Songs',
    songs: mockSongs,
    loading: false,
    error: null,
    limit: 10,
    offset: 0,
    setOffset: vi.fn(),
    user: mockUser,
    setCurrentPage: vi.fn(),
    setCurrentSong: vi.fn(),
    onDeleteSuccess: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading indicator when loading', () => {
    render(<SongTable {...defaultProps} loading={true} songs={[]} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    render(<SongTable {...defaultProps} error="Something failed" songs={[]} />)
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('renders the table title', () => {
    render(<SongTable {...defaultProps} />)
    expect(screen.getByText('My Songs')).toBeInTheDocument()
  })

  it('renders all songs', () => {
    render(<SongTable {...defaultProps} />)
    expect(screen.getByText('Song One')).toBeInTheDocument()
    expect(screen.getByText('Artist A')).toBeInTheDocument()
    expect(screen.getByText('Song Two')).toBeInTheDocument()
    expect(screen.getByText('Artist B')).toBeInTheDocument()
  })

  it('navigates to songDisplay when a row is clicked', () => {
    const setCurrentPage = vi.fn()
    const setCurrentSong = vi.fn()
    render(<SongTable {...defaultProps} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />)
    fireEvent.click(screen.getByText('Song One'))
    expect(setCurrentPage).toHaveBeenCalledWith('songDisplay')
    expect(setCurrentSong).toHaveBeenCalledWith(mockSongs[0])
  })

  describe('delete', () => {
    it('shows an X button for each song', () => {
      render(<SongTable {...defaultProps} />)
      expect(screen.getAllByText('X')).toHaveLength(2)
    })

    it('shows Sure? and Cancel after clicking X', () => {
      render(<SongTable {...defaultProps} />)
      fireEvent.click(screen.getAllByText('X')[0])
      expect(screen.getByText('Sure?')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('replaces only the clicked song X with confirmation', () => {
      render(<SongTable {...defaultProps} />)
      fireEvent.click(screen.getAllByText('X')[0])
      // One X replaced by Sure?/Cancel, one remains
      expect(screen.getAllByText('X')).toHaveLength(1)
    })

    it('cancels delete and restores X buttons', () => {
      render(<SongTable {...defaultProps} />)
      fireEvent.click(screen.getAllByText('X')[0])
      fireEvent.click(screen.getByText('Cancel'))
      expect(screen.queryByText('Sure?')).not.toBeInTheDocument()
      expect(screen.getAllByText('X')).toHaveLength(2)
    })

    it('calls deleteSong and onDeleteSuccess on confirmation', async () => {
      api.deleteSong.mockResolvedValue(204)
      const onDeleteSuccess = vi.fn()
      render(<SongTable {...defaultProps} onDeleteSuccess={onDeleteSuccess} />)
      fireEvent.click(screen.getAllByText('X')[0])
      fireEvent.click(screen.getByText('Sure?'))
      await waitFor(() => {
        expect(api.deleteSong).toHaveBeenCalledWith(mockUser, 1)
        expect(onDeleteSuccess).toHaveBeenCalled()
      })
    })

    it('shows toast and resets confirmation on delete failure', async () => {
      api.deleteSong.mockRejectedValue(new Error('Network error'))
      render(<SongTable {...defaultProps} />)
      fireEvent.click(screen.getAllByText('X')[0])
      fireEvent.click(screen.getByText('Sure?'))
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to delete song')
        expect(screen.queryByText('Sure?')).not.toBeInTheDocument()
      })
    })

    it('does not navigate when delete cell is clicked', () => {
      const setCurrentPage = vi.fn()
      render(<SongTable {...defaultProps} setCurrentPage={setCurrentPage} />)
      fireEvent.click(screen.getAllByText('X')[0])
      expect(setCurrentPage).not.toHaveBeenCalled()
    })
  })

  describe('pagination', () => {
    it('hides Previous button when offset is 0', () => {
      render(<SongTable {...defaultProps} offset={0} />)
      expect(screen.queryByText('<- Previous page')).not.toBeInTheDocument()
    })

    it('shows Previous button when offset > 0', () => {
      render(<SongTable {...defaultProps} offset={10} />)
      expect(screen.getByText('<- Previous page')).toBeInTheDocument()
    })

    it('clicking Previous calls setOffset with a decrement function', () => {
      const setOffset = vi.fn()
      render(<SongTable {...defaultProps} offset={10} setOffset={setOffset} />)
      fireEvent.click(screen.getByText('<- Previous page'))
      const updater = setOffset.mock.calls[0][0]
      expect(updater(10)).toBe(0)
    })

    it('Previous never goes below 0', () => {
      const setOffset = vi.fn()
      render(<SongTable {...defaultProps} offset={5} setOffset={setOffset} limit={10} />)
      fireEvent.click(screen.getByText('<- Previous page'))
      const updater = setOffset.mock.calls[0][0]
      expect(updater(5)).toBe(0)
    })

    it('shows Next button when songs count equals limit', () => {
      const tenSongs = Array.from({ length: 10 }, (_, i) => ({ id: i, title: `S${i}`, artist: `A${i}` }))
      render(<SongTable {...defaultProps} songs={tenSongs} limit={10} />)
      expect(screen.getByText('Next page ->')).toBeInTheDocument()
    })

    it('hides Next button when songs count is less than limit', () => {
      render(<SongTable {...defaultProps} songs={mockSongs} limit={10} />)
      expect(screen.queryByText('Next page ->')).not.toBeInTheDocument()
    })

    it('clicking Next calls setOffset with an increment function', () => {
      const setOffset = vi.fn()
      const tenSongs = Array.from({ length: 10 }, (_, i) => ({ id: i, title: `S${i}`, artist: `A${i}` }))
      render(<SongTable {...defaultProps} songs={tenSongs} limit={10} setOffset={setOffset} />)
      fireEvent.click(screen.getByText('Next page ->'))
      const updater = setOffset.mock.calls[0][0]
      expect(updater(0)).toBe(10)
    })
  })
})
