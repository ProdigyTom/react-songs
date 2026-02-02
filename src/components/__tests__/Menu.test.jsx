import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Menu from '../menu'

vi.mock('../../css/menu.css', () => ({}))

describe('Menu', () => {
  const defaultProps = {
    user: { name: 'Test User' },
    showMenu: true,
    toggleMenu: vi.fn(),
    setCurrentPage: vi.fn(),
    setSearchString: vi.fn(),
  }

  it('returns null when user is not provided', () => {
    const { container } = render(
      <Menu {...defaultProps} user={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders menu when user exists', () => {
    render(<Menu {...defaultProps} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('has open class when showMenu is true', () => {
    const { container } = render(<Menu {...defaultProps} showMenu={true} />)
    expect(container.querySelector('.menu.open')).toBeInTheDocument()
  })

  it('has closed class when showMenu is false', () => {
    const { container } = render(<Menu {...defaultProps} showMenu={false} />)
    expect(container.querySelector('.menu.closed')).toBeInTheDocument()
  })

  it('calls toggleMenu when exit button is clicked', () => {
    const toggleMenu = vi.fn()
    render(<Menu {...defaultProps} toggleMenu={toggleMenu} />)

    fireEvent.click(screen.getByText('X'))

    expect(toggleMenu).toHaveBeenCalled()
  })

  it('renders My Songs menu item', () => {
    render(<Menu {...defaultProps} />)
    expect(screen.getByText('My Songs')).toBeInTheDocument()
  })

  it('renders New Song menu item', () => {
    render(<Menu {...defaultProps} />)
    expect(screen.getByText('New Song')).toBeInTheDocument()
  })

  it('navigates to yourSongs when My Songs is clicked', () => {
    const setCurrentPage = vi.fn()
    render(<Menu {...defaultProps} setCurrentPage={setCurrentPage} />)

    fireEvent.click(screen.getByText('My Songs'))

    expect(setCurrentPage).toHaveBeenCalledWith('yourSongs')
  })

  it('navigates to newSong when New Song is clicked', () => {
    const setCurrentPage = vi.fn()
    render(<Menu {...defaultProps} setCurrentPage={setCurrentPage} />)

    fireEvent.click(screen.getByText('New Song'))

    expect(setCurrentPage).toHaveBeenCalledWith('newSong')
  })

  it('renders search input', () => {
    render(<Menu {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search songs...')).toBeInTheDocument()
  })

  it('renders Search button', () => {
    render(<Menu {...defaultProps} />)
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('sets search string and navigates when Search is clicked', () => {
    const setSearchString = vi.fn()
    const setCurrentPage = vi.fn()
    render(<Menu {...defaultProps} setSearchString={setSearchString} setCurrentPage={setCurrentPage} />)

    const searchInput = screen.getByPlaceholderText('Search songs...')
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    fireEvent.click(screen.getByText('Search'))

    expect(setSearchString).toHaveBeenCalledWith('test query')
    expect(setCurrentPage).toHaveBeenCalledWith('searchResults')
  })
})
