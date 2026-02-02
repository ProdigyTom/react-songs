import React from 'react';
import '../css/appAuthenticated.css'
import YourSongs from './yourSongs.jsx';
import SearchResults from './searchResults.jsx';
import SongDisplay from './songDisplay.jsx';

const AppAuthenticated = ({ user, currentPage, setCurrentPage, searchString }) => {
  const [currentSong, setCurrentSong] = React.useState(null);

  return (
    <div className="app-authenticated">
      { currentPage === 'yourSongs' && (
        <YourSongs user={user} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />
      )}
      { currentPage === 'searchResults' && (
        <SearchResults user={user} searchString={searchString} setCurrentPage={setCurrentPage} setCurrentSong={setCurrentSong} />
      )}
      { currentPage === 'songDisplay' && (
        <SongDisplay user={user} song={currentSong} />
      )}
    </div>
  );
};

export default AppAuthenticated;
