import { NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createMiddlewareSupabaseClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const protectedRoutes = [
    '/teoria',
    '/training',
    '/niveles',
    '/prueba-nivel',
    '/update-password',
    '/reset-password',
    '/perfil' // ✅ Ahora también protegida
  ]

  const pathname = req.nextUrl.pathname
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/teoria/:path*',
    '/training/:path*',
    '/niveles/:path*',
    '/prueba-nivel/:path*',
    '/update-password/:path*',
    '/reset-password/:path*',
    '/perfil/:path*' // ✅ Protege también esta ruta
  ]
}
