'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IT_PREVIEW_ROLE_OPTIONS,
  appendItPreviewParams,
  getDefaultItPreviewPathForRole,
  getItPreviewNavSummary,
  getItPreviewPresetsForRole,
  isItPreviewPathAccessible,
} from '@/lib/itPreviewRole';

const DEVICES = [
  { id: 'mobile', label: 'Móvil', width: 390, height: 844, bezel: 'rounded-[2rem] border-[10px]' },
  {
    id: 'tablet',
    label: 'Tablet',
    width: 768,
    height: 1024,
    bezel: 'rounded-[1.25rem] border-[12px]',
  },
];

function normalizePath(input = '') {
  const trimmed = String(input || '').trim();
  if (!trimmed) return '/';
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}` || '/';
      }
      return trimmed;
    } catch {
      return '/';
    }
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function DevicePreview({ device, src, reloadToken }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const padding = 8;
    const availableWidth = Math.max(120, el.clientWidth - padding);
    const availableHeight = Math.max(200, el.clientHeight - padding);
    const scaleW = availableWidth / device.width;
    const scaleH = availableHeight / device.height;
    setScale(Math.min(1, scaleW, scaleH));
  }, [device.width, device.height]);

  useEffect(() => {
    updateScale();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScale]);

  const frameWidth = device.width * scale;
  const frameHeight = device.height * scale;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-slate-100/80 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{device.label}</p>
          <p className="text-xs text-slate-500">
            {device.width} × {device.height}px
            {scale < 1 ? ` · escala ${Math.round(scale * 100)}%` : ''}
          </p>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-1 items-start justify-center overflow-auto pb-2">
        <div
          className={`relative shrink-0 overflow-hidden border-slate-900 bg-slate-900 shadow-2xl ${device.bezel}`}
          style={{ width: frameWidth, height: frameHeight }}
        >
          {device.id === 'mobile' ? (
            <div
              className="pointer-events-none absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-700"
              aria-hidden
            />
          ) : null}
          <iframe
            key={`${device.id}-${src}`}
            title={`Vista ${device.label}`}
            src={src}
            width={device.width}
            height={device.height}
            className="block bg-white"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ItResponsivePreviewPanel() {
  const [previewRoleId, setPreviewRoleId] = useState('student');
  const [path, setPath] = useState('/niveles/b2');
  const [draftPath, setDraftPath] = useState('/niveles/b2');
  const [reloadToken, setReloadToken] = useState(0);
  const [showTabletLandscape, setShowTabletLandscape] = useState(false);

  const presetRoutes = useMemo(
    () => getItPreviewPresetsForRole(previewRoleId),
    [previewRoleId],
  );

  const navSummary = useMemo(() => getItPreviewNavSummary(previewRoleId), [previewRoleId]);

  const previewPath = useMemo(() => normalizePath(path), [path]);

  const previewUrl = useMemo(() => {
    if (typeof window === 'undefined') return previewPath;
    const base = /^https?:\/\//i.test(previewPath)
      ? previewPath
      : `${window.location.origin}${previewPath}`;
    return appendItPreviewParams(base, { roleId: previewRoleId, reloadToken });
  }, [previewPath, previewRoleId, reloadToken]);

  const tabletDevice = useMemo(() => {
    const base = DEVICES.find((d) => d.id === 'tablet');
    if (!showTabletLandscape) return base;
    return { ...base, width: 1024, height: 768, label: 'Tablet (horizontal)' };
  }, [showTabletLandscape]);

  const applyPath = useCallback((nextPath) => {
    const normalized = normalizePath(nextPath);
    setPath(normalized);
    setDraftPath(normalized);
    setReloadToken((t) => t + 1);
  }, []);

  const handleRoleChange = useCallback(
    (nextRoleId) => {
      setPreviewRoleId(nextRoleId);
      setReloadToken((t) => t + 1);
      if (!isItPreviewPathAccessible(path, nextRoleId)) {
        const fallback = getDefaultItPreviewPathForRole(nextRoleId);
        setPath(fallback);
        setDraftPath(fallback);
      }
    },
    [path],
  );

  const reloadPreviews = () => setReloadToken((t) => t + 1);

  const selectedRole =
    IT_PREVIEW_ROLE_OPTIONS.find((option) => option.id === previewRoleId) ||
    IT_PREVIEW_ROLE_OPTIONS[1];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Visualización en móvil y tablet</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Previsualiza la web en móvil y tablet con la misma lógica de acceso que en escritorio:
          Sin sesión, Exam Strategies, Exam practice y Dralo AI redirigen al login. Elige un rol para simular
          menús y accesos; tu sesión real sigue teniendo permisos de admin o informático.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-[220px] flex-col gap-1 text-sm text-slate-700">
            <span className="font-medium">Rol simulado</span>
            <select
              value={previewRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {IT_PREVIEW_ROLE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500 sm:pb-2">
            Simulando: <strong className="text-slate-800">{selectedRole.label}</strong>
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Menú visible para este rol
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {navSummary.map((item) => (
              <li
                key={item}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presetRoutes.map((preset) => (
            <button
              key={preset.path}
              type="button"
              onClick={() => applyPath(preset.path)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                previewPath === normalizePath(preset.path)
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isItPreviewPathAccessible(draftPath, previewRoleId)) {
              window.alert('Esa ruta no está disponible para el rol seleccionado.');
              return;
            }
            applyPath(draftPath);
          }}
        >
          <input
            type="text"
            value={draftPath}
            onChange={(e) => setDraftPath(e.target.value)}
            placeholder="/niveles/b2/exam-mode"
            className="min-w-0 flex-1 rounded border border-slate-200 px-3 py-2 font-mono text-sm"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Ir
            </button>
            <button
              type="button"
              onClick={reloadPreviews}
              className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Recargar
            </button>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-sky-700 hover:bg-slate-50"
            >
              Abrir pestaña →
            </a>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showTabletLandscape}
              onChange={(e) => setShowTabletLandscape(e.target.checked)}
              className="rounded border-slate-300"
            />
            Tablet en horizontal (1024 × 768)
          </label>
          <span className="text-xs text-slate-500">Ruta: {previewPath}</span>
        </div>
      </div>

      <div className="grid min-h-[640px] grid-cols-1 gap-4 xl:grid-cols-2">
        <DevicePreview device={DEVICES[0]} src={previewUrl} reloadToken={reloadToken} />
        <DevicePreview device={tabletDevice} src={previewUrl} reloadToken={reloadToken} />
      </div>
    </div>
  );
}
