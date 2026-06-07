'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';
import { AuthProvider } from '../../src/context/AuthContext';

export default function AppPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
