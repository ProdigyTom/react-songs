import React from 'react';
import '../css/menu.css'

const Menu = ({ user, showMenu, toggleMenu, setCurrentPage, setSearchString }) => {
  if (!user) return null;

  return (
    <div className={`menu ${showMenu ? 'open' : 'closed'}`} onBlur={toggleMenu}>
      <div className="menu-exit" onClick={() => {
        toggleMenu();
      }}>
        X
      </div>
      <div className="menu-header">
        <h2>Menu</h2>
      </div>
      <div className="menu-item" onClick={() => {
        setCurrentPage('yourSongs');
      }}>
        My Songs
      </div>
      <div className="menu-item" onClick={() => {
        setCurrentPage('newSong');
      }}>
        New Song
      </div>
      <input type="text" className="menu-search" placeholder="Search songs..." />
      <div className="menu-item" onClick={() => {
        setSearchString(document.querySelector('.menu-search').value);
        setCurrentPage('searchResults');
      }}>
        Search
      </div>
    </div>
  );
};

export default Menu;