import type Phaser from 'phaser';
import type { RoomId } from '../content/types';
import { R, disc, line } from './props';
import { canvas } from './sprites';
import { TILE, type Decor, type World } from './world';

/**
 * Paints every room's floor, trim and walls into one texture, so each room reads as its
 * own place: the theme is picked from the room id, the shape comes from the Tiled map.
 */

type Ctx = CanvasRenderingContext2D;
type Theme = 'corridor' | Exclude<RoomId, 'corridor'>;

const WALL = 26;
const SIDE = 6;
const LIP = 8;

/** Deterministic noise in [0, 1) per cell, so the station looks the same on every visit. */
const hash = (x: number, y: number, salt = 0) => {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------- floors ----------

const FLOORS: Record<Theme, (ctx: Ctx, x: number, y: number, cx: number, cy: number) => void> = {
  hub(ctx, x, y) {
    R(ctx, x, y, 32, 32, '#a9cfd8');
    R(ctx, x + 1, y + 1, 30, 1, '#c6e3ea');
    R(ctx, x, y, 32, 1, '#86adb9');
    R(ctx, x, y, 1, 32, '#86adb9');
    for (const [dx, dy] of [[4, 4], [27, 4], [4, 27], [27, 27]]) R(ctx, x + dx, y + dy, 2, 2, '#7f9fae');
  },
  corridor(ctx, x, y) {
    R(ctx, x, y, 32, 32, '#383d5a');
    for (let i = 0; i < 32; i += 4) {
      R(ctx, x + i, y, 1, 32, '#4c5275');
      R(ctx, x, y + i, 32, 1, '#4c5275');
    }
  },
  nav(ctx, x, y, cx, cy) {
    R(ctx, x, y, 32, 32, '#15213d');
    R(ctx, x, y, 32, 1, '#24365f');
    R(ctx, x, y, 1, 32, '#24365f');
    R(ctx, x, y + 16, 32, 1, '#1b2a4c');
    R(ctx, x + 16, y, 1, 32, '#1b2a4c');
    const r = hash(cx, cy);
    if (r < 0.45) R(ctx, x + Math.floor(r * 2000) % 30, y + Math.floor(r * 7000) % 30, 1, 1, '#9fb8e8');
  },
  workshop(ctx, x, y, cx, cy) {
    const tones = ['#a8714a', '#9a6542', '#b07a52', '#946040'];
    for (let k = 0; k < 4; k++) {
      const row = cy * 4 + k;
      R(ctx, x, y + k * 8, 32, 8, tones[Math.floor(hash(cx, row, 1) * 4)]);
      R(ctx, x, y + k * 8 + 7, 32, 1, '#6b4430');
      const joint = Math.floor(hash(cx, row, 2) * 40);
      if (joint < 32) R(ctx, x + joint, y + k * 8, 1, 7, '#6b4430');
      R(ctx, x + Math.floor(hash(cx, row, 3) * 30), y + k * 8 + 3, 4, 1, '#8c5a3b');
    }
    // Sawdust and the odd oil stain
    if (hash(cx, cy, 4) < 0.05) disc(ctx, x + 16, y + 18, 6, 3, '#83563b');
    if (hash(cx, cy, 5) < 0.5) R(ctx, x + Math.floor(hash(cx, cy, 6) * 28), y + Math.floor(hash(cx, cy, 7) * 28), 2, 1, '#d9b48a');
  },
  training(ctx, x, y, cx, cy) {
    const mats = [
      ['#f2a7a7', '#d98b8b'],
      ['#f7d98b', '#ddbd6c'],
      ['#a6e0ea', '#86c4cf'],
      ['#b5e3b0', '#94c78e'],
    ];
    const [c, d] = mats[(cx + cy * 2) % 4];
    R(ctx, x, y, 32, 32, d);
    R(ctx, x + 1, y + 1, 30, 30, c);
    // Puzzle-piece nubs
    R(ctx, x + 13, y, 6, 2, d);
    R(ctx, x, y + 13, 2, 6, d);
  },
  arcade(ctx, x, y, cx, cy) {
    R(ctx, x, y, 32, 32, '#24183a');
    const neon = ['#ff34c3', '#1dc7e6', '#f5b62a', '#7e5bd6'];
    for (let k = 0; k < 2; k++) {
      if (hash(cx, cy, k + 40) < 0.35) continue;
      const sx = x + 2 + Math.floor(hash(cx, cy, k) * 24);
      const sy = y + 2 + Math.floor(hash(cx, cy, k + 9) * 24);
      const c = neon[Math.floor(hash(cx, cy, k + 20) * 4)];
      if (hash(cx, cy, k + 30) < 0.5) {
        line(ctx, sx, sy, sx + 3, sy + 3, c);
        line(ctx, sx + 3, sy + 3, sx + 6, sy, c);
      } else {
        R(ctx, sx, sy, 3, 3, c);
        R(ctx, sx + 1, sy + 1, 1, 1, '#24183a');
      }
    }
  },
  vault(ctx, x, y) {
    R(ctx, x, y, 32, 32, '#575b6e');
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        const px = x + gx * 8 + (gy % 2 ? 4 : 0);
        const py = y + gy * 8 + 2;
        if (px + 4 > x + 32) continue;
        line(ctx, px, py + 3, px + 3, py, '#7a8096');
        line(ctx, px + 1, py + 4, px + 4, py + 1, '#44475a');
      }
    }
  },
  trophy(ctx, x, y, cx, cy) {
    R(ctx, x, y, 32, 32, (cx + cy) % 2 ? '#efe8d6' : '#d6ccb0');
    if (hash(cx, cy) < 0.6) {
      const a = Math.floor(hash(cx, cy, 1) * 20);
      line(ctx, x + a, y + 2, x + a + 10, y + 29, '#c4b996');
    }
  },
  core(ctx, x, y, cx, cy) {
    R(ctx, x, y, 32, 32, '#1c1e29');
    R(ctx, x + 1, y + 1, 30, 30, '#2a2c3b');
    if (hash(cx, cy) < 0.2) {
      for (let i = 4; i < 28; i += 3) R(ctx, x + 4, y + i, 24, 1, '#3f4460');
    } else {
      for (let i = 5; i < 28; i += 4) for (let j = 5; j < 28; j += 4) R(ctx, x + i, y + j, 1, 1, '#3a3d52');
    }
  },
  stage(ctx, x, y, cx, cy) {
    // Theatre carpet
    R(ctx, x, y, 32, 32, '#3a1b2c');
    for (let i = 0; i < 32; i += 8) {
      for (let j = 0; j < 32; j += 8) R(ctx, x + i + ((j / 8) % 2) * 4, y + j + 3, 2, 2, (cx + cy) % 3 ? '#4d2539' : '#6b2f45');
    }
  },
  logs(ctx, x, y, cx, cy) {
    R(ctx, x, y, 32, 32, '#4a5878');
    R(ctx, x + 1, y + 1, 30, 30, '#5b6c8f');
    const across = (cx + cy) % 2 === 0;
    for (let i = 3; i < 30; i += 3) {
      if (across) R(ctx, x + 2, y + i, 28, 1, '#536384');
      else R(ctx, x + i, y + 2, 1, 28, '#536384');
    }
  },
};

