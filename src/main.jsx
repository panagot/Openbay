import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import { About } from './pages/About.jsx';
import { ApiLab } from './pages/ApiLab.jsx';
import { PersonaProvider } from './context/PersonaContext.jsx';
import './styles.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PersonaProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />
          <Route path="/lab" element={<ApiLab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PersonaProvider>
    </BrowserRouter>
  </React.StrictMode>
);


