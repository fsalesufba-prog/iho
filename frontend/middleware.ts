import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const path = request.nextUrl.pathname

  // Rotas públicas
  const publicPaths = [
    '/',
    '/planos',
    '/blog',
    '/blog/(.*)',
    '/juridico',
    '/juridico/(.*)',
    '/login',
    '/esqueci-senha',
    '/resetar-senha/(.*)'
  ]

  const isPublicPath = publicPaths.some(publicPath => {
    if (publicPath.includes('(.*)')) {
      const basePath = publicPath.replace('(.*)', '')
      return path.startsWith(basePath)
    }
    return path === publicPath
  })

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
}