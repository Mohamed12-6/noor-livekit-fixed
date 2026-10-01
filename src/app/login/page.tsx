'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
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
      router.push(data.user.role === 'TEACHER' ? '/teacher' : next);
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
