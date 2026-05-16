import { notFound } from 'next/navigation';
import TeoriaTopicList from '@/components/theory/TeoriaTopicList';
import { SECTION_CATALOG, getSectionBySlug } from '@/data/teoriaSections';

export function generateStaticParams() {
  return SECTION_CATALOG.map((s) => ({ section: s.slug }));
}

export default function TeoriaSectionPage({ params }) {
  const section = getSectionBySlug(params.section);

  if (!section) {
    notFound();
  }

  return (
    <TeoriaTopicList
      sectionTitle={section.key}
      topics={section.topics}
    />
  );
}
