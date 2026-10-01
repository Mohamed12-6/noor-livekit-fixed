import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTeacherUser } from '@/lib/auth';

// Simple DB-backed signaling + call lifecycle.
// Student initiates a call to a teacher; teacher polls for incoming calls.
export async function POST(req: Request) {
  const { teacherId } = await req.json().catch(() => ({}));
  if (!teacherId) return NextResponse.json({ error: 'missing_teacher' }, { status: 400 });
  const teacher = await db.teacher.findUnique({ where: { id: String(teacherId) } });
  if (!teacher) return NextResponse.json({ error: 'teacher_not_found' }, { status: 404 });
  if (!teacher.isOnline) return NextResponse.json({ error: 'teacher_offline' }, { status: 409 });
  // End any stale ringing calls from this teacher
  await db.call.updateMany({ where: { teacherId: teacher.id, status: 'ringing' }, data: { status: 'ended', endedAt: new Date() } });
  const call = await db.call.create({ data: { teacherId: teacher.id, status: 'ringing' } });
  return NextResponse.json({ call });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (id) {
    const call = await db.call.findUnique({ where: { id }, include: { signals: { orderBy: { createdAt: 'asc' } } } });
    if (!call) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ call });
  }
  // Teacher inbox: only THIS teacher's ringing call (never another teacher's).
  const session = await getTeacherUser();
  if (!session) return NextResponse.json({ call: null });
  const call = await db.call.findFirst({
    where: { status: 'ringing', teacherId: session.teacher.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ call });
}

// status update: accepted | declined | ended
export async function PUT(req: Request) {
  const { callId, status } = await req.json().catch(() => ({}));
  if (!callId || !['accepted', 'declined', 'ended'].includes(status)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const call = await db.call.update({
    where: { id: String(callId) },
    data: {
      status,
      updatedAt: new Date(),
      ...(status === 'accepted' ? { startedAt: new Date() } : {}),
      ...(status === 'ended' || status === 'declined' ? { endedAt: new Date() } : {}),
    },
  });
  if (status === 'ended' || status === 'declined') {
    await db.signalMessage.create({ data: { callId: call.id, fromRole: 'system', type: 'bye', payload: '{}' } });
  }
  return NextResponse.json({ call });
}
