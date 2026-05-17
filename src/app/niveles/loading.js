export default function NivelesLoading() {
  return (
    <div
      className="route-loading route-loading--niveles"
      role="status"
      aria-live="polite"
      aria-label="Cargando ejercicios"
    >
      <span className="route-loading__spinner" aria-hidden="true" />
    </div>
  );
}
