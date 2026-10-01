import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// Admin-only: set/update the WhatsApp (chat + call) number for any teacher.
// Accepts local Egyptian numbers (010xxxxxxxx) or international (2010xxxxxxxx) and
// normalises them to the international digits-only form used by wa.me / tel: links.
export function normalizeWhatsapp(input: string): string {
  let digits = String(input || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  // bare 10xxxxxxxx (Egyptian mobile without leading 0)
  if (/^1\d{9}$/.test(digits)) return `20${digits}`;
  return digits;
}

export async function PUT(req: Request) {
  const admin = await requireRole('ADMIN');
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const teacherId = String(body.teacherId || '');
  if (!teacherId) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  const whatsapp = normalizeWhatsapp(body.whatsapp);
  if (whatsapp && !/^\d{8,15}$/.test(whatsapp)) {
    return NextResponse.json({ error: 'invalid_whatsapp' }, { status: 400 });
  }

  const teacher = await db.teacher.update({
    where: { id: teacherId },
    data: { whatsapp },
  });
  return NextResponse.json({ teacher: { id: teacher.id, whatsapp: teacher.whatsapp } });
}
