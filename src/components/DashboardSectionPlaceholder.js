export default function DashboardSectionPlaceholder({ label = 'Cargando panel…' }) {
  return (
    <div
      style={{
        minHeight: 120,
        borderRadius: 12,
        border: '1px solid #e5e9f0',
        background: 'linear-gradient(90deg, #f4f7fb 25%, #eef2f8 50%, #f4f7fb 75%)',
        backgroundSize: '200% 100%',
        animation: 'dralo-shimmer 1.2s ease-in-out infinite',
        display: 'grid',
        placeItems: 'center',
        color: '#6b7c8f',
        fontSize: '0.9rem',
        fontWeight: 600,
      }}
      aria-busy="true"
      aria-label={label}
    >
      {label}
      <style jsx>{`
        @keyframes dralo-shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  );
}
