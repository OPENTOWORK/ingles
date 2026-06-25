'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientAuth } from '@/utils/getClientAuth';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import StudyPlanSurvey from '@/components/plan-objetivos/StudyPlanSurvey';
import StudyPlanSurveyAnswers from '@/components/plan-objetivos/StudyPlanSurveyAnswers';
import SiteMascot from '@/components/SiteMascot';

export default function PlanObjetivosPage() {
  const router = useRouter();
  const { assignedLevel, loading: placementLoading } = usePlacementAccess();
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

  const showSurvey = editing || !plan?.completed_at;
  const levelLabel = assignedLevel || plan?.placement_level || '—';

  return (
    <main className="page-content max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-start gap-4 mb-6">
        <SiteMascot variant={9} width={80} alt="" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plan de objetivos</h1>
          <p className="text-slate-600 text-sm mt-1">
            Encuesta de objetivos{assignedLevel ? ` (nivel ${levelLabel})` : ''}. Tu plan de estudios personalizado llegará pronto.
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
