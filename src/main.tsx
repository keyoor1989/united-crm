
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create a root with concurrent mode disabled for better initial load performance
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
