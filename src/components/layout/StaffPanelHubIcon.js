'use client';

function StaffPanelHubIcon({ name = 'panel', className = '' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'inbox':
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="M4 10h5l2 3h2l2-3h5" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...common}>
          <path d="M9 11l2 2 4-4" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case 'admin':
      return (
        <svg {...common}>
          <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'teacher':
      return (
        <svg {...common}>
          <path d="M12 3L2 8l10 5 10-5-10-5z" />
          <path d="M6 11v4c0 2 2.5 4 6 4s6-2 6-4v-4" />
        </svg>
      );
    case 'coordinator':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
          <path d="M15 14c2.2.5 4 2.2 4 4.5" />
        </svg>
      );
    case 'support':
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 0116 0v4a2 2 0 01-2 2h-1" />
          <path d="M8 20h8" />
          <path d="M12 12v3" />
        </svg>
      );
    case 'it':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
          <path d="M8 9h2M14 9h2" />
        </svg>
      );
    case 'objectives':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      );
    case 'finance':
      return (
        <svg {...common}>
          <path d="M4 18V8l8-4 8 4v10" />
          <path d="M8 18v-6h8v6" />
          <path d="M12 4v4" />
        </svg>
      );
    case 'exercises':
      return (
        <svg {...common}>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 'building':
      return (
        <svg {...common}>
          <path d="M4 20V8l8-4 8 4v12" />
          <path d="M9 20v-6h6v6" />
          <path d="M10 10h1M13 10h1M10 13h1M13 13h1" />
        </svg>
      );
    case 'groups':
      return (
        <svg {...common}>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16" cy="9" r="3" />
          <path d="M3 20c0-3 2.2-5 5-5M16 15c2.8 0 5 2 5 5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
  }
}

export default StaffPanelHubIcon;
