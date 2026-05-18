'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { userHasRole } from '@/utils/authRoles';

const IT_SECTIONS = [
  {
    title: 'Estado del sistema',
    description: 'Resumen de servicios y despliegues (Vercel, Supabase, correo).',
  },
  {
    title: 'Usuarios y accesos',
    description: 'Gestión de cuentas, roles y permisos vía panel de administración.',
    href: '/admin',
  },
  {
    title: 'Tickets de soporte',
    description: 'Revisión de incidencias reportadas por estudiantes.',
    href: '/soporte',
  },
];

export default function InformaticaPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const canAccess = await userHasRole(user.id, ['informatico', 'it', 'admin', 'administrador'], user.email);
      if (!canAccess) {
        router.push('/perfil');
        return;
      }
      setUserEmail(user.email || '');
      const admin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      setIsAdmin(admin);
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) return null;

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      <p className="text-sm text-gray-500 mb-2">
        <Link href="/" className="text-sky-600 hover:underline">
          Inicio
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel informático</h1>
      <p className="text-gray-600 mb-8">
        Espacio técnico para mantenimiento del sistema e infraestructura. Sesión: {userEmail}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IT_SECTIONS.filter((section) => isAdmin || !section.href).map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{section.description}</p>
            {section.href ? (
              <Link
                href={section.href}
                className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Abrir →
              </Link>
            ) : (
              <span className="text-sm text-gray-400">Próximamente</span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
