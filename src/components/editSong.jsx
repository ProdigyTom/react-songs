import React from 'react';
import SongForm from './songForm.jsx';
import '../css/editSong.css';

const EditSong = ({ user, song, setCurrentPage, setCurrentSong }) => {
  return (
    <div className="edit-song">
      <h1>Edit Song</h1>
      <SongForm user={user} song={song} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} type={'Edit'} />
    </div>
  );
};

export default EditSong;