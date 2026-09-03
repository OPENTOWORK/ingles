'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

const CONDITIONS_TEXT =
  'Después de 30 días solo tendrás que rellenar un breve formulario.';

/** Refresco en home: la API ya va sin caché; esto evita números viejos con la pestaña abierta. */
const FOUNDING_SLOTS_POLL_MS = 45_000;

function formatSlotsMessage(remaining, total) {
  if (remaining === 1) {
    return (
      <>
        Queda <strong>1 plaza</strong>{' '}
        <span className="founding-slots-banner__gratis">GRATIS</span> de <strong>Plan Plus</strong>{' '}
        <strong>para siempre</strong> entre los {total} primeros registros
      </>
    );
  }

  return (
    <>
      Quedan <strong>{remaining} plazas</strong>{' '}
      <span className="founding-slots-banner__gratis">GRATIS</span> de <strong>Plan Plus</strong>{' '}
      <strong>para siempre</strong> entre los {total} primeros registros
    </>
  );
}

/**
 * Contador público de cupos founding (solo en home sin login).
 */
export default function FoundingMemberSlotsBanner() {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConditions, setShowConditions] = useState(false);
  const conditionsRef = useRef(null);

  useEffect(() => {
    if (!showConditions) return undefined;

    const handlePointerDown = (event) => {
      if (conditionsRef.current?.contains(event.target)) return;
      setShowConditions(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowConditions(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showConditions]);

  useEffect(() => {
    let cancelled = false;
    let intervalId = 0;

    async function refreshAvailability() {
      try {
        const res = await fetch(`/api/founding-member/slots?_=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });
        if (!res.ok) throw new Error('availability_fetch_failed');
        const data = await res.json();
        if (cancelled) return;
        setAvailability(data);
        if (data?.soldOut && intervalId) {
          window.clearInterval(intervalId);
          intervalId = 0;
        }
      } catch {
        if (!cancelled) setAvailability(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refreshAvailability();
    intervalId = window.setInterval(refreshAvailability, FOUNDING_SLOTS_POLL_MS);

    const handleVisible = () => {
      if (document.visibilityState === 'visible') void refreshAvailability();
    };
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', refreshAvailability);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', refreshAvailability);
    };
  }, []);

  if (loading) {
    return (
      <div className="founding-slots-banner founding-slots-banner--home" aria-hidden>
        <div className="founding-slots-banner__inner founding-slots-banner__inner--loading">
          <span className="founding-slots-banner__pulse" />
          Cargando plazas disponibles…
        </div>
      </div>
    );
  }

  if (!availability || availability.soldOut) return null;

  return (
    <div className="founding-slots-banner founding-slots-banner--home" role="status" aria-live="polite">
      <div className="founding-slots-banner__inner">
        <span className="founding-slots-banner__icon" aria-hidden>
          <Sparkles size={18} strokeWidth={2.25} />
        </span>
        <p className="founding-slots-banner__text">
          {formatSlotsMessage(availability.remaining, availability.total)}
        </p>
        <div className="founding-slots-banner__conditions" ref={conditionsRef}>
          <button
            type="button"
            className="founding-slots-banner__conditions-btn"
            onClick={() => setShowConditions((open) => !open)}
            aria-expanded={showConditions}
            aria-controls="founding-slots-conditions-popover"
          >
            Condiciones
          </button>
          {showConditions ? (
            <div
              id="founding-slots-conditions-popover"
              className="founding-slots-banner__conditions-popover"
              role="dialog"
              aria-label="Condiciones del Plan Plus founding"
            >
              <p>{CONDITIONS_TEXT}</p>
              <button
                type="button"
                className="founding-slots-banner__conditions-close"
                onClick={() => setShowConditions(false)}
                aria-label="Cerrar condiciones"
              >
                ×
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
