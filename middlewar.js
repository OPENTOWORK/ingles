import { NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // rutas protegidas
  const protectedRoutes = [
    '/teoria',
    '/training',
    '/niveles',
    '/prueba-nivel',
    '/update-password',
    '/perfil',
  ]

  const pathname = req.nextUrl.pathname
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // ❌ evitar bucle infinito: no redirigir si ya estoy en /login
  if (isProtected && !session && pathname !== '/login') {
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
    '/perfil/:path*',
  ],
}
