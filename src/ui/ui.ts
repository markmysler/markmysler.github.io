import { content, otherLang, saveLang } from '../content';
import { cvHref, quickHref } from '../content/links';
import type { Entry, ItemId, Lang, ObjectId, PrizeId, RoomId } from '../content/types';
import { avatarAscii } from '../game/sprites';
import type { World } from '../game/world';
import { el } from './dom';
import { mountChromle } from './games/chromle';
import { mountSignal } from './games/signal';
import { mountSlots } from './games/slots';
import { mountSnake } from './games/snake';
import type { MountGame } from './games/types';
import { candidates } from './markov';

const ITEM_ORDER: ItemId[] = ['keycard', 'berkeley', 'pathfinder', 'pokedex', 'snake', 'cc', 'fohd', 'tecnokids', 'logbook', 'ub', 'rotary', 'itba'];
const ROOM_ORDER: RoomId[] = ['hub', 'nav', 'workshop', 'training', 'arcade', 'core', 'logs', 'vault', 'trophy'];
const PRIZE_ORDER: PrizeId[] = ['apple', 'prism', 'seven', 'signal'];
const GAMES: Partial<Record<ObjectId, [MountGame, PrizeId]>> = {
  snakegame: [mountSnake, 'apple'],
  chromle: [mountChromle, 'prism'],
  slots: [mountSlots, 'seven'],
  simon: [mountSignal, 'signal'],
};
const ITEMS_KEY = 'station.items';
const PRIZES_KEY = 'station.prizes';
const ROOMS_KEY = 'station.rooms';
const SAFE_ANSWER = 'open sesame';

function load<T>(key: string): Set<T> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]'));
  } catch {
    return new Set();
  }
}

function save(key: string, set: Set<unknown>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // storage blocked: progress lasts for this visit only
  }
}

export interface UiEvents {
  onLang(lang: Lang): void;
  onMotion(on: boolean): void;
  onClose(): void;
  onTravel(room: RoomId): void;
  onSafeOpen(): void;
  onDash(): void;
}

export class UI {
  lang: Lang;
  motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  found = load<ItemId>(ITEMS_KEY);
  visited = load<RoomId>(ROOMS_KEY);
  prizes = load<PrizeId>(PRIZES_KEY);
  private view: 'entry' | 'inventory' | 'map' | null = null;
  private cleanup: (() => void) | null = null;
  private world: World | null = null;
  private player = { x: 0, y: 0 };
  private room: RoomId = 'hub';
  private openView: (() => void) | null = null;
  private hud = el('div', { className: 'hud' });
  private roomTag = el('div', { className: 'hud-room' });
  private buttons = el('div', { className: 'hud-buttons' });
  private minimap = el('canvas', { className: 'minimap' });
  private dashBtn = el('button', { className: 'btn dash-btn', type: 'button' });
  private backdrop = el('div', { className: 'panel-backdrop', hidden: true });
  private panel = el('div', { className: 'panel', role: 'dialog' });
  private toastEl = el('div', { className: 'toast', hidden: true, role: 'status' });
  private toastTimer = 0;

