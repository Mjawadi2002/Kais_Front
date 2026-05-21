import React, { useState, useRef, useEffect } from 'react';
import { BsCheck, BsChevronDown } from 'react-icons/bs';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', nativeName: 'English',  flag: '🇬🇧' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', nativeName: 'العربية',  flag: '🇹🇳' },
];

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setOpen(v => !v)}
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:block">{current.code.toUpperCase()}</span>
        <BsChevronDown
          size={11}
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-slide-up">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => select(lang.code)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="flex-1 text-start">{lang.nativeName}</span>
              {currentLanguage === lang.code && (
                <BsCheck size={16} className="text-indigo-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
