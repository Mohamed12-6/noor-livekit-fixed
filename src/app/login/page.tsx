'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function homeFor(role: string) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  return '/teachers';
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'invalid_credentials' ? 'بريد أو كلمة مرور غير صحيحة' : 'تعذر تسجيل الدخول');
        return;
      }
      const home = homeFor(data.user.role);
      // استخدم next فقط لو هو داخل منطقة نفس الدور (وبداية بـ / مش //)
      const safeNext = next.startsWith('/') && !next.startsWith('//') && next.startsWith(home) ? next : home;
      router.push(safeNext);
      router.refresh();
    } catch {
      setError('تعذر تسجيل الدخول');
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

        <h1 className="page-title" style={{ fontSize: 22, marginTop: 18 }}>تسجيل الدخول</h1>
        <p className="page-subtitle" style={{ fontSize: 12 }}>للوصول إلى لوحة الإدارة أو لوحة المعلم.</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <input className="input-field" dir="ltr" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" dir="ltr" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div style={{ color: 'hsl(var(--destructive))', fontSize: 12, fontWeight: 700 }}>{error}</div>}
          <button className="button-primary" type="submit" disabled={busy}>
            {busy ? 'جارٍ الدخول…' : 'دخول'}
          </button>
        </div>

        <p style={{ fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          معندكش أكونت؟{' '}
          <Link href="/signup" style={{ color: 'hsl(var(--primary))', fontWeight: 800 }}>اعمل حساب جديد</Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-wrap" />}>
      <LoginForm />
    </Suspense>
  );
}
