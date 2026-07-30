'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getClientAuth } from '@/utils/getClientAuth';
import { buzonApiRequest } from '@/lib/staffBuzonClient';
import styles from './StaffBuzonPanelPage.module.css';

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

async function getAccessToken() {
  const { session } = await getClientAuth();
  if (!session?.access_token) throw new Error('Sesión no válida.');
  return session.access_token;
}

async function getServiceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration('/');
  const registration = existing || await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await registration.update().catch(() => {});
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  return navigator.serviceWorker.ready;
}

export default function BuzonPushNotifications() {
  const [supported, setSupported] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(true);
  const [publicKey, setPublicKey] = useState('');
  const [developmentMode, setDevelopmentMode] = useState(false);

  const syncExistingSubscription = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setSupported(false);
      setBusy(false);
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      setDevelopmentMode(true);
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
      }
      setConfigured(false);
      setSubscribed(false);
      setBusy(false);
      return;
    }

    try {
      const token = await getAccessToken();
      const config = await buzonApiRequest('/api/buzon/push-subscriptions', { token });
      setConfigured(Boolean(config.configured));
      setPublicKey(config.publicKey || '');

      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(Boolean(subscription));

      if (subscription && config.configured) {
        await buzonApiRequest('/api/buzon/push-subscriptions', {
          method: 'POST',
          token,
          body: { subscription: subscription.toJSON() },
        });
      }
    } catch (error) {
      console.error('Could not load push notification status:', error);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void syncExistingSubscription();
  }, [syncExistingSubscription]);

  const enableNotifications = async () => {
    setBusy(true);
    try {
      if (!configured || !publicKey) {
        throw new Error('Las notificaciones todavía no están configuradas en el servidor.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error(
          permission === 'denied'
            ? 'Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador.'
            : 'Debes aceptar el permiso para recibir avisos.',
        );
      }

      const registration = await getServiceWorkerRegistration();
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const token = await getAccessToken();
      await buzonApiRequest('/api/buzon/push-subscriptions', {
        method: 'POST',
        token,
        body: { subscription: subscription.toJSON() },
      });
      setSubscribed(true);
      toast.success('Notificaciones del Buzón activadas');
    } catch (error) {
      toast.error(error.message || 'No se pudieron activar las notificaciones.');
    } finally {
      setBusy(false);
    }
  };

  const disableNotifications = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const token = await getAccessToken();
        await buzonApiRequest('/api/buzon/push-subscriptions', {
          method: 'DELETE',
          token,
          body: { endpoint: subscription.endpoint },
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      toast.success('Notificaciones desactivadas');
    } catch (error) {
      toast.error(error.message || 'No se pudieron desactivar las notificaciones.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.pushCard}>
      <div className={styles.digestIcon} aria-hidden>
        🔔
      </div>
      <div className={styles.pushBody}>
        <p className={styles.digestTitle}>Notificaciones de mensajes</p>
        <p className={styles.digestText}>
          {developmentMode
            ? 'Las notificaciones están disponibles en la aplicación publicada.'
            : !configured
            ? 'Falta configurar las claves de notificación en el servidor.'
            : supported
            ? subscribed
              ? 'Este dispositivo recibirá un aviso cuando llegue un mensaje nuevo.'
              : 'Actívalas en cada móvil donde instales Dralo para recibir mensajes aunque la app esté cerrada.'
            : 'Este navegador no admite notificaciones web. Instala Dralo y usa una versión reciente del navegador.'}
        </p>
      </div>
      {supported ? (
        <button
          type="button"
          className={subscribed ? styles.pushButtonSecondary : styles.pushButton}
          onClick={() =>
            void (subscribed ? disableNotifications() : enableNotifications())
          }
          disabled={busy || !configured}
        >
          {busy ? 'Comprobando…' : subscribed ? 'Desactivar' : 'Activar notificaciones'}
        </button>
      ) : null}
    </div>
  );
}
