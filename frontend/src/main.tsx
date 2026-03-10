import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppBuilder } from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppBuilder />
    </AuthProvider>
  </StrictMode>
);
