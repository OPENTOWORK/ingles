import { examPracticeLevelMetadata } from '@/lib/siteSeo';

export const metadata = {
  ...examPracticeLevelMetadata('c2'),
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
