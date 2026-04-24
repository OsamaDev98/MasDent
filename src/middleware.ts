import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const LOCALES = ['en', 'ar'];
const DEFAULT_LOCALE = 'en';
const AUTH_COOKIE = 'masdent_auth';
// JWT_SECRET must be set via environment variable — no hardcoded fallback
const JWT_SECRET = process.env.JWT_SECRET ?? '';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. i18n redirect
  const hasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 3. Dashboard auth guard
  const isDashboard = pathname.includes('/dashboard');
  if (isDashboard) {
    const isLogin = pathname.endsWith('/dashboard/login');
    if (isLogin) return NextResponse.next();

    const token = request.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      const loginUrl = pathname.replace(/\/dashboard(\/.*)?$/, '/dashboard/login');
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      // Role-based routing:
      // /dashboard → redirect to /dashboard/admin or /dashboard/staff
      const isBase = /\/dashboard\/?$/.test(pathname);
      if (isBase) {
        const lang = pathname.split('/')[1];
        const dest = role === 'admin' ? `/${lang}/dashboard/admin` : `/${lang}/dashboard/staff`;
        return NextResponse.redirect(new URL(dest, request.url));
      }

      // Protect /admin route to admins only
      if (pathname.includes('/dashboard/admin') && role !== 'admin') {
        const lang = pathname.split('/')[1];
        return NextResponse.redirect(new URL(`/${lang}/dashboard/staff`, request.url));
      }

      return NextResponse.next();
    } catch {
      const loginUrl = pathname.replace(/\/dashboard(\/.*)?$/, '/dashboard/login');
      const res = NextResponse.redirect(new URL(loginUrl, request.url));
      res.cookies.delete(AUTH_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
