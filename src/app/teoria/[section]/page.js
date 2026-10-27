import { notFound } from 'next/navigation';
import TeoriaSectionGate from '@/components/theory/TeoriaSectionGate';
import {
  EXAM_SECTION_LEGACY_SLUGS,
  SECTION_CATALOG,
  getSectionBySlug,
} from '@/data/teoriaSections';
import { examStrategyPartMetadata } from '@/lib/siteSeo';

export function generateStaticParams() {
  return [
    ...SECTION_CATALOG.map((s) => ({ section: s.slug })),
    ...EXAM_SECTION_LEGACY_SLUGS.map((section) => ({ section })),
  ];
}

export function generateMetadata({ params }) {
  const strategy = examStrategyPartMetadata(params.section);
  if (strategy) return strategy;
  const section = getSectionBySlug(params.section);
  if (!section) return { title: 'Theory' };
  return {
    title: `${section.key} | Theory`,
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
