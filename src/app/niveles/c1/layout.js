import { examPracticeLevelMetadata } from '@/lib/siteSeo';

export const metadata = {
  ...examPracticeLevelMetadata('c1'),
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
