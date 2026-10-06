'use client';

import { useEffect, useState } from 'react';
import { FOUNDING_OFFER } from '@/lib/abExperiment';

/**
 * Muestra plazas solo cuando el endpoint público ya existente devuelve un número.
 * Si no hay dato, no inventa una cifra.
 */
export default function FoundingSlotsStatus({ variant = 'text' }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/founding-member/slots/', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('slots'))))
      .then((data) => {
        if (cancelled) return;
        const remaining = Number(data?.remaining);
        const total = Number(data?.total) || FOUNDING_OFFER.total;
        if (!Number.isInteger(remaining) || remaining < 0) {
          setState({ status: 'unknown' });
          return;
        }
        setState({
          status: 'ready',
          remaining,
          total,
          soldOut: Boolean(data?.soldOut) || remaining === 0,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unknown' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (variant === 'badge') {
    const remaining = state.status === 'ready' && !state.soldOut ? state.remaining : null;
    const label =
      state.status === 'ready' && state.soldOut
        ? 'Plazas asignadas'
        : state.status === 'loading'
          ? 'Plazas'
          : 'Plazas limitadas';
    return (
      <p className={`ab-seats${remaining == null ? ' ab-seats--plain' : ''}`} role="status">
        {remaining == null ? (
          label
        ) : (
          <>
            <span>Quedan</span>
            <strong>{remaining}</strong>
            <span>plazas</span>
          </>
        )}
      </p>
    );
  }

  if (state.status === 'ready' && state.soldOut) {
    return (
      <p className="ab-slots" role="status">
        Las {state.total} plazas de esta promoción ya están asignadas.
      </p>
    );
  }

  if (state.status === 'ready') {
    return (
      <p className="ab-slots" role="status">
        {`Plazas disponibles: ${state.remaining} de ${state.total}.`}
      </p>
    );
  }

  if (state.status === 'loading') {
    return (
      <p className="ab-slots" role="status">
        Comprobando plazas disponibles.
      </p>
    );
  }

  return (
    <p className="ab-slots" role="status">
      La promoción es para los primeros {FOUNDING_OFFER.total} registros. [PLAZAS RESTANTES]
    </p>
  );
}
