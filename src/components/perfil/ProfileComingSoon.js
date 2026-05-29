'use client';

export default function ProfileComingSoon({ section }) {
  return (
    <section className="profile-coming-soon" role="status" aria-live="polite">
      <span className="profile-coming-soon__badge">Coming soon</span>
      <h2 className="profile-coming-soon__title">
        {section ? `${section} — coming soon` : 'Coming soon'}
      </h2>
      <p className="profile-coming-soon__text">
        This profile section will be available soon. In the meantime, check your{' '}
        <strong>Overview</strong> for your main stats.
      </p>
    </section>
  );
}
