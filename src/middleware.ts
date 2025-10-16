import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle legacy dashboard redirects
  if (pathname.includes('/dashboard/provider-dashboard') || 
      pathname.includes('/dashboard/equipment-provider-dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace(
      /\/dashboard\/(provider-dashboard|equipment-provider-dashboard)/,
      '/dashboard/equipment-provider'
    );
    return NextResponse.redirect(url);
  }

  return createMiddleware(routing)(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
    '/',
    '/(ar|en)/:path*'
  ]
};