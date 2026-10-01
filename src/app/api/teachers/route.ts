import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSettings, isPresent } from '@/lib/settings';

export async function GET() {
  const settings = await getSettings();
  const teachers = await db.teacher.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({
    lessonPriceUsd: settings.lessonPriceUsd,
    currency: settings.currency,
    teachers: teachers.map((t) => ({
      id: t.id,
      name: t.name,
      nameAr: t.nameAr,
      bio: t.bio,
      tags: t.tags.split(',').filter(Boolean),
      initials: t.initials,
      whatsapp: t.whatsapp,
      email: t.user.email,
      online: isPresent(t),
      lastSeenAt: t.lastSeenAt,
    })),
  });
}
