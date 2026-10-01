import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signToken, TOKEN_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }
  const token = await signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
