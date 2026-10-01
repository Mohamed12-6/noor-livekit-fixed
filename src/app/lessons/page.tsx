'use client';

import { useEffect, useState } from 'react';
import { Check, Clock3, Heart } from 'lucide-react';
import { NoorShell } from '@/components/noor-shell';
import { useUi } from '@/components/ui-context';
import { lessons } from '@/data/content';

export default function LessonsPage() {
  const { language, notify } = useUi();
  const [filter, setFilter] = useState('all');
  const [completed, setCompleted] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

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
    setFavorites(read('noor-favorites', []));
  }, []);

  const toggleCompleted = (id: string) => {
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id];
    setCompleted(next);
    window.localStorage.setItem('noor-completed', JSON.stringify(next));
    notify(language === 'ar' ? 'تم تحديث تقدمك.' : 'Your progress has been updated.');
  };
  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    window.localStorage.setItem('noor-favorites', JSON.stringify(next));
  };

  const filters = [
    { id: 'all', en: 'All lessons', ar: 'كل الدروس' },
    { id: 'foundations', en: 'Foundations', ar: 'الأساسيات' },
    { id: 'primary', en: 'Primary school', ar: 'الابتدائي' },
    { id: 'tajweed', en: 'Tajweed', ar: 'التجويد' },
  ];
  const shown = filter === 'all' ? lessons : lessons.filter((l) => l.category === filter);

  return (
    <NoorShell active="/lessons">
      <div className="fade-up">
        <div className="page-header">
          <div>
            <div className="eyebrow">02 · {language === 'ar' ? 'الدروس' : 'Lessons'}</div>
            <h1 className="page-title">{language === 'ar' ? 'نتعلم لنفهم ونعيش' : 'Learn it, understand it, live it'}</h1>
            <p className="page-subtitle">{language === 'ar' ? 'دروس قصيرة تصنع أساساً متيناً، في القرآن والحياة والمدرسة.' : 'Short lessons that build a steady foundation in Qur’an, life, and school.'}</p>
          </div>
          <div className="page-header-actions">
            <span className="tag">{completed.length} {language === 'ar' ? 'مكتمل' : 'complete'}</span>
          </div>
        </div>
        <div className="section-row">
          <div className="section-heading">{language === 'ar' ? 'مسارات مختارة لك' : 'A path chosen for you'}</div>
          <div className="page-header-actions">
            {filters.map((f) => (
              <button
                key={f.id}
                className={`button-soft ${filter === f.id ? 'active-elevate-2' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {language === 'ar' ? f.ar : f.en}
              </button>
            ))}
          </div>
        </div>
        <div className="lesson-grid">
          {shown.map((lesson) => {
            const done = completed.includes(lesson.id);
            const saved = favorites.includes(lesson.id);
            return (
              <article className="card lesson-card" key={lesson.id}>
                <div className="lesson-card-top">
                  <div className="lesson-icon">📖</div>
                  <button className="icon-button" onClick={() => toggleFavorite(lesson.id)} aria-label="Save lesson">
                    <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h3>{language === 'ar' ? lesson.ar : lesson.en}</h3>
                <div className="arabic-label">{language === 'ar' ? lesson.en : lesson.ar}</div>
                <p>{lesson.description}</p>
                <div className="lesson-footer">
                  {done ? (
                    <span className="status-done"><span className="status-dot" /><Check size={13} /> {language === 'ar' ? 'مكتمل' : 'Completed'}</span>
                  ) : (
                    <span className="lesson-meta"><Clock3 size={12} /> {lesson.duration}</span>
                  )}
                  <button className="lesson-button" onClick={() => toggleCompleted(lesson.id)}>
                    {done ? (language === 'ar' ? 'إلغاء الإكمال' : 'Undo') : (language === 'ar' ? 'أكمل الدرس' : 'Mark complete')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {shown.length === 0 && <div className="card empty-state">{language === 'ar' ? 'لا توجد دروس في هذا المسار بعد.' : 'No lessons in this path yet.'}</div>}
      </div>
    </NoorShell>
  );
}
