import React from 'react';
import { fetchSearchSongs } from '../services/api';
import '../css/searchResults.css'

const SearchResults = ({ user, searchString, setCurrentPage, setCurrentSong }) => {
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(0);

  const fetchUserSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSearchSongs(user, limit, offset, searchString);
      setSongs(data);
    } catch (err) {
      setError('Failed to fetch songs');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user && searchString) {
      fetchUserSearch();
    }
  }, [user, offset, limit, searchString]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="search-results">
      <h2>Search Results</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
          </tr>
        </thead>
        <tbody>
          { songs.map(song => (
            <tr key={song.id} onClick={() => { 
              setCurrentPage('songDisplay');
              setCurrentSong(song);
            }}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {offset > 0 && (
          <button className="previous" onClick={() => {
            setOffset(prev => Math.max(0, prev - limit));
          }}>&lt;- Previous page</button>
        )}
        { songs.length === limit && (
          <button className="next" onClick={() => {
            setOffset(prev => prev + limit);
          }}>Next page -&gt;</button>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
