'use client';

import { useEffect, useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Palette } from 'lucide-react';
import { DEFAULT_SITE_THEME, SITE_THEMES, activeSiteTheme, siteThemeLabel } from '@/lib/siteTheme';
import { chooseSiteTheme, useSiteTheme } from '@/hooks/useSiteTheme';

const DAY_FORMAT = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Madrid',
});

function useSiteThemeChoice() {
  const state = useSiteTheme();
  const [saving, setSaving] = useState(false);
  const current = activeSiteTheme(state);
  /** Tema del calendario (Halloween sin elegir): se quita solo. Elegirlo lo deja puesto. */
  const endsAt = current !== DEFAULT_SITE_THEME && state.until ? state.until : null;

  const choose = async (themeId) => {
    if (saving || (themeId === current && !endsAt)) return;
    setSaving(true);
    try {
      await chooseSiteTheme(themeId);
      toast.success(`Tema «${siteThemeLabel(themeId)}» activado para toda la web.`);
    } catch (error) {
      toast.error(error?.message || 'No se pudo cambiar el tema.');
    } finally {
      setSaving(false);
    }
  };

  const note = saving
    ? 'Guardando…'
    : endsAt
      ? `Se quita solo al acabar el ${DAY_FORMAT.format(endsAt - 1)}.`
      : 'Lo ven todos los visitantes.';

  return { current, saving, note, choose };
}

function DesktopSiteThemePicker({ current, saving, note, choose }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className="site-theme-picker" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`site-theme-picker__trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Tema de la web: ${siteThemeLabel(current)}`}
        title="Tema de la web"
        onClick={() => setOpen((value) => !value)}
      >
        <Palette size={18} strokeWidth={2.2} aria-hidden />
      </button>
      {open ? (
        <div id={panelId} className="site-theme-picker__panel">
          <p className="site-theme-picker__title">Tema de la web</p>
          {SITE_THEMES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`site-theme-picker__option${id === current ? ' is-current' : ''}`}
              aria-pressed={id === current}
              disabled={saving}
              onClick={async () => {
                await choose(id);
                setOpen(false);
              }}
            >
              <span className={`site-theme-picker__swatch site-theme-picker__swatch--${id}`} aria-hidden />
              <span className="site-theme-picker__label">{label}</span>
              {id === current ? <Check size={16} strokeWidth={2.6} aria-hidden /> : null}
            </button>
          ))}
          <p className="site-theme-picker__note" aria-live="polite">
            {note}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DrawerSiteThemePicker({ current, saving, note, choose }) {
  const selectId = useId();
  const [picked, setPicked] = useState(null);

  return (
    <div className="site-theme-picker-field">
      <label className="site-theme-picker-field__label" htmlFor={selectId}>
        <Palette size={18} aria-hidden />
        Tema de la web
      </label>
      <select
        id={selectId}
        className="site-theme-picker-field__select"
        value={picked ?? current}
        disabled={saving}
        onChange={async (event) => {
          setPicked(event.target.value);
          await choose(event.target.value);
          setPicked(null);
        }}
      >
        {SITE_THEMES.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <p className="site-theme-picker-field__note" aria-live="polite">
        {note}
      </p>
    </div>
  );
}

/** Solo para administradores: cambia el tema de toda la web. */
export default function SiteThemePicker({ variant = 'desktop' }) {
  const choice = useSiteThemeChoice();
  return variant === 'drawer' ? <DrawerSiteThemePicker {...choice} /> : <DesktopSiteThemePicker {...choice} />;
}
