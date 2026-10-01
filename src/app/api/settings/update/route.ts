import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function PUT(req: Request) {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const price = Number(body.lessonPriceUsd);
  if (!Number.isFinite(price) || price < 1 || price > 1000) {
    return NextResponse.json({ error: 'invalid_price' }, { status: 400 });
  }
  const settings = await db.settings.update({
    where: { id: 'main' },
    data: { lessonPriceUsd: price },
  });
  return NextResponse.json({ settings });
}
