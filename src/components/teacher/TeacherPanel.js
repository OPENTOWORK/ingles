'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import {
  canAccessAdminTeacherPanelView,
  canAccessTeacherPanel,
  getRoleNameByUserId,
} from '@/utils/authRoles';
import TeacherActivityCharts from '@/components/teacher/TeacherActivityCharts';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'alumnos', label: 'Alumnos' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'correos', label: 'Correos' },
  { id: 'calificaciones', label: 'Calificaciones' },
  { id: 'actividad', label: 'Actividad' },
];

async function teacherFetch(path, options = {}, { soft = false } = {}) {
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

export default function TeacherPanel({ title = 'Panel de Profesor' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resumen');
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [autoScores, setAutoScores] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [userActivityByUser, setUserActivityByUser] = useState({});
  const [sessionChart, setSessionChart] = useState([]);
  const [connectionAnalytics, setConnectionAnalytics] = useState({
    totalSessionLabel: '0 s',
    sessionCount: 0,
    activeUsers: 0,
    avgPerUserLabel: '0 s',
    horaPico: '-',
    diaPico: '-',
    heatmap: [],
  });
  const [chartPeriod, setChartPeriod] = useState('meses');
  const [chartStartDate, setChartStartDate] = useState('');
  const [chartEndDate, setChartEndDate] = useState('');
  const [activityAlumnoId, setActivityAlumnoId] = useState('');

  const [assignEmail, setAssignEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskAlumnoId, setTaskAlumnoId] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [mailing, setMailing] = useState(false);

  const [gradeAlumnoId, setGradeAlumnoId] = useState('');
  const [gradeTitle, setGradeTitle] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [gradeComment, setGradeComment] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [tablesReady, setTablesReady] = useState(null);

  const loadStudents = useCallback(async () => {
    const data = await teacherFetch('/api/teacher/students', {}, { soft: true });
    if (data.error) return [];
    setStudents(data.students || []);
    if (typeof data.tablesReady === 'boolean') setTablesReady(data.tablesReady);
    return data.students || [];
  }, []);

  const loadTasks = useCallback(async () => {
    const data = await teacherFetch('/api/teacher/tasks', {}, { soft: true });
    if (data.error) return;
    setTasks(data.tasks || []);
    if (data.tablesReady === true) setTablesReady(true);
  }, []);

  const loadGrades = useCallback(async () => {
    const data = await teacherFetch('/api/teacher/grades', {}, { soft: true });
    if (data.error) return;
    setGrades(data.grades || []);
    setAutoScores(data.autoScores || []);
  }, []);

  const loadActivity = useCallback(async () => {
    const params = new URLSearchParams({ period: chartPeriod });
    if (chartStartDate) params.set('startDate', chartStartDate);
    if (chartEndDate) params.set('endDate', chartEndDate);
    if (activityAlumnoId) params.set('alumnoId', activityAlumnoId);
    const data = await teacherFetch(`/api/teacher/user-activity?${params}`, {}, { soft: true });
    if (data.error) return;
    setUserActivityByUser(data.byUser || {});
    setSessionChart(data.chart || []);
    setConnectionAnalytics(
      data.connection || {
        totalSessionLabel: '0 s',
        sessionCount: 0,
        activeUsers: 0,
        avgPerUserLabel: '0 s',
        horaPico: '-',
        diaPico: '-',
        heatmap: [],
      },
    );
  }, [chartPeriod, chartStartDate, chartEndDate, activityAlumnoId]);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user: u }, error } = await supabase.auth.getUser();
        if (error || !u) {
          router.push('/login');
          return;
        }
        const role = await getRoleNameByUserId(u.id, u.email);
        if (!canAccessTeacherPanel(role)) {
          router.push('/perfil');
          return;
        }
        setUser(u);
        setIsAdminView(canAccessAdminTeacherPanelView(role));
        await loadStudents();
        await Promise.allSettled([loadTasks(), loadGrades(), loadActivity()]);
      } catch (e) {
        console.error('[TeacherPanel] init', e);
        if (String(e?.message || '').includes('Sesión')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router, loadStudents, loadTasks, loadGrades, loadActivity]);

  useEffect(() => {
    if (!loading && tab === 'actividad') {
      loadActivity().catch(console.error);
    }
  }, [loading, tab, loadActivity]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAssign = async () => {
    if (!assignEmail.trim()) return;
    setSavingStudent(true);
    try {
      await teacherFetch('/api/teacher/students', {
        method: 'POST',
        body: JSON.stringify({ action: 'assign', email: assignEmail.trim() }),
      });
      setAssignEmail('');
      await loadStudents();
      alert('Alumno asignado correctamente.');
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!newEmail.trim()) return;
    setSavingStudent(true);
    try {
      const res = await teacherFetch('/api/teacher/students', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', email: newEmail.trim(), name: newName.trim() }),
      });
      setNewEmail('');
      setNewName('');
      await loadStudents();
      alert(
        res.emailSent
          ? `Alumno creado y correo enviado a ${res.email}.`
          : `Alumno creado (${res.email}). Revisa configuración de correo si no llegó el email.`,
      );
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleRemoveStudent = async (alumnoId) => {
    if (!confirm('¿Quitar este alumno de tu lista?')) return;
    try {
      await teacherFetch('/api/teacher/students', {
        method: 'POST',
        body: JSON.stringify({ action: 'remove', alumnoId }),
      });
      await loadStudents();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      await teacherFetch('/api/teacher/tasks', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          titulo: taskTitle,
          descripcion: taskDesc,
          enlace: taskLink,
          fecha_limite: taskDue || null,
          alumno_id: taskAlumnoId || null,
        }),
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskLink('');
      setTaskDue('');
      setTaskAlumnoId('');
      await loadTasks();
      alert('Tarea creada.');
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingTask(false);
    }
  };

  const handleSendMail = async () => {
    if (!mailSubject.trim() || !mailMessage.trim()) {
      alert('Completa asunto y mensaje.');
      return;
    }
    if (!selectedIds.length) {
      alert('Selecciona al menos un alumno.');
      return;
    }
    setMailing(true);
    try {
      const res = await teacherFetch('/api/teacher/send-mail', {
        method: 'POST',
        body: JSON.stringify({
          alumnoIds: selectedIds,
          subject: mailSubject,
          message: mailMessage,
        }),
      });
      alert(`Correo enviado a ${res.sent} alumno(s).`);
      setMailSubject('');
      setMailMessage('');
    } catch (e) {
      alert(e.message);
    } finally {
      setMailing(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!gradeAlumnoId || !gradeTitle.trim() || gradeScore === '') {
      alert('Alumno, actividad y nota son obligatorios.');
      return;
    }
    setSavingGrade(true);
    try {
      await teacherFetch('/api/teacher/grades', {
        method: 'POST',
        body: JSON.stringify({
          alumno_id: gradeAlumnoId,
          titulo: gradeTitle,
          nota: Number(gradeScore),
          comentario: gradeComment,
        }),
      });
      setGradeTitle('');
      setGradeScore('');
      setGradeComment('');
      await loadGrades();
      alert('Calificación guardada.');
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingGrade(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RouteLoadingMascot label="Cargando panel de profesor…" variant={4} width={130} />
      </div>
    );
  }

  const onlineCount = students.filter((s) => s.online).length;
  const totalSessionHours =
    Math.round(
      (students.reduce((a, s) => a + (s.totalSessionSeconds || 0), 0) / 3600) * 10,
    ) / 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
          <PanelPageHeader title={title} mascotVariant={4} mascotWidth={92}>
            <span className="text-sm text-gray-600">{user?.email}</span>
          </PanelPageHeader>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tablesReady === false && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Supabase aún no expone las tablas del profesor</p>
            <p className="mt-1">
              Si ya ejecutaste el SQL, corre en el SQL Editor:{' '}
              <code className="bg-amber-100 px-1 rounded">NOTIFY pgrst, &apos;reload schema&apos;;</code>{' '}
              y recarga (Ctrl+F5).
            </p>
            <p className="mt-2">
              Si no has creado las tablas:{' '}
              <code className="bg-amber-100 px-1 rounded">scripts/teacher_panel_tables.sql</code>
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Mis alumnos" value={students.length} />
              <StatCard label="Conectados ahora" value={onlineCount} />
              <StatCard label="Horas de sesión (total)" value={totalSessionHours} />
              <StatCard label="Tareas pendientes" value={tasks.filter((t) => t.estado === 'pendiente').length} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Alumnos recientes</h2>
              {students.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {isAdminView
                    ? 'No hay alumnos activos en la plataforma.'
                    : 'Aún no tienes alumnos. Ve a la pestaña Alumnos para añadir o crear.'}
                </p>
              ) : (
                <ul className="divide-y text-sm">
                  {students.slice(0, 8).map((s) => (
                    <li key={s.id} className="py-2 flex justify-between items-center">
                      <span>
                        {s.nombre || s.email}
                        <span
                          className={`ml-2 inline-block w-2 h-2 rounded-full ${
                            s.online ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      </span>
                      <span className="text-gray-500">
                        {s.sessionCount} sesiones · {s.totalSessionLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'alumnos' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <section className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Asignar alumno existente</h3>
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
                  disabled={savingStudent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>
            </section>
            <section className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Crear alumno nuevo</h3>
              <p className="text-xs text-gray-600 mb-2">
                Se crea la cuenta, se asigna a tu lista y se envía correo con contraseña temporal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre (opcional)"
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email"
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateStudent}
                disabled={savingStudent}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
              >
                Crear y enviar acceso
              </button>
            </section>
            <StudentsTable
              students={students}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              onRemove={!isAdminView ? handleRemoveStudent : null}
              showSelect
            />
          </div>
        )}

        {tab === 'tareas' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <section className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Nueva tarea</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Título *"
                  className="border rounded px-3 py-2 text-sm"
                />
                <select
                  value={taskAlumnoId}
                  onChange={(e) => setTaskAlumnoId(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">Todos mis alumnos</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre || s.email}
                    </option>
                  ))}
                </select>
                <input
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  placeholder="Enlace (ej. /niveles/...)"
                  className="border rounded px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  type="datetime-local"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Instrucciones"
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm mb-2"
              />
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={savingTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
              >
                Crear tarea
              </button>
            </section>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Título</th>
                    <th className="px-3 py-2 text-left">Alumno</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Límite</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const alum = t.alumno;
                    return (
                      <tr key={t.id} className="border-t">
                        <td className="px-3 py-2">{t.titulo}</td>
                        <td className="px-3 py-2">{alum?.nombre || alum?.email || 'Todos'}</td>
                        <td className="px-3 py-2">{t.estado}</td>
                        <td className="px-3 py-2">
                          {t.fecha_limite
                            ? new Date(t.fecha_limite).toLocaleString('es-ES')
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {tasks.length === 0 && (
                <p className="text-gray-500 text-sm py-4">No hay tareas. Crea la primera arriba.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'correos' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Marca alumnos en la tabla (pestaña Alumnos) o selecciónalos aquí.
            </p>
            <StudentsTable
              students={students}
              selectedIds={selectedIds}
              onToggle={toggleSelect}
              showSelect
            />
            <input
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              placeholder="Asunto"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <textarea
              value={mailMessage}
              onChange={(e) => setMailMessage(e.target.value)}
              placeholder="Mensaje"
              rows={5}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleSendMail}
              disabled={mailing || selectedIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {mailing ? 'Enviando...' : `Enviar a ${selectedIds.length} alumno(s)`}
            </button>
          </div>
        )}

        {tab === 'calificaciones' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <section className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Calificar manualmente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <select
                  value={gradeAlumnoId}
                  onChange={(e) => setGradeAlumnoId(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">Alumno *</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre || s.email}
                    </option>
                  ))}
                </select>
                <input
                  value={gradeTitle}
                  onChange={(e) => setGradeTitle(e.target.value)}
                  placeholder="Actividad / examen *"
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  placeholder="Nota 0–100 *"
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  value={gradeComment}
                  onChange={(e) => setGradeComment(e.target.value)}
                  placeholder="Comentario (opcional)"
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveGrade}
                disabled={savingGrade}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
              >
                Guardar calificación
              </button>
            </section>
            <section>
              <h3 className="font-semibold mb-2">Calificaciones del profesor</h3>
              <GradesList grades={grades} />
            </section>
            {autoScores.length > 0 && (
              <section>
                <h3 className="font-semibold mb-2">Puntuaciones automáticas (niveles)</h3>
                <p className="text-xs text-gray-500 mb-2">Últimas evaluaciones en la plataforma.</p>
                <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                  {autoScores.slice(0, 30).map((row, i) => (
                    <li key={i} className="flex justify-between border-b py-1">
                      <span className="text-gray-600 truncate">{row.descripcion || 'Ítem'}</span>
                      <span>
                        {Math.round(row.puntuacion)}% ·{' '}
                        {new Date(row.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {tab === 'actividad' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Filtrar alumno</label>
                <select
                  value={activityAlumnoId}
                  onChange={(e) => setActivityAlumnoId(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre || s.email}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => loadActivity()}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                Actualizar
              </button>
            </div>
            <StudentsTable
              students={students.map((s) => ({
                ...s,
                ...userActivityByUser[s.id],
                sessionCount: userActivityByUser[s.id]?.sessionCount ?? s.sessionCount,
              }))}
              showActivity
            />
            <TeacherActivityCharts
              sessionChart={sessionChart}
              chartPeriod={chartPeriod}
              setChartPeriod={setChartPeriod}
              chartStartDate={chartStartDate}
              setChartStartDate={setChartStartDate}
              chartEndDate={chartEndDate}
              setChartEndDate={setChartEndDate}
              connectionAnalytics={connectionAnalytics}
              onApply={() => loadActivity()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function StudentsTable({ students, selectedIds = [], onToggle, onRemove, showSelect, showActivity }) {
  if (!students.length) {
    return <p className="text-sm text-gray-500 py-4">No hay alumnos en tu lista.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y">
        <thead className="bg-gray-50">
          <tr>
            {showSelect && <th className="px-3 py-2 w-8" />}
            <th className="px-3 py-2 text-left">Nombre</th>
            <th className="px-3 py-2 text-left">Email</th>
            {showActivity && (
              <>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Sesiones</th>
                <th className="px-3 py-2 text-left">Tiempo total</th>
                <th className="px-3 py-2 text-left">Conexiones</th>
              </>
            )}
            {!showActivity && (
              <>
                <th className="px-3 py-2 text-left">Online</th>
                <th className="px-3 py-2 text-left">Tiempo</th>
                <th className="px-3 py-2 text-left">Nota media</th>
              </>
            )}
            {onRemove && <th className="px-3 py-2" />}
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {students.map((s) => (
            <tr key={s.id}>
              {showSelect && (
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => onToggle(s.id)}
                  />
                </td>
              )}
              <td className="px-3 py-2">{s.nombre || '—'}</td>
              <td className="px-3 py-2">{s.email}</td>
              {showActivity ? (
                <>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs ${
                        s.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.online ? 'Conectado' : 'Desconectado'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{s.sessionCount ?? 0}</td>
                  <td className="px-3 py-2">{s.totalSessionLabel || '0 s'}</td>
                  <td className="px-3 py-2">{s.loginCount ?? '—'}</td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2">
                    {s.online ? (
                      <span className="text-green-600">Sí</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{s.totalSessionLabel || '0 s'}</td>
                  <td className="px-3 py-2">{s.gradeAverage != null ? `${s.gradeAverage}%` : '—'}</td>
                </>
              )}
              {onRemove && (
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Quitar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GradesList({ grades }) {
  if (!grades.length) {
    return <p className="text-sm text-gray-500">Sin calificaciones manuales aún.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Alumno</th>
            <th className="px-3 py-2 text-left">Actividad</th>
            <th className="px-3 py-2 text-left">Nota</th>
            <th className="px-3 py-2 text-left">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => {
            const alum = g.alumno;
            return (
              <tr key={g.id} className="border-t">
                <td className="px-3 py-2">{alum?.nombre || alum?.email}</td>
                <td className="px-3 py-2">{g.titulo}</td>
                <td className="px-3 py-2">{g.nota}%</td>
                <td className="px-3 py-2">
                  {new Date(g.creado_en).toLocaleDateString('es-ES')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
