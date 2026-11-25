import StudentProfilePreview from '@/components/perfil/StudentProfilePreview';

export const metadata = {
  title: 'Student profile preview',
  robots: { index: false, follow: false },
};

export default function StudentProfilePreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    return (
      <main className="shell">
        <p>This preview is not available.</p>
      </main>
    );
  }

  return <StudentProfilePreview />;
}
