import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Pass-through middleware. SEO and static assets are excluded from the matcher
 * so crawlers always receive sitemap/robots without auth checks.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
