import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/index.css';

// ?demo = โหมดสาธิตสำหรับอัดวิดีโอ (เฉพาะ npm run dev)
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo')) {
  import('./demo.js').then((m) => m.default());
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
