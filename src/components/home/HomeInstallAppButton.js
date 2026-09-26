'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  capturePwaInstallPrompt,
  getPwaInstallPrompt,
  subscribePwaInstallPrompt,
} from '@/lib/pwaInstallPrompt';

const MOBILE_TABLET_MEDIA_QUERY = '(max-width: 1024px)';
const PHONE_MEDIA_QUERY = '(max-width: 639px)';

function isIosDevice() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iphone|ipad|ipod/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

function installHelpText() {
  if (isIosDevice()) {
    return 'En Safari, pulsa Compartir y luego «Añadir a pantalla de inicio».';
  }
  return 'En el menú del navegador (⋮), elige «Añadir a pantalla de inicio» o «Instalar aplicación».';
}

export default function HomeInstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [headerSlot, setHeaderSlot] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);

  useEffect(() => {
    capturePwaInstallPrompt();
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

    setInstallPrompt(getPwaInstallPrompt());
    const unsubscribe = subscribePwaInstallPrompt(setInstallPrompt);
    const handleInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
      phoneQuery.removeEventListener('change', syncViewport);
      unsubscribe();
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showHelp) return undefined;

    const handlePointerDown = (event) => {
      if (helpRef.current?.contains(event.target)) return;
      setShowHelp(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowHelp(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showHelp]);

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
    if (installPrompt) {
      setShowHelp(false);
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setInstallPrompt(null);
      return;
    }
    setShowHelp((open) => !open);
  };

  if (!isMobileOrTablet || installed) return null;

  const content = (
    <div className="home-install-app__wrap" ref={helpRef}>
      <button type="button" className="home-install-app__button" onClick={() => void handleInstall()}>
        <span className="home-install-app__icon" aria-hidden>
          ↓
        </span>
        Acceso directo
      </button>
      {showHelp ? (
        <p className="home-install-app__help" role="status">
          {installHelpText()}
        </p>
      ) : null}
    </div>
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