// ---------- trim along exposed edges ----------

const TRIM: Record<Theme, [string, string]> = {
  hub: ['hazard', '#23428b'],
  corridor: ['#6f76ae', '#2c2f48'],
  nav: ['#1dc7e6', '#2c3d66'],
  workshop: ['#6b4430', '#4a2e20'],
  training: ['#f5b62a', '#c98e1e'],
  arcade: ['#ff34c3', '#7e1e66'],
  vault: ['hazard', '#1f1d2c'],
  trophy: ['#c9a227', '#8a6c12'],
  core: ['#1dc7e6', '#11131c'],
  logs: ['#3f4b66', '#2d3750'],
  stage: ['#c9a227', '#8a6c12'],
};

function trim(ctx: Ctx, theme: Theme, x: number, y: number, w: number, h: number, along: 'h' | 'v') {
  const [c, dark] = TRIM[theme];
  if (c !== 'hazard') {
    R(ctx, x, y, w, h, c);
    return;
  }
  // Diagonal hazard stripes, as on the station's original tiles
  const stripe = theme === 'vault' ? '#f5b62a' : '#ed8024';
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = along === 'h' ? x + i + j : y + j + i;
      R(ctx, x + i, y + j, 1, 1, Math.floor(k / 4) % 2 ? stripe : dark);
    }
  }
}

