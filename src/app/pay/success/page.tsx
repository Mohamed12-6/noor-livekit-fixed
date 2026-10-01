'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';

function SuccessContent() {
  const params = useSearchParams();
  const booking = params.get('booking');
  return (
    <div className="login-wrap" dir="rtl">
      <div className="login-card">
        <div className="eyebrow">NOOR · الدفع</div>
        <h1 className="page-title" style={{ fontSize: 22, marginTop: 12 }}>تم استلام الدفعة ✓</h1>
        <p className="page-subtitle" style={{ fontSize: 12 }}>
          شكراً لك! تم تأكيد دفعتك{booking ? ` (الحجز: ${booking.slice(0, 8)}…)` : ''}. سيظهر الحجز كـ«مدفوع» في لوحة الأدمن.
        </p>
        <button className="button-primary" style={{ marginTop: 18 }} onClick={() => (window.location.href = '/teachers')}>
          <Check size={13} /> العودة إلى المعلمين
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="login-wrap" />}>
      <SuccessContent />
    </Suspense>
  );
}
