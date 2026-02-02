import React from 'react';
import '../css/header.css'

const Header = ({ user, setUser, toggleMenu }) => {
  return (
    <div className="header">
      {user ? (
        <div className="header-user">
          <div className="header-menu" onClick={() => toggleMenu()}>
            <span className="header-menu-icon">☰</span>
          </div>
          <div className="header-title">Song Project</div>
          <div className="header-right">
            <div className="header-welcome">Welcome, {user.name}</div>
            <button className="header-logout" onClick={() => {
              setUser(null);
              document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="header-login">Please log in</div>
      )}
    </div>
  );
};

export default Header;