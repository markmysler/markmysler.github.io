import { en } from '../content/en';
import { es } from '../content/es';
import { EMAIL, GITHUB, LINKEDIN, cvHref, gameHref, quickHref } from '../content/links';
import type { Lang } from '../content/types';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const a = (href: string, label: string) => {
  const external = /^https?:/.test(href);
  return `<a href="${esc(href)}"${external ? ' rel="noopener"' : ''}>${esc(label)}</a>`;
};

/** Static HTML for the quick view, run at build time (and by the dev server). */
export function renderQuickView(lang: Lang): string {
  const c = lang === 'es' ? es : en;
  const q = c.quick;
  const other: Lang = lang === 'en' ? 'es' : 'en';
  const section = (title: string, body: string) => `<section><h2>${esc(title)}</h2>${body}</section>`;
  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

  return `
<header class="q-head">
  <nav class="q-nav">
    <a class="q-play" href="${gameHref(lang)}">▶ ${esc(c.title.enter)}</a>
    <a href="${quickHref(other)}" hreflang="${other}" lang="${other}">${esc(c.title.otherLang)}</a>
  </nav>
  <h1>Mark Mysler</h1>
  <p class="q-headline">${esc(c.headline)}</p>
  <p class="q-contact">
    ${esc(c.location)} ·
    ${a(`mailto:${EMAIL}`, EMAIL)} ·
    ${a(LINKEDIN, 'LinkedIn')} ·
    ${a(GITHUB, 'GitHub')} ·
    <a class="q-cv" href="${cvHref(lang)}" download>${esc(c.hud.downloadCv)}</a>
  </p>
</header>
<main>
  ${section(q.summaryTitle, `<p>${esc(q.summary)}</p>`)}
  ${section(
    q.experienceTitle,
    q.experience
      .map(
        (r) => `<article class="q-role">
      <h3>${esc(r.title)} · ${esc(r.org)} <span class="q-when">${esc(r.when)}</span></h3>
      ${r.summary ? `<p>${esc(r.summary)}</p>` : ''}
      ${list(r.points)}
    </article>`,
      )
      .join(''),
  )}
  ${section(
    q.projectsTitle,
    `<div class="q-projects">${q.projects
      .map(
        (p) => `<article class="q-project">
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.desc)}</p>
      <p class="q-stack">${esc(p.stack)}</p>
      ${p.link ? `<p>${a(p.link.href, p.link.label)}</p>` : ''}
    </article>`,
      )
      .join('')}</div>`,
  )}
  ${section(q.educationTitle, list(q.education))}
  ${section(q.certsTitle, list(q.certs))}
  ${section(q.awardsTitle, list(q.awards))}
  ${section(
    q.skillsTitle,
    `<dl class="q-skills">${q.skills.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`,
  )}
  ${section(q.languagesTitle, `<p>${esc(q.languages)}</p>`)}
</main>
<footer class="q-foot"><a class="q-play" href="${gameHref(lang)}">▶ ${esc(q.playCta)}</a></footer>`;
}
