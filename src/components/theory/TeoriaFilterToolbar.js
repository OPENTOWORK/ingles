'use client';

import { LEVELS } from '@/data/teoriaSections';

/**
 * Barra de filtros CEFR + búsqueda (compartida en Theory hub y cada apartado).
 */
export default function TeoriaFilterToolbar({
  selectedLevels = [],
  onToggleLevel,
  query = '',
  onQueryChange,
  onClear,
  filteredCount = 0,
  totalCount = 0,
  searchPlaceholder = 'Search topic…',
  sections = [],
  selectedSections = [],
  onToggleSection,
}) {
  const showSections = sections.length > 0 && onToggleSection;

  return (
    <section className="toolbar" aria-label="Filter and search topics">
      <div className="chips" role="group" aria-label="CEFR levels">
        {LEVELS.map((level) => {
          const active = selectedLevels.includes(level.code);
          return (
            <button
              key={level.code}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => onToggleLevel(level.code)}
              aria-pressed={active}
              title={`${level.name}: ${level.description}`}
              style={{
                borderColor: active ? level.color : '#eaeaea',
                background: active ? level.color : 'var(--card)',
                color: active ? 'white' : 'var(--text)',
                boxShadow: active ? `0 8px 20px ${level.color}35` : 'none',
              }}
            >
              {level.code}
            </button>
          );
        })}
        <button type="button" className="chip chip--ghost" onClick={onClear}>
          Clear
        </button>
      </div>

      {showSections ? (
        <div className="chips chips--sections" role="group" aria-label="Skill areas">
          {sections.map((area) => {
            const active = selectedSections.includes(area.key);
            return (
              <button
                key={area.key}
                type="button"
                className={`chip ${active ? 'chip--active' : ''}`}
                onClick={() => onToggleSection(area.key)}
                aria-pressed={active}
                style={{
                  borderColor: active ? area.accent : '#eaeaea',
                  background: active ? area.accent : 'var(--card)',
                  color: active ? 'white' : 'var(--text)',
                  boxShadow: active ? `0 6px 16px ${area.accent}40` : 'none',
                }}
              >
                {area.key}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="search">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search topic"
        />
        <span className="search__icon" aria-hidden>
          ⌕
        </span>
      </div>

      <div className="meta">
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> topic
        {totalCount === 1 ? '' : 's'}
      </div>

      {selectedLevels.length > 0 ? (
        <div className="level-info">
          <h4>Selected levels:</h4>
          <div className="level-cards">
            {LEVELS.filter((level) => selectedLevels.includes(level.code)).map((level) => (
              <div key={level.code} className="level-card" style={{ borderColor: level.color }}>
                <div className="level-header" style={{ backgroundColor: level.color }}>
                  <span className="level-code">{level.code}</span>
                  <span className="level-name">{level.name}</span>
                </div>
                <div className="level-content">
                  <p className="level-description">{level.description}</p>
                  <p className="level-skills">
                    <strong>Skills:</strong> {level.skills}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