// ---------- walls ----------

interface Wall {
  body: string;
  cap: string;
  side: string;
  lip: string;
  detail?: (ctx: Ctx, x: number, top: number, cx: number) => void;
}

const WALLS: Record<Theme, Wall> = {
  hub: {
    body: '#4a4f9b',
    cap: '#2f3266',
    side: '#3a3e7d',
    lip: '#2f3266',
    detail(ctx, x, top) {
      R(ctx, x, top + 4, 1, WALL - 8, '#3d4185');
      R(ctx, x + 14, top + 8, 4, 2, '#a1cad4');
      for (let i = 0; i < 32; i++) R(ctx, x + i, top + WALL - 4, 1, 3, Math.floor((x + i) / 4) % 2 ? '#ed8024' : '#23428b');
    },
  },
  corridor: {
    body: '#3f4466',
    cap: '#2a2d45',
    side: '#33375a',
    lip: '#2a2d45',
    detail(ctx, x, top) {
      R(ctx, x, top + 7, 32, 3, '#8a90b8');
      R(ctx, x, top + 7, 32, 1, '#b5bad6');
      R(ctx, x, top + 14, 32, 2, '#c46a3a');
      R(ctx, x + 6, top + 5, 2, 13, '#2a2d45');
    },
  },
  nav: {
    body: '#101a33',
    cap: '#0a1022',
    side: '#0e172d',
    lip: '#0a1022',
    detail(ctx, x, top, cx) {
      // A long panoramic window onto space
      R(ctx, x, top + 3, 32, 18, '#05070f');
      for (let i = 0; i < 4; i++) R(ctx, x + Math.floor(hash(cx, i, 40) * 31), top + 4 + Math.floor(hash(cx, i, 41) * 16), 1, 1, '#d3e9e1');
      if (cx % 9 === 4) {
        disc(ctx, x + 22, top + 14, 9, 9, '#ed8024');
        disc(ctx, x + 19, top + 11, 4, 3, '#f5b62a');
        R(ctx, x, top + 21, 32, 6, '#101a33');
      }
      R(ctx, x, top + 2, 32, 1, '#2c3d66');
      R(ctx, x, top + 21, 32, 1, '#2c3d66');
      R(ctx, x, top + 3, 1, 18, '#2c3d66');
    },
  },
  workshop: {
    body: '#c08a5c',
    cap: '#8a5d3b',
    side: '#9e6f48',
    lip: '#7a5034',
    detail(ctx, x, top, cx) {
      for (let i = 2; i < 32; i += 4) for (let j = top + 4; j < top + WALL - 3; j += 4) R(ctx, x + i, j, 1, 1, '#8a5d3b');
      const tool = Math.floor(hash(cx, 0, 50) * 4);
      if (tool === 0) {
        R(ctx, x + 8, top + 6, 2, 12, '#7a5034');
        R(ctx, x + 5, top + 5, 8, 4, '#555a70');
      } else if (tool === 1) {
        line(ctx, x + 18, top + 18, x + 26, top + 7, '#555a70');
        disc(ctx, x + 26, top + 7, 3, 3, '#555a70');
        disc(ctx, x + 26, top + 7, 1, 1, '#c08a5c');
      } else if (tool === 2) {
        R(ctx, x + 12, top + 6, 3, 13, '#df213f');
        R(ctx, x + 13, top + 4, 1, 3, '#939cc0');
      }
    },
  },
  training: {
    body: '#fff1c9',
    cap: '#e6d19b',
    side: '#ead8a6',
    lip: '#d9c48c',
    detail(ctx, x, top, cx) {
      R(ctx, x, top + 4, 32, 1, '#8a5d3b');
      const flags = ['#df213f', '#1dc7e6', '#f5b62a', '#289c5c'];
      for (let k = 0; k < 2; k++) {
        const fx = x + 3 + k * 16;
        const c = flags[(cx * 2 + k) % 4];
        for (let j = 0; j < 7; j++) R(ctx, fx + j, top + 5 + j, 10 - j * 2 > 0 ? 10 - j * 2 : 1, 1, c);
      }
    },
  },
  arcade: {
    body: '#120c1f',
    cap: '#08050f',
    side: '#0d0917',
    lip: '#08050f',
    detail(ctx, x, top, cx) {
      R(ctx, x, top + 7, 32, 2, '#ff34c3');
      R(ctx, x, top + 6, 32, 1, '#7e1e66');
      for (let i = 0; i < 32; i++) R(ctx, x + i, top + 15 + Math.round(Math.sin((cx * 32 + i) / 5) * 2), 1, 1, '#1dc7e6');
    },
  },
  vault: {
    body: '#3a3d4d',
    cap: '#24262f',
    side: '#30323f',
    lip: '#24262f',
    detail(ctx, x, top, cx) {
      for (let i = 4; i < 32; i += 8) R(ctx, x + i, top + 3, 2, WALL - 6, '#2c2e3b');
      if (cx % 3 === 0) {
        disc(ctx, x + 16, top + 11, 5, 5, '#5a1622');
        disc(ctx, x + 16, top + 11, 3, 3, '#df213f');
        R(ctx, x + 15, top + 9, 1, 1, '#ffb3be');
      }
    },
  },
  trophy: {
    body: '#7a1f2b',
    cap: '#c9a227',
    side: '#651a24',
    lip: '#4f141c',
    detail(ctx, x, top, cx) {
      for (let i = 3; i < 32; i += 6) for (let j = top + 6; j < top + WALL - 4; j += 6) R(ctx, x + i + ((j / 6) % 2 ? 3 : 0), j, 1, 1, '#962a39');
      R(ctx, x, top + WALL - 4, 32, 2, '#c9a227');
      if (cx % 2 === 0) {
        R(ctx, x + 9, top + 5, 14, 12, '#c9a227');
        R(ctx, x + 11, top + 7, 10, 8, '#efe8d6');
        R(ctx, x + 13, top + 9, 6, 4, '#a1cad4');
      }
    },
  },
  core: {
    body: '#1d1f2a',
    cap: '#11131c',
    side: '#181a24',
    lip: '#11131c',
    detail(ctx, x, top, cx) {
      R(ctx, x + 2, top + 3, 28, 20, '#2d3042');
      for (let j = top + 5; j < top + 22; j += 3) {
        R(ctx, x + 4, j, 24, 1, '#3b3f56');
        const led = hash(cx, j, 60);
        R(ctx, x + 24, j, 2, 1, led < 0.4 ? '#289c5c' : led < 0.6 ? '#1dc7e6' : led < 0.7 ? '#ed8024' : '#3b3f56');
      }
    },
  },
  stage: {
    body: '#8a1c2b',
    cap: '#c9a227',
    side: '#6b1421',
    lip: '#4f0f19',
    detail(ctx, x, top) {
      // Velvet curtain folds and a gold valance
      for (let i = 0; i < 32; i += 6) {
        R(ctx, x + i, top + 6, 2, WALL - 6, '#6b1421');
        R(ctx, x + i + 3, top + 6, 1, WALL - 6, '#a8283a');
      }
      R(ctx, x, top + 3, 32, 4, '#c9a227');
      for (let i = 2; i < 32; i += 6) R(ctx, x + i, top + 7, 2, 2, '#c9a227');
    },
  },
  logs: {
    body: '#d9d2c3',
    cap: '#b8b0a0',
    side: '#c6bead',
    lip: '#a39b8b',
    detail(ctx, x, top, cx) {
      if (cx % 2) return;
      R(ctx, x + 3, top + 3, 26, 18, '#8f877a');
      R(ctx, x + 4, top + 4, 24, 16, '#9fc6e6');
      for (let j = top + 5; j < top + 20; j += 2) R(ctx, x + 4, j, 24, 1, '#c8dff0');
      R(ctx, x + 15, top + 4, 1, 16, '#8f877a');
    },
  },
};

