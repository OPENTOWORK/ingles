'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessPlanObjetivosAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import StudyPlanSurvey from '@/components/plan-objetivos/StudyPlanSurvey';
import StudyPlanSurveyAnswers from '@/components/plan-objetivos/StudyPlanSurveyAnswers';
import styles from './AdminPlanObjetivosPanel.module.css';

export default function AdminPlanObjetivosPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [previewResult, setPreviewResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessPlanObjetivosAdminPanel(role)) {
        router.push('/perfil');
        return;
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return <RouteLoadingMascot label="Cargando vista previa…" variant={5} width={120} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PanelPageHeader
        title="Plan de objetivos"
        subtitle="Vista previa de la encuesta que completan los alumnos tras el placement test"
        mascotVariant={8}
      />

      <div className={styles.previewBanner} role="status">
        <strong>Modo vista previa (admin).</strong> Recorre la encuesta igual que un alumno. No se
        guarda nada en la base de datos. Para cambiar preguntas u opciones, edita{' '}
        <code className={styles.code}>src/data/studyPlanSurveyConfig.js</code>.
      </div>

      {previewResult ? (
        <div>
          <StudyPlanSurveyAnswers plan={previewResult} forAdmin />
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => setPreviewResult(null)}
          >
            Volver a recorrer la encuesta
          </button>
        </div>
      ) : (
        <StudyPlanSurvey
          previewMode
          placementLevel="B2 (ejemplo)"
          onComplete={(plan) => setPreviewResult(plan)}
        />
      )}
    </div>
  );
}
