'use client';

function formatFetchedAt(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function KpiCard({ label, value, hint = '' }) {
  return (
    <div className="p-4 rounded border bg-gray-50">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
    </div>
  );
}

function UrlTable({ title, rows, countLabel = 'Eventos', emptyLabel }) {
  return (
    <div className="rounded border p-4 h-full">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3 font-medium">Página</th>
                <th className="py-2 font-medium w-24">{countLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${title}-${row.url}`} className="border-b border-gray-100">
                  <td className="py-2 pr-3 text-gray-800 break-all">{row.url}</td>
                  <td className="py-2 font-semibold text-gray-900">{row.count ?? row.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold mb-2">Configura Microsoft Clarity en el servidor</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>
          En{' '}
          <a
            href="https://clarity.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            clarity.microsoft.com
          </a>{' '}
          → Settings → Data Export → Generate new API token
        </li>
        <li>
          Añade <code className="bg-amber-100 px-1 rounded">CLARITY_API_TOKEN=tu_token</code> en
          Vercel y en <code className="bg-amber-100 px-1 rounded">.env.local</code>
        </li>
        <li>
          Asegúrate de tener{' '}
          <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_CLARITY_PROJECT_ID=x4qtfjtnkz</code>{' '}
          para que el script recoja datos en la web
        </li>
      </ol>
    </div>
  );
}

export default function AdminClarityPanel({
  data,
  loading = false,
  onRefresh,
  refreshDisabled = false,
}) {
  const projectId = data?.projectId || 'x4qtfjtnkz';
  const clarityDashboardUrl = `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`;

  if (!data && loading) {
    return (
      <div className="bg-white rounded-lg shadow mb-8 p-6 text-sm text-gray-500">
        Cargando datos de Microsoft Clarity…
      </div>
    );
  }

  if (data?.error === 'not_configured') {
    return (
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Comportamiento real (Microsoft Clarity)</h2>
            <p className="text-sm text-gray-600 mt-1">
              Clics, abandonos, mapas de calor y grabaciones anónimas
            </p>
          </div>
        </div>
        <div className="p-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Comportamiento real (Microsoft Clarity)</h2>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-red-700">
            {data.error === 'rate_limit'
              ? 'Límite diario de la API de Clarity alcanzado (10 peticiones/día). Los datos en caché se mostrarán cuando estén disponibles.'
              : `Error al cargar Clarity: ${data.message || data.error}`}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshDisabled || loading}
            className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Comportamiento real (Microsoft Clarity)</h2>
          <p className="text-sm text-gray-600 mt-1">
            Últimas {summary.numOfDays || 3} día(s) · Clics frustrados, páginas donde se pierden los
            usuarios y rutas más visitadas
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Actualizado: {formatFetchedAt(data?.fetchedAt)}
            {data?.cached ? ' (caché)' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={clarityDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Abrir Clarity (grabaciones) →
          </a>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshDisabled || loading}
            className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Sesiones" value={summary.totalSessions ?? 0} />
          <KpiCard label="Usuarios" value={summary.totalUsers ?? 0} />
          <KpiCard
            label="Rage clicks"
            value={summary.rageClickTotal ?? 0}
            hint="Clics repetidos por frustración"
          />
          <KpiCard
            label="Dead clicks"
            value={summary.deadClickTotal ?? 0}
            hint="Clics en elementos que no responden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Quickback"
            value={summary.quickbackTotal ?? 0}
            hint="Vuelven atrás rápido (posible abandono)"
          />
          <KpiCard
            label="Error clicks"
            value={summary.errorClickTotal ?? 0}
            hint="Clics tras un error de script"
          />
          <KpiCard
            label="Proyecto"
            value={projectId}
            hint="ID en Microsoft Clarity"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrlTable
            title="Páginas más visitadas"
            rows={data?.topPages || []}
            countLabel="Sesiones"
            emptyLabel="Sin tráfico en el rango. ¿El script de Clarity está activo y los usuarios aceptaron cookies analíticas?"
          />
          <UrlTable
            title="Rage clicks por página"
            rows={data?.rageClicks || []}
            emptyLabel="Sin rage clicks en este periodo."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrlTable
            title="Dead clicks (botón no visible o no funciona)"
            rows={data?.deadClicks || []}
            emptyLabel="Sin dead clicks en este periodo."
          />
          <UrlTable
            title="Quickback (abandonan la página)"
            rows={data?.quickbackClicks || []}
            emptyLabel="Sin quickback en este periodo."
          />
        </div>

        <p className="text-xs text-gray-500">
          La API de Clarity solo permite datos de las últimas 72 h y 10 peticiones/día. Para
          grabaciones de sesión y mapas de calor detallados, usa el enlace «Abrir Clarity».
        </p>
      </div>
    </div>
  );
}
