'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getUserProgress } from '@/utils/getUserProgress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from('profiles')
        .select('full_name, birth_date')
        .eq('id', session.user.id)
        .single();

      setFullName(data?.full_name || '');
      setBirthDate(data?.birth_date || '');

      const userProgress = await getUserProgress(session.user.id);
      setStats(userProgress);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
    } else {
      console.error('Logout error:', error.message);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      birth_date: birthDate
    });
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('Error changing password');
    else alert('Password updated successfully');
  };

  if (!user || !stats) return <p style={{ textAlign: 'center' }}>Cargando perfil...</p>;

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>👤 Bienvenido, {user.email}</h1>
      <button onClick={handleLogout} style={{ marginBottom: '2rem', padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚪 Logout</button>

      <section style={sectionStyle}>
        <h2>📝 Información personal</h2>
        <label>Nombre</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
        <label>Fecha de nacimiento</label>
        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inputStyle} />
        <button onClick={handleProfileUpdate} style={styles.button}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </section>

      <section style={sectionStyle}>
        <h2>🔐 Seguridad</h2>
        <label>Nueva contraseña</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
        <button onClick={handlePasswordChange} style={styles.button}>Actualizar contraseña</button>
      </section>

      <section style={sectionStyle}>
        <h2>📊 Estadísticas globales</h2>
        <ul>
          <li>📝 Exámenes completados: {stats.stats.completedExams}</li>
          <li>✅ Respuestas correctas: {stats.stats.totalCorrect}</li>
          <li>💪 Sesiones de entrenamiento: {stats.stats.trainingCount}</li>
          <li>🎯 Nivel estimado: {stats.stats.levelEstimate}</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2>📈 Evolución de puntuaciones</h2>
        {stats.exams.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.exams.map(e => ({
              fecha: new Date(e.date).toLocaleDateString(),
              puntuación: e.total_score,
            }))}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="fecha" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="puntuación" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No hay datos suficientes para mostrar la gráfica.</p>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={() => router.push('/training')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>🚀 Ir a entrenar</button>
      </div>
    </main>
  );
}

const sectionStyle = {
  backgroundColor: '#f9f9f9',
  padding: '1.5rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginBottom: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const styles = {
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem'
  }
};

const thStyle = {
  textAlign: 'left',
  padding: '0.5rem',
  backgroundColor: '#eee',
  borderBottom: '1px solid #ccc'
};

const tdStyle = {
  padding: '0.5rem',
  borderBottom: '1px solid #ddd'
};
