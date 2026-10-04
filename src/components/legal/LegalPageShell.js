import LegalDocumentView from '@/components/legal/LegalDocumentView';
import { getSupabaseAdmin } from '@/lib/aiUsage';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import { loadPersistedLegalIdentity } from '@/lib/orgSettingsServer';

export default async function LegalPageShell({ slug }) {
  const document = getLegalDocument(slug);

  if (!document) {
    return (
      <main className="legal-doc-page">
        <h1>Documento no encontrado</h1>
      </main>
    );
  }

  const legalIdentity = slug === 'terminos-condiciones'
    ? await loadPersistedLegalIdentity(getSupabaseAdmin())
    : null;

  return (
    <main className="legal-doc-page">
      <LegalDocumentView document={{ ...document, legalIdentity }} />
    </main>
  );
}
