import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { isPresent } from '@/lib/settings';

export async function POST(req: Request) {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { teacherId, isOnline } = await req.json().catch(() => ({}));
  if (!teacherId || typeof isOnline !== 'boolean') {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  const teacher = await db.teacher.update({
    where: { id: String(teacherId) },
    data: { isOnline, lastSeenAt: isOnline ? new Date() : undefined },
  });
  return NextResponse.json({ teacher: { id: teacher.id, isOnline: teacher.isOnline, present: isPresent(teacher) } });
}
