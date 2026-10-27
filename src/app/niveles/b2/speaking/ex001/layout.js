import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Speaking B2 First Part 1 — SP-EX001',
  description:
    'Simulador SP-EX001 de Speaking B2 First Part 1. Entrevista oral con examinador y correcciones orientativas.',
  path: '/exam-practice/b2/speaking/ex001/',
  robots: { index: false, follow: true },
});

export default function SpeakingB2Ex001Layout({ children }) {
  return children;
}
