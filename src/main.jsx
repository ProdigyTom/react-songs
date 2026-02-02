import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="348459928331-3g606qfio1p157c6f9lblr31osb5ao78.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);