  constructor(
    lang: Lang,
    private events: UiEvents,
  ) {
    this.lang = lang;
    this.visited.add('hub');
    this.panel.setAttribute('aria-modal', 'true');
    this.hud.append(this.roomTag, this.buttons);
    this.backdrop.append(this.panel);
    document.body.append(this.hud, this.minimap, this.dashBtn, this.backdrop, this.toastEl);
    this.dashBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.events.onDash();
    });
    this.backdrop.addEventListener('click', (e) => e.target === this.backdrop && this.close());
    this.minimap.addEventListener('click', () => this.showMap());
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Escape' && this.isOpen()) this.close();
      else if ((e.key === 'i' || e.key === 'I') && !this.isOpen()) this.showInventory();
      else if (e.key === 'm' || e.key === 'M') {
        if (!this.isOpen()) this.showMap();
        else if (this.view === 'map') this.close();
      }
    });
    window.addEventListener('resize', () => this.drawMinimap());
    this.render();
  }

  get c() {
    return content[this.lang];
  }

  isOpen() {
    return !this.backdrop.hidden;
  }

  attachWorld(world: World) {
    this.world = world;
    this.drawMinimap();
  }

  setPlayer(x: number, y: number) {
    if (x === this.player.x && y === this.player.y) return;
    this.player = { x, y };
    this.drawMinimap();
  }

  setRoom(room: RoomId) {
    if (room === this.room) return;
    this.room = room;
    if (room !== 'corridor' && !this.visited.has(room)) {
      this.visited.add(room);
      save(ROOMS_KEY, this.visited);
    }
    this.renderRoom();
    if (room !== 'corridor') this.toast(this.c.rooms[room]);
  }

  collect(id: ItemId, quiet = false) {
    if (this.found.has(id)) return;
    this.found.add(id);
    save(ITEMS_KEY, this.found);
    if (!quiet) this.toast(this.c.hud.pickedUp(this.c.items[id].name));
    this.renderRoom();
  }

  collectPrize(id: PrizeId) {
    if (this.prizes.has(id)) return;
    this.prizes.add(id);
    save(PRIZES_KEY, this.prizes);
    this.toast(this.c.games.won(this.c.prizes[id].name));
  }

  toast(text: string) {
    this.toastEl.textContent = text;
    this.toastEl.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toastEl.hidden = true), 2200);
  }

  showEntry(id: ObjectId) {
    if (id === 'directory') return this.showMap();
    this.open('entry', () => this.fillEntry(this.c.objects[id], this.extras(id)));
  }

  showInventory() {
    this.open('inventory', () => {
      const h = this.c.hud;
      const list = el(
        'ul',
        { className: 'inventory' },
        ...ITEM_ORDER.map((id) => {
          const item = this.c.items[id];
          const has = this.found.has(id);
          return el('li', { className: has ? 'found' : '' }, el('strong', {}, has ? item.name : h.unknown), has ? item.desc : item.hint);
        }),
      );
      const prizes = el(
        'ul',
        { className: 'inventory prizes' },
        ...PRIZE_ORDER.map((id) => {
          const prize = this.c.prizes[id];
          const has = this.prizes.has(id);
          return el('li', { className: has ? 'found' : '' }, el('strong', {}, has ? prize.name : h.unknown), has ? prize.desc : prize.hint);
        }),
      );
      const prizesTitle = el('h3', { className: 'panel-sub' }, `${this.c.prizesTitle} · ${this.prizes.size}/${PRIZE_ORDER.length}`);
      this.fillPanel(`${h.inventory} · ${h.found(this.found.size, ITEM_ORDER.length)}`, [list, prizesTitle, prizes], [{ label: h.downloadCv, href: cvHref(this.lang) }]);
    });
  }

  showMap() {
    if (!this.world) return;
    this.open('map', () => {
      const h = this.c.hud;
      const big = el('canvas', { className: 'bigmap' });
      const list = el(
        'ul',
        { className: 'room-list' },
        ...ROOM_ORDER.map((id) => {
          const go = el('button', { className: 'btn small', type: 'button', textContent: h.go });
          go.addEventListener('click', () => {
            this.close();
            this.events.onTravel(id);
          });
          const seen = this.visited.has(id);
          return el('li', { className: seen ? 'seen' : '' }, el('span', {}, this.c.rooms[id], el('small', {}, seen ? h.visited : h.notVisited)), go);
        }),
      );
      this.fillPanel(h.mapTitle, [el('p', {}, h.mapHint), big, list], []);
      requestAnimationFrame(() => this.drawMap(big, Math.max(4, Math.floor(big.clientWidth / this.world!.w))));
    });
  }

  close() {
    this.backdrop.hidden = true;
    this.openView = null;
    this.view = null;
    this.cleanup?.();
    this.cleanup = null;
    this.events.onClose();
  }

  // ---------- panels ----------

  private open(kind: 'entry' | 'inventory' | 'map', view: () => void) {
    this.cleanup?.();
    this.cleanup = null;
    this.view = kind;
    this.openView = view;
    view();
    this.backdrop.hidden = false;
    this.panel.querySelector<HTMLElement>('.close')?.focus();
  }

  /** Live demos that live inside a panel rather than on the floor. */
  private extras(id: ObjectId): Node[] {
    const d = this.c.demos;
    const game = GAMES[id];
    if (game) {
      const [mount, prize] = game;
      const root = el('div', { className: 'game' });
      this.cleanup?.();
      this.cleanup = mount(root, { t: this.c.games, won: this.prizes.has(prize), onWin: () => this.collectPrize(prize) });
      return [root];
    }
    if (id === 'asciify') {
      return [el('p', { className: 'caption' }, d.asciiCaption), el('pre', { className: 'ascii', ariaHidden: 'true' }, avatarAscii())];
    }
    if (id === 'markov') {
      const list = el('ul', { className: 'markov' });
      const fill = () => list.replaceChildren(...candidates().map((w) => el('li', {}, el('code', {}, w))));
      fill();
      const again = el('button', { className: 'btn small', type: 'button', textContent: d.again });
      again.addEventListener('click', fill);
      return [el('p', { className: 'caption' }, d.markovCaption), list, again];
    }
    if (id === 'safe') {
      if (this.found.has('cc')) return [el('p', { className: 'caption' }, d.safeAlreadyOpen)];
      const input = document.createElement('input');
      Object.assign(input, { type: 'text', autocomplete: 'off', spellcheck: false, id: 'safe-input' });
      const msg = el('p', { className: 'safe-msg', role: 'status' });
      const unlock = () => {
        this.collect('cc', true);
        this.collect('fohd', true);
        this.events.onSafeOpen();
        this.toast(d.safeOpen);
        this.openView?.();
      };
      // Built by hand: these DOM types are too complex for el()'s Partial<> typing.
      const label = document.createElement('label');
      label.htmlFor = 'safe-input';
      label.textContent = d.safeLabel;
      const form = document.createElement('form');
      form.className = 'safe';
      const submit: HTMLButtonElement = el('button', { className: 'btn small primary', type: 'submit', textContent: d.safeTry });
      form.append(label, input, submit);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim().toLowerCase().replace(/\s+/g, ' ') === SAFE_ANSWER) unlock();
        else msg.textContent = d.safeWrong;
      });
      const skip = el('button', { className: 'btn small', type: 'button', textContent: d.safeSkip });
      skip.addEventListener('click', unlock);
      return [el('p', { className: 'caption' }, d.safeNote), el('p', { className: 'caption' }, d.safeHint), form, msg, skip];
    }
    return [];
  }

  private fillEntry(entry: Entry, extras: Node[] = []) {
    const nodes: Node[] = entry.body.map((p) => el('p', {}, p));
    if (entry.tags?.length) nodes.push(el('ul', { className: 'tags' }, ...entry.tags.map((t) => el('li', {}, t))));
    this.fillPanel(entry.title, [...nodes, ...extras], entry.links ?? []);
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

  // ---------- maps ----------

  private drawMap(canvas: HTMLCanvasElement, scale: number) {
    const world = this.world;
    if (!world) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = world.w * scale * dpr;
    canvas.height = world.h * scale * dpr;
    canvas.style.width = `${world.w * scale}px`;
    canvas.style.height = `${world.h * scale}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, world.w * scale, world.h * scale);
    for (let y = 0; y < world.h; y++) {
      for (let x = 0; x < world.w; x++) {
        if (!world.floor[y][x]) continue;
        const room = world.roomAt[y][x];
        ctx.fillStyle = room === 'corridor' ? '#939cc0' : room && this.visited.has(room) ? (room === this.room ? '#f5b62a' : '#a1cad4') : '#4a4f9b';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    ctx.fillStyle = '#df213f';
    ctx.fillRect((this.player.x - 0.5) * scale, (this.player.y - 0.5) * scale, scale * 2, scale * 2);
    if (scale >= 6) {
      ctx.font = `${Math.max(9, scale + 2)}px Silkscreen`;
      ctx.textAlign = 'center';
      for (const r of world.rooms) {
        ctx.fillStyle = '#1f1d2c';
        ctx.fillText(this.c.rooms[r.id], (r.x + r.w / 2) * scale, (r.y + r.h / 2) * scale);
      }
    }
  }

  private drawMinimap() {
    if (!this.world) return;
    this.drawMap(this.minimap, window.innerWidth < 600 ? 2 : 3);
  }

  // ---------- HUD ----------

  private renderRoom() {
    this.roomTag.replaceChildren(this.c.rooms[this.room], el('small', {}, this.c.hud.found(this.found.size, ITEM_ORDER.length)));
    this.drawMinimap();
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
      btn(h.map, () => this.showMap()),
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
    this.minimap.title = h.map;
    this.dashBtn.textContent = h.dash;
    this.renderRoom();
  }
}
