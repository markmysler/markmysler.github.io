import '@fontsource/silkscreen/400.css';
import './styles.css';
import { content, detectLang, otherLang, saveLang } from './content';
import { cvHref, quickHref } from './content/links';
import type { Lang } from './content/types';

let lang: Lang = detectLang();

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function applyTitle() {
  const c = content[lang];
  document.documentElement.lang = lang;
  document.title = c.meta.title;
  const text: Record<string, string> = {
    headline: c.headline,
    tagline: c.title.tagline,
    enter: c.title.enter,
    quick: c.title.quick,
    otherLang: c.title.otherLang,
    controls: c.title.controls,
  };
  document.querySelectorAll<HTMLElement>('[data-t]').forEach((el) => {
    el.textContent = text[el.dataset.t!] ?? el.textContent;
  });
  $<HTMLAnchorElement>('quick').href = quickHref(lang);
  $<HTMLAnchorElement>('t-cv').href = cvHref(lang);
}

function sprinkleStars() {
  const box = document.querySelector('.stars')!;
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    box.appendChild(s);
  }
}

async function enter() {
  const button = $<HTMLButtonElement>('enter');
  button.disabled = true;
  button.textContent = content[lang].title.loading;
  // Phaser is ~1 MB, so it only loads once someone chooses to play.
  const { startGame } = await import('./game');
  await document.fonts.load('16px Silkscreen');
  $('title').hidden = true;
  $('game').removeAttribute('aria-hidden');
  startGame($('game'), lang);
}

applyTitle();
sprinkleStars();

$('lang').addEventListener('click', () => {
  lang = otherLang(lang);
  saveLang(lang);
  applyTitle();
});
$('enter').addEventListener('click', enter);
