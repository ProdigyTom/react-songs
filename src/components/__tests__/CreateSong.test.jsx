import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CreateSong from '../createSong'

vi.mock('../songForm', () => ({
  default: ({ type, song, user, setCurrentPage, setCurrentSong }) => (
    <div
      data-testid="song-form"
      data-type={type}
      data-song={song === null ? 'null' : 'set'}
      data-has-user={!!user}
      data-has-set-current-page={!!setCurrentPage}
      data-has-set-current-song={!!setCurrentSong}
    />
  ),
}))

describe('CreateSong', () => {
  const mockProps = {
    user: { session_jwt: 'token' },
    setCurrentPage: vi.fn(),
    setCurrentSong: vi.fn(),
  }

  it('renders the Create Song heading', () => {
    render(<CreateSong {...mockProps} />)
    expect(screen.getByText('Create Song')).toBeInTheDocument()
  })

  it('renders SongForm with type Create', () => {
    render(<CreateSong {...mockProps} />)
    expect(screen.getByTestId('song-form')).toHaveAttribute('data-type', 'Create')
  })

  it('passes null as song to SongForm', () => {
    render(<CreateSong {...mockProps} />)
    expect(screen.getByTestId('song-form')).toHaveAttribute('data-song', 'null')
  })

  it('passes all props down to SongForm', () => {
    render(<CreateSong {...mockProps} />)
    const form = screen.getByTestId('song-form')
    expect(form).toHaveAttribute('data-has-user', 'true')
    expect(form).toHaveAttribute('data-has-set-current-page', 'true')
    expect(form).toHaveAttribute('data-has-set-current-song', 'true')
  })
})
