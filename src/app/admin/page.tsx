'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, DollarSign, LogOut, RefreshCcw, Users, CalendarCheck, Wifi, WifiOff } from 'lucide-react';

type AdminData = {
  teachers: { id: string; name: string; nameAr: string; email: string; whatsapp: string; isOnline: boolean; lastSeenAt: string; tags: string; bio: string }[];
  bookings: { id: string; studentName: string; studentEmail: string; scheduledAt: string; priceUsd: number; status: string; teacher: { name: string }; payments: { status: string; provider: string }[] }[];
  settings: { lessonPriceUsd: number; currency: string };
  stats: { bookings: number; paid: number; revenue: number };
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [waDraft, setWaDraft] = useState<Record<string, string>>({});
  const [waMsg, setWaMsg] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data', { cache: 'no-store' });
      if (res.status === 403) {
        window.location.href = '/login?next=/admin';
        return;
      }
      const d = await res.json();
      setData(d);
      setPrice(String(d.settings?.lessonPriceUsd ?? 15));
      setWaDraft((prev) => {
        const next = { ...prev };
        for (const t of d.teachers || []) if (!(t.id in next)) next[t.id] = t.whatsapp || '';
        return next;
      });
    } catch { /* retry */ }
  }, []);

  useEffect(() => {
    load();
    const iv = window.setInterval(load, 10000);
    return () => window.clearInterval(iv);
  }, [load]);

  const savePrice = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/settings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPriceUsd: Number(price) }),
      });
      if (!res.ok) {
        setMsg('سعر غير صالح (من 1 إلى 1000)');
        return;
      }
      setMsg('تم حفظ السعر ✓');
      load();
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 2500);
    }
  };

  const toggleOnline = async (teacherId: string, isOnline: boolean) => {
    await fetch('/api/admin/teachers/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, isOnline }),
    });
    load();
  };

  const saveWhatsapp = async (teacherId: string) => {
    try {
      const res = await fetch('/api/admin/teachers/whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, whatsapp: waDraft[teacherId] || '' }),
      });
      if (!res.ok) {
        setWaMsg((m) => ({ ...m, [teacherId]: 'رقم غير صالح' }));
      } else {
        setWaMsg((m) => ({ ...m, [teacherId]: 'تم الحفظ ✓' }));
        load();
      }
    } catch {
      setWaMsg((m) => ({ ...m, [teacherId]: 'تعذر الحفظ' }));
    } finally {
      setTimeout(() => setWaMsg((m) => ({ ...m, [teacherId]: '' })), 2500);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const statusBadge = (status: string) => {
    if (status === 'PAID' || status === 'CONFIRMED') return <span className="badge paid">{status}</span>;
    if (status === 'CANCELLED') return <span className="badge cancelled">{status}</span>;
    return <span className="badge pending">{status}</span>;
  };

  return (
    <div className="admin-wrap" dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="eyebrow">NOOR · لوحة التحكم</div>
          <h1 className="page-title" style={{ fontSize: 30 }}>صفحة الأدمن</h1>
        </div>
        <button className="button-soft" onClick={logout}>
          <LogOut size={13} /> خروج
        </button>
      </div>

      <div className="admin-grid">
        <div className="card stat-card">
          <div className="eyebrow"><Users size={11} /> المعلمون</div>
          <div className="stat-number">{data?.teachers.length ?? '—'}</div>
          <div className="stats-caption">{data?.teachers.filter((t) => t.isOnline).length ?? 0} متصل الآن</div>
        </div>
        <div className="card stat-card">
          <div className="eyebrow"><CalendarCheck size={11} /> الحجوزات</div>
          <div className="stat-number">{data?.stats.bookings ?? '—'}</div>
          <div className="stats-caption">{data?.stats.paid ?? 0} مدفوعة</div>
        </div>
        <div className="card stat-card">
          <div className="eyebrow"><DollarSign size={11} /> الإيرادات</div>
          <div className="stat-number">${(data?.stats.revenue ?? 0).toFixed(2)}</div>
          <div className="stats-caption">إجمالي المدفوعات الناجحة</div>
        </div>
      </div>

      <div className="card setting-panel" style={{ marginBottom: 18 }}>
        <div className="eyebrow">سعر الحصة (USD)</div>
        <div className="setting-row">
          <div>
            <div className="setting-title">السعر الحالي: ${data?.settings?.lessonPriceUsd ?? '—'}</div>
            <div className="setting-note">يتغير السعر في صفحة الحجز فوراً بعد الحفظ.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input-field" dir="ltr" style={{ width: 110 }} type="number" min="1" max="1000" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button className="button-primary" onClick={savePrice} disabled={saving}>
              {saving ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
            {msg && <span style={{ fontSize: 11, fontWeight: 700 }}>{msg}</span>}
          </div>
        </div>
      </div>

      <div className="card setting-panel" style={{ marginBottom: 18 }}>
        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          المعلمون وحالة الاتصال
          <button className="icon-button" style={{ width: 26, height: 26 }} onClick={load} aria-label="Refresh">
            <RefreshCcw size={12} />
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>المعلم</th>
              <th>البريد</th>
              <th>الحالة</th>
              <th>رقم الواتساب (تواصل)</th>
              <th>آخر ظهور</th>
              <th>تشغيل / إيقاف</th>
            </tr>
          </thead>
          <tbody>
            {(data?.teachers ?? []).map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 700 }}>{t.nameAr || t.name}</td>
                <td dir="ltr" style={{ textAlign: 'right' }}>{t.email}</td>
                <td>
                  <span className={`pill-online ${t.isOnline ? 'on' : 'off'}`}>
                    {t.isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                    {t.isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </td>
                <td className="wa-cell">
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      className="input-field wa-input"
                      dir="ltr"
                      inputMode="tel"
                      placeholder="2010xxxxxxxx"
                      value={waDraft[t.id] ?? ''}
                      onChange={(e) => setWaDraft((m) => ({ ...m, [t.id]: e.target.value }))}
                    />
                    <button className="button-soft" onClick={() => saveWhatsapp(t.id)}>
                      <Check size={12} /> حفظ
                    </button>
                    {waMsg[t.id] && <span style={{ fontSize: 10, fontWeight: 700 }}>{waMsg[t.id]}</span>}
                  </div>
                  <div style={{ fontSize: 9, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
                    مثال: 01014546662 أو 201014546662
                  </div>
                </td>
                <td dir="ltr" style={{ textAlign: 'right', fontSize: 10 }}>
                  {new Date(t.lastSeenAt).toLocaleString('en-GB', { hour12: false })}
                </td>
                <td>
                  <button className={`button-soft ${t.isOnline ? '' : 'active-elevate-2'}`} onClick={() => toggleOnline(t.id, !t.isOnline)}>
                    {t.isOnline ? 'إيقاف الاتصال' : 'تشغيل الاتصال'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card setting-panel">
        <div className="eyebrow">الحجوزات والمدفوعات</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>الطالب</th>
              <th>المعلم</th>
              <th>الموعد</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>الدفع</th>
            </tr>
          </thead>
          <tbody>
            {(data?.bookings ?? []).map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 700 }}>{b.studentName}<br /><span dir="ltr" style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }}>{b.studentEmail}</span></td>
                <td>{b.teacher?.name}</td>
                <td dir="ltr" style={{ textAlign: 'right', fontSize: 10 }}>{new Date(b.scheduledAt).toLocaleString('en-GB', { hour12: false })}</td>
                <td dir="ltr" style={{ textAlign: 'right' }}>${b.priceUsd}</td>
                <td>{statusBadge(b.status)}</td>
                <td style={{ fontSize: 10 }}>{b.payments?.[0]?.provider ?? '—'} / {b.payments?.[0]?.status ?? '—'}</td>
              </tr>
            ))}
            {(data?.bookings ?? []).length === 0 && (
              <tr><td colSpan={6} className="empty-state">لا توجد حجوزات بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
