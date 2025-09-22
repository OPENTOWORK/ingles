'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function PruebaNivelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando...</p>;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Prueba de nivel</h1>
      <p>
        Aquí podrás realizar una prueba rápida para conocer tu nivel de inglés aproximado.
      </p>
      <p>
        Esta sección estará disponible próximamente con ejercicios interactivos para evaluar tus conocimientos.
      </p>
    </main>
  );
}
