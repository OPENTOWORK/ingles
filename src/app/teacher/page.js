'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { userHasRole } from '@/utils/authRoles';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSessions: 0,
    totalHours: 0,
    averageRating: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        router.push('/login');
        return;
      }

      const canAccessTeacherPanel = await userHasRole(currentUser.id, ['teacher', 'profesor'], currentUser.email);
      if (!canAccessTeacherPanel) {
        router.push('/perfil');
        return;
      }

      setUser(currentUser);
      setTeacher({
        biografia: 'Profesor habilitado por rol de acceso.',
        idioma_preferido: 'Inglés',
      });
      await loadDashboardData(currentUser.id);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (userId) => {
    try {
      // Cargar estadísticas
      const [
        sessionsResult,
        recentSessionsResult
      ] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('duracion_seg, user_id')
          .eq('user_id', userId),
        supabase
          .from('study_sessions')
          .select(`
            id,
            fecha_inicio,
            fecha_fin,
            duracion_seg,
            notas,
            user_id
          `)
          .eq('user_id', userId)
          .order('fecha_inicio', { ascending: false })
          .limit(5)
      ]);

      const uniqueStudents = 0;
      const totalHours = sessionsResult.data?.reduce((acc, session) => acc + (session.duracion_seg || 0), 0) / 3600 || 0;
      const averageRating = 0;

      setStats({
        totalStudents: uniqueStudents,
        activeSessions: 0, // TODO: Implementar sesiones activas
        totalHours: Math.round(totalHours * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10
      });

      setRecentSessions(recentSessionsResult.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de profesor...</p>
        </div>
      </div>
    );
  }

  if (!user || !teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Profesor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del profesor */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Mi Perfil</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Especializaciones</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {teacher.idioma_preferido || 'No especificadas'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Años de Experiencia</h3>
                <p className="mt-1 text-sm text-gray-900">N/A</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tarifa por Hora</h3>
                <p className="mt-1 text-sm text-gray-900">
                  No especificada
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado de Verificación</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  'bg-green-100 text-green-800'
                }`}>
                  Verificado
                </span>
              </div>
            </div>
            {teacher.biografia && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Biografía</h3>
                <p className="mt-1 text-sm text-gray-900">{teacher.biografia}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valoración Media</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageRating}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Acciones Rápidas</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/teacher/students"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Mis Estudiantes</h3>
                  <p className="text-sm text-gray-500">Ver y gestionar estudiantes</p>
                </div>
              </Link>

              <Link
                href="/teacher/sessions"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Sesiones</h3>
                  <p className="text-sm text-gray-500">Programar y gestionar clases</p>
                </div>
              </Link>

              <Link
                href="/teacher/progress"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Progreso</h3>
                  <p className="text-sm text-gray-500">Ver progreso de estudiantes</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sesiones recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Sesiones Recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valoración
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Estudiante
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Sesión de estudio
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.duracion_seg ? `${Math.round(session.duracion_seg / 60)} min` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.fecha_inicio ? new Date(session.fecha_inicio).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      -
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


