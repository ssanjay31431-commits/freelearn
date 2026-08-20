import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// Configure Axios Base URL for Render backend deployment
axios.defaults.baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://vibeforge-hq68.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

