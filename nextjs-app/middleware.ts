import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.NEXT_PUBLIC_SIMPLE_PASSWORD || 'mySecret123';
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'sculpture_auth';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME);

  if (cookie?.value !== PASSWORD) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sculptures-admin/:path*'], // ✅ Only runs on /sculptures/** routes
};