// ---------- decor painted on the floor ----------

function paintDecor(ctx: Ctx, d: Decor, all: Decor[]) {
  const px = d.x * TILE;
  const py = d.y * TILE;
  const pw = d.w * TILE;
  const ph = d.h * TILE;
  if (d.kind === 'hazardzone') {
    // A restricted area: hazard frame, darker plate, a red seal in the middle
    for (let j = 0; j < ph; j++) {
      for (let i = 0; i < pw; i++) {
        const edge = i < 6 || j < 6 || i >= pw - 6 || j >= ph - 6;
        if (edge) R(ctx, px + i, py + j, 1, 1, Math.floor((i + j) / 5) % 2 ? '#f5b62a' : '#1f1d2c');
      }
    }
    R(ctx, px + 6, py + 6, pw - 12, ph - 12, '#4a4d5e');
    disc(ctx, px + pw / 2, py + ph / 2, ph / 2 - 12, ph / 2 - 12, '#5a1622');
    disc(ctx, px + pw / 2, py + ph / 2, ph / 2 - 16, ph / 2 - 16, '#4a4d5e');
    line(ctx, px + pw / 2 - 18, py + ph / 2 - 18, px + pw / 2 + 18, py + ph / 2 + 18, '#5a1622');
    return;
  }
  if (d.kind === 'stage') {
    // Wooden stage with a raised front edge and footlights
    for (let j = 0; j < ph; j += 8) {
      R(ctx, px, py + j, pw, 8, (j / 8) % 2 ? '#a8714a' : '#9a6542');
      R(ctx, px, py + j + 7, pw, 1, '#6b4430');
    }
    R(ctx, px, py + ph - 6, pw, 6, '#4a2e20');
    R(ctx, px, py + ph - 6, pw, 1, '#c08a5c');
    for (let i = 10; i < pw; i += 24) {
      R(ctx, px + i, py + ph - 5, 4, 3, '#f5b62a');
      R(ctx, px + i + 1, py + ph - 4, 2, 1, '#f3fff4');
    }
    return;
  }
  if (d.kind === 'seats') {
    // A row of theatre seats, seen from above: backs at the top, cushions below
    for (let i = 0; i < pw; i += 16) {
      R(ctx, px + i + 1, py + 4, 14, 24, '#1f1d2c');
      R(ctx, px + i + 2, py + 5, 12, 7, '#6b1421');
      R(ctx, px + i + 2, py + 12, 12, 14, '#a8283a');
      R(ctx, px + i + 3, py + 14, 10, 2, '#c43a4c');
      R(ctx, px + i, py + 12, 1, 14, '#c9a227');
    }
    return;
  }
  if (d.kind === 'rug') {
    disc(ctx, px + pw / 2, py + ph / 2, pw / 2, ph / 2, '#8a3b2e');
    disc(ctx, px + pw / 2, py + ph / 2, pw / 2 - 5, ph / 2 - 5, '#c46a3a');
    disc(ctx, px + pw / 2, py + ph / 2, pw / 2 - 14, ph / 2 - 14, '#e3b07a');
    disc(ctx, px + pw / 2, py + ph / 2, pw / 2 - 20, ph / 2 - 20, '#c46a3a');
    return;
  }
  const inKind = (x: number, y: number) => all.some((o) => o.kind === d.kind && x >= o.x && y >= o.y && x < o.x + o.w && y < o.y + o.h);
  for (let cy = d.y; cy < d.y + d.h; cy++) {
    for (let cx = d.x; cx < d.x + d.w; cx++) {
      const x = cx * TILE;
      const y = cy * TILE;
      if (d.kind === 'runner') {
        // Red carpet with gold edges and posts where it turns
        R(ctx, x, y, 32, 32, '#a3162b');
        R(ctx, x, y + 15, 32, 2, '#b82237');
        if (!inKind(cx - 1, cy)) R(ctx, x, y, 3, 32, '#c9a227');
        if (!inKind(cx + 1, cy)) R(ctx, x + 29, y, 3, 32, '#c9a227');
        if (!inKind(cx, cy - 1)) R(ctx, x, y, 32, 3, '#c9a227');
        if (!inKind(cx, cy + 1)) R(ctx, x, y + 29, 32, 3, '#c9a227');
      } else if (d.kind === 'cables') {
        const horizontal = d.w >= d.h;
        const [ox, oy, w, h] = horizontal ? [x, y + 10, 32, 12] : [x + 10, y, 12, 32];
        R(ctx, ox, oy, w, h, '#14151d');
        ['#df213f', '#1dc7e6', '#f5b62a', '#289c5c'].forEach((c, i) => {
          if (horizontal) R(ctx, ox, oy + 2 + i * 2, w, 1, c);
          else R(ctx, ox + 2 + i * 2, oy, 1, h, c);
        });
      }
    }
  }
}

