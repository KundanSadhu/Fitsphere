import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider} from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

const __BUILD__ = '2026-07-02T00:38Z';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
