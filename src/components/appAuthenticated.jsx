import React from 'react';
import '../css/appAuthenticated.css'
import YourSongs from './yourSongs.jsx';
import SearchResults from './searchResults.jsx';
import SongDisplay from './songDisplay.jsx';
import EditSong from './editSong.jsx';
import CreateSong from './createSong.jsx';

const AppAuthenticated = ({ user, currentPage, setCurrentPage, searchString }) => {
  const [currentSong, setCurrentSong] = React.useState(() => {
    try {
      const saved = localStorage.getItem('currentSong');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    if (currentSong) {
      localStorage.setItem('currentSong', JSON.stringify(currentSong));
    } else {
      localStorage.removeItem('currentSong');
    }
  }, [currentSong]);

  // Guard: if we restored a page that needs a song but the song is missing, fall back
  React.useEffect(() => {
    if ((currentPage === 'songDisplay' || currentPage === 'editSong') && !currentSong) {
      setCurrentPage('yourSongs');
    }
  }, []);

  return (
    <div className="app-authenticated">
      { currentPage === 'yourSongs' && (
        <YourSongs user={user} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />
      )}
      { currentPage === 'searchResults' && (
        <SearchResults user={user} searchString={searchString} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />
      )}
      { currentPage === 'songDisplay' && (
        <SongDisplay user={user} song={currentSong} setCurrentPage={setCurrentPage} />
      )}
      { currentPage === 'editSong' && (
        <EditSong user={user} song={currentSong} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />
      )}
      { currentPage === 'newSong' && (
        <CreateSong user={user} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />
      )}
    </div>
  );
};

export default AppAuthenticated;
