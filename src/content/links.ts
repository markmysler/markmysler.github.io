import type { Lang } from './types';

export const EMAIL = 'myslermark@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/mark-mysler';
export const GITHUB = 'https://github.com/markmysler';
export const PUNTO_MEDIO = 'https://puntomedio.org';
export const PATHFINDER = 'https://markmysler.github.io/pathfinder/';
export const POKEDEX = 'https://pokedex-next-rho.vercel.app';
export const SNAKE_DEMO = 'https://markmysler.github.io/snake-ai/';
export const NERDEARLA_VIDEO = 'https://www.youtube.com/watch?v=_W3lXDH5jOY';
export const NERDEARLA_SPEAKER = 'https://nerdearla.com/speakers/mark-mysler/';
export const EKOPARTY_SCHEDULE = 'https://ekoparty.org/schedule-miami-2026/';
export const repo = (name: string) => `${GITHUB}/${name}`;

export const cvHref = (lang: Lang) => `/cv/Mark-Mysler-CV-${lang.toUpperCase()}.pdf`;
export const quickHref = (lang: Lang) => (lang === 'es' ? '/quick/es/' : '/quick/');
export const gameHref = (lang: Lang) => `/?lang=${lang}`;
