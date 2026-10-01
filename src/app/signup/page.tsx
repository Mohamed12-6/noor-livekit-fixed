'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// نفس منطق صفحة الدخول بالظبط — عشان الطالب يوصل لنفس المكان بعد التسجيل أو الدخول.
function homeFor(role: string) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  return '/teachers';
}

const messages: Record<string, string> = {
  invalid_name: 'الاسم قصير جداً (حرفين على الأقل).',
  invalid_email: 'صيغة البريد الإلكتروني غير صحيحة.',
  weak_password: 'كلمة المرور لازم 6 حروف أو أرقام على الأقل.',
  password_mismatch: 'كلمتا المرور غير متطابقتين.',
  email_taken: 'البريد ده مسجّل بالفعل — جرّب تسجيل الدخول.',
  missing_fields: 'من فضلك أكمل كل الحقول.',
  fallback: 'تعذر إنشاء الحساب، حاول مرة أخرى.',
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(messages[data.error] || messages.fallback);
        return;
      }
      // التسجيل بيعمل الجلسة بنفسه — نروح على طول على مكان الدور.
      router.push(homeFor(data.user?.role || 'STUDENT'));
      router.refresh();
    } catch {
      setError(messages.fallback);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap" dir="rtl">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-lockup" style={{ padding: 0 }}>
          <div className="brand-mark">ن</div>
          <div>
            <div className="brand-name" style={{ color: 'hsl(var(--foreground))' }}>Noor</div>
            <div className="brand-sub" style={{ color: 'hsl(var(--muted-foreground))' }}>Quran learning</div>
          </div>
        </div>

        <h1 className="page-title" style={{ fontSize: 22, marginTop: 18 }}>إنشاء حساب جديد</h1>
        <p className="page-subtitle" style={{ fontSize: 12 }}>دقيقة واحدة وتبدأ رحلتك في حفظ القرآن.</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <input className="input-field" placeholder="الاسم" value={form.name} onChange={set('name')} required minLength={2} maxLength={60} />
          <input className="input-field" dir="ltr" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input className="input-field" dir="ltr" type="password" placeholder="Password (6+)" value={form.password} onChange={set('password')} required minLength={6} />
          <input className="input-field" dir="ltr" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')} required minLength={6} />
          {error && <div style={{ color: 'hsl(var(--destructive))', fontSize: 12, fontWeight: 700 }}>{error}</div>}
          <button className="button-primary" type="submit" disabled={busy}>
            {busy ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
          </button>
        </div>

        <p style={{ fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          عندك حساب بالفعل؟{' '}
          <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 800 }}>سجّل الدخول</Link>
        </p>
      </form>
    </div>
  );
}
