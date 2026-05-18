'use client';

export default function ProfileComingSoon({ section }) {
  return (
    <section className="profile-coming-soon" role="status" aria-live="polite">
      <span className="profile-coming-soon__badge">Coming soon</span>
      <h2 className="profile-coming-soon__title">
        {section ? `${section} — próximamente` : 'Próximamente'}
      </h2>
      <p className="profile-coming-soon__text">
        Esta sección del perfil estará disponible pronto. Mientras tanto, puedes revisar tu{' '}
        <strong>Resumen</strong> con tus estadísticas principales.
      </p>
    </section>
  );
}
