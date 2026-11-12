'use client';

import { useEffect, useState } from 'react';
import { PRO_LAUNCH_COPY, PRO_LAUNCH_SLOT_LIMIT, PRO_LAUNCH_SLOTS_PATH } from '@/lib/proLaunchOffer.rules';

/**
 * Muestra plazas solo cuando el endpoint público ya existente devuelve un número.
 * Si no hay dato, no inventa una cifra.
 */
export default function FoundingSlotsStatus({ variant = 'text' }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch(PRO_LAUNCH_SLOTS_PATH, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('slots'))))
      .then((data) => {
        if (cancelled) return;
        const remaining = Number(data?.remaining);
        const total = Number(data?.total) || PRO_LAUNCH_SLOT_LIMIT;
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

  if (variant === 'sentence') {
    if (state.status === 'ready' && state.soldOut) {
      return (
        <p className="ab-seats-line" role="status">
          {PRO_LAUNCH_COPY.soldOutTitle}
        </p>
      );
    }
    if (state.status === 'ready') {
      return (
        <p className="ab-seats-line" role="status">
          Quedan {state.remaining} de {state.total} plazas.
        </p>
      );
    }
    if (state.status === 'loading') {
      return (
        <p className="ab-seats-line" role="status">
          Comprobando plazas.
        </p>
      );
    }
    return null;
  }

  if (variant === 'headline') {
    const remaining = state.status === 'ready' && !state.soldOut ? state.remaining : null;
    const label =
      state.status === 'ready' && state.soldOut
        ? PRO_LAUNCH_COPY.soldOutTitle
        : state.status === 'loading'
          ? 'Plazas limitadas'
          : 'Plazas limitadas';
    return (
      <p className="ab-seats-line" role="status">
        {remaining == null ? (
          label
        ) : (
          <>
            <span>Quedan</span>
            <strong>{remaining} plazas</strong>
          </>
        )}
      </p>
    );
  }

  if (variant === 'badge') {
    const remaining = state.status === 'ready' && !state.soldOut ? state.remaining : null;
    const label =
      state.status === 'ready' && state.soldOut
        ? PRO_LAUNCH_COPY.soldOutTitle
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
        {PRO_LAUNCH_COPY.soldOutTitle}
      </p>
    );
  }

  if (state.status === 'ready') {
    return (
      <p className="ab-slots" role="status">
        {`Quedan ${state.remaining} de ${state.total} plazas.`}
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
      {PRO_LAUNCH_COPY.badge}
    </p>
  );
}
