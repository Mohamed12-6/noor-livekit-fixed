'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookCheck, BookOpen, ChevronRight, Compass, Home, Menu, Moon, Play, Search, Sun, UsersRound, X,
} from 'lucide-react';
import { useUi } from './ui-context';

const navItems = [
  { href: '/', icon: Home, en: 'My study space', ar: 'مساحتي التعليمية' },
  { href: '/memorization', icon: BookOpen, en: 'Memorization', ar: 'الحفظ والمراجعة' },
  { href: '/lessons', icon: BookCheck, en: 'Lessons', ar: 'الدروس' },
  { href: '/sunnah', icon: Compass, en: 'Sunnah', ar: 'السنة النبوية' },
  { href: '/teachers', icon: UsersRound, en: 'Teachers', ar: 'المعلمون' },
];

export function NoorShell({
  children,
  active,
  title,
  kicker,
}: {
  children: React.ReactNode;
  active: string;
  title?: string;
  kicker?: string;
}) {
  const { language, theme, setLanguage, setTheme, t, toast } = useUi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = active;

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return navItems
      .filter((item) => `${item.en} ${item.ar}`.toLowerCase().includes(term))
      .map((item) => ({ href: item.href, label: language === 'ar' ? item.ar : item.en }))
      .slice(0, 5);
  }, [search, language]);

  return (
    <div className="app-shell" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">ن</div>
          <div>
            <div className="brand-name">Noor</div>
            <div className="brand-sub">Quran learning</div>
          </div>
          <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={17} />
          </button>
        </div>
        <div className="nav-group-label">{language === 'ar' ? 'طريقك اليومي' : 'Your daily path'}</div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`side-link ${location === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{t(item)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="side-bottom">
          <div className="streak-card">
            <div className="eyebrow">{language === 'ar' ? 'ثبات جميل' : 'A steady rhythm'}</div>
            <div className="streak-number">7 {language === 'ar' ? 'أيام' : 'days'}</div>
            <div className="streak-note">{language === 'ar' ? 'كل يوم صفحة جديدة' : 'A new page each day.'}</div>
          </div>
          <Link href="/profile" className="sidebar-profile">
            <div className="avatar">أ</div>
            <div>
              <div className="profile-mini-name">Adam Rahman</div>
              <div className="profile-mini-role">{language === 'ar' ? 'متعلم · المستوى ٣' : 'Learner · Level 3'}</div>
            </div>
          </Link>
        </div>
      </aside>

      <div className="content-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <strong>{title ?? t(navItems.find((i) => i.href === active) ?? { en: 'Noor', ar: 'نور' })}</strong>
              <span> &nbsp;·&nbsp; </span>
              {kicker ?? (language === 'ar' ? 'رحلتك مع نور' : 'Your Noor journey')}
            </div>
          </div>
          <div className="top-actions">
            <div className="search-box">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث في دروسك' : 'Search your path'}
                aria-label="Search"
              />
              {search.length > 0 && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((r, i) => (
                      <Link key={i} href={r.href} className="search-result" onClick={() => setSearch('')}>
                        {r.label}
                      </Link>
                    ))
                  ) : (
                    <div className="empty-state">{language === 'ar' ? 'لا توجد نتائج بعد' : 'No matches yet'}</div>
                  )}
                </div>
              )}
            </div>
            <button
              className="lang-button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              aria-label="Switch language"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
      {toast && (
        <div className="toast-note" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export function PlayGlyph() {
  return <Play size={14} fill="currentColor" />;
}

export function ChevronGlyph() {
  return <ChevronRight size={13} />;
}
