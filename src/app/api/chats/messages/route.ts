import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Read / write messages inside a chat.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');
  const forRole = url.searchParams.get('forRole'); // student | teacher — who is reading
  if (!chatId) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  const chat = await db.chat.findUnique({ where: { id: String(chatId) } });
  if (!chat) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const messages = await db.chatMessage.findMany({
    where: { chatId: String(chatId) },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  // Mark the other side's messages as read by the current reader
  if (forRole === 'student' || forRole === 'teacher') {
    const fromOther = forRole === 'student' ? 'teacher' : 'student';
    await db.chatMessage.updateMany({
      where: { chatId: String(chatId), fromRole: fromOther, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ chat, messages });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const chatId = String(body.chatId || '');
  const fromRole = String(body.fromRole || '');
  const text = String(body.body || '').trim().slice(0, 2000);
  if (!chatId || !['student', 'teacher'].includes(fromRole) || !text) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const chat = await db.chat.findUnique({ where: { id: chatId } });
  if (!chat) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const message = await db.chatMessage.create({ data: { chatId, fromRole, body: text } });
  await db.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
  return NextResponse.json({ message });
}
