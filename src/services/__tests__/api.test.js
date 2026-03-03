import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchSongs,
  fetchSearchSongs,
  fetchTabForSong,
  fetchVideosForSong,
  createNewSong,
  editSong,
  deleteSong,
} from '../../services/api'

const mockUser = { session_jwt: 'test-token' }

const okJson = (data) =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) })

const errorResponse = () => Promise.resolve({ ok: false, status: 500 })

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchSongs', () => {
    it('calls correct endpoint with default params', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchSongs(mockUser)
      expect(fetch).toHaveBeenCalledWith('/api/songs?limit=10&offset=0', {
        headers: { Authorization: 'Bearer test-token' },
      })
    })

    it('passes custom limit and offset', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchSongs(mockUser, 5, 20)
      expect(fetch).toHaveBeenCalledWith('/api/songs?limit=5&offset=20', {
        headers: { Authorization: 'Bearer test-token' },
      })
    })

    it('returns parsed response', async () => {
      const songs = [{ id: 1, title: 'Song' }]
      fetch.mockReturnValue(okJson(songs))
      expect(await fetchSongs(mockUser)).toEqual(songs)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchSongs(mockUser)).rejects.toThrow('Failed to fetch songs')
    })
  })

  describe('fetchSearchSongs', () => {
    it('encodes search query in URL', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchSearchSongs(mockUser, 10, 0, 'hello world')
      expect(fetch).toHaveBeenCalledWith(
        '/api/songs?limit=10&offset=0&query=hello%20world',
        { headers: { Authorization: 'Bearer test-token' } }
      )
    })

    it('returns parsed response', async () => {
      const songs = [{ id: 2, title: 'Match' }]
      fetch.mockReturnValue(okJson(songs))
      expect(await fetchSearchSongs(mockUser, 10, 0, 'q')).toEqual(songs)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchSearchSongs(mockUser, 10, 0, 'q')).rejects.toThrow(
        'Failed to fetch search results'
      )
    })
  })

  describe('fetchTabForSong', () => {
    it('calls correct endpoint', async () => {
      fetch.mockReturnValue(okJson({}))
      await fetchTabForSong(mockUser, 42)
      expect(fetch).toHaveBeenCalledWith('/api/tabs/42', {
        headers: { Authorization: 'Bearer test-token' },
      })
    })

    it('returns tab data', async () => {
      const tab = { text: 'Am G C' }
      fetch.mockReturnValue(okJson(tab))
      expect(await fetchTabForSong(mockUser, 1)).toEqual(tab)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchTabForSong(mockUser, 1)).rejects.toThrow('Failed to fetch tab')
    })
  })

  describe('fetchVideosForSong', () => {
    it('calls correct endpoint', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchVideosForSong(mockUser, 7)
      expect(fetch).toHaveBeenCalledWith('/api/videos/7', {
        headers: { Authorization: 'Bearer test-token' },
      })
    })

    it('returns video data', async () => {
      const videos = [{ id: 1, url: 'https://example.com' }]
      fetch.mockReturnValue(okJson(videos))
      expect(await fetchVideosForSong(mockUser, 1)).toEqual(videos)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchVideosForSong(mockUser, 1)).rejects.toThrow('Failed to fetch videos')
    })
  })

  describe('createNewSong', () => {
    const songData = { title: 'New', artist: 'Artist', tab_text: '', videos: [] }

    it('sends POST with JSON body', async () => {
      fetch.mockReturnValue(okJson({ song: songData }))
      await createNewSong(mockUser, songData)
      expect(fetch).toHaveBeenCalledWith('/api/songs', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      })
    })

    it('returns parsed response', async () => {
      const res = { song: { id: 1, ...songData } }
      fetch.mockReturnValue(okJson(res))
      expect(await createNewSong(mockUser, songData)).toEqual(res)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(createNewSong(mockUser, songData)).rejects.toThrow('Failed to create new song')
    })
  })

  describe('editSong', () => {
    const songData = { title: 'Edited', artist: 'Artist', tab_text: 'Am', videos: [] }

    it('sends PUT with JSON body to song URL', async () => {
      fetch.mockReturnValue(okJson({ song: songData }))
      await editSong(mockUser, 5, songData)
      expect(fetch).toHaveBeenCalledWith('/api/songs/5', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      })
    })

    it('returns parsed response', async () => {
      const res = { song: { id: 5, ...songData } }
      fetch.mockReturnValue(okJson(res))
      expect(await editSong(mockUser, 5, songData)).toEqual(res)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(editSong(mockUser, 5, songData)).rejects.toThrow('Failed to edit song')
    })
  })

  describe('deleteSong', () => {
    it('sends DELETE to song URL', async () => {
      fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
      await deleteSong(mockUser, 3)
      expect(fetch).toHaveBeenCalledWith('/api/songs/3', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer test-token' },
      })
    })

    it('returns response status', async () => {
      fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
      expect(await deleteSong(mockUser, 3)).toBe(204)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(Promise.resolve({ ok: false, status: 500 }))
      await expect(deleteSong(mockUser, 3)).rejects.toThrow('Failed to delete song')
    })
  })
})
