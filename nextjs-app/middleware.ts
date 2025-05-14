import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.SIMPLE_PASSWORD || 'mySecret123';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('auth');

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
