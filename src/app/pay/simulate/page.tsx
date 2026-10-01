'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ShieldCheck } from 'lucide-react';

function SimulateContent() {
  const params = useSearchParams();
  const paymentId = params.get('payment');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // prefill nothing; user confirms manually
  }, []);

  const pay = async () => {
    setBusy(true);
    try {
      await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap" dir="rtl">
      <div className="login-card">
        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={13} /> بوابة دفع تجريبية
        </div>
        <h1 className="page-title" style={{ fontSize: 22, marginTop: 12 }}>
          {done ? 'تم الدفع بنجاح ✓' : 'تأكيد الدفع (وضع المحاكاة)'}
        </h1>
        <p className="page-subtitle" style={{ fontSize: 12 }}>
          {done
            ? 'شكراً لك! تم تأكيد حجزك، وسيظهر في لوحة الأدمن فوراً.'
            : 'لا توجد مفاتيح Stripe مضبوطة حالياً، لذا هذه بوابة محاكاة لتجربة المسار كاملاً. أضف STRIPE_SECRET_KEY في ملف .env لتشغيل الدفع الحقيقي عبر Stripe Checkout.'}
        </p>
        {done ? (
          <button className="button-primary" style={{ marginTop: 18 }} onClick={() => (window.location.href = '/teachers')}>
            <Check size={13} /> العودة إلى المعلمين
          </button>
        ) : (
          <button className="button-primary" style={{ marginTop: 18 }} onClick={pay} disabled={busy || !paymentId}>
            {busy ? 'جارٍ التنفيذ…' : 'ادفع الآن (محاكاة)'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="login-wrap" />}>
      <SimulateContent />
    </Suspense>
  );
}
