import React from 'react';
import { fetchSearchSongs } from '../services/api';
import SongTable from './songTable.jsx';

const SearchResults = ({ user, searchString, setCurrentPage, setCurrentSong }) => {
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const limit = 10;
  const [offset, setOffset] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const fetchUserSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSearchSongs(limit, offset, searchString);
        setSongs(data);
      } catch {
        setError('Failed to fetch songs');
      } finally {
        setLoading(false);
      }
    };

    if (user && searchString) {
      fetchUserSearch();
    }
  }, [user, offset, limit, searchString, refreshKey]);

  return (
    <SongTable
      title="Search Results"
      songs={songs}
      loading={loading}
      error={error}
      limit={limit}
      offset={offset}
      setOffset={setOffset}
      setCurrentPage={setCurrentPage}
      setCurrentSong={setCurrentSong}
      onDeleteSuccess={() => setRefreshKey(prev => prev + 1)}
    />
  );
};

export default SearchResults;
