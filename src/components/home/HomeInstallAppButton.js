'use client';

import { useEffect, useState } from 'react';

export default function HomeInstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) setInstalled(true);

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    if (
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator &&
      window.matchMedia('(max-width: 1024px)').matches
    ) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error('Could not prepare app installation:', error);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstructions((current) => !current);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  if (installed) return null;

  return (
    <div className="home-install-app">
      <button type="button" className="home-install-app__button" onClick={() => void handleInstall()}>
        <span className="home-install-app__icon" aria-hidden>
          ↓
        </span>
        Descargar app
      </button>
      {showInstructions ? (
        <p className="home-install-app__instructions" role="status">
          En iPhone o iPad: pulsa Compartir y “Añadir a pantalla de inicio”. En Android: abre el
          menú ⋮ y pulsa “Instalar aplicación”.
        </p>
      ) : null}
    </div>
  );
}
