import { NextResponse } from 'next/server';

const PASSWORD = process.env.SIMPLE_PASSWORD || 'mySecret123';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth', PASSWORD, {
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
    });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
