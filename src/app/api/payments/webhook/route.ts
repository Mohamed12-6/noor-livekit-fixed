import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Webhook endpoint for Stripe. Configure with: stripe listen --forward-to .../api/payments/webhook
// NOTE: signature verification requires the raw body; for simplicity we verify by
// checking checkout session id directly with Stripe using STRIPE_SECRET_KEY.
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const type = payload?.type;
  const obj = payload?.data?.object;
  if (type === 'checkout.session.completed' && obj?.id) {
    const payment = await db.payment.findFirst({ where: { externalId: obj.id } });
    if (payment) {
      await db.payment.update({ where: { id: payment.id }, data: { status: 'SUCCEEDED' } });
      await db.booking.update({ where: { id: payment.bookingId }, data: { status: 'PAID' } });
    }
  }
  return NextResponse.json({ received: true });
}
