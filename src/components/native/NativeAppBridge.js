'use client';

import { useEffect } from 'react';

function isDraloNativeApp() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  if (ua.includes('DraloApp')) return true;
  return window.Capacitor?.isNativePlatform?.() === true;
}

/**
 * En el navegador no hace nada. Dentro de la app activa la barra de estado
 * y el teclado sobre la misma web. El botón atrás lo resuelve Android.
 */
export default function NativeAppBridge() {
  useEffect(() => {
    if (!isDraloNativeApp()) return undefined;

    document.documentElement.classList.add('dralo-native-app');
    let cancelled = false;

    (async () => {
      try {
        const [{ StatusBar, Style }, { Keyboard, KeyboardResize }, { SplashScreen }] =
          await Promise.all([
            import('@capacitor/status-bar'),
            import('@capacitor/keyboard'),
            import('@capacitor/splash-screen'),
          ]);
        if (cancelled) return;

        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
        await SplashScreen.hide();
      } catch (error) {
        console.warn('[native-app]', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
