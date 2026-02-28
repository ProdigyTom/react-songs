import React from 'react';
import SongForm from './songForm.jsx';
import '../css/createSong.css';

const CreateSong = ({ user, setCurrentPage, setCurrentSong }) => {
  return (
    <div className="create-song">
      <h1>Create Song</h1>
      <SongForm user={user} song={null} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} type={'Create'} />
    </div>
  );
};

export default CreateSong;