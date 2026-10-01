'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, Search } from 'lucide-react';
import { NoorShell } from '@/components/noor-shell';
import { QuranAudioPlayer } from '@/components/quran-audio-player';
import { useUi } from '@/components/ui-context';
import { surahs, getQuranRecitation } from '@/data/content';

export default function MemorizationPage() {
  const { language, notify } = useUi();
  const [progress, setProgress] = useState(42);
  const [selected, setSelected] = useState('surah-67');
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      const v = window.localStorage.getItem('noor-memorization-progress');
      if (v) setProgress(JSON.parse(v));
    } catch { /* keep default */ }
  }, []);

  const save = (v: number) => {
    setProgress(v);
    window.localStorage.setItem('noor-memorization-progress', JSON.stringify(v));
    notify(language === 'ar' ? 'أحسنت، تمت إضافة مراجعة اليوم.' : 'Beautiful work — today’s review is saved.');
  };

  const review = () => save(Math.min(100, progress + 8));

  const visibleSurahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter((s) => s.en.toLowerCase().includes(q) || s.ar.includes(query.trim()) || s.number === q || s.number.replace(/^0+/, '') === q);
  }, [query]);

  return (
    <NoorShell active="/memorization">
      <div className="fade-up">
        <div className="page-header">
          <div>
            <div className="eyebrow">01 · {language === 'ar' ? 'الحفظ والمراجعة' : 'Memorization'}</div>
            <h1 className="page-title">{language === 'ar' ? 'نثبت الآيات في القلب' : 'Let the verses settle in your heart'}</h1>
            <p className="page-subtitle">{language === 'ar' ? 'نراجع بهدوء، ونحتفل بكل آية تجد طريقها.' : 'Review softly, and celebrate every verse that finds its way.'}</p>
          </div>
          <div className="page-header-actions">
            <button className="button-primary" onClick={review}>
              <RotateCcw size={14} /> {language === 'ar' ? 'ابدأ المراجعة' : 'Start review'}
            </button>
          </div>
        </div>
        <div className="memo-hero">
          <article className="card memo-panel">
            <div className="arabic-label">المقطع المقترح اليوم</div>
            <div className="memo-surah">سُورَةُ الْمُلْكِ</div>
            <div className="memo-translation">Surah Al-Mulk · Verses 1–7</div>
            <div className="progress-line"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="memo-action-row">
              <span className="memo-count">{progress}% {language === 'ar' ? 'من هذه الرحلة' : 'of this journey'}</span>
              <button className="button-primary" onClick={review}>
                <Play size={13} fill="currentColor" /> {language === 'ar' ? 'تدرب الآن' : 'Practice now'}
              </button>
            </div>
          </article>
          <article className="card review-card">
            <div>
              <div className="eyebrow">{language === 'ar' ? 'مراجعة اليوم' : 'Today’s review'}</div>
              <div className="review-ring"><span className="review-ring-number">7/10</span></div>
              <div className="review-label">{language === 'ar' ? 'آيات تنتظر صوتك' : 'verses waiting for your voice'}</div>
            </div>
            <div className="review-meta">
              <div><strong>12</strong>{language === 'ar' ? 'دقيقة' : 'minutes'}</div>
              <div><strong>3</strong>{language === 'ar' ? 'أيام متتالية' : 'day rhythm'}</div>
            </div>
          </article>
        </div>
        <QuranAudioPlayer surahId={selected} />
        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'وردك الحالي' : 'Your current recitation'}</div>
            <div className="section-kicker">كل آية خطوة</div>
          </div>
          <div className="surah-search">
            <Search size={14} aria-hidden="true" />
            <input
              className="input-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث عن سورة…' : 'Search a surah…'}
              aria-label={language === 'ar' ? 'بحث السور' : 'Search surahs'}
            />
            <span className="text-link">{visibleSurahs.length}/{surahs.length}</span>
          </div>
        </div>
        <div className="surah-list">
          {visibleSurahs.map((surah) => {
            const recitation = getQuranRecitation(surah.id);
            const isSelected = selected === surah.id;
            return (
              <article className={`card surah-row ${isSelected ? 'selected' : ''}`} key={surah.id}>
                <div className="surah-number">{surah.number}</div>
                <div className="surah-info">
                  <div className="surah-name">{surah.ar}</div>
                  <div className="surah-sub">{surah.en} · {surah.verses} {language === 'ar' ? 'آيات' : 'verses'}</div>
                </div>
                <div className="surah-progress">
                  <div className="progress-line"><div className="progress-fill" style={{ width: `${surah.id === 'surah-67' ? progress : 0}%` }} /></div>
                  <div className="surah-percent">{surah.id === 'surah-67' ? progress : 0}%</div>
                </div>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    onClick={() => setSelected(surah.id)}
                    aria-pressed={isSelected}
                    disabled={!recitation}
                    aria-label={`Select ${surah.en}`}
                  >
                    <Play size={13} fill="currentColor" />
                  </button>
                  <button className="icon-button" onClick={review} aria-label={`Review ${surah.en}`}>
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </NoorShell>
  );
}
