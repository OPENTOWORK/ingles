'use client';

/**
 * Barra de búsqueda y filtros por apartado (Theory hub y listados de temas).
 */
export default function TeoriaFilterToolbar({
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
  const canClear =
    Boolean(onClear) &&
    (query.trim().length > 0 || (showSections && selectedSections.length > 0));

  return (
    <section className="toolbar" aria-label="Filter and search topics">
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
        {canClear ? (
          <button type="button" className="toolbar__clear" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
    </section>
  );
}
