import React, { useRef, useEffect } from 'react';
import '../css/menu.css'

const Menu = ({ user, showMenu, toggleMenu, setCurrentPage, setSearchString }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMenuToggleButton = event.target.closest('.header-menu');
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) && !isMenuToggleButton) {
        toggleMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, toggleMenu]);

  function handleMenuItemClick(page) {
    setCurrentPage(page);
    toggleMenu();
  }

  function handleSearch() {
    setSearchString(document.querySelector('.menu-search').value);
    setCurrentPage('searchResults');
    toggleMenu();
    document.querySelector('.menu-search').value = '';
  }

  if (!user) return null;

  return (
    <div ref={menuRef} className={`menu ${showMenu ? 'open' : 'closed'}`}>
      <div className="menu-exit" onClick={() => {
        toggleMenu();
      }}>
        X
      </div>
      <div className="menu-header">
        <h2>Menu</h2>
      </div>
      <div className="menu-item" onClick={() => handleMenuItemClick('yourSongs')}>
        My Songs
      </div>
      <div className="menu-item" onClick={() => handleMenuItemClick('newSong')}>
        New Song
      </div>
      <input type="text" className="menu-search" placeholder="Search songs..." onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      }} />
      <div className="menu-item" onClick={() => handleSearch()}>
        Search
      </div>
    </div>
  );
};

export default Menu;