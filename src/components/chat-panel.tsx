'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useUi } from './ui-context';

type Message = { id: string; fromRole: string; body: string; createdAt: string };

function getStudentKey(): string {
  if (typeof window === 'undefined') return '';
  let key = window.localStorage.getItem('noor-student-key');
  if (!key) {
    key = `sk_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem('noor-student-key', key);
  }
  return key;
}

// Text chat panel — works as a fixed overlay on both the student page and the teacher dashboard.
export function ChatPanel({
  role,
  teacherId,
  teacherName,
  chatId,
  studentName,
  onClose,
}: {
  role: 'student' | 'teacher';
  teacherId?: string;
  teacherName?: string;
  chatId?: string;
  studentName?: string;
  onClose: () => void;
}) {
  const { language } = useUi();
  const [activeChatId, setActiveChatId] = useState<string>(chatId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);

  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  // Student: find or create their chat with this teacher once
  useEffect(() => {
    if (role !== 'student' || activeChatId || !teacherId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId, studentKey: getStudentKey(), studentName: studentName || '' }),
        });
        const data = await res.json();
        if (!cancelled && data.chat) {
          setActiveChatId(data.chat.id);
          setStatus('ready');
        } else if (!cancelled) {
          setStatus('error');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [role, activeChatId, teacherId, studentName]);

  const load = useCallback(async () => {
    if (!activeChatId) return;
    try {
      const res = await fetch(`/api/chats/messages?chatId=${activeChatId}&forRole=${role}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.messages)) setMessages(data.messages);
      setStatus('ready');
    } catch { /* retry on next tick */ }
  }, [activeChatId, role]);

  useEffect(() => {
    if (!activeChatId) return;
    load();
    pollRef.current = window.setInterval(load, 2000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [activeChatId, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeChatId) return;
    setDraft('');
    // optimistic
    const optimistic: Message = { id: `tmp-${Date.now()}`, fromRole: role, body: text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChatId, fromRole: role, body: text }),
      });
      load();
    } catch { /* message stays optimistic; next poll reconciles */ }
  };

  const title = role === 'student' ? (teacherName || t('Teacher', 'المعلم')) : (studentName || t('Student', 'الطالب'));

  return (
    <div className="chat-overlay" dir={language === 'ar' ? 'rtl' : 'ltr'} role="dialog" aria-label="Chat">
      <div className="chat-panel card">
        <div className="chat-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span className="chat-head-icon"><MessageCircle size={16} /></span>
            <div>
              <div className="chat-head-title">{title}</div>
              <div className="chat-head-sub">{t('Text chat', 'محادثة نصية')}</div>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label={t('Close', 'إغلاق')}><X size={16} /></button>
        </div>

        <div className="chat-body">
          {status === 'error' && (
            <div className="chat-empty">{t('Could not open the chat. Try again.', 'تعذر فتح المحادثة. حاول مرة أخرى.')}</div>
          )}
          {status !== 'error' && messages.length === 0 && (
            <div className="chat-empty">{t('No messages yet — say salam 👋', 'لا توجد رسائل بعد — ابدأ بالسلام 👋')}</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.fromRole === role ? 'mine' : 'theirs'}`}>
              <div className="chat-text">{m.body}</div>
              <div className="chat-time">
                {new Date(m.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="chat-input-row"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            className="input-field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('Write a message…', 'اكتب رسالة…')}
            aria-label={t('Message', 'الرسالة')}
          />
          <button className="button-primary" type="submit" disabled={!draft.trim() || !activeChatId} aria-label={t('Send', 'إرسال')}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
