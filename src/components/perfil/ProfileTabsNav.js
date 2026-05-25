'use client';

/**
 * Menú de pestañas del perfil (reutilizable en dock fijo y en flujo de página).
 */
export default function ProfileTabsNav({
  tabs,
  activeTab,
  onSelectTab,
  isStudent,
  className = '',
  ariaLabel = 'Secciones del perfil',
}) {
  return (
    <nav
      className={`perfil-tabs-bar tabs-container${className ? ` ${className}` : ''}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="tabs">
        {tabs.map((tab) => {
          const locked = isStudent && !tab.studentAllowed;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tab${activeTab === tab.id ? ' tab--active' : ''}${locked ? ' tab--locked' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              aria-disabled={locked || undefined}
              title={locked ? 'Próximamente disponible' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
