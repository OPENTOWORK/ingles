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
        <div className={styles.panelLoading}>Loading exam dates…</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <section className="profile-section">
        <div className="section-head">
          <h2>🎓 When should you take the exam?</h2>
        </div>
        <p className="section-desc">
          Personalised recommendation based on your activity on Dralo. Exact dates depend on each
          authorised centre — use the links below to confirm availability and registration.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{recommendation.level}</div>
              <div className="stat-label">Estimated level</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className={`stat-number ${styles.statNumberCompact}`}>
                {recommendation.suggestedWindow}
              </div>
              <div className="stat-label">Suggested window</div>
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
              <div className="stat-label">Readiness</div>
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
          <h2>📅 Dates by city</h2>
        </div>
        <p className="section-desc">
          {CAMBRIDGE_EXAM_CITIES.length} cities in Spain. Search yours or filter by region to see
          indicative sessions and official links.
        </p>

        <div className={styles.filterBar}>
          <label className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              🔍
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search city… (e.g. Málaga, Valencia, Bilbao)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search city"
            />
            {searchQuery ? (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </label>

          <div className={styles.regionRow}>
            <label className={styles.regionLabel} htmlFor="exam-dates-region">
              Region
            </label>
            <select
              id="exam-dates-region"
              className={styles.regionSelect}
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label="Filter by region"
            >
              <option value="all">All regions</option>
              {CAMBRIDGE_EXAM_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterMeta}>
            <span>
              Showing <strong>{filteredCities.length}</strong> of {CAMBRIDGE_EXAM_CITIES.length}{' '}
              cities.
              {regionFilter !== 'all' ? (
                <>
                  {' '}
                  In <strong>{regionFilter}</strong>
                </>
              ) : null}
            </span>
            {hasActiveFilter ? (
              <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <p className={styles.cityNote}>
          Dates shown are indicative. Each centre publishes real slots on Cambridge English or
          British Council.
        </p>

        {filteredCities.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No cities match that filter.</p>
            <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
              Show all cities
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
          <h2>🔗 Official resources</h2>
        </div>
        <p className="section-desc">
          Verified links to Cambridge English and British Council for dates, fees and registration.
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
              <span className={styles.officialLinkArrow}>Open link ↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
