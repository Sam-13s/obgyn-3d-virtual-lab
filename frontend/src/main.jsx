import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthShell from './AuthShell.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthShell />
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const serviceWorkerUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href);
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.warn('Offline caching is unavailable in this browser session.', error);
    });
  });
}
