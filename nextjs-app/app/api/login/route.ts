import { NextResponse } from 'next/server';

const PASSWORD = process.env.NEXT_PUBLIC_SIMPLE_PASSWORD || 'mySecret123';
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'sculpture_auth';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, PASSWORD, {
      path: '/', // This makes the cookie available everywhere
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
    });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
