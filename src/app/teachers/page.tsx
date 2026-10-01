'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Phone, PhoneCall, Video, Wallet } from 'lucide-react';
import { NoorShell } from '@/components/noor-shell';
import { CallOverlay, type CallTeacher } from '@/components/call-overlay';
import { ChatPanel } from '@/components/chat-panel';
import { useUi } from '@/components/ui-context';

type TeacherApi = {
  id: string; name: string; nameAr: string; bio: string; tags: string[]; initials: string;
  email: string; whatsapp: string; online: boolean; lastSeenAt: string;
};

export default function TeachersPage() {
  const { language, notify } = useUi();
  const [teachers, setTeachers] = useState<TeacherApi[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [call, setCall] = useState<{ teacher: CallTeacher; callId: string } | null>(null);
  const [booking, setBooking] = useState<TeacherApi | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const [chatTeacher, setChatTeacher] = useState<TeacherApi | null>(null);
  const [form, setForm] = useState({ studentName: '', studentEmail: '', scheduledAt: '' });
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/teachers', { cache: 'no-store' });
      const data = await res.json();
      setTeachers(data.teachers || []);
      setPrice(data.lessonPriceUsd);
    } catch { /* retry on next tick */ }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = window.setInterval(load, 15000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [load]);

  const startCall = async (teacher: TeacherApi) => {
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(language === 'ar' ? 'المعلم غير متصل الآن.' : 'Teacher is not online right now.');
        return;
      }
      setCall({ teacher, callId: data.call.id });
    } catch {
      notify(language === 'ar' ? 'تعذر بدء المكالمة.' : 'Could not start the call.');
    }
  };

  const submitBooking = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: booking.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      const payRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data.booking.id }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error();
      notify(language === 'ar' ? 'تم إنشاء الحجز، جارٍ تحويلك للدفع…' : 'Booking created — redirecting to payment…');
      window.location.href = payData.checkoutUrl;
    } catch {
      notify(language === 'ar' ? 'تعذر إتمام الحجز. حاول مرة أخرى.' : 'Booking failed. Please try again.');
    } finally {
      setBusy(false);
      setBooking(null);
    }
  };

  return (
    <NoorShell active="/teachers">
      <div className="fade-up">
        <div className="page-header">
          <div>
            <div className="eyebrow">04 · {language === 'ar' ? 'المعلمون' : 'Teachers'}</div>
            <h1 className="page-title">{language === 'ar' ? 'وجوهٌ ترافق رحلتك' : 'Teachers who walk beside you'}</h1>
            <p className="page-subtitle">
              {language === 'ar'
                ? 'التعلم أدفأ حين تجد معلماً يصبر، يسمع، ويعرف متى يشجعك.'
                : 'Learning feels warmer with a teacher who listens, waits, and knows when to encourage.'}
            </p>
          </div>
          {price !== null && (
            <div className="page-header-actions">
              <span className="pill-online on"><Wallet size={12} /> {language === 'ar' ? `سعر الحصة: $${price}` : `Lesson price: $${price}`}</span>
            </div>
          )}
        </div>
        <div className="teacher-grid">
          {teachers.map((teacher) => (
            <article className="card teacher-card" key={teacher.id}>
              <div className="teacher-portrait">{teacher.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div className="teacher-name">{language === 'ar' ? teacher.nameAr : teacher.name}</div>
                  <span className={`pill-online ${teacher.online ? 'on' : 'off'}`}>
                    <span className={`status-dot ${teacher.online ? 'green' : 'gray'}`} style={{ margin: 0 }} />
                    {teacher.online ? (language === 'ar' ? 'متصل الآن' : 'Online') : (language === 'ar' ? 'غير متصل' : 'Offline')}
                  </span>
                </div>
                <div className="teacher-name-ar">{language === 'ar' ? teacher.name : teacher.nameAr}</div>
                <div className="teacher-bio">{teacher.bio}</div>
                <div className="teacher-tags">
                  {teacher.tags.map((tag) => (
                    <span className="mini-tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <button className="button-primary" disabled={!teacher.online} onClick={() => startCall(teacher)}>
                    <Video size={14} /> {language === 'ar' ? 'مكالمة فيديو' : 'Video call'}
                  </button>
                  <button className="button-soft" onClick={() => setChatTeacher(teacher)}>
                    <MessageCircle size={14} /> {language === 'ar' ? 'شات' : 'Chat'}
                  </button>
                  <div className="contact-wrap">
                    <button
                      className="button-primary contact-btn"
                      disabled={!teacher.online || !teacher.whatsapp}
                      onClick={() => setContact(contact === teacher.id ? null : teacher.id)}
                      aria-expanded={contact === teacher.id}
                      aria-haspopup="menu"
                      title={!teacher.whatsapp ? (language === 'ar' ? 'رقم التواصل غير متاح بعد' : 'No contact number yet') : undefined}
                    >
                      <Phone size={14} /> {language === 'ar' ? 'تواصل' : 'Contact'}
                    </button>
                    {contact === teacher.id && teacher.whatsapp && (
                      <div className="contact-menu" role="menu">
                        <a
                          className="contact-item"
                          role="menuitem"
                          href={`https://wa.me/${teacher.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setContact(null)}
                        >
                          <MessageCircle size={15} />
                          <span>{language === 'ar' ? 'محادثة واتساب' : 'WhatsApp chat'}</span>
                        </a>
                        <a className="contact-item" role="menuitem" href={`tel:+${teacher.whatsapp}`} onClick={() => setContact(null)}>
                          <Phone size={15} />
                          <span>{language === 'ar' ? 'مكالمة هاتفية' : 'Phone call'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                  <button className="button-soft" onClick={() => setBooking(teacher)}>
                    <PhoneCall size={14} /> {language === 'ar' ? 'احجز حصة' : 'Book a lesson'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {teachers.length === 0 && (
          <div className="card empty-state">{language === 'ar' ? 'لا يوجد معلمون بعد.' : 'No teachers yet.'}</div>
        )}
        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'رسالة من معلميك' : 'A note from your teachers'}</div>
          </div>
        </div>
        <article className="card quote-card">
          <div className="quote-mark">“</div>
          <div className="quote-text">
            {language === 'ar' ? 'لا تستعجل الثمرة. كل مرة تقرأ فيها، أنت تزرع نوراً.' : 'Do not rush the fruit. Every time you read, you are planting light.'}
          </div>
          <div className="quote-source">Mustafa Hamdy · {language === 'ar' ? 'إلى كل متعلم' : 'for every learner'}</div>
        </article>
      </div>

      {call && (
        <CallOverlay
          role="student"
          teacher={call.teacher}
          callId={call.callId}
          onEnd={() => setCall(null)}
        />
      )}

      {booking && (
        <div className="call-overlay" style={{ justifyContent: 'center' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="login-card">
            <div className="eyebrow">{language === 'ar' ? 'حجز حصة' : 'Book a lesson'}</div>
            <div className="call-name" style={{ marginTop: 6 }}>
              {language === 'ar' ? booking.nameAr : booking.name} · ${price}
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              <input className="input-field" placeholder={language === 'ar' ? 'اسمك' : 'Your name'} value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
              <input className="input-field" type="email" placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'} value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} />
              <input className="input-field" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              <button className="button-primary" disabled={busy || !form.studentName || !form.studentEmail || !form.scheduledAt} onClick={submitBooking}>
                <Phone size={14} /> {busy ? (language === 'ar' ? 'جارٍ المعالجة…' : 'Processing…') : language === 'ar' ? 'متابعة الدفع' : 'Continue to payment'}
              </button>
              <button className="button-soft" onClick={() => setBooking(null)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {chatTeacher && (
        <ChatPanel
          role="student"
          teacherId={chatTeacher.id}
          teacherName={language === 'ar' ? chatTeacher.nameAr : chatTeacher.name}
          onClose={() => setChatTeacher(null)}
        />
      )}
    </NoorShell>
  );
}
