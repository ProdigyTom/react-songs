import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import EditSong from '../editSong'

vi.mock('../songForm', () => ({
  default: ({ type, song, user, setCurrentPage, setCurrentSong }) => (
    <div
      data-testid="song-form"
      data-type={type}
      data-song-id={song?.id}
      data-has-user={!!user}
      data-has-set-current-page={!!setCurrentPage}
      data-has-set-current-song={!!setCurrentSong}
    />
  ),
}))

describe('EditSong', () => {
  const mockProps = {
    user: { session_jwt: 'token' },
    song: { id: 5, title: 'My Song', artist: 'Artist' },
    setCurrentPage: vi.fn(),
    setCurrentSong: vi.fn(),
  }

  it('renders the Edit Song heading', () => {
    render(<EditSong {...mockProps} />)
    expect(screen.getByText('Edit Song')).toBeInTheDocument()
  })

  it('renders SongForm with type Edit', () => {
    render(<EditSong {...mockProps} />)
    expect(screen.getByTestId('song-form')).toHaveAttribute('data-type', 'Edit')
  })

  it('passes all props down to SongForm', () => {
    render(<EditSong {...mockProps} />)
    const form = screen.getByTestId('song-form')
    expect(form).toHaveAttribute('data-song-id', '5')
    expect(form).toHaveAttribute('data-has-user', 'true')
    expect(form).toHaveAttribute('data-has-set-current-page', 'true')
    expect(form).toHaveAttribute('data-has-set-current-song', 'true')
  })
})
