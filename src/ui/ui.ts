import { content, otherLang, saveLang } from '../content';
import { cvHref, quickHref } from '../content/links';
import type { Entry, ItemId, Lang, ObjectId, RoomId } from '../content/types';

const ITEM_ORDER: ItemId[] = ['keycard', 'berkeley', 'pathfinder', 'pokedex', 'snake', 'cc', 'fohd', 'tecnokids', 'logbook', 'ub', 'rotary', 'itba'];
const ITEMS_KEY = 'station.items';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function loadFound(): Set<ItemId> {
  try {
    return new Set(JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export interface UiEvents {
  onLang(lang: Lang): void;
  onMotion(on: boolean): void;
  onClose(): void;
}

export class UI {
  lang: Lang;
  motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  found = loadFound();
  private room: RoomId = 'hub';
  private openView: (() => void) | null = null;
  private hud = el('div', { className: 'hud' });
  private roomTag = el('div', { className: 'hud-room' });
  private buttons = el('div', { className: 'hud-buttons' });
  private backdrop = el('div', { className: 'panel-backdrop', hidden: true });
  private panel = el('div', { className: 'panel', role: 'dialog' });
  private toastEl = el('div', { className: 'toast', hidden: true, role: 'status' });
  private toastTimer = 0;

  constructor(
    lang: Lang,
    private events: UiEvents,
  ) {
    this.lang = lang;
    this.panel.setAttribute('aria-modal', 'true');
    this.hud.append(this.roomTag, this.buttons);
    this.backdrop.append(this.panel);
    document.body.append(this.hud, this.backdrop, this.toastEl);
    this.backdrop.addEventListener('click', (e) => e.target === this.backdrop && this.close());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
      if ((e.key === 'i' || e.key === 'I') && !this.isOpen()) this.showInventory();
    });
    this.render();
  }

  get c() {
    return content[this.lang];
  }

  isOpen() {
    return !this.backdrop.hidden;
  }

  setRoom(room: RoomId) {
    if (room === this.room) return;
    this.room = room;
    this.renderRoom();
    this.toast(this.c.rooms[room]);
  }

  collect(id: ItemId) {
    this.found.add(id);
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify([...this.found]));
    } catch {
      // storage blocked: progress lasts for this visit only
    }
    this.toast(this.c.hud.pickedUp(this.c.items[id].name));
    this.renderRoom();
  }

  toast(text: string) {
    this.toastEl.textContent = text;
    this.toastEl.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toastEl.hidden = true), 2200);
  }

  showEntry(id: ObjectId) {
    this.open(() => this.fillEntry(this.c.objects[id]));
  }

  showInventory() {
    this.open(() => {
      const h = this.c.hud;
      const list = el(
        'ul',
        { className: 'inventory' },
        ...ITEM_ORDER.map((id) => {
          const item = this.c.items[id];
          const has = this.found.has(id);
          return el(
            'li',
            { className: has ? 'found' : '' },
            el('strong', {}, has ? item.name : h.unknown),
            has ? item.desc : item.hint,
          );
        }),
      );
      this.fillPanel(`${h.inventory} · ${h.found(this.found.size, ITEM_ORDER.length)}`, [list], [{ label: h.downloadCv, href: cvHref(this.lang) }]);
    });
  }

  close() {
    this.backdrop.hidden = true;
    this.openView = null;
    this.events.onClose();
  }

  private open(view: () => void) {
    this.openView = view;
    view();
    this.backdrop.hidden = false;
    this.panel.querySelector<HTMLElement>('.close')?.focus();
  }

  private fillEntry(entry: Entry) {
    const nodes: Node[] = entry.body.map((p) => el('p', {}, p));
    if (entry.tags?.length) nodes.push(el('ul', { className: 'tags' }, ...entry.tags.map((t) => el('li', {}, t))));
    this.fillPanel(entry.title, nodes, entry.links ?? []);
  }

  private fillPanel(title: string, nodes: Node[], links: { label: string; href: string }[]) {
    const close = el('button', { className: 'btn small close', type: 'button', textContent: this.c.hud.close });
    close.addEventListener('click', () => this.close());
    const heading = el('h2', { id: 'panel-title' }, title);
    this.panel.setAttribute('aria-labelledby', 'panel-title');
    const linkRow = el(
      'div',
      { className: 'links' },
      ...links.map((l, i) => {
        const a = el('a', { className: i === 0 ? 'btn primary small' : 'btn small', href: l.href, textContent: l.label });
        if (/^https?:/.test(l.href)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        if (l.href.endsWith('.pdf')) a.setAttribute('download', '');
        return a;
      }),
    );
    this.panel.replaceChildren(close, heading, ...nodes, ...(links.length ? [linkRow] : []));
  }

  private renderRoom() {
    this.roomTag.replaceChildren(this.c.rooms[this.room], el('small', {}, this.c.hud.found(this.found.size, ITEM_ORDER.length)));
  }

  private render() {
    const h = this.c.hud;
    document.documentElement.lang = this.lang;
    document.title = this.c.meta.title;
    const btn = (label: string, onClick: () => void, cls = 'btn small') => {
      const b = el('button', { className: cls, type: 'button', textContent: label });
      b.addEventListener('click', (e) => {
        onClick();
        (e.currentTarget as HTMLElement).blur();
      });
      return b;
    };
    const link = (label: string, href: string, download = false) => {
      const a = el('a', { className: 'btn small', href, textContent: label });
      if (download) a.setAttribute('download', '');
      return a;
    };
    this.buttons.replaceChildren(
      btn(h.contact, () => this.showEntry('mailbox'), 'btn small primary'),
      link(h.cv, cvHref(this.lang), true),
      btn(h.inventory, () => this.showInventory()),
      link(h.quick, quickHref(this.lang)),
      btn(this.motion ? h.motionOn : h.motionOff, () => {
        this.motion = !this.motion;
        this.events.onMotion(this.motion);
        this.render();
      }),
      btn(h.otherLang, () => {
        this.lang = otherLang(this.lang);
        saveLang(this.lang);
        this.render();
        this.openView?.();
        this.events.onLang(this.lang);
      }),
    );
    this.renderRoom();
  }
}
