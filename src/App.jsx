import React from 'react';
import Login from './components/login.jsx';
import { useState } from 'react';
import Header from './components/header';
import AppAuthenticated from './components/appAuthenticated';
import Menu from './components/menu';
import { ToastProvider } from './context/ToastContext';
import { setUnauthorizedHandler, logout } from './services/api.js';
import './css/App.css';
import './css/toast.css';

function App() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setUser(null);
    });
  }, []);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('currentPage') || 'yourSongs');
  const [searchString, setSearchString] = useState('');

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  React.useEffect(() => {
    if (!user) {
      const userData = getCookie('user_data');
      if (userData) {
        try {
          const userDataJson = JSON.parse(userData);
          setUser(userDataJson);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  if (user) return (
    <ToastProvider>
      <div>
        <Header user={user} setUser={setUser} toggleMenu={toggleMenu} />
        <AppAuthenticated user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} searchString={searchString} />
        <Menu user={user} showMenu={showMenu} toggleMenu={toggleMenu} setCurrentPage={setCurrentPage} setSearchString={setSearchString} />
      </div>
    </ToastProvider>
  )
  else return (
    <div className="app">
      <Header user={user} setUser={setUser} />
      <Login setUser={setUser} />
    </div>
  )
}

export default App;