import React from 'react';
import { fetchSongs } from '../services/api';
import SongTable from './songTable.jsx';

const YourSongs = ({ user, setCurrentPage, setCurrentSong }) => {
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const limit = 10;
  const [offset, setOffset] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const fetchUserSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSongs(user, limit, offset);
        setSongs(data);
      } catch {
        setError('Failed to fetch songs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserSongs();
    }
  }, [user, offset, limit, refreshKey]);

  return (
    <SongTable
      title="Your Songs"
      songs={songs}
      loading={loading}
      error={error}
      limit={limit}
      offset={offset}
      setOffset={setOffset}
      user={user}
      setCurrentPage={setCurrentPage}
      setCurrentSong={setCurrentSong}
      onDeleteSuccess={() => setRefreshKey(prev => prev + 1)}
    />
  );
};

export default YourSongs;
