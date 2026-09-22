import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { isPublicPath } from '@/utils/publicRoutes';
import { isWritingV3PreviewPath } from '@/utils/writingV3Preview';

/**
 * Server-side auth gate — same rules on mobile, tablet and desktop.
 * Only home, contact, login and registration are public; everything else requires a session.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Google Search Console (and similar) HTML verification files in /public.
  if (/^\/google[a-z0-9]+\.html\/?$/i.test(pathname)) {
    return NextResponse.next();
  }

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

  // Visualización móvil/tablet. No leer ni refrescar cookies: rotaría el token
  // de la ventana principal. Una pestaña normal (sec-fetch-dest: document) sigue el gate.
  if (isItPreviewFrameRequest(request)) {
    const headers = new Headers(request.headers);
    headers.delete('cookie');
    return NextResponse.next({ request: { headers } });
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

  const isDev = process.env.NODE_ENV === 'development';
  let user = null;
  if (isDev) {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;
  } else {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function requestHasPreviewMark(request: NextRequest) {
  return (
    request.nextUrl.searchParams.has('_itPreview') ||
    request.nextUrl.searchParams.has('itPreviewRole')
  );
}

function refererHasPreviewMark(request: NextRequest) {
  const referer = request.headers.get('referer');
  if (!referer) return false;
  try {
    const url = new URL(referer);
    if (url.origin !== request.nextUrl.origin) return false;
    return url.searchParams.has('_itPreview') || url.searchParams.has('itPreviewRole');
  } catch {
    return false;
  }
}

function isItPreviewFrameRequest(request: NextRequest) {
  const dest = request.headers.get('sec-fetch-dest');
  if (dest === 'document') return false;
  if (dest === 'iframe' && requestHasPreviewMark(request)) return true;
  if (dest === 'empty' && (requestHasPreviewMark(request) || refererHasPreviewMark(request))) {
    return true;
  }
  return false;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest\\.webmanifest|manifest.json|offline.html|sw-reset.html|sw.js|google[a-z0-9]+\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
};
