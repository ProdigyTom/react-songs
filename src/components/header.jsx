import React from 'react';
import '../css/header.css'
import { logout } from '../services/api';

const Header = ({ user, setUser, toggleMenu }) => {
  const handleLogout = async () => {
    await logout();
    document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
  };

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
            <button className="header-logout" onClick={handleLogout}>
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