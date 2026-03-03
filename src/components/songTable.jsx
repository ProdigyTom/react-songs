import React from 'react';
import { deleteSong } from '../services/api';
import '../css/songTable.css';
import { useToast } from '../context/ToastContext';

const SongTable = ({ title, songs, loading, error, limit, offset, setOffset, user, setCurrentPage, setCurrentSong, onDeleteSuccess }) => {
  const showToast = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="song-table">
      <h2>{title}</h2>
      <table className="song-table-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
          </tr>
        </thead>
        <tbody>
          {songs.map(song => (
            <tr key={song.id} onClick={() => {
              setCurrentPage('songDisplay');
              setCurrentSong(song);
            }}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td className="delete-cell" onClick={(e) => e.stopPropagation()}>
                {confirmDeleteId === song.id ? (
                  <>
                    <span className="delete-confirm" onClick={() => {
                      deleteSong(user, song.id).then(() => {
                        setConfirmDeleteId(null);
                        onDeleteSuccess();
                      }).catch(() => {
                        showToast('Failed to delete song');
                        setConfirmDeleteId(null);
                      });
                    }}>Sure?</span>
                    {' '}
                    <span className="delete-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</span>
                  </>
                ) : (
                  <b className="delete-song" onClick={() => setConfirmDeleteId(song.id)}>X</b>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {offset > 0 && (
          <button className="previous" onClick={() => setOffset(prev => Math.max(0, prev - limit))}>&lt;- Previous page</button>
        )}
        {songs.length === limit && (
          <button className="next" onClick={() => setOffset(prev => prev + limit)}>Next page -&gt;</button>
        )}
      </div>
    </div>
  );
};

export default SongTable;
