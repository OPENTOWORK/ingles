import type { MetadataRoute } from 'next';
import { buildRobotsPolicy } from '@/lib/robotsPolicy';

/** Public robots.txt. Preview deployments must not be indexed. */
export default function robots(): MetadataRoute.Robots {
  return buildRobotsPolicy({
    preview: process.env.VERCEL_ENV === 'preview',
  });
}