/** The Airlock's seal (the spawn point) and its wayfinding chevrons. */
function paintHub(ctx: Ctx, world: World, signs: Sign[]) {
  // The seal marks where you arrive, so it is centred on the spawn cell.
  {
    const cx = world.spawn.x * TILE + TILE / 2;
    const cy = world.spawn.y * TILE + TILE / 2;
    disc(ctx, cx, cy, 44, 44, '#86adb9');
    disc(ctx, cx, cy, 41, 41, '#a9cfd8');
    disc(ctx, cx, cy, 30, 30, '#86adb9');
    disc(ctx, cx, cy, 28, 28, '#c6e3ea');
    for (let a = 0; a < 8; a++) {
      const t = (a / 8) * Math.PI * 2;
      R(ctx, cx + Math.cos(t) * 36 - 2, cy + Math.sin(t) * 36 - 2, 4, 4, '#23428b');
    }
  }
  for (const s of signs) {
    const { x, y } = s;
    for (let k = 0; k < 2; k++) {
      const o = k * 7 - 3;
      const tip = [x + s.dx * (6 + o), y + s.dy * (6 + o)];
      const wing = (sign: number) => [x + s.dx * o - s.dy * 6 * sign, y + s.dy * o + s.dx * 6 * sign];
      for (const sign of [1, -1]) {
        const [wx, wy] = wing(sign).map(Math.round);
        const [tx, ty] = tip.map(Math.round);
        // Thick chevron with a dark edge so it reads on the pale floor
        for (const [ox, oy, c] of [
          [-1, -1, '#23428b'],
          [1, 1, '#23428b'],
          [0, 0, '#ed8024'],
        ] as [number, number, string][]) {
          line(ctx, wx + ox, wy + oy, tx + ox, ty + oy, c);
        }
        line(ctx, wx + (s.dx ? 0 : 1), wy + (s.dy ? 0 : 1), tx + (s.dx ? 0 : 1), ty + (s.dy ? 0 : 1), '#ed8024');
      }
    }
  }
}

