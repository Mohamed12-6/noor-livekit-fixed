import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Create a payment for a booking.
// - If STRIPE_SECRET_KEY is set: create a real Stripe Checkout Session (test or live keys — user's choice).
// - Otherwise: fall back to a clearly-labeled simulated checkout so the flow is testable end-to-end.
export async function POST(req: Request) {
  const { bookingId } = await req.json().catch(() => ({}));
  if (!bookingId) return NextResponse.json({ error: 'missing_booking' }, { status: 400 });
  const booking = await db.booking.findUnique({ where: { id: String(bookingId) } });
  if (!booking) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (booking.status === 'PAID') return NextResponse.json({ error: 'already_paid' }, { status: 400 });

  const payment = await db.payment.create({
    data: { bookingId: booking.id, provider: 'stripe', amountUsd: booking.priceUsd, status: 'PENDING' },
  });

  const key = process.env.STRIPE_SECRET_KEY;
  if (key) {
    try {
      const params = new URLSearchParams();
      params.set('mode', 'payment');
      params.set('success_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/success?booking=${booking.id}`);
      params.set('cancel_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/teachers?canceled=1`);
      params.set('line_items[0][quantity]', '1');
      params.set('line_items[0][price_data][currency]', 'usd');
      params.set('line_items[0][price_data][unit_amount]', String(Math.round(booking.priceUsd * 100)));
      params.set('line_items[0][price_data][product_data][name]', `Noor Quran Lesson — ${booking.teacherId === undefined ? '' : ''}حصة قرآن`);
      params.set('client_reference_id', booking.id);
      params.set('metadata[paymentId]', payment.id);
      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (!res.ok) throw new Error(session?.error?.message || 'stripe_error');
      await db.payment.update({ where: { id: payment.id }, data: { externalId: session.id } });
      return NextResponse.json({ mode: 'stripe', checkoutUrl: session.url, paymentId: payment.id });
    } catch (e) {
      return NextResponse.json({ error: 'stripe_error', detail: String(e) }, { status: 502 });
    }
  }

  // Simulated checkout (no keys configured) — clearly labeled
  return NextResponse.json({ mode: 'simulated', checkoutUrl: `/pay/simulate?payment=${payment.id}`, paymentId: payment.id });
}
