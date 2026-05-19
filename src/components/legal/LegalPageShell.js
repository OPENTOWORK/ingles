import LegalDocumentView from '@/components/legal/LegalDocumentView';
import { getLegalDocument } from '@/lib/legal/legalDocuments';

export default function LegalPageShell({ slug }) {
  const document = getLegalDocument(slug);

  if (!document) {
    return (
      <main className="legal-doc-page">
        <h1>Documento no encontrado</h1>
      </main>
    );
  }

  return (
    <main className="legal-doc-page">
      <LegalDocumentView document={document} />
    </main>
  );
}
