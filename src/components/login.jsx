import React from 'react';
import GoogleAuth from './googleAuth';
import '../css/login.css';

const Login = ({ setUser }) => {
  return (
    <div className="login">
      <h1>Song Project</h1>
      <p className="login-description">
        Your personal guitar tab library. Store tabs for your songs,
        auto-scroll while you play, and attach YouTube videos.
      </p>
      <GoogleAuth setUser={setUser} />
    </div>
  );
};

export default Login;