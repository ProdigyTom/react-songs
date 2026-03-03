import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AppAuthenticated from '../appAuthenticated'

vi.mock('../yourSongs', () => ({
  default: () => <div data-testid="your-songs">YourSongs Component</div>
}))

vi.mock('../searchResults', () => ({
  default: () => <div data-testid="search-results">SearchResults Component</div>
}))

vi.mock('../songDisplay', () => ({
  default: ({ song }) => <div data-testid="song-display">SongDisplay: {song?.title}</div>
}))

vi.mock('../editSong', () => ({
  default: ({ song }) => <div data-testid="edit-song">EditSong: {song?.title}</div>
}))

vi.mock('../createSong', () => ({
  default: () => <div data-testid="create-song">CreateSong Component</div>
}))

vi.mock('../../css/appAuthenticated.css', () => ({}))

describe('AppAuthenticated', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const mockUser = { name: 'Test User' }
  const defaultProps = {
    user: mockUser,
    currentPage: 'yourSongs',
    setCurrentPage: vi.fn(),
    searchString: '',
  }

  it('renders YourSongs when currentPage is yourSongs', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="yourSongs" />)
    expect(screen.getByTestId('your-songs')).toBeInTheDocument()
  })

  it('does not render SearchResults or SongDisplay when currentPage is yourSongs', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="yourSongs" />)
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument()
    expect(screen.queryByTestId('song-display')).not.toBeInTheDocument()
  })

  it('renders SearchResults when currentPage is searchResults', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="searchResults" />)
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
  })

  it('does not render YourSongs or SongDisplay when currentPage is searchResults', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="searchResults" />)
    expect(screen.queryByTestId('your-songs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('song-display')).not.toBeInTheDocument()
  })

  it('renders SongDisplay when currentPage is songDisplay', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="songDisplay" />)
    expect(screen.getByTestId('song-display')).toBeInTheDocument()
  })

  it('does not render YourSongs or SearchResults when currentPage is songDisplay', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="songDisplay" />)
    expect(screen.queryByTestId('your-songs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument()
  })

  it('has app-authenticated class on container', () => {
    const { container } = render(<AppAuthenticated {...defaultProps} />)
    expect(container.querySelector('.app-authenticated')).toBeInTheDocument()
  })

  it('renders EditSong when currentPage is editSong', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, title: 'My Song' }))
    render(<AppAuthenticated {...defaultProps} currentPage="editSong" />)
    expect(screen.getByTestId('edit-song')).toBeInTheDocument()
  })

  it('renders CreateSong when currentPage is newSong', () => {
    render(<AppAuthenticated {...defaultProps} currentPage="newSong" />)
    expect(screen.getByTestId('create-song')).toBeInTheDocument()
  })

  it('redirects to yourSongs when currentPage is songDisplay but no currentSong', async () => {
    const setCurrentPage = vi.fn()
    render(<AppAuthenticated {...defaultProps} currentPage="songDisplay" setCurrentPage={setCurrentPage} />)
    await waitFor(() => {
      expect(setCurrentPage).toHaveBeenCalledWith('yourSongs')
    })
  })

  it('redirects to yourSongs when currentPage is editSong but no currentSong', async () => {
    const setCurrentPage = vi.fn()
    render(<AppAuthenticated {...defaultProps} currentPage="editSong" setCurrentPage={setCurrentPage} />)
    await waitFor(() => {
      expect(setCurrentPage).toHaveBeenCalledWith('yourSongs')
    })
  })

  it('persists currentSong to localStorage when it changes', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, title: 'Saved' }))
    render(<AppAuthenticated {...defaultProps} currentPage="editSong" />)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'currentSong',
      JSON.stringify({ id: 1, title: 'Saved' })
    )
  })
})
