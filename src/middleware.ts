import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { isPublicPath } from '@/utils/publicRoutes';
import { isWritingV3PreviewPath } from '@/utils/writingV3Preview';

/**
 * Server-side auth gate — same rules on mobile, tablet and desktop.
 * Only home, contact and login are public; everything else requires a session.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Writing v3 fixture surface (Phase 8). It renders static fixtures, reaches no
  // database and no model, and exists ONLY outside production: in a production
  // build the route itself refuses to render and this bypass never applies, so it
  // is not a public path and no student can reach it.
  if (isWritingV3PreviewPath(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = getSupabaseUrl() ?? '';
  const supabaseAnonKey = getSupabaseAnonKey() ?? '';
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|offline.html|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
};
