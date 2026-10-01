import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

// للصفحات (Server Components / layouts)
export async function requireRole(role: Role, next: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${next}`);
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}

export function homeFor(role: string) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  return '/teachers';
}

// لل API routes
export async function apiRequireRole(role: Role) {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  if (user.role !== role) return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  return { user };
}