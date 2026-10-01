'use client';

import { useEffect, useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { NoorShell } from '@/components/noor-shell';
import { useUi } from '@/components/ui-context';

export default function ProfilePage() {
  const { language, theme, setLanguage, setTheme, notify } = useUi();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem('noor-completed');
      if (v) setCompleted(JSON.parse(v));
    } catch { /* keep default */ }
  }, []);

  return (
    <NoorShell active="/profile">
      <div className="fade-up">
        <div className="page-header">
          <div>
            <div className="eyebrow">05 · {language === 'ar' ? 'ملفي' : 'Profile'}</div>
            <h1 className="page-title">{language === 'ar' ? 'مساحتي، على طريقتي' : 'My space, my rhythm'}</h1>
            <p className="page-subtitle">{language === 'ar' ? 'اختر ما يساعدك على أن تتعلم براحة وثبات.' : 'Choose what helps you learn with comfort and consistency.'}</p>
          </div>
        </div>
        <article className="card profile-card">
          <div className="profile-avatar">أ</div>
          <div>
            <div className="profile-name">Adam Rahman</div>
            <div className="profile-detail">{language === 'ar' ? 'المستوى الثالث · محب سورة الملك' : 'Level 3 learner · Al-Mulk enthusiast'}</div>
            <div className="teacher-tags">
              <span className="mini-tag"><Check size={11} /> {completed.length} {language === 'ar' ? 'دروس مكتملة' : 'lessons complete'}</span>
            </div>
          </div>
        </article>
        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'تفضيلاتي' : 'Preferences'}</div>
            <div className="section-kicker">أنت تعرف ما يناسبك</div>
          </div>
        </div>
        <div className="settings-grid">
          <article className="card setting-panel">
            <div className="eyebrow">{language === 'ar' ? 'المظهر واللغة' : 'Look and language'}</div>
            <div className="setting-row">
              <div>
                <div className="setting-title">{language === 'ar' ? 'الوضع الليلي' : 'Dark mode'}</div>
                <div className="setting-note">{language === 'ar' ? 'راحة للعين في المساء.' : 'A softer view for evening study.'}</div>
              </div>
              <button className={`switch ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle dark mode">
                <span className="switch-thumb" />
              </button>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-title">{language === 'ar' ? 'لغة المساحة' : 'Space language'}</div>
                <div className="setting-note">{language === 'ar' ? 'الكل يعود إلى العربية بلمسة.' : 'Everything returns to Arabic with a touch.'}</div>
              </div>
              <button className="lang-button" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
                {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />} {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          </article>
          <article className="card setting-panel">
            <div className="eyebrow">{language === 'ar' ? 'تقدمك' : 'Your progress'}</div>
            <div className="setting-row">
              <div>
                <div className="setting-title">{language === 'ar' ? 'السير المحفوظة' : 'Saved lessons'}</div>
                <div className="setting-note">{language === 'ar' ? 'تظهر في مساحتك التعليمية.' : 'Shown on your home page.'}</div>
              </div>
              <span className="tag">{completed.length}</span>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-title">{language === 'ar' ? 'إعادة التعيين' : 'Reset progress'}</div>
                <div className="setting-note">{language === 'ar' ? 'حذف التقدم المحلي على هذا الجهاز.' : 'Clear local progress on this device.'}</div>
              </div>
              <button
                className="button-soft"
                onClick={() => {
                  if (window.confirm(language === 'ar' ? 'هل تريد حذف التقدم المحلي؟' : 'Reset your local progress?')) {
                    window.localStorage.removeItem('noor-completed');
                    window.localStorage.removeItem('noor-favorites');
                    window.localStorage.removeItem('noor-memorization-progress');
                    setCompleted([]);
                    notify(language === 'ar' ? 'عاد تقدمك إلى البداية.' : 'Your progress has been reset.');
                  }
                }}
              >
                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </button>
            </div>
          </article>
        </div>
      </div>
    </NoorShell>
  );
}
