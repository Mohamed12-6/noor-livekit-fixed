import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTeacherUser } from '@/lib/auth';

// Text chat between a student and a teacher.
// - Student side is keyed by a random studentKey kept in the browser (no login needed).
// - Teacher side is resolved from the signed-in teacher session.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const teacherId = String(body.teacherId || '');
  const studentKey = String(body.studentKey || '');
  const studentName = String(body.studentName || '').slice(0, 60);
  if (!teacherId || !studentKey) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return NextResponse.json({ error: 'teacher_not_found' }, { status: 404 });

  const chat = await db.chat.upsert({
    where: { teacherId_studentKey: { teacherId, studentKey } },
    update: studentName ? { studentName } : {},
    create: { teacherId, studentKey, studentName },
  });
  return NextResponse.json({ chat });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  // A single chat + its messages (used by both sides)
  if (chatId) {
    const chat = await db.chat.findUnique({ where: { id: String(chatId) } });
    if (!chat) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ chat });
  }

  // Teacher inbox: every chat addressed to the signed-in teacher, with last message + unread count
  const session = await getTeacherUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const chats = await db.chat.findMany({
    where: { teacherId: session.teacher.id },
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  const inbox = await Promise.all(
    chats.map(async (c) => {
      const unread = await db.chatMessage.count({
        where: { chatId: c.id, fromRole: 'student', readAt: null },
      });
      const last = c.messages[0];
      return {
        id: c.id,
        studentName: c.studentName,
        updatedAt: c.updatedAt,
        unread,
        lastMessage: last ? { body: last.body, fromRole: last.fromRole, createdAt: last.createdAt } : null,
      };
    }),
  );
  return NextResponse.json({ chats: inbox });
}
