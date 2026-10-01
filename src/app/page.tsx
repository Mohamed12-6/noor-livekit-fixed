'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookCheck, Bookmark, BookOpen, Check, ChevronRight, Compass, Heart, Play, Sparkles } from 'lucide-react';
import { NoorShell } from '@/components/noor-shell';
import { useUi } from '@/components/ui-context';
import { lessons, surahs } from '@/data/content';

export default function HomePage() {
  const { language, t, notify } = useUi();
  const [completed, setCompleted] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [progress, setProgress] = useState(42);

  useEffect(() => {
    const read = <T,>(key: string, fb: T): T => {
      try {
        const v = window.localStorage.getItem(key);
        return v ? (JSON.parse(v) as T) : fb;
      } catch {
        return fb;
      }
    };
    setCompleted(read('noor-completed', []));
    setFavorites(read('noor-favorites', ['makharij']));
    setProgress(read('noor-memorization-progress', 42));
  }, []);

  const favoriteLessons = lessons.filter((l) => favorites.includes(l.id));
  const copy = {
    welcome: { en: 'As-salāmu ʿalaykum, Adam', ar: 'السلام عليكم يا آدم' },
    welcomeSub: { en: 'A little light, learned every day.', ar: 'احفظ، راجع، وتدبر.. في أي وقت ومن أي مكان' },
    continue: { en: 'Continue learning', ar: 'تابع تعلّمك' },
    start: { en: 'Start today’s practice', ar: 'ابدأ تدريب اليوم' },
  };

  return (
    <NoorShell active="/">
      <div className="fade-up">
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">NOOR · {language === 'ar' ? 'رحلة هادئة' : 'A quiet journey'}</div>
            <h1 className="page-title">
              {t(copy.welcome)}
              <br />
              <span className="font-arabic">{t(copy.welcomeSub)}</span>
            </h1>
            <p className="page-subtitle">
              {language === 'ar' ? 'خطوة صغيرة اليوم، تصنع قلباً أقوى غداً.' : 'One small step today makes a stronger heart tomorrow.'}
            </p>
            <div className="hero-cta-row">
              <Link href="/memorization" className="button-primary">
                <Play size={14} fill="currentColor" /> {t(copy.continue)}
              </Link>
              <Link href="/memorization" className="button-ghost">
                {t(copy.start)} <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          <div className="hero-side-note">
            <div className="orb"><Sparkles size={17} /></div>
            <span>{language === 'ar' ? 'معلمك ينتظرك بلطف' : 'Your teacher is waiting gently'}</span>
          </div>
        </section>

        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'نعود إلى حيث توقفنا' : 'Pick up where you left off'}</div>
            <div className="section-kicker">نكمل معاً، بهدوء</div>
          </div>
          <Link href="/memorization" className="text-link">
            {language === 'ar' ? 'كل الحفظ' : 'View memorization'} <ChevronRight size={13} />
          </Link>
        </div>
        <div className="dashboard-grid">
          <article className="card continue-card">
            <div className="continue-top">
              <div>
                <div className="lesson-meta">{language === 'ar' ? 'آخر درس' : 'Last lesson'} · 12 min</div>
                <div className="lesson-title">{language === 'ar' ? 'مخارج الحروف' : 'The sounds of the Qur’an'}</div>
                <div className="lesson-ar">مَخَارِجُ الْحُرُوفِ</div>
              </div>
              <span className="tag">{language === 'ar' ? 'تجويد' : 'Tajweed'}</span>
            </div>
            <div className="progress-line"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="continue-bottom">
              <span className="progress-label">{progress}% {language === 'ar' ? 'مكتمل' : 'complete'}</span>
              <Link href="/memorization" className="button-soft">
                {language === 'ar' ? 'متابعة' : 'Resume'} <ChevronRight size={13} />
              </Link>
            </div>
          </article>
          <article className="card stats-card">
            <div>
              <div className="eyebrow">{language === 'ar' ? 'هذا الأسبوع' : 'This week'}</div>
              <div className="stats-number">4.2</div>
              <div className="stats-caption">{language === 'ar' ? 'ساعات تعلّم لطيفة' : 'hours of gentle learning'}</div>
            </div>
            <div className="week-dots">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div className="week-day" key={i}>
                  <div className={`week-dot ${i < 5 ? 'done' : ''}`}>{i < 5 ? <Check size={11} /> : ''}</div>
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'ثلاثة أبواب، قلب واحد' : 'Three doors, one heart'}</div>
            <div className="section-kicker">أين نذهب اليوم؟</div>
          </div>
        </div>
        <div className="pillars">
          <Link href="/memorization" className="card pillar-card">
            <div className="pillar-icon"><BookOpen size={17} /></div>
            <div className="pillar-title">{language === 'ar' ? 'الحفظ' : 'Memorization'}</div>
            <div className="pillar-ar">حفظ القرآن الكريم</div>
            <div className="pillar-note">{language === 'ar' ? 'صفحة واحدة، بتركيز كامل.' : 'One page, with a present heart.'}</div>
          </Link>
          <Link href="/lessons" className="card pillar-card">
            <div className="pillar-icon"><BookCheck size={17} /></div>
            <div className="pillar-title">{language === 'ar' ? 'دروسنا' : 'Foundations'}</div>
            <div className="pillar-ar">نتعلم لنفهم</div>
            <div className="pillar-note">{language === 'ar' ? 'أساسيات جميلة للحياة والمدرسة.' : 'Beautiful basics for life and school.'}</div>
          </Link>
          <Link href="/sunnah" className="card pillar-card">
            <div className="pillar-icon"><Compass size={17} /></div>
            <div className="pillar-title">{language === 'ar' ? 'السنة' : 'Sunnah'}</div>
            <div className="pillar-ar">هدي النبي ﷺ</div>
            <div className="pillar-note">{language === 'ar' ? 'خلق صغير، أثر كبير.' : 'A small habit, a lasting mark.'}</div>
          </Link>
        </div>

        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'من هدي النبي' : 'A light to carry'}</div>
            <div className="section-kicker">كلمة لهذا اليوم</div>
          </div>
          <Link href="/sunnah" className="text-link">
            {language === 'ar' ? 'اكتشف السنة' : 'Explore Sunnah'} <ChevronRight size={13} />
          </Link>
        </div>
        <div className="duo-grid">
          <article className="card quote-card">
            <div className="quote-mark">“</div>
            <div className="quote-text">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</div>
            <div className="quote-source">{language === 'ar' ? 'رواه البخاري' : 'The Prophet ﷺ · Sahih al-Bukhari'}</div>
          </article>
          <article className="card favorite-list">
            <div className="eyebrow">{language === 'ar' ? 'دروسي المحفوظة' : 'Saved for later'}</div>
            {favoriteLessons.length ? (
              favoriteLessons.slice(0, 2).map((lesson) => (
                <div className="favorite-row" key={lesson.id}>
                  <div className="favorite-badge"><Bookmark size={15} fill="currentColor" /></div>
                  <div className="favorite-info">
                    <div className="favorite-title">{language === 'ar' ? lesson.ar : lesson.en}</div>
                    <div className="favorite-sub">{lesson.duration} · {lesson.category}</div>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => {
                      const next = favorites.filter((f) => f !== lesson.id);
                      setFavorites(next);
                      window.localStorage.setItem('noor-favorites', JSON.stringify(next));
                      notify(language === 'ar' ? 'تم تحديث دروسك المحفوظة.' : 'Saved lessons updated.');
                    }}
                    aria-label="Remove saved"
                  >
                    <Heart size={15} fill="currentColor" />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">{language === 'ar' ? 'احفظ درساً لتجده هنا.' : 'Save a lesson and find it here.'}</div>
            )}
          </article>
        </div>
        {completed.length > 0 && (
          <div className="section-row">
            <div className="status-done">
              <span className="status-dot" /><Check size={13} /> {completed.length} {language === 'ar' ? 'دروس مكتملة — أحسنت' : 'lessons completed — well done'}
            </div>
          </div>
        )}
        {surahs.length === 0 && null}
      </div>
    </NoorShell>
  );
}
