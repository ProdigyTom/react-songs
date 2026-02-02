import React from 'react';
import Login from './components/login';
import { useState } from 'react';
import Header from './components/Header';
import AppAuthenticated from './components/appAuthenticated';
import Menu from './components/menu';
import './css/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState('yourSongs');
  const [searchString, setSearchString] = useState('');

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  if (!user) {
    const userData = getCookie('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }

  if (user) return (
    <div>
      <Header user={user} setUser={setUser} toggleMenu={toggleMenu} />
      <AppAuthenticated user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} searchString={searchString} />
      <Menu user={user} showMenu={showMenu} toggleMenu={toggleMenu} setCurrentPage={setCurrentPage} setSearchString={setSearchString} />
    </div>
  )
  else return (
    <div className="app">
      <Header user={user} setUser={setUser} />
      <Login setUser={setUser} />
    </div>
  )
}

export default App;