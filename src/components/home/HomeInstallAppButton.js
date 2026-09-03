'use client';

import { useEffect, useState } from 'react';

const MOBILE_TABLET_MEDIA_QUERY = '(max-width: 1024px)';

export default function HomeInstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_TABLET_MEDIA_QUERY);
    const syncViewport = () => setIsMobileOrTablet(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

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
      mediaQuery.matches
    ) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error('Could not prepare app installation:', error);
      });
    }

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
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

  if (!isMobileOrTablet || installed) return null;

  return (
    <div className="home-install-app">
      <button type="button" className="home-install-app__button" onClick={() => void handleInstall()}>
        <span className="home-install-app__icon" aria-hidden>
          ↓
        </span>
        Descargar acceso directo
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
