'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import {
  CAMBRIDGE_EXAM_CITIES,
  CAMBRIDGE_EXAM_OFFICIAL_LINKS,
  CAMBRIDGE_EXAM_REGIONS,
} from '@/data/cambridgeExamDatesByCity';
import { getExamReadinessRecommendation } from '@/utils/examReadinessRecommendation';
import styles from './ProfileExamDatesPanel.module.css';

function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isDigitalSession(session) {
  return /computer-based|digital/i.test(session);
}

const CityCard = memo(function CityCard({ city }) {
  return (
    <article className={styles.cityCard}>
      <header className={styles.cityHeader}>
        <h3 className={styles.cityName}>{city.name}</h3>
        <span className={styles.cityRegion}>{city.region}</span>
      </header>

      <ul className={styles.sessionList}>
        {city.typicalSessions.map((session) => (
          <li
            key={session}
            className={styles.sessionItem}
            data-digital={isDigitalSession(session) ? 'true' : undefined}
          >
            <span className={styles.sessionDot} aria-hidden />
            {session}
          </li>
        ))}
      </ul>

      <div className={styles.cityActions}>
        {city.links.map((link) => (
          <a
            key={`${city.id}-${link.variant}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              link.variant === 'secondary'
                ? `${styles.cityLink} ${styles.cityLinkSecondary}`
                : `${styles.cityLink} ${styles.cityLinkPrimary}`
            }
          >
            <span>{link.label}</span>
            <span className={styles.cityLinkIcon} aria-hidden>
              ↗
            </span>
          </a>
        ))}
      </div>
    </article>
  );
});

/**
 * Recomendación de preparación + fechas por ciudad con enlaces oficiales.
 */
export default function ProfileExamDatesPanel({
  levelEstimate = 'B1',
  completedExams = 0,
  studyStreak = 0,
  totalStudyMinutes = 0,
}) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const recommendation = useMemo(
    () =>
      getExamReadinessRecommendation({
        levelEstimate,
        completedExams,
        studyStreak,
        totalStudyMinutes,
      }),
    [levelEstimate, completedExams, studyStreak, totalStudyMinutes],
  );

  const filteredCities = useMemo(() => {
    const query = normalizeText(searchQuery);
    return CAMBRIDGE_EXAM_CITIES.filter((city) => {
      if (regionFilter !== 'all' && city.region !== regionFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = normalizeText(`${city.name} ${city.region} ${city.id}`);
      return haystack.includes(query);
    });
  }, [searchQuery, regionFilter]);

  const hasActiveFilter = searchQuery.trim().length > 0 || regionFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setRegionFilter('all');
  };

  if (!mounted) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelLoading}>Cargando fechas de examen…</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <section className="profile-section">
        <div className="section-head">
          <h2>🎓 ¿Cuándo presentarte al examen?</h2>
        </div>
        <p className="section-desc">
          Recomendación personalizada según tu actividad en Dralo. Las fechas exactas dependen de
          cada centro autorizado — usa los enlaces para confirmar plazas e inscripción.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{recommendation.level}</div>
              <div className="stat-label">Nivel estimado</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className={`stat-number ${styles.statNumberCompact}`}>
                {recommendation.suggestedWindow}
              </div>
              <div className="stat-label">Ventana orientativa</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {recommendation.readiness === 'ready'
                ? '✅'
                : recommendation.readiness === 'almost'
                  ? '🟡'
                  : '📘'}
            </div>
            <div className="stat-content">
              <div className={`stat-number ${styles.statNumberCompact}`}>
                {recommendation.readinessLabel}
              </div>
              <div className="stat-label">Estado de preparación</div>
            </div>
          </div>
        </div>

        <p className={styles.readinessHeadline}>{recommendation.headline}</p>
        <ul className={styles.readinessTips}>
          {recommendation.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="profile-section">
        <div className="section-head">
          <h2>📅 Fechas por ciudad</h2>
        </div>
        <p className="section-desc">
          {CAMBRIDGE_EXAM_CITIES.length} ciudades en España. Busca la tuya o filtra por comunidad
          autónoma para ver convocatorias orientativas y enlaces oficiales.
        </p>

        <div className={styles.filterBar}>
          <label className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              🔍
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Buscar ciudad… (ej. Málaga, Valencia, Bilbao)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar ciudad"
            />
            {searchQuery ? (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Borrar búsqueda"
              >
                ✕
              </button>
            ) : null}
          </label>

          <div className={styles.regionRow}>
            <span className={styles.regionLabel}>Comunidad:</span>
            <div className={styles.regionChips} role="group" aria-label="Filtrar por comunidad">
              <button
                type="button"
                className={`${styles.regionChip}${regionFilter === 'all' ? ` ${styles.regionChipActive}` : ''}`}
                onClick={() => setRegionFilter('all')}
              >
                Todas
              </button>
              {CAMBRIDGE_EXAM_REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  className={`${styles.regionChip}${regionFilter === region ? ` ${styles.regionChipActive}` : ''}`}
                  onClick={() => setRegionFilter(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterMeta}>
            <span>
              Mostrando <strong>{filteredCities.length}</strong> de {CAMBRIDGE_EXAM_CITIES.length}{' '}
              ciudades
              {regionFilter !== 'all' ? (
                <>
                  {' '}
                  en <strong>{regionFilter}</strong>
                </>
              ) : null}
            </span>
            {hasActiveFilter ? (
              <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
                Quitar filtros
              </button>
            ) : null}
          </div>
        </div>

        <p className={styles.cityNote}>
          Las fechas mostradas son orientativas. Cada centro publica sus plazas reales en Cambridge
          English o British Council.
        </p>

        {filteredCities.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay ciudades con ese criterio.</p>
            <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
              Ver todas las ciudades
            </button>
          </div>
        ) : (
          <div className={styles.cityGrid}>
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <div className="section-head">
          <h2>🔗 Recursos oficiales</h2>
        </div>
        <p className="section-desc">
          Enlaces verificados a Cambridge English y British Council para consultar plazos, precios e
          inscripción.
        </p>
        <div className={styles.officialGrid}>
          {CAMBRIDGE_EXAM_OFFICIAL_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.officialLink}
              title={link.description}
            >
              <span className={styles.officialLinkLabel}>{link.label}</span>
              <span className={styles.officialLinkDesc}>{link.description}</span>
              <span className={styles.officialLinkArrow}>Abrir enlace ↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
