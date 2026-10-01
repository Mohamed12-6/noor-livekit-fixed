'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, LoaderCircle, Pause, Play, Volume2 } from 'lucide-react';
import { getQuranRecitation } from '@/data/content';
import { useUi } from './ui-context';

type AudioState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

export function QuranAudioPlayer({ surahId }: { surahId: string }) {
  const { language } = useUi();
  // Memoised: getQuranRecitation returns a NEW object each call, which used to
  // re-trigger the effect below on every render and reload the audio forever.
  const source = useMemo(() => getQuranRecitation(surahId), [surahId]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>(source ? 'loading' : 'idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentTime(0);
    setDuration(0);
    setError('');
    if (!source) {
      audio.removeAttribute('src');
      audio.load();
      setState('idle');
      return;
    }
    const onLoaded = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setState('ready');
    };
    const onCanPlay = () => setState(audio.paused ? 'ready' : 'playing');
    const onPlaying = () => setState('playing');
    const onPause = () => {
      if (!audio.ended) setState('paused');
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setCurrentTime(audio.duration);
      setState('ended');
    };
    const onError = () => {
      setError(language === 'ar' ? 'تعذر تحميل التلاوة. تحقق من الاتصال وحاول مرة أخرى.' : 'This recitation could not load. Check your connection and try again.');
      setState('error');
    };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.src = source.audioUrl;
    audio.preload = 'metadata';
    audio.load();
    setState('loading');
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [language, source]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !source || state === 'loading') return;
    if (state === 'playing') {
      audio.pause();
      return;
    }
    if (state === 'ended' || state === 'error') {
      audio.currentTime = 0;
      setCurrentTime(0);
      setError('');
      if (state === 'error') audio.load();
    }
    setState('loading');
    try {
      await audio.play();
    } catch {
      setError(language === 'ar' ? 'لم تبدأ التلاوة. حاول الضغط مرة أخرى.' : 'Playback did not start. Try again.');
      setState('error');
    }
  };

  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const label = isLoading
    ? language === 'ar' ? 'جارٍ التحميل' : 'Loading'
    : state === 'error'
      ? language === 'ar' ? 'إعادة المحاولة' : 'Retry'
      : isPlaying
        ? language === 'ar' ? 'إيقاف مؤقت' : 'Pause'
        : language === 'ar' ? 'استمع للتلاوة' : 'Listen to recitation';

  return (
    <article className="card recitation-card" aria-live="polite">
      <audio ref={audioRef} preload="metadata" aria-hidden="true" />
      <div className="recitation-heading">
        <div>
          <div className="eyebrow">{language === 'ar' ? 'تلاوة القرآن' : 'Quran recitation'}</div>
          <div className="recitation-title">
            {source ? (language === 'ar' ? source.surahName.ar : source.surahName.en) : language === 'ar' ? 'اختر سورة للاستماع' : 'Choose a surah to listen'}
          </div>
          {source && (
            <div className="recitation-meta">
              {language === 'ar' ? source.passage.ar : source.passage.en} · {language === 'ar' ? source.reciter.ar : source.reciter.en}
            </div>
          )}
        </div>
        <Volume2 size={18} className="recitation-icon" aria-hidden="true" />
      </div>
      <div className="recitation-controls">
        <button className="button-primary recitation-play" type="button" onClick={toggle} disabled={!source || isLoading} aria-label={label}>
          {isLoading ? <LoaderCircle size={14} className="spin" /> : isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          {label}
        </button>
        <div className="recitation-time">
          {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
        </div>
      </div>
      {duration > 0 && (
        <label className="recitation-progress">
          <span className="sr-only">Recitation position</span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={Math.min(currentTime, duration)}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = v;
              setCurrentTime(v);
            }}
            aria-label="Recitation progress"
          />
          <span className="recitation-progress-fill" style={{ width: `${progress}%` }} />
        </label>
      )}
      {state === 'error' && (
        <div className="recitation-error" role="alert">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      <div className="recitation-source">{source ? `${language === 'ar' ? 'المصدر' : 'Source'}: ${source.provider}` : ''}</div>
    </article>
  );
}
