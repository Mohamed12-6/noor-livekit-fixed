import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Post or consume SDP signals for a call.
export async function POST(req: Request) {
  const { callId, fromRole, type, payload } = await req.json().catch(() => ({}));
  if (!callId || !fromRole || !type || payload === undefined) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const signal = await db.signalMessage.create({
    data: { callId: String(callId), fromRole, type: String(type), payload: typeof payload === 'string' ? payload : JSON.stringify(payload) },
  });
  return NextResponse.json({ signal });
}

// Poll: fetch & consume unread signals for the requesting side
export async function GET(req: Request) {
  const url = new URL(req.url);
  const callId = url.searchParams.get('callId');
  const forRole = url.searchParams.get('forRole');
  if (!callId || !forRole) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const signals = await db.signalMessage.findMany({
    where: { callId: String(callId), fromRole: { not: forRole }, consumed: false },
    orderBy: { createdAt: 'asc' },
  });
  await db.signalMessage.updateMany({ where: { id: { in: signals.map((s) => s.id) } }, data: { consumed: true } });
  return NextResponse.json({ signals });
}
