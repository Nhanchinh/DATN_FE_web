import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/i18n';
import App from './App.jsx';

/**
 * Entry point của ứng dụng
 * Vite mount React app vào DOM element #root
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
