const API_URL = '/api';

let unauthorizedHandler = null;
const setUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

const checkResponse = (response, errorMessage) => {
  if (response.status === 401) {
    if (unauthorizedHandler) unauthorizedHandler();
    throw new Error('Unauthorized');
  }
  if (!response.ok) throw new Error(errorMessage);
};

const fetchSongs = async (limit = 10, offset = 0) => {
  const response = await fetch(`${API_URL}/songs?limit=${limit}&offset=${offset}`, {
    credentials: 'include',
  });
  checkResponse(response, 'Failed to fetch songs');
  return response.json();
};

const fetchSearchSongs = async (limit = 10, offset = 0, searchString) => {
  const response = await fetch(`${API_URL}/songs?limit=${limit}&offset=${offset}&query=${encodeURIComponent(searchString)}`, {
    credentials: 'include',
  });
  checkResponse(response, 'Failed to fetch search results');
  return response.json();
};

const fetchTabForSong = async (songId) => {
  const response = await fetch(`${API_URL}/tabs/${songId}`, {
    credentials: 'include',
  });
  checkResponse(response, 'Failed to fetch tab');
  return response.json();
};

const fetchVideosForSong = async (songId) => {
  const response = await fetch(`${API_URL}/videos/${songId}`, {
    credentials: 'include',
  });
  checkResponse(response, 'Failed to fetch videos');
  return response.json();
};

const createNewSong = async (songData) => {
  const response = await fetch(`${API_URL}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(songData)
  });
  checkResponse(response, 'Failed to create new song');
  return response.json();
};

const editSong = async (songId, songData) => {
  const response = await fetch(`${API_URL}/songs/${songId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(songData)
  });
  checkResponse(response, 'Failed to edit song');
  return response.json();
};

const deleteSong = async (songId) => {
  const response = await fetch(`${API_URL}/songs/${songId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  checkResponse(response, 'Failed to delete song');
  return response.status;
};

const saveScrollSpeed = async (songId, scrollSpeed) => {
  const response = await fetch(`${API_URL}/songs/${songId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ scroll_speed: scrollSpeed })
  });
  checkResponse(response, 'Failed to save scroll speed');
  return response.json();
};

const logout = () =>
  fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });

export { fetchSongs, fetchSearchSongs, fetchTabForSong, fetchVideosForSong, createNewSong, editSong, deleteSong, saveScrollSpeed, logout, setUnauthorizedHandler };