// ---------- wayfinding ----------

export interface Sign {
  /** Pixel centre of the arrow, one cell inside the Airlock, centred on the corridor. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  to: RoomId;
}

/** For every corridor leaving the Airlock: where it goes and which way to point. */
export function hubSigns(world: World): Sign[] {
  const signs: Sign[] = [];
  const at = (x: number, y: number) => world.roomAt[y]?.[x] ?? null;
  for (const c of world.corridors) {
    const horizontal = c.w > c.h;
    const ends: [number, number, number, number][] = horizontal
      ? [
          [c.x - 1, c.y, c.x + c.w, c.y],
          [c.x + c.w, c.y, c.x - 1, c.y],
        ]
      : [
          [c.x, c.y - 1, c.x, c.y + c.h],
          [c.x, c.y + c.h, c.x, c.y - 1],
        ];
    for (const [hx, hy, ox, oy] of ends) {
      if (at(hx, hy) !== 'hub') continue;
      const to = at(ox, oy);
      if (!to || to === 'corridor') continue;
      const dx = Math.sign(ox - hx);
      const dy = Math.sign(oy - hy);
      const x = horizontal ? (hx - dx) * TILE + TILE / 2 : (c.x + c.w / 2) * TILE;
      const y = horizontal ? (c.y + c.h / 2) * TILE : (hy - dy) * TILE + TILE / 2;
      signs.push({ x, y, dx, dy, to });
    }
  }
  return signs;
}

// ---------- painter ----------

export function paintStation(scene: Phaser.Scene, world: World, decor: Decor[]) {
  const { w, h } = world;
  const theme = (x: number, y: number): Theme => (world.roomAt[y]?.[x] ?? 'corridor') as Theme;
  const on = (x: number, y: number) => world.isFloor(x, y);
  const signs = hubSigns(world);

  canvas(scene, 'station-floor', w * TILE, h * TILE, (ctx) => {
    // 1. Floors
    for (let cy = 0; cy < h; cy++) for (let cx = 0; cx < w; cx++) if (on(cx, cy)) FLOORS[theme(cx, cy)](ctx, cx * TILE, cy * TILE, cx, cy);
    // 2. Decor on top of the floor
    decor.forEach((d) => paintDecor(ctx, d, decor));
    paintHub(ctx, world, signs);
    // 3. North walls, side walls and front lips in the empty space around each room
    for (let cy = 0; cy < h; cy++) {
      for (let cx = 0; cx < w; cx++) {
        if (!on(cx, cy)) continue;
        const t = theme(cx, cy);
        const wall = WALLS[t];
        const x = cx * TILE;
        const y = cy * TILE;
        const n = !on(cx, cy - 1);
        const s = !on(cx, cy + 1);
        if (n) {
          const top = y - WALL;
          R(ctx, x, top, 32, WALL, wall.body);
          wall.detail?.(ctx, x, top, cx);
          R(ctx, x, top, 32, 3, wall.cap);
          R(ctx, x, y - 2, 32, 2, '#1f1d2c');
        }
        if (s) {
          R(ctx, x, y + 32, 32, LIP, wall.lip);
          R(ctx, x, y + 32, 32, 1, wall.side);
        }
        for (const dir of [-1, 1]) {
          if (on(cx + dir, cy)) continue;
          const sx = dir < 0 ? x - SIDE : x + 32;
          const top = n ? y - WALL : y;
          const bottom = s ? y + 32 + LIP : y + 32;
          R(ctx, sx, top, SIDE, bottom - top, wall.side);
          R(ctx, dir < 0 ? sx : sx + SIDE - 1, top, 1, bottom - top, '#1f1d2c');
        }
      }
    }
    // 4. Trim on the floor along every exposed edge
    for (let cy = 0; cy < h; cy++) {
      for (let cx = 0; cx < w; cx++) {
        if (!on(cx, cy)) continue;
        const t = theme(cx, cy);
        const x = cx * TILE;
        const y = cy * TILE;
        if (!on(cx, cy - 1)) trim(ctx, t, x, y, 32, 4, 'h');
        if (!on(cx, cy + 1)) trim(ctx, t, x, y + 28, 32, 4, 'h');
        if (!on(cx - 1, cy)) trim(ctx, t, x, y, 4, 32, 'v');
        if (!on(cx + 1, cy)) trim(ctx, t, x + 28, y, 4, 32, 'v');
      }
    }
  });
  scene.add.image(0, 0, 'station-floor').setOrigin(0).setDepth(-10);
  return signs;
}
