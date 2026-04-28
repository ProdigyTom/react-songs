import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SongForm from '../songForm'
import * as api from '../../services/api'

vi.mock('../../services/api')

const mockShowToast = vi.hoisted(() => vi.fn())
vi.mock('../../context/ToastContext', () => ({ useToast: () => mockShowToast }))

describe('SongForm', () => {
  const mockUser = { session_jwt: 'token' }
  const mockSong = { id: 5, title: 'Existing Song', artist: 'Existing Artist' }
  const mockTab = { text: 'Am G C\nHello' }
  const mockVideos = [{ video_type: 'tutorial', url: 'https://youtube.com/embed/abc' }]

  beforeEach(() => {
    vi.clearAllMocks()
    api.fetchTabForSong.mockResolvedValue(mockTab)
    api.fetchVideosForSong.mockResolvedValue(mockVideos)
  })

  describe('Create mode', () => {
    const createProps = {
      user: mockUser,
      song: null,
      setCurrentPage: vi.fn(),
      setCurrentSong: vi.fn(),
      type: 'Create',
    }

    it('renders empty title and artist inputs', () => {
      render(<SongForm {...createProps} />)
      expect(document.getElementById('song-title').value).toBe('')
      expect(document.getElementById('song-artist').value).toBe('')
    })

    it('renders an empty tab textarea', () => {
      render(<SongForm {...createProps} />)
      expect(document.getElementById('song-tab').value).toBe('')
    })

    it('starts with one empty video row', () => {
      render(<SongForm {...createProps} />)
      expect(document.querySelectorAll('.video-input-row')).toHaveLength(1)
    })

    it('does not fetch tab or videos on mount when no song', () => {
      render(<SongForm {...createProps} />)
      expect(api.fetchTabForSong).not.toHaveBeenCalled()
      expect(api.fetchVideosForSong).not.toHaveBeenCalled()
    })

    it('shows toast when title is empty on submit', async () => {
      render(<SongForm {...createProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      expect(mockShowToast).toHaveBeenCalledWith('Title is required.')
    })

    it('shows toast when artist is empty on submit', async () => {
      render(<SongForm {...createProps} />)
      fireEvent.change(document.getElementById('song-title'), { target: { value: 'A Title' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      expect(mockShowToast).toHaveBeenCalledWith('Artist is required.')
    })

    it('calls createNewSong with form data on submit', async () => {
      api.createNewSong.mockResolvedValue({ song: { id: 1, title: 'New', artist: 'Band' } })
      render(<SongForm {...createProps} />)
      fireEvent.change(document.getElementById('song-title'), { target: { value: 'New' } })
      fireEvent.change(document.getElementById('song-artist'), { target: { value: 'Band' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(api.createNewSong).toHaveBeenCalledWith({
          title: 'New',
          artist: 'Band',
          tab_text: '',
          videos: [],
        })
      })
    })

    it('navigates to songDisplay after successful create', async () => {
      const setCurrentPage = vi.fn()
      const setCurrentSong = vi.fn()
      const savedSong = { id: 1, title: 'New', artist: 'Band' }
      api.createNewSong.mockResolvedValue({ song: savedSong })
      render(<SongForm {...createProps} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />)
      fireEvent.change(document.getElementById('song-title'), { target: { value: 'New' } })
      fireEvent.change(document.getElementById('song-artist'), { target: { value: 'Band' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(setCurrentSong).toHaveBeenCalledWith(savedSong)
        expect(setCurrentPage).toHaveBeenCalledWith('songDisplay')
      })
    })

    it('shows Saving... and disables button while submitting', async () => {
      api.createNewSong.mockImplementation(() => new Promise(() => {}))
      render(<SongForm {...createProps} />)
      fireEvent.change(document.getElementById('song-title'), { target: { value: 'T' } })
      fireEvent.change(document.getElementById('song-artist'), { target: { value: 'A' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
      })
    })

    it('shows toast and re-enables button on submit failure', async () => {
      api.createNewSong.mockRejectedValue(new Error('Network error'))
      render(<SongForm {...createProps} />)
      fireEvent.change(document.getElementById('song-title'), { target: { value: 'T' } })
      fireEvent.change(document.getElementById('song-artist'), { target: { value: 'A' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to save song. Please try again.')
        expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled()
      })
    })
  })

  describe('Edit mode', () => {
    const editProps = {
      user: mockUser,
      song: mockSong,
      setCurrentPage: vi.fn(),
      setCurrentSong: vi.fn(),
      type: 'Edit',
    }

    it('pre-fills title and artist from song prop', async () => {
      render(<SongForm {...editProps} />)
      await waitFor(() => {
        expect(document.getElementById('song-title').value).toBe('Existing Song')
        expect(document.getElementById('song-artist').value).toBe('Existing Artist')
      })
    })

    it('fetches and displays tab content on mount', async () => {
      render(<SongForm {...editProps} />)
      await waitFor(() => {
        expect(document.getElementById('song-tab').value).toBe('Am G C\nHello')
      })
    })

    it('fetches and displays existing videos on mount', async () => {
      render(<SongForm {...editProps} />)
      await waitFor(() => {
        expect(screen.getByDisplayValue('tutorial')).toBeInTheDocument()
        expect(screen.getByDisplayValue('https://youtube.com/embed/abc')).toBeInTheDocument()
      })
    })

    it('shows toast when fetch fails on mount', async () => {
      api.fetchTabForSong.mockRejectedValue(new Error('Network error'))
      render(<SongForm {...editProps} />)
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to load song data. Please try again.')
      })
    })

    it('calls editSong with form data on submit', async () => {
      api.editSong.mockResolvedValue({ song: mockSong })
      render(<SongForm {...editProps} />)
      await waitFor(() => expect(document.getElementById('song-title').value).toBe('Existing Song'))
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(api.editSong).toHaveBeenCalledWith(
          mockSong.id,
          expect.objectContaining({ title: 'Existing Song', artist: 'Existing Artist' })
        )
      })
    })
  })

  describe('video management', () => {
    const createProps = {
      user: mockUser,
      song: null,
      setCurrentPage: vi.fn(),
      setCurrentSong: vi.fn(),
      type: 'Create',
    }

    it('adds a video row when + Add Video is clicked', () => {
      render(<SongForm {...createProps} />)
      fireEvent.click(screen.getByRole('button', { name: '+ Add Video' }))
      expect(document.querySelectorAll('.video-input-row')).toHaveLength(2)
    })

    it('hides + Add Video button at max 5 videos', () => {
      render(<SongForm {...createProps} />)
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByRole('button', { name: '+ Add Video' }))
      }
      expect(screen.queryByRole('button', { name: '+ Add Video' })).not.toBeInTheDocument()
    })

    it('shows Remove button when there are multiple video rows', () => {
      render(<SongForm {...createProps} />)
      fireEvent.click(screen.getByRole('button', { name: '+ Add Video' }))
      expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2)
    })

    it('removes a video row when Remove is clicked', () => {
      render(<SongForm {...createProps} />)
      fireEvent.click(screen.getByRole('button', { name: '+ Add Video' }))
      fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
      expect(document.querySelectorAll('.video-input-row')).toHaveLength(1)
    })

    it('hides Remove button when only one video row remains', () => {
      render(<SongForm {...createProps} />)
      expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
    })

    it('only submits videos with both type and URL filled in', async () => {
      api.createNewSong.mockResolvedValue({ song: { id: 1, title: 'T', artist: 'A' } })
      render(<SongForm {...createProps} />)
      fireEvent.change(document.getElementById('song-title'), { target: { value: 'T' } })
      fireEvent.change(document.getElementById('song-artist'), { target: { value: 'A' } })

      // Add a second row and fill only one
      fireEvent.click(screen.getByRole('button', { name: '+ Add Video' }))
      const typeInputs = document.querySelectorAll('.video-type-input')
      const urlInputs = document.querySelectorAll('.video-url-input')
      fireEvent.change(typeInputs[0], { target: { value: 'tutorial' } })
      fireEvent.change(urlInputs[0], { target: { value: 'https://example.com' } })
      // Second row is left empty

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        const call = api.createNewSong.mock.calls[0]
        expect(call[0].videos).toEqual([{ video_type: 'tutorial', url: 'https://example.com' }])
      })
    })
  })
})
