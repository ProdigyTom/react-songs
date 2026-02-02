import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

vi.mock('../../css/appAuthenticated.css', () => ({}))

describe('AppAuthenticated', () => {
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
})
