import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchResults from '../searchResults'
import * as api from '../../services/api'

vi.mock('../../services/api')
vi.mock('../../css/searchResults.css', () => ({}))

describe('SearchResults', () => {
  const mockUser = { name: 'Test User', session_jwt: 'token123' }
  const mockSongs = [
    { id: 1, title: 'Found Song', artist: 'Found Artist' },
    { id: 2, title: 'Another Match', artist: 'Another Artist' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state when fetching', () => {
    api.fetchSearchSongs.mockImplementation(() => new Promise(() => {}))
    render(
      <SearchResults
        user={mockUser}
        searchString="test"
        setCurrentPage={vi.fn()}
        setCurrentSong={vi.fn()}
      />
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches songs with search string on mount', async () => {
    api.fetchSearchSongs.mockResolvedValue(mockSongs)
    render(
      <SearchResults
        user={mockUser}
        searchString="test query"
        setCurrentPage={vi.fn()}
        setCurrentSong={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(api.fetchSearchSongs).toHaveBeenCalledWith(mockUser, 10, 0, 'test query')
    })
  })

  it('does not fetch if searchString is empty', () => {
    api.fetchSearchSongs.mockResolvedValue([])
    render(
      <SearchResults
        user={mockUser}
        searchString=""
        setCurrentPage={vi.fn()}
        setCurrentSong={vi.fn()}
      />
    )

    expect(api.fetchSearchSongs).not.toHaveBeenCalled()
  })

  it('displays search results in a table', async () => {
    api.fetchSearchSongs.mockResolvedValue(mockSongs)
    render(
      <SearchResults
        user={mockUser}
        searchString="test"
        setCurrentPage={vi.fn()}
        setCurrentSong={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Found Song')).toBeInTheDocument()
      expect(screen.getByText('Found Artist')).toBeInTheDocument()
      expect(screen.getByText('Another Match')).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    api.fetchSearchSongs.mockRejectedValue(new Error('Network error'))
    render(
      <SearchResults
        user={mockUser}
        searchString="test"
        setCurrentPage={vi.fn()}
        setCurrentSong={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch songs')).toBeInTheDocument()
    })
  })

  it('shows Search Results heading', async () => {
    api.fetchSearchSongs.mockResolvedValue(mockSongs)
    render(
      <SearchResults
        user={mockUser}
        searchString="test"
        setCurrentPage={vi.fn()}
        setCurrentSong={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument()
    })
  })

  it('navigates to songDisplay when a song is clicked', async () => {
    api.fetchSearchSongs.mockResolvedValue(mockSongs)
    const setCurrentPage = vi.fn()
    const setCurrentSong = vi.fn()
    render(
      <SearchResults
        user={mockUser}
        searchString="test"
        setCurrentPage={setCurrentPage}
        setCurrentSong={setCurrentSong}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Found Song')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Found Song'))

    expect(setCurrentPage).toHaveBeenCalledWith('songDisplay')
    expect(setCurrentSong).toHaveBeenCalledWith(mockSongs[0])
  })

  describe('pagination', () => {
    it('does not show Previous button on first page', async () => {
      api.fetchSearchSongs.mockResolvedValue(mockSongs)
      render(
        <SearchResults
          user={mockUser}
          searchString="test"
          setCurrentPage={vi.fn()}
          setCurrentSong={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Found Song')).toBeInTheDocument()
      })

      expect(screen.queryByText('<- Previous page')).not.toBeInTheDocument()
    })

    it('shows Next button when results equal limit', async () => {
      const tenSongs = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
      }))
      api.fetchSearchSongs.mockResolvedValue(tenSongs)
      render(
        <SearchResults
          user={mockUser}
          searchString="test"
          setCurrentPage={vi.fn()}
          setCurrentSong={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Next page ->')).toBeInTheDocument()
      })
    })

    it('fetches next page when Next is clicked', async () => {
      const tenSongs = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
      }))
      api.fetchSearchSongs.mockResolvedValue(tenSongs)
      render(
        <SearchResults
          user={mockUser}
          searchString="test"
          setCurrentPage={vi.fn()}
          setCurrentSong={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Next page ->')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Next page ->'))

      await waitFor(() => {
        expect(api.fetchSearchSongs).toHaveBeenCalledWith(mockUser, 10, 10, 'test')
      })
    })
  })
})
