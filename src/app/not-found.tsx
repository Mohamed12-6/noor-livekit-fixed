import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="login-wrap" dir="rtl">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="brand-mark" style={{ margin: '0 auto' }}>ن</div>
        <h1 className="page-title" style={{ fontSize: 24, marginTop: 16 }}>الصفحة غير موجودة</h1>
        <p className="page-subtitle" style={{ fontSize: 12 }}>ربما انتقل الرابط أو ضاع في الطريق.</p>
        <Link href="/" className="button-primary" style={{ marginTop: 18 }}>العودة للرئيسية</Link>
      </div>
    </div>
  );
}
