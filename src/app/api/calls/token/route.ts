import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLiveKitToken, livekitConfigured } from '@/lib/livekit';

// Server-side access-token minting for a call room.
// Room = callId, two identities join: student + teacher (from their roles).
export async function POST(req: Request) {
  const { callId, role } = await req.json().catch(() => ({}));
  if (!callId || !['student', 'teacher'].includes(role)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const call = await db.call.findUnique({ where: { id: String(callId) } });
  if (!call) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!['ringing', 'accepted'].includes(call.status)) {
    return NextResponse.json({ error: 'call_not_active' }, { status: 409 });
  }
  if (!livekitConfigured()) {
    return NextResponse.json({ error: 'livekit_not_configured' }, { status: 503 });
  }
  const token = await createLiveKitToken(
    `${role}-${call.id}`,
    call.id,
    role === 'teacher' ? 'Teacher' : 'Student',
  );
  return NextResponse.json({
    provider: 'livekit',
    token,
    wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    room: call.id,
  });
}
