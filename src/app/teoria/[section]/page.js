import { notFound } from 'next/navigation';
import TeoriaSectionGate from '@/components/theory/TeoriaSectionGate';
import {
  EXAM_SECTION_LEGACY_SLUGS,
  SECTION_CATALOG,
  getSectionBySlug,
} from '@/data/teoriaSections';

export function generateStaticParams() {
  return [
    ...SECTION_CATALOG.map((s) => ({ section: s.slug })),
    ...EXAM_SECTION_LEGACY_SLUGS.map((section) => ({ section })),
  ];
}

export function generateMetadata({ params }) {
  const section = getSectionBySlug(params.section);
  if (!section) return { title: 'Theory | Dralo' };
  return {
    title: `${section.key} | Theory | Dralo`,
    description: section.description,
  };
}

export default function TeoriaSectionPage({ params }) {
  const section = getSectionBySlug(params.section);

  if (!section) {
    notFound();
  }

  return (
    <TeoriaSectionGate
      sectionSlug={section.slug}
      sectionTitle={section.key}
      topics={section.topics}
    />
  );
}
