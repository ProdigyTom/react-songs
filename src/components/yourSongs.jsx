import React from 'react';
import { fetchSongs } from '../services/api';
import '../css/songTable.css'

const YourSongs = ({ user, setCurrentPage, setCurrentSong }) => {
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const limit = 10;
  const [offset, setOffset] = React.useState(0);

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
  }, [user, offset, limit]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="song-table">
      <h2>Your Songs</h2>
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

export default YourSongs;
