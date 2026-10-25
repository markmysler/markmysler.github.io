import { en } from './en';
import { es } from './es';
import type { Content, Lang } from './types';

export const content: Record<Lang, Content> = { en, es };

const KEY = 'station.lang';

/** ?lang= wins, then the saved choice, then the browser language. */
export function detectLang(): Lang {
  const param = new URLSearchParams(location.search).get('lang');
  if (param === 'en' || param === 'es') return param;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // storage blocked: fall through
  }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // storage blocked: the choice just won't persist
  }
}

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');
