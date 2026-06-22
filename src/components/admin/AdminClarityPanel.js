'use client';

const DEFAULT_PROJECT_ID = 'x4qtfjtnkz';

export default function AdminClarityPanel() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
  const clarityUrl = projectId
    ? `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`
    : 'https://clarity.microsoft.com/';

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Comportamiento real (Microsoft Clarity)</h2>
        <p className="text-sm text-gray-600 mt-1">
          Mapas de calor, grabaciones de sesión y análisis de uso en la web de Clarity.
        </p>
      </div>
      <div className="p-6">
        <a
          href={clarityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Abrir Microsoft Clarity →
        </a>
      </div>
    </div>
  );
}
