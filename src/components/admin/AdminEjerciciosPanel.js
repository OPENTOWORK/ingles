'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { userHasRole } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import {
  filterTheoryPartsByLevel,
  findTheoryPartByHref,
} from '@/lib/theoryPartsCatalog';
import {
  buildTeoriaSuperBatchPlan,
  filterLevelsForTeoriaAdmin,
  summarizeTeoriaSuperBatchPlan,
} from '@/lib/teoriaSuperBatchPlan';
import AdminEjercicioEditModal from '@/components/admin/AdminEjercicioEditModal';
import AdminRecentEjerciciosSection from '@/components/admin/AdminRecentEjerciciosSection';
import styles from './AdminEjerciciosPanel.module.css';

async function getAdminFetchHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;
  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    accessToken = refreshed?.session?.access_token || null;
  }
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

export default function AdminEjerciciosPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [rowBusyId, setRowBusyId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [superRunning, setSuperRunning] = useState(false);
  const [superProgress, setSuperProgress] = useState({ done: 0, total: 0 });
  const [editingExercise, setEditingExercise] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [levels, setLevels] = useState([]);
  const [skills, setSkills] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [theoryParts, setTheoryParts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [aiConfigured, setAiConfigured] = useState(false);

  const [nivelId, setNivelId] = useState('');
  const [skillId, setSkillId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [topicHref, setTopicHref] = useState('');
  const [topic, setTopic] = useState('');

  const selectedTipo = useMemo(
    () => tipos.find((t) => t.id === tipoId) || null,
    [tipos, tipoId],
  );

  const selectedLevel = useMemo(
    () => levels.find((l) => l.id === nivelId) || null,
    [levels, nivelId],
  );

  const filteredTheoryParts = useMemo(
    () => filterTheoryPartsByLevel(theoryParts, selectedLevel?.nombre),
    [theoryParts, selectedLevel?.nombre],
  );

  const theoryPartsByGroup = useMemo(() => {
    const map = new Map();
    for (const part of filteredTheoryParts) {
      if (!map.has(part.group)) map.set(part.group, []);
      map.get(part.group).push(part);
    }
    return [...map.entries()];
  }, [filteredTheoryParts]);

  const selectedTheoryPart = useMemo(
    () => findTheoryPartByHref(theoryParts, topicHref),
    [theoryParts, topicHref],
  );

  const superBatchSummary = useMemo(() => {
    if (!levels.length || !skills.length || !tipos.length || !theoryParts.length) {
      return null;
    }
    return summarizeTeoriaSuperBatchPlan(
      buildTeoriaSuperBatchPlan({ theoryParts, levels, skills, tipos }),
    );
  }, [theoryParts, levels, skills, tipos]);

  const load = useCallback(async () => {
    setError('');
    const headers = await getAdminFetchHeaders();
    const res = await fetch('/api/admin/teoria-ejercicios', { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los datos.');

    const levelList = filterLevelsForTeoriaAdmin(json.levels || []);
    const skillList = json.skills || [];
    const tipoList = json.tipos || [];

    setLevels(levelList);
    setSkills(skillList);
    const partList = json.theoryParts || [];

    setTipos(tipoList);
    setTheoryParts(partList);
    setRecent(json.recent || []);
    setAiConfigured(Boolean(json.aiConfigured));

    const defaultNivelId =
      levelList.find((l) => String(l.nombre).toLowerCase() === 'b2')?.id ||
      levelList[0]?.id ||
      '';
    setNivelId((prev) => {
      if (prev && levelList.some((l) => l.id === prev)) return prev;
      return defaultNivelId;
    });
    setSkillId((prev) => prev || skillList[0]?.id || '');
    setTipoId((prev) => prev || tipoList[0]?.id || '');

    const defaultNivel = levelList.find((l) => l.id === defaultNivelId);
    const partsForLevel = filterTheoryPartsByLevel(partList, defaultNivel?.nombre);
    setTopicHref((prev) => prev || partsForLevel[0]?.href || '');
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login');
        return;
      }
      const isAdmin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      if (!isAdmin) {
        router.push('/perfil');
        return;
      }
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, load]);

  const handleNivelChange = (nextNivelId) => {
    setNivelId(nextNivelId);
    const nivel = levels.find((l) => l.id === nextNivelId);
    const parts = filterTheoryPartsByLevel(theoryParts, nivel?.nombre);
    if (!parts.some((p) => p.href === topicHref)) {
      setTopicHref(parts[0]?.href || '');
    }
  };

  const runSuperBatch = async () => {
    const summary = superBatchSummary;
    if (!summary?.total) {
      setError('No hay combinaciones para generar.');
      return;
    }

    const mins = Math.ceil((summary.total * 4) / 60);
    const ok = window.confirm(
      `SUPERBOTÓN — se generarán ${summary.total.toLocaleString('es-ES')} ejercicios.\n\n` +
        `• ${summary.folders} carpetas (Theory + Exam theory)\n` +
        `• ${summary.topics} temas\n` +
        `• ${summary.topics} temas × ${summary.cefrLevels} niveles × ${summary.skills} skills × ${summary.tipos} tipos\n\n` +
        `Fórmula: ${summary.topics} × ${summary.cefrLevels} × ${summary.skills} × ${summary.tipos} = ${summary.total.toLocaleString('es-ES')}.\n\n` +
        `Puede tardar horas (≈${mins} min con IA). ¿Continuar?`,
    );
    if (!ok) return;

    setSuperRunning(true);
    setCreating(true);
    setError('');
    setSuccess('');
    setSuperProgress({ done: 0, total: summary.total });

    let offset = 0;
    let createdTotal = 0;
    let failedTotal = 0;

    try {
      const headers = await getAdminFetchHeaders();

      while (offset < summary.total) {
        const res = await fetch('/api/admin/teoria-ejercicios/super-batch', {
          method: 'POST',
          headers,
          body: JSON.stringify({ offset, limit: 5 }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Error en el lote del superbotón.');

        createdTotal += json.createdCount ?? 0;
        failedTotal += json.failedCount ?? 0;
        offset = json.nextOffset ?? offset + (json.processed ?? 0);
        setSuperProgress({ done: offset, total: summary.total });

        if (json.recent) setRecent(json.recent);
        if (json.done) break;
      }

      setSuccess(
        `Superbotón completado: ${createdTotal.toLocaleString('es-ES')} creados` +
          (failedTotal ? `, ${failedTotal} fallos` : '') +
          ` de ${summary.total.toLocaleString('es-ES')}.`,
      );
      await load();
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setSuperRunning(false);
      setCreating(false);
      setSuperProgress({ done: 0, total: 0 });
    }
  };

  const createExercise = async () => {
    if (!nivelId || !skillId || !tipoId || !topicHref) {
      setError('Selecciona nivel, parte de teoría, skill y tipo de pregunta.');
      return;
    }

    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/teoria-ejercicios', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nivelId,
          skillId,
          tipoId,
          topicHref,
          topic,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo crear el ejercicio.');
      setRecent(json.recent || []);
      setSuccess(
        json.generatedWithAi
          ? 'Ejercicio generado con IA y guardado en preguntas + respuestas.'
          : 'Ejercicio creado (plantilla; configura OPENAI_API_KEY para IA).',
      );
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = async (row) => {
    setRowBusyId(row.id);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch(`/api/admin/teoria-ejercicios/${row.id}`, { headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo cargar el ejercicio.');
      setEditingExercise(json.exercise);
      setEditModalOpen(true);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setRowBusyId(null);
    }
  };

  const saveEdit = async (payload) => {
    if (!payload?.id) return;
    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch(`/api/admin/teoria-ejercicios/${payload.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar.');
      setRecent(json.recent || []);
      setEditModalOpen(false);
      setEditingExercise(null);
      setSuccess('Ejercicio actualizado.');
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteBulk = async (ids, onClearSelection) => {
    const ok = window.confirm(
      `¿Eliminar ${ids.length} ejercicio(s)?\n\nSe borrarán preguntas y respuestas en Supabase. No se puede deshacer.`,
    );
    if (!ok) return;

    setBulkDeleting(true);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/teoria-ejercicios', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ ids }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudieron eliminar.');
      setRecent(json.recent || []);
      onClearSelection?.();
      if (json.failed?.length) {
        setError(
          `Eliminados ${json.deletedCount ?? ids.length}. Fallos: ${json.failed.length}.`,
        );
      } else {
        setSuccess(`${json.deletedCount ?? ids.length} ejercicio(s) eliminados.`);
      }
      if (editingExercise && ids.includes(editingExercise.id)) {
        setEditModalOpen(false);
        setEditingExercise(null);
      }
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setBulkDeleting(false);
    }
  };

  const deleteExercise = async (row) => {
    const label = row.theoryPart?.label || row.pregunta?.slice(0, 60) || 'este ejercicio';
    const ok = window.confirm(
      `¿Eliminar «${label}»?\n\nSe borrarán la pregunta y sus respuestas en Supabase. Esta acción no se puede deshacer.`,
    );
    if (!ok) return;

    setRowBusyId(row.id);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch(`/api/admin/teoria-ejercicios/${row.id}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar.');
      setRecent(json.recent || []);
      if (editingExercise?.id === row.id) {
        setEditModalOpen(false);
        setEditingExercise(null);
      }
      setSuccess('Ejercicio eliminado.');
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setRowBusyId(null);
    }
  };

  if (loading) {
    return <RouteLoadingMascot label="Cargando panel de ejercicios…" variant={7} width={120} />;
  }

  return (
    <div className={styles.wrap}>
      <PanelPageHeader
        title="Panel de ejercicios"
        subtitle="Generación automática vinculada a levels_teoria_preguntas, respuestas y respuestas_abiertas"
        mascotVariant={8}
        mascotWidth={96}
      >
        <Link href="/admin" className={styles.btn}>
          ← Panel admin
        </Link>
      </PanelPageHeader>

      <div className={aiConfigured ? styles.banner : `${styles.banner} ${styles.bannerWarn}`} role="status">
        {aiConfigured ? (
          <>
            Al pulsar <strong>Crear ejercicio</strong> se inserta una fila en{' '}
            <strong>levels_teoria_preguntas</strong> y, según el tipo, en{' '}
            <strong>levels_teoria_respuestas</strong> (cerradas) o{' '}
            <strong>levels_teoria_respuestas_abiertas</strong> (abiertas).
          </>
        ) : (
          <>
            <strong>OPENAI_API_KEY</strong> no configurada: se usarán plantillas básicas. Añade la clave
            para generación automática con IA.
          </>
        )}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <section>
        <h2 className={styles.sectionTitle}>Crear ejercicio</h2>
        <p className={styles.sectionDesc}>
          Elige la parte de teoría (Theory o Exam theory), nivel CEFR, skill y tipo. El
          enlace a la unidad se guarda en la descripción del ejercicio.
        </p>

        {superBatchSummary ? (
          <div className={styles.superBox}>
            <div className={styles.superBoxText}>
              <p className={styles.superBoxTitle}>Superbotón</p>
              <p className={styles.superBoxDesc}>
                Genera <strong>{superBatchSummary.total.toLocaleString('es-ES')}</strong>{' '}
                ejercicios: {superBatchSummary.topics} temas × {superBatchSummary.cefrLevels}{' '}
                niveles × {superBatchSummary.skills} skills × {superBatchSummary.tipos} tipos (
                {superBatchSummary.folders} carpetas).
              </p>
              {superRunning ? (
                <p className={styles.superProgress} role="status">
                  Progreso: {superProgress.done.toLocaleString('es-ES')} /{' '}
                  {superProgress.total.toLocaleString('es-ES')}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSuper}`}
              disabled={creating || superRunning || bulkDeleting}
              onClick={runSuperBatch}
            >
              {superRunning ? 'Generando…' : `⚡ Superbotón (${superBatchSummary.total.toLocaleString('es-ES')})`}
            </button>
          </div>
        ) : null}

        <div className={styles.toolbar}>
          <label className={`${styles.field} ${styles.fieldPart}`}>
            <span className={styles.fieldLabel}>Parte de teoría</span>
            <select
              value={topicHref}
              onChange={(e) => setTopicHref(e.target.value)}
              required
            >
              <option value="">— Selecciona un tema —</option>
              {theoryPartsByGroup.map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((part) => (
                    <option key={part.href} value={part.href}>
                      {part.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nivel</span>
            <select value={nivelId} onChange={(e) => handleNivelChange(e.target.value)}>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {String(l.nombre).toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Skill</span>
            <select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Tipo de pregunta</span>
            <select value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`${styles.field} ${styles.fieldTopic}`}>
            <span className={styles.fieldLabel}>Tema (opcional)</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. Present perfect, phrasal verbs…"
            />
          </label>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={creating}
            onClick={createExercise}
          >
            {creating ? 'Creando…' : 'Crear ejercicio'}
          </button>

          <button type="button" className={styles.btn} disabled={creating} onClick={() => load()}>
            Actualizar
          </button>
        </div>

        <p className={styles.meta}>
          {selectedTheoryPart ? (
            <>
              Unidad: <strong>{selectedTheoryPart.label}</strong>
              <span className={styles.meta}> ({selectedTheoryPart.group})</span>
              {' · '}
            </>
          ) : null}
          {selectedTipo ? (
            <>
              Modo de respuesta:{' '}
              <span
                className={`${styles.badge} ${
                  selectedTipo.answerMode === 'open' ? styles.badgeOpen : styles.badgeClosed
                }`}
              >
                {selectedTipo.answerMode === 'open' ? 'Abierta' : 'Cerrada (opciones)'}
              </span>
            </>
          ) : null}
          {filteredTheoryParts.length === 0 ? (
            <span className={styles.metaWarn}> — No hay temas para este nivel CEFR.</span>
          ) : null}
        </p>
      </section>

      <AdminRecentEjerciciosSection
        recent={recent}
        levels={levels}
        skills={skills}
        tipos={tipos}
        theoryParts={theoryParts}
        rowBusyId={rowBusyId}
        savingEdit={savingEdit}
        bulkDeleting={bulkDeleting}
        onEdit={openEdit}
        onDelete={deleteExercise}
        onBulkDelete={deleteBulk}
      />

      <AdminEjercicioEditModal
        open={editModalOpen}
        saving={savingEdit}
        exercise={editingExercise}
        levels={levels}
        skills={skills}
        tipos={tipos}
        theoryParts={theoryParts}
        onClose={() => {
          if (savingEdit) return;
          setEditModalOpen(false);
          setEditingExercise(null);
        }}
        onSave={saveEdit}
      />
    </div>
  );
}
