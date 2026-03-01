const API_URL = 'http://localhost:3001/api';

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

const fetchVideosForSong = async (user, songId) => {
  const response = await fetch(`${API_URL}/videos/${songId}`, {
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
};

const createNewSong = async (user, songData) => {
  const response = await fetch(`${API_URL}/songs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(songData)
  });
  if (!response.ok) {
    throw new Error('Failed to create new song');
  }
  return response.json();
};

const editSong = async (user, songId, songData) => {
  const response = await fetch(`${API_URL}/songs/${songId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(songData)
  });
  if (!response.ok) {
    throw new Error('Failed to edit song');
  }
  return response.json();
};

const deleteSong = async (user, songId) => {
  const response = await fetch(`${API_URL}/songs/${songId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${user.session_jwt}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to delete song');
  }
  return response.status;
};

export { fetchSongs, fetchSearchSongs, fetchTabForSong, fetchVideosForSong, createNewSong, editSong, deleteSong };