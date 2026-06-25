'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { canAccessCoordinatorPanel, getRoleNameByUserId } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'profesores', label: 'Profesores' },
  { id: 'alumnos', label: 'Alumnos por profesor' },
];

async function coordinatorFetch(path, options = {}, { soft = false } = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    if (soft) return { error: 'Sesión no válida.' };
    throw new Error('Sesión no válida.');
  }
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (soft) return { ...payload, error: payload?.error || 'Error en la petición.' };
    throw new Error(payload?.error || 'Error en la petición.');
  }
  return payload;
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function CoordinatorPanel({ title = 'Panel de coordinador' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resumen');
  const [teachers, setTeachers] = useState([]);
  const [summary, setSummary] = useState({
    teacherCount: 0,
    totalStudents: 0,
    activeTeachers: 0,
  });
  const [tablesReady, setTablesReady] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTeachers = useCallback(async () => {
    const data = await coordinatorFetch('/api/coordinator/teachers', {}, { soft: true });
    if (data.error) return;
    setTeachers(data.teachers || []);
    setSummary(data.summary || { teacherCount: 0, totalStudents: 0, activeTeachers: 0 });
    if (typeof data.tablesReady === 'boolean') setTablesReady(data.tablesReady);
  }, []);

  const loadStudentsForTeacher = useCallback(async (profesorId) => {
    if (!profesorId) {
      setStudents([]);
      setSelectedTeacher(null);
      return;
    }
    const params = new URLSearchParams({ profesorId });
    const data = await coordinatorFetch(`/api/coordinator/students?${params}`, {}, { soft: true });
    if (data.error) {
      alert(data.error);
      return;
    }
    setStudents(data.students || []);
    setSelectedTeacher(data.teacher || null);
    if (typeof data.tablesReady === 'boolean') setTablesReady(data.tablesReady);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user: u },
          error,
        } = await supabase.auth.getUser();
        if (error || !u) {
          router.push('/login');
          return;
        }
        const role = await getRoleNameByUserId(u.id, u.email);
        if (!canAccessCoordinatorPanel(role)) {
          router.push('/perfil');
          return;
        }
        setUser(u);
        await loadTeachers();
      } catch (e) {
        console.error('[CoordinatorPanel] init', e);
        if (String(e?.message || '').includes('Sesión')) router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router, loadTeachers]);

  useEffect(() => {
    if (selectedTeacherId) {
      loadStudentsForTeacher(selectedTeacherId).catch(console.error);
    }
  }, [selectedTeacherId, loadStudentsForTeacher]);

  const handleAssign = async () => {
    if (!selectedTeacherId || !assignEmail.trim()) return;
    setSaving(true);
    try {
      await coordinatorFetch('/api/coordinator/students', {
        method: 'POST',
        body: JSON.stringify({
          action: 'assign',
          profesorId: selectedTeacherId,
          email: assignEmail.trim(),
        }),
      });
      setAssignEmail('');
      await loadStudentsForTeacher(selectedTeacherId);
      await loadTeachers();
      alert('Alumno asignado al profesor.');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (alumnoId) => {
    if (!selectedTeacherId || !alumnoId) return;
    if (!window.confirm('¿Quitar este alumno del profesor seleccionado?')) return;
    setSaving(true);
    try {
      await coordinatorFetch('/api/coordinator/students', {
        method: 'POST',
        body: JSON.stringify({
          action: 'remove',
          profesorId: selectedTeacherId,
          alumnoId,
        }),
      });
      await loadStudentsForTeacher(selectedTeacherId);
      await loadTeachers();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RouteLoadingMascot label="Cargando panel de coordinador…" variant={5} width={130} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <PanelPageHeader title={title} mascotVariant={5} mascotWidth={92}>
            <span className="text-sm text-gray-600">{user?.email}</span>
          </PanelPageHeader>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tablesReady === false && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Faltan tablas de asignación profesor–alumno</p>
            <p className="mt-1">
              Ejecuta{' '}
              <code className="bg-amber-100 px-1 rounded">scripts/teacher_panel_tables.sql</code> en
              Supabase y recarga el esquema de PostgREST.
            </p>
          </div>
        )}

        <nav className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-t text-sm font-medium ${
                tab === t.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Profesores" value={summary.teacherCount} />
              <StatCard label="Profesores activos" value={summary.activeTeachers} />
              <StatCard label="Alumnos asignados (total)" value={summary.totalStudents} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Equipo docente</h2>
              {teachers.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay usuarios con rol de profesor.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {teachers.slice(0, 10).map((t) => (
                    <li key={t.id} className="py-2 flex justify-between items-center gap-2">
                      <span>
                        {t.nombre || t.email}
                        {t.activo === false && (
                          <span className="ml-2 text-xs text-amber-700">(inactivo)</span>
                        )}
                      </span>
                      <span className="text-gray-500">{t.studentCount} alumnos</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'profesores' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Alumnos</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{t.nombre || '—'}</td>
                    <td className="px-4 py-3">{t.email}</td>
                    <td className="px-4 py-3">{t.studentCount}</td>
                    <td className="px-4 py-3">{t.activo === false ? 'Inactivo' : 'Activo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teachers.length === 0 && (
              <p className="p-6 text-gray-500 text-sm">No hay profesores registrados.</p>
            )}
          </div>
        )}

        {tab === 'alumnos' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <section>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profesor
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full max-w-md"
              >
                <option value="">Selecciona un profesor…</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre || t.email} ({t.studentCount} alumnos)
                  </option>
                ))}
              </select>
            </section>

            {selectedTeacherId && (
              <>
                <section className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">
                    Asignar alumno a {selectedTeacher?.nombre || selectedTeacher?.email || 'profesor'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="email"
                      value={assignEmail}
                      onChange={(e) => setAssignEmail(e.target.value)}
                      placeholder="Email del alumno"
                      className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
                    />
                    <button
                      type="button"
                      onClick={handleAssign}
                      disabled={saving}
                      className="px-4 py-2 bg-violet-600 text-white rounded text-sm disabled:opacity-50"
                    >
                      Asignar
                    </button>
                  </div>
                </section>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Alumno</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Conexión</th>
                        <th className="px-4 py-3">Tiempo en app</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3">{s.nombre || '—'}</td>
                          <td className="px-4 py-3">{s.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                s.online ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                            {s.online ? 'En línea' : 'Desconectado'}
                          </td>
                          <td className="px-4 py-3">{s.totalSessionLabel || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemove(s.id)}
                              disabled={saving}
                              className="text-red-600 hover:underline text-xs disabled:opacity-50"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {students.length === 0 && (
                    <p className="py-4 text-gray-500 text-sm">
                      Este profesor no tiene alumnos asignados.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
