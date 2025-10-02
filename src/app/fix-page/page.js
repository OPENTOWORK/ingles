'use client';
import { useEffect } from 'react';

export default function FixPage() {
  useEffect(() => {
    // Limpiar high contrast
    localStorage.removeItem('accessibilitySettings');
    document.documentElement.classList.remove('high-contrast');
    document.documentElement.classList.remove('large-text');
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.remove('reduced-motion');
    document.documentElement.classList.remove('simplified-ui');
    
    alert('Settings cleared! Click OK to go home.');
    window.location.href = '/';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5rem',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      Fixing settings...
    </div>
  );
}







