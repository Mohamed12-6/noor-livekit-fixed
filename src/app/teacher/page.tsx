'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { CallOverlay, type CallTeacher } from '@/components/call-overlay';
import { ChatPanel } from '@/components/chat-panel';
import { useUi } from '@/components/ui-context';

type CallApi = { id: string; teacherId: string; status: string; createdAt: string };

export default function TeacherPage() {
  const { language } = useUi();
  const [online, setOnline] = useState(false);
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('م');
  const [call, setCall] = useState<CallApi | null>(null);
  const heartbeat = useRef<number | null>(null);
  const onlineRef = useRef(false);
  const [inboxChats, setInboxChats] = useState<{ id: string; studentName: string; unread: number; updatedAt: string; lastMessage: { body: string; fromRole: string } | null }[]>([]);
  const [openChat, setOpenChat] = useState<{ id: string; studentName: string } | null>(null);
  const inbox = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== 'TEACHER') {
          window.location.href = '/login?next=/teacher';
        }
      });
  }, []);

  const sendPresence = useCallback(async (isOnline: boolean) => {
    const res = await fetch('/api/teachers/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline }),
    });
    if (res.status === 401) {
      window.location.href = '/login?next=/teacher';
      return;
    }
    const data = await res.json();
    if (data.teacher) {
      setOnline(data.teacher.isOnline);
      onlineRef.current = data.teacher.isOnline;
      setName(data.teacher.name);
      setInitials(data.teacher.initials || 'م');
    }
  }, []);

  useEffect(() => {
    sendPresence(true);
    heartbeat.current = window.setInterval(() => sendPresence(onlineRef.current), 30000);
    return () => {
      if (heartbeat.current) window.clearInterval(heartbeat.current);
      // Best-effort offline ping on leave
      navigator.sendBeacon?.('/api/teachers/presence', new Blob([JSON.stringify({ isOnline: false })], { type: 'application/json' }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for incoming calls
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/calls', { cache: 'no-store' });
        const data = await res.json();
        if (data.call && data.call.status === 'ringing' && (!call || call.id !== data.call.id)) {
          setCall(data.call);
        }
      } catch { /* ignore */ }
    };
    check();
    inbox.current = window.setInterval(check, 2000);
    return () => {
      if (inbox.current) window.clearInterval(inbox.current);
    };
  }, [call]);

  // Poll the teacher's chat inbox
  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/chats', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.chats)) setInboxChats(data.chats);
      } catch { /* ignore */ }
    };
    tick();
    const iv = window.setInterval(tick, 4000);
    return () => window.clearInterval(iv);
  }, []);

  const logout = async () => {
    await sendPresence(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="admin-wrap" dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="eyebrow">NOOR · لوحة المعلم</div>
          <h1 className="page-title" style={{ fontSize: 30 }}>مرحباً، {name || '…'}</h1>
        </div>
        <button className="button-soft" onClick={logout}>
          <LogOut size={13} /> خروج
        </button>
      </div>

      <div className="card setting-panel" style={{ marginTop: 20 }}>
        <div className="eyebrow">حالة الاتصال</div>
        <div className="setting-row">
          <div>
            <div className="setting-title">{online ? 'أنت متصل الآن — الطلاب يرون زر المكالمة' : 'أنت غير متصل'}</div>
            <div className="setting-note">
              {online
                ? language === 'ar' ? 'سيصلك رنين المكالمات هنا تلقائياً.' : 'Incoming call rings will appear here automatically.'
                : language === 'ar' ? 'شغّل الاتصال لتتمكن من استقبال المكالمات.' : 'Turn on presence to receive calls.'}
            </div>
          </div>
          <button
            className={`button-primary ${online ? '' : ''}`}
            style={online ? { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' } : {}}
            onClick={() => sendPresence(!online)}
          >
            {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            {online ? 'الانتقال لغير متصل' : 'أنا متصل الآن'}
          </button>
        </div>
      </div>

      <div className="card setting-panel" style={{ marginTop: 16 }}>
        <div className="eyebrow">كيف تعمل المكالمات؟</div>
        <p className="page-subtitle" style={{ fontSize: 12 }}>
          عندما يضغط طالب على «مكالمة فيديو» في صفحة المعلمين، سيظهر لك رنين هنا. اضغط زر القبول الأخضر لبدء
          مكالمة فيديو مباشرة (WebRTC) مثل مكالمات واتساب. يمكنك كتم الميكروفون أو إنهاء المكالمة في أي وقت.
        </p>
      </div>

      <div className="card setting-panel" style={{ marginTop: 16 }}>
        <div className="eyebrow">الرسائل النصية</div>
        {inboxChats.length === 0 ? (
          <div className="setting-note">لا توجد رسائل بعد — لما يفتح طالب الشات معاك هتظهر هنا.</div>
        ) : (
          <div style={{ marginTop: 10 }}>
            {inboxChats.map((c) => (
              <div key={c.id} className="chat-list-item" onClick={() => setOpenChat({ id: c.id, studentName: c.studentName })}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{c.studentName || 'طالب'}</div>
                  <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{c.lastMessage?.body || '—'}</div>
                </div>
                {c.unread > 0 ? <span className="chat-badge">{c.unread}</span> : <MessageCircle size={15} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {openChat && (
        <ChatPanel role="teacher" chatId={openChat.id} studentName={openChat.studentName} onClose={() => setOpenChat(null)} />
      )}

      {call && (
        <CallOverlay
          role="teacher"
          teacher={{ id: call.teacherId, name, nameAr: name, initials }}
          callId={call.id}
          onEnd={() => setCall(null)}
        />
      )}
    </div>
  );
}
