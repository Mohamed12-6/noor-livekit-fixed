import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simulated payment completion (only used when Stripe keys are not configured).
// For a real deployment this endpoint should be disabled.
export async function POST(req: Request) {
  const { paymentId } = await req.json().catch(() => ({}));
  if (!paymentId) return NextResponse.json({ error: 'missing_payment' }, { status: 400 });
  const payment = await db.payment.findUnique({ where: { id: String(paymentId) } });
  if (!payment) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await db.payment.update({ where: { id: payment.id }, data: { status: 'SUCCEEDED', provider: 'manual' } });
  await db.booking.update({ where: { id: payment.bookingId }, data: { status: 'PAID' } });
  return NextResponse.json({ ok: true });
}
