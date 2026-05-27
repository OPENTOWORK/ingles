'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClientAuth } from '@/utils/getClientAuth';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import StudyPlanSurvey from '@/components/plan-objetivos/StudyPlanSurvey';
import StudyPlanSurveyAnswers from '@/components/plan-objetivos/StudyPlanSurveyAnswers';
import SiteMascot from '@/components/SiteMascot';

export default function PlanObjetivosPage() {
  const router = useRouter();
  const { hasPlacementResult, assignedLevel, loading: placementLoading } = usePlacementAccess();
  const [session, setSession] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const loadPlan = useCallback(async (token) => {
    const res = await fetch('/api/plan-objetivos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Error al cargar');
    return json.plan;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session: s } = await getClientAuth();
      if (!s?.access_token) {
        router.push('/login');
        return;
      }
      if (!cancelled) setSession(s);

      try {
        const p = await loadPlan(s.access_token);
        if (!cancelled) setPlan(p);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, loadPlan]);

  if (loading || placementLoading) {
    return (
      <main className="page-content py-12">
        <RouteLoadingMascot label="Cargando plan de estudios…" variant={4} width={110} />
      </main>
    );
  }

  if (!hasPlacementResult) {
    return (
      <main className="page-content max-w-lg mx-auto py-12 px-4 text-center">
        <SiteMascot variant={6} width={100} alt="" />
        <h1 className="text-2xl font-bold mt-4 text-slate-800">Plan de estudios</h1>
        <p className="text-slate-600 mt-2">
          Primero debes completar el{' '}
          <Link href="/prueba-nivel" className="text-indigo-600 font-medium underline">
            placement test
          </Link>
          . Después podrás crear tu plan personalizado.
        </p>
        <Link href="/prueba-nivel" className="btn btn-primary mt-6 inline-block">
          Ir al placement test
        </Link>
      </main>
    );
  }

  const showSurvey = editing || !plan?.completed_at;

  return (
    <main className="page-content max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-start gap-4 mb-6">
        <SiteMascot variant={9} width={80} alt="" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plan de objetivos</h1>
          <p className="text-slate-600 text-sm mt-1">
            Encuesta de objetivos según tu placement ({assignedLevel}). Tu plan de estudios personalizado llegará pronto.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {showSurvey ? (
        <StudyPlanSurvey
          placementLevel={assignedLevel}
          accessToken={session?.access_token}
          onComplete={(newPlan) => {
            setPlan(newPlan);
            setEditing(false);
            setError('');
          }}
          onSkip={plan ? () => setEditing(false) : undefined}
        />
      ) : (
        <>
          <StudyPlanSurveyAnswers plan={plan} />
          <p className="mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
              Volver a editar encuesta
            </button>
          </p>
        </>
      )}
    </main>
  );
}
