import React from 'react';
import GoogleAuth from './googleAuth';
import '../css/login.css';

const Login = ({ setUser }) => {
  return (
    <div className="login">
      <h1>Please Login</h1>
      <GoogleAuth setUser={setUser} />
    </div>
  );
};

export default Login;