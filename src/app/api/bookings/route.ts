import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

// Student creates a booking; price always read from DB settings
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { teacherId, studentName, studentEmail, scheduledAt } = body || {};
  if (!teacherId || !studentName || !studentEmail || !scheduledAt) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  const teacher = await db.teacher.findUnique({ where: { id: String(teacherId) } });
  if (!teacher) return NextResponse.json({ error: 'teacher_not_found' }, { status: 404 });
  const settings = await getSettings();
  const booking = await db.booking.create({
    data: {
      teacherId: teacher.id,
      studentName: String(studentName),
      studentEmail: String(studentEmail).toLowerCase().trim(),
      scheduledAt: String(scheduledAt),
      priceUsd: settings.lessonPriceUsd,
    },
  });
  return NextResponse.json({ booking });
}

export async function GET() {
  const bookings = await db.booking.findMany({ include: { teacher: true, payments: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ bookings });
}
