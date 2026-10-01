import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTeacherUser } from '@/lib/auth';

// Teacher heartbeat: toggle + keep-alive
export async function POST(req: Request) {
  const session = await getTeacherUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const data: { isOnline?: boolean; lastSeenAt?: Date } = { lastSeenAt: new Date() };
  if (typeof body.isOnline === 'boolean') data.isOnline = body.isOnline;
  const teacher = await db.teacher.update({ where: { id: session.teacher.id }, data });
  return NextResponse.json({ teacher: { id: teacher.id, isOnline: teacher.isOnline, lastSeenAt: teacher.lastSeenAt } });
}

export async function GET() {
  const session = await getTeacherUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const teacher = await db.teacher.findUnique({ where: { id: session.teacher.id } });
  return NextResponse.json({ teacher });
}
