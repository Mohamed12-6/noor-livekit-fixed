import { SignJWT, jwtVerify } from 'jose';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';

const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || 'noor-dev-secret');

export const TOKEN_COOKIE = 'noor_token';

export type SessionUser = { id: string; email: string; name: string; role: string };

export function hashPassword(password: string) {
  return scryptSync(password, 'noor-salt', 64).toString('hex');
}

export function verifyPassword(password: string, stored: string) {
  const a = Buffer.from(scryptSync(password, 'noor-salt', 64));
  const b = Buffer.from(stored, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function signToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: payload.id as string, email: payload.email as string, name: payload.name as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireRole(role: string) {
  const user = await getSessionUser();
  if (!user || user.role !== role) return null;
  return user;
}

export async function getTeacherUser() {
  const user = await getSessionUser();
  if (!user || user.role !== 'TEACHER') return null;
  const teacher = await db.teacher.findUnique({ where: { userId: user.id }, include: { user: true } });
  if (!teacher) return null;
  return { user, teacher };
}
