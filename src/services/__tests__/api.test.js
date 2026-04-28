import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchSongs,
  fetchSearchSongs,
  fetchTabForSong,
  fetchVideosForSong,
  createNewSong,
  editSong,
  deleteSong,
  saveScrollSpeed,
  logout,
  setUnauthorizedHandler,
} from '../../services/api'

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
      await fetchSongs()
      expect(fetch).toHaveBeenCalledWith('/api/songs?limit=10&offset=0', {
        credentials: 'include',
      })
    })

    it('passes custom limit and offset', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchSongs(5, 20)
      expect(fetch).toHaveBeenCalledWith('/api/songs?limit=5&offset=20', {
        credentials: 'include',
      })
    })

    it('returns parsed response', async () => {
      const songs = [{ id: 1, title: 'Song' }]
      fetch.mockReturnValue(okJson(songs))
      expect(await fetchSongs()).toEqual(songs)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchSongs()).rejects.toThrow('Failed to fetch songs')
    })
  })

  describe('fetchSearchSongs', () => {
    it('encodes search query in URL', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchSearchSongs(10, 0, 'hello world')
      expect(fetch).toHaveBeenCalledWith(
        '/api/songs?limit=10&offset=0&query=hello%20world',
        { credentials: 'include' }
      )
    })

    it('returns parsed response', async () => {
      const songs = [{ id: 2, title: 'Match' }]
      fetch.mockReturnValue(okJson(songs))
      expect(await fetchSearchSongs(10, 0, 'q')).toEqual(songs)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchSearchSongs(10, 0, 'q')).rejects.toThrow(
        'Failed to fetch search results'
      )
    })
  })

  describe('fetchTabForSong', () => {
    it('calls correct endpoint', async () => {
      fetch.mockReturnValue(okJson({}))
      await fetchTabForSong(42)
      expect(fetch).toHaveBeenCalledWith('/api/tabs/42', {
        credentials: 'include',
      })
    })

    it('returns tab data', async () => {
      const tab = { text: 'Am G C' }
      fetch.mockReturnValue(okJson(tab))
      expect(await fetchTabForSong(1)).toEqual(tab)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchTabForSong(1)).rejects.toThrow('Failed to fetch tab')
    })
  })

  describe('fetchVideosForSong', () => {
    it('calls correct endpoint', async () => {
      fetch.mockReturnValue(okJson([]))
      await fetchVideosForSong(7)
      expect(fetch).toHaveBeenCalledWith('/api/videos/7', {
        credentials: 'include',
      })
    })

    it('returns video data', async () => {
      const videos = [{ id: 1, url: 'https://example.com' }]
      fetch.mockReturnValue(okJson(videos))
      expect(await fetchVideosForSong(1)).toEqual(videos)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(fetchVideosForSong(1)).rejects.toThrow('Failed to fetch videos')
    })
  })

  describe('createNewSong', () => {
    const songData = { title: 'New', artist: 'Artist', tab_text: '', videos: [] }

    it('sends POST with JSON body', async () => {
      fetch.mockReturnValue(okJson({ song: songData }))
      await createNewSong(songData)
      expect(fetch).toHaveBeenCalledWith('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(songData),
      })
    })

    it('returns parsed response', async () => {
      const res = { song: { id: 1, ...songData } }
      fetch.mockReturnValue(okJson(res))
      expect(await createNewSong(songData)).toEqual(res)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(createNewSong(songData)).rejects.toThrow('Failed to create new song')
    })
  })

  describe('editSong', () => {
    const songData = { title: 'Edited', artist: 'Artist', tab_text: 'Am', videos: [] }

    it('sends PUT with JSON body to song URL', async () => {
      fetch.mockReturnValue(okJson({ song: songData }))
      await editSong(5, songData)
      expect(fetch).toHaveBeenCalledWith('/api/songs/5', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(songData),
      })
    })

    it('returns parsed response', async () => {
      const res = { song: { id: 5, ...songData } }
      fetch.mockReturnValue(okJson(res))
      expect(await editSong(5, songData)).toEqual(res)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(editSong(5, songData)).rejects.toThrow('Failed to edit song')
    })
  })

  describe('deleteSong', () => {
    it('sends DELETE to song URL', async () => {
      fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
      await deleteSong(3)
      expect(fetch).toHaveBeenCalledWith('/api/songs/3', {
        method: 'DELETE',
        credentials: 'include',
      })
    })

    it('returns response status', async () => {
      fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
      expect(await deleteSong(3)).toBe(204)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(Promise.resolve({ ok: false, status: 500 }))
      await expect(deleteSong(3)).rejects.toThrow('Failed to delete song')
    })
  })

  describe('saveScrollSpeed', () => {
    it('sends PUT with scroll_speed to song URL', async () => {
      fetch.mockReturnValue(okJson({ song: { id: 5, scroll_speed: 30 } }))
      await saveScrollSpeed(5, 30)
      expect(fetch).toHaveBeenCalledWith('/api/songs/5', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scroll_speed: 30 }),
      })
    })

    it('returns parsed response', async () => {
      const res = { song: { id: 5, scroll_speed: 30 } }
      fetch.mockReturnValue(okJson(res))
      expect(await saveScrollSpeed(5, 30)).toEqual(res)
    })

    it('throws on non-ok response', async () => {
      fetch.mockReturnValue(errorResponse())
      await expect(saveScrollSpeed(5, 30)).rejects.toThrow('Failed to save scroll speed')
    })
  })
})

describe('401 unauthorized handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    setUnauthorizedHandler(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setUnauthorizedHandler(null)
  })

  it('calls the unauthorized handler when a 401 is received', async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 401 }))
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    await expect(fetchSongs()).rejects.toThrow('Unauthorized')
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call the handler for non-401 errors', async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 500 }))
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    await expect(fetchSongs()).rejects.toThrow('Failed to fetch songs')
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not throw when no handler is registered on 401', async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 401 }))

    await expect(fetchSongs()).rejects.toThrow('Unauthorized')
  })
})

describe('logout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends POST to /api/auth/logout with credentials: include', async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))

    await logout()

    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  })
})
