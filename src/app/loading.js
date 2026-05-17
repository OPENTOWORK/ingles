export default function RootLoading() {
  return (
    <div
      className="route-loading"
      role="status"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <span className="route-loading__spinner" aria-hidden="true" />
    </div>
  );
}
