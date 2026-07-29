import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get('auth-token')?.value;

  // Protected application routes
  const protectedPrefixes = [
    '/dashboard',
    '/locations',
    '/rank-tracker',
    '/heatmaps',
    '/citations',
    '/citation-builder',
    '/review-campaigns',
    '/duplicate-suppressor',
    '/reviews',
    '/competitors',
    '/website-audit',
    '/content-tools',
    '/schema-generator',
    '/automation',
    '/reports',
    '/developer',
    '/assistant',
    '/recommendations',
    '/notifications',
    '/billing',
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Redirect to login if accessing a protected route without being authenticated
  if (isProtected && !authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged-in user visits auth pages
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  if (isAuthRoute && authToken) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Security headers addition for production hardening
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
