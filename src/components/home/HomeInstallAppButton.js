'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const MOBILE_TABLET_MEDIA_QUERY = '(max-width: 1024px)';
const PHONE_MEDIA_QUERY = '(max-width: 639px)';

export default function HomeInstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [headerSlot, setHeaderSlot] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_TABLET_MEDIA_QUERY);
    const phoneQuery = window.matchMedia(PHONE_MEDIA_QUERY);
    const syncViewport = () => {
      setIsMobileOrTablet(mediaQuery.matches);
      setIsPhone(phoneQuery.matches);
    };
    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    phoneQuery.addEventListener('change', syncViewport);

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
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
      phoneQuery.removeEventListener('change', syncViewport);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isPhone) {
      setHeaderSlot(null);
      return undefined;
    }

    const findSlot = () => document.querySelector('[data-home-install-slot]');
    const existing = findSlot();
    if (existing) {
      setHeaderSlot(existing);
      return undefined;
    }

    const observer = new MutationObserver(() => {
      const slot = findSlot();
      if (!slot) return;
      setHeaderSlot(slot);
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isPhone]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  if (!isMobileOrTablet || installed) return null;

  const content = (
    <button type="button" className="home-install-app__button" onClick={() => void handleInstall()}>
      <span className="home-install-app__icon" aria-hidden>
        ↓
      </span>
      Acceso directo
    </button>
  );

  if (isPhone) {
    if (!headerSlot) return null;
    return createPortal(
      <div className="home-install-app home-install-app--header">{content}</div>,
      headerSlot,
    );
  }

  return <div className="home-install-app">{content}</div>;
}
