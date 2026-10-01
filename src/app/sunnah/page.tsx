'use client';

import { useState } from 'react';
import { Check, Headphones, Heart, Play, UsersRound, X, BookOpen } from 'lucide-react';
import { NoorShell } from '@/components/noor-shell';
import { useUi } from '@/components/ui-context';

export default function SunnahPage() {
  const { language, notify } = useUi();
  const [playing, setPlaying] = useState(false);
  const toggleAudio = () => {
    setPlaying(!playing);
    notify(language === 'ar' ? (playing ? 'تم إيقاف التلاوة.' : 'بدأت التلاوة.') : (playing ? 'Recitation paused.' : 'Recitation started.'));
  };
  return (
    <NoorShell active="/sunnah">
      <div className="fade-up">
        <div className="page-header">
          <div>
            <div className="eyebrow">03 · {language === 'ar' ? 'السنة النبوية' : 'Sunnah'}</div>
            <h1 className="page-title">{language === 'ar' ? 'هديٌ صغير، أثرٌ كبير' : 'Small sunnahs, lasting light'}</h1>
            <p className="page-subtitle">{language === 'ar' ? 'نقرب السنة إلى يومك — عادة واحدة، ومعنى يبقى معك.' : 'Bring the Sunnah close to your day — one habit, one meaning that stays.'}</p>
          </div>
          <div className="page-header-actions">
            <button className="button-primary" onClick={toggleAudio}>
              <Headphones size={14} /> {playing ? (language === 'ar' ? 'إيقاف الصوت' : 'Pause audio') : (language === 'ar' ? 'استمع للحديث' : 'Listen to hadith')}
            </button>
          </div>
        </div>
        <div className="duo-grid">
          <article className="card quote-card">
            <div className="eyebrow">{language === 'ar' ? 'حديث اليوم' : 'Hadith of the day'}</div>
            <div className="quote-text">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ</div>
            <div className="quote-source">{language === 'ar' ? 'رواه البخاري ومسلم' : 'Narrated by al-Bukhari and Muslim'}</div>
            <button className="button-soft" style={{ marginTop: 20 }} onClick={toggleAudio}>
              {playing ? <X size={13} /> : <Play size={13} fill="currentColor" />} {playing ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'استماع' : 'Listen')}
            </button>
          </article>
          <article className="card continue-card">
            <div className="eyebrow">{language === 'ar' ? 'تطبيق اليوم' : 'Try it today'}</div>
            <div className="lesson-title" style={{ marginTop: 16 }}>{language === 'ar' ? 'ابدأ عملك بنية جميلة' : 'Begin with a beautiful intention'}</div>
            <p className="page-subtitle">{language === 'ar' ? 'قبل واجبك أو حفظك، توقف لحظة وانوِ الخير. القلب يعرف الطريق.' : 'Before homework or memorization, pause for a moment and intend good. The heart knows the way.'}</p>
            <button className="button-soft" style={{ marginTop: 18 }} onClick={() => notify(language === 'ar' ? 'تم حفظ نية اليوم.' : 'Today’s intention is saved.')}>
              <Check size={13} /> {language === 'ar' ? 'تممتها اليوم' : 'I did this today'}
            </button>
          </article>
        </div>
        <div className="section-row">
          <div>
            <div className="section-heading">{language === 'ar' ? 'أبواب السنة' : 'Sunnah in your day'}</div>
            <div className="section-kicker">نكتشفها خطوة خطوة</div>
          </div>
        </div>
        <div className="pillars">
          <article className="card pillar-card">
            <div className="pillar-icon"><Heart size={17} /></div>
            <div className="pillar-title">{language === 'ar' ? 'في البيت' : 'At home'}</div>
            <div className="pillar-ar">الرحمة تبدأ هنا</div>
            <div className="pillar-note">{language === 'ar' ? 'سلام، شكر، وكلمة طيبة.' : 'Salam, gratitude, and a kind word.'}</div>
          </article>
          <article className="card pillar-card">
            <div className="pillar-icon"><BookOpen size={17} /></div>
            <div className="pillar-title">{language === 'ar' ? 'في طلب العلم' : 'While learning'}</div>
            <div className="pillar-ar">اطلب العلم</div>
            <div className="pillar-note">{language === 'ar' ? 'نية صادقة وأدب جميل.' : 'A sincere intention and beautiful adab.'}</div>
          </article>
          <article className="card pillar-card">
            <div className="pillar-icon"><UsersRound size={17} /></div>
            <div className="pillar-title">{language === 'ar' ? 'مع الناس' : 'With others'}</div>
            <div className="pillar-ar">خير الناس أنفعهم</div>
            <div className="pillar-note">{language === 'ar' ? 'كن عوناً لمن حولك.' : 'Be a source of ease for others.'}</div>
          </article>
        </div>
      </div>
    </NoorShell>
  );
}
