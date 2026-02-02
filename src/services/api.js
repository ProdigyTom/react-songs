const API_URL = 'http://localhost:3000/api';

const fetchSongs = async (user, limit = 10, offset = 0) => {
  const response = await fetch(`${API_URL}/songs?limit=${limit}&offset=${offset}`, {
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch songs');
  }
  return response.json();
};

const fetchSearchSongs = async (user, limit = 10, offset = 0, searchString) => {
  const response = await fetch(`${API_URL}/songs?limit=${limit}&offset=${offset}&query=${encodeURIComponent(searchString)}`, {
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  return response.json();
};

const fetchTabForSong = async (user, songId) => {
  const response = await fetch(`${API_URL}/tabs/${songId}`, {
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tab');
  }
  return response.json();
};

export { fetchSongs, fetchSearchSongs, fetchTabForSong };