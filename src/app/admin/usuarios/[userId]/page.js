'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { userHasRole } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

function formatRegistrationDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminStudentProfilePage() {
  const params = useParams();
  const userId = String(params?.userId || '');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadStudent = useCallback(async () => {
    if (!userId) return;
    setError('');
    try {
      const { user } = await getClientAuth();
      if (!user) {
        router.push('/login');
        return;
      }
      const isAdmin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      if (!isAdmin) {
        router.push('/perfil');
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'No se pudo cargar la ficha.');
        setData(null);
        return;
      }
      setData(json);
    } catch (err) {
      console.error('[admin/usuarios]', err);
      setError('Error al cargar la ficha del alumno.');
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  if (loading) {
    return <RouteLoadingMascot label="Cargando ficha del alumno…" />;
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-600 mb-4">{error || 'Usuario no encontrado.'}</p>
        <Link href="/admin" className="text-indigo-700 hover:underline">
          ← Volver al panel de administración
        </Link>
      </div>
    );
  }

  const { profile, presence, placement, sessionsByDate, pageViews, navigationReady } = data;
  const displayName = profile.nombre || profile.email || 'Sin nombre';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/admin"
          className="text-sm text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          ← Panel de administración
        </Link>
      </div>

      <PanelPageHeader
        title={displayName}
        subtitle={profile.email}
        mascotVariant={4}
      >
        {presence.online ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
            Conectado ahora
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden />
            Desconectado
          </span>
        )}
      </PanelPageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Rol</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{profile.rolNombre || '—'}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Registro</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatRegistrationDate(profile.creadoEn)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tiempo total en app</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {presence.totalSessionLabel}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Placement</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {placement.done ? placement.level : 'No realizado'}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Conexiones por fecha</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tiempo de uso agrupado por día y detalle de cada sesión.
          </p>
        </div>
        {sessionsByDate.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500">Sin sesiones registradas todavía.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessionsByDate.map((day) => (
              <div key={day.date} className="px-6 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900">{day.date}</h3>
                  <span className="text-sm font-medium text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Total: {day.totalLabel}
                  </span>
                </div>
                <ul className="space-y-2">
                  {day.sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex flex-wrap justify-between gap-2 text-sm text-gray-700 rounded-md bg-gray-50 px-3 py-2"
                    >
                      <span>
                        {session.startedLabel}
                        {session.endedAt ? '' : ' (sesión activa o sin cierre)'}
                      </span>
                      <span className="font-medium text-gray-900">{session.durationLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Qué ha estado viendo</h2>
          <p className="text-sm text-gray-600 mt-1">
            Páginas visitadas y tiempo en cada una (más recientes primero).
          </p>
        </div>
        {!navigationReady ? (
          <p className="px-6 py-8 text-sm text-amber-800 bg-amber-50">
            El historial de navegación aún no está activo. Ejecuta{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">scripts/usuario_navegacion_tables.sql</code>{' '}
            en Supabase para habilitarlo.
          </p>
        ) : pageViews.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500">
            Sin páginas registradas. El historial se irá rellenando cuando el alumno navegue por la app.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha y hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Página
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tiempo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pageViews.map((view) => (
                  <tr key={view.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {view.visitedLabel}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {view.pageTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {view.path}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {view.durationLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
