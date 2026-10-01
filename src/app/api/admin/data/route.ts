import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const teachers = await db.teacher.findMany({ include: { user: { select: { email: true } } }, orderBy: { name: 'asc' } });
  const bookings = await db.booking.findMany({ include: { teacher: true, payments: true }, orderBy: { createdAt: 'desc' } });
  const settings = await db.settings.findUnique({ where: { id: 'main' } });
  const revenue = bookings
    .flatMap((b) => b.payments)
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amountUsd, 0);
  return NextResponse.json({
    teachers: teachers.map((t) => ({
      id: t.id, name: t.name, nameAr: t.nameAr, email: t.user.email,
      isOnline: t.isOnline, lastSeenAt: t.lastSeenAt, tags: t.tags, bio: t.bio, whatsapp: t.whatsapp,
    })),
    bookings,
    settings,
    stats: { bookings: bookings.length, paid: bookings.filter((b) => b.status === 'PAID').length, revenue },
  });
}
