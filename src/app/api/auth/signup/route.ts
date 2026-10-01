import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, TOKEN_COOKIE } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public self-service registration.
// IMPORTANT: role is hard-coded to STUDENT so nobody can self-assign ADMIN/TEACHER.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');
  const confirmPassword = body.confirmPassword === undefined ? password : String(body.confirmPassword);

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'weak_password' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'password_mismatch' }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 });
  }

  let user;
  try {
    user = await db.user.create({
      data: { name, email, passwordHash: hashPassword(password), role: 'STUDENT' },
    });
  } catch (e: any) {
    // Unique constraint (email) — someone registered it between our check and the insert.
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }
    throw e;
  }

  const token = await signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const res = NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { status: 201 },
  );
  // Auto-login right after signup, same cookie the login route sets.
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
