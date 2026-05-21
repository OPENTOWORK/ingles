export default function DashboardSectionPlaceholder({ label = 'Loading…' }) {
  return (
    <div
      style={{
        minHeight: 120,
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
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
