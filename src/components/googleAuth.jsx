import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleAuth = ({ setUser }) => {
  const setCookie = (name, value, days) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
  };

  const onSuccess = async (credentialResponse) => {
    
    const res = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
    });
    
    if (res.ok) {
      const userData = await res.json();
      setCookie('user_data', JSON.stringify(userData), 7);
      setUser(userData);
    }
  };

  const onError = () => {
    console.log('Login Failed');
  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      useOneTap
    />
  );
};

export default GoogleAuth;