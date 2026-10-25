import type Phaser from 'phaser';
import { BODY_DOWN, HEAD_DOWN, PAL, canvas, drawRows } from './sprites';

/**
 * Custom props, drawn pixel by pixel. Each texture is `prop-<object id>` and is placed
 * bottom-centred on the object's footprint, so it can rise above it.
 */

type Ctx = CanvasRenderingContext2D;

const col = (c: string) => PAL[c] ?? c;

export function R(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = col(c);
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Rectangle with a 1px dark outline. */
export function box(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  R(ctx, x, y, w, h, 'k');
  R(ctx, x + 1, y + 1, w - 2, h - 2, c);
}

/** Pixel-exact filled ellipse; '-' clears instead of painting. */
export function disc(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, c: string) {
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
    for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy > 1) continue;
      if (c === '-') ctx.clearRect(x, y, 1, 1);
      else R(ctx, x, y, 1, 1, c);
    }
  }
}

/** Ellipse with a 1px dark outline. */
export function odisc(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, c: string) {
  disc(ctx, cx, cy, rx + 1, ry + 1, 'k');
  disc(ctx, cx, cy, rx, ry, c);
}

export function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, c: string) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    R(ctx, x0, y0, 1, 1, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function shadow(ctx: Ctx, cx: number, bottom: number, rx: number) {
  ctx.globalAlpha = 0.35;
  disc(ctx, cx, bottom - 3, rx, 3, 'k');
  ctx.globalAlpha = 1;
}

/** A small desk most of the workstation props sit on. */
function desk(ctx: Ctx, w: number, h: number) {
  shadow(ctx, w / 2, h, w / 2 - 2);
  R(ctx, 2, h - 15, w - 4, 4, 'k');
  R(ctx, 3, h - 14, w - 6, 2, 'T');
  R(ctx, 4, h - 11, 3, 10, 'B');
  R(ctx, w - 7, h - 11, 3, 10, 'B');
}

/** Book spines with a repeatable pseudo-random mix. */
function books(ctx: Ctx, x0: number, x1: number, base: number, seed: number) {
  const cols = ['r', 'c', 'y', 'g', 'm', 'o', 'J', 'l', 'T'];
  let s = seed;
  for (let x = x0; x < x1; ) {
    s = (s * 9301 + 49297) % 233280;
    const w = 2 + (s % 2);
    const h = 8 + (s % 4);
    R(ctx, x, base - h, w, h, cols[s % cols.length]);
    R(ctx, x, base - h, w, 1, 'k');
    x += w + 1;
  }
}

const PROPS: Record<string, [number, number, (ctx: Ctx) => void]> = {
  // Airlock
  guide: [
    32,
    44,
    (ctx) => {
      // Floating guide droid; the scene adds its shadow and bob.
      line(ctx, 16, 20, 16, 9, 'k');
      odisc(ctx, 16, 7, 2.5, 2.5, 'r');
      R(ctx, 3, 26, 4, 9, 'k');
      R(ctx, 4, 27, 2, 7, 'n');
      R(ctx, 25, 26, 4, 9, 'k');
      R(ctx, 26, 27, 2, 7, 'n');
      odisc(ctx, 16, 29, 10, 10, 'l');
      disc(ctx, 13, 25, 4, 3, 'W');
      R(ctx, 8, 28, 16, 5, 'k');
      R(ctx, 12, 29, 8, 3, 'c');
      R(ctx, 13, 30, 2, 1, 'w');
      R(ctx, 12, 39, 8, 3, 'k');
      R(ctx, 14, 42, 4, 1, 'o');
    },
  ],
  directory: [
    32,
    56,
    (ctx) => {
      shadow(ctx, 16, 56, 12);
      // Projector base
      R(ctx, 7, 44, 18, 11, 'k');
      R(ctx, 8, 45, 16, 9, 'n');
      R(ctx, 8, 45, 16, 2, 'x');
      odisc(ctx, 16, 44, 10, 3, 'l');
      disc(ctx, 16, 43.5, 4, 1.5, 'c');
      // Hologram of the station
      ctx.globalAlpha = 0.45;
      for (let y = 14; y < 43; y++) {
        const half = 2 + ((43 - y) * 11) / 29;
        R(ctx, 16 - half, y, half * 2, 1, 'c');
      }
      ctx.globalAlpha = 1;
      for (const [x, y, w, h] of [
        [4, 16, 7, 6],
        [12, 12, 8, 6],
        [21, 15, 7, 7],
        [12, 22, 8, 7],
        [5, 25, 6, 5],
      ]) {
        R(ctx, x, y, w, h, 'c');
        R(ctx, x + 1, y + 1, w - 2, h - 2, 'J');
      }
      R(ctx, 15, 18, 2, 4, 'c');
      R(ctx, 11, 18, 1, 1, 'c');
      R(ctx, 20, 18, 1, 1, 'c');
      R(ctx, 15, 24, 1, 1, 'y');
    },
  ],
  about: [
    32,
    58,
    (ctx) => {
      shadow(ctx, 16, 58, 11);
      line(ctx, 9, 56, 13, 34, 'B');
      line(ctx, 23, 56, 19, 34, 'B');
      line(ctx, 16, 56, 16, 36, 'k');
      R(ctx, 3, 4, 26, 32, 'k');
      R(ctx, 4, 5, 24, 30, 'T');
      R(ctx, 6, 7, 20, 26, 'f');
      drawRows(ctx, HEAD_DOWN, 8, 9);
      drawRows(ctx, BODY_DOWN.slice(0, 6), 8, 18);
      R(ctx, 3, 36, 26, 2, 'B');
    },
  ],
  mailbox: [
    32,
    60,
    (ctx) => {
      shadow(ctx, 16, 60, 12);
      // Satellite dish over a comms console
      R(ctx, 15, 22, 3, 22, 'k');
      odisc(ctx, 15, 15, 12, 7, 'l');
      disc(ctx, 15, 15, 9, 5, 'W');
      disc(ctx, 13, 13, 4, 2, 'w');
      line(ctx, 15, 15, 25, 4, 'k');
      line(ctx, 16, 15, 26, 4, 'k');
      odisc(ctx, 26, 4, 2, 2, 'r');
      box(ctx, 4, 40, 24, 19, 'o');
      R(ctx, 5, 41, 22, 2, 'y');
      box(ctx, 8, 44, 16, 10, 'w');
      line(ctx, 9, 45, 16, 49, 'k');
      line(ctx, 22, 45, 16, 49, 'k');
      R(ctx, 6, 56, 3, 2, 'g');
    },
  ],
  // Navigation deck
  pathfinder: [
    32,
    48,
    (ctx) => {
      shadow(ctx, 16, 48, 13);
      R(ctx, 3, 30, 26, 17, 'k');
      R(ctx, 4, 31, 24, 15, 'n');
      R(ctx, 4, 31, 24, 3, 'x');
      for (let i = 0; i < 5; i++) R(ctx, 7 + i * 4, 38, 2, 2, ['r', 'y', 'g', 'c', 'm'][i]);
      odisc(ctx, 16, 17, 12, 12, 'G');
      disc(ctx, 16, 17, 8, 8, 'g');
      disc(ctx, 16, 17, 7, 7, 'G');
      disc(ctx, 16, 17, 4, 4, 'g');
      disc(ctx, 16, 17, 3, 3, 'G');
      R(ctx, 5, 17, 23, 1, 'g');
      R(ctx, 16, 6, 1, 23, 'g');
      R(ctx, 20, 12, 2, 2, 'y');
      R(ctx, 10, 21, 2, 2, 'o');
    },
  ],
  learn: [
    32,
    58,
    (ctx) => {
      shadow(ctx, 16, 58, 13);
      box(ctx, 2, 2, 28, 54, 'B');
      R(ctx, 4, 4, 24, 50, 'd');
      for (const [y, seed] of [
        [17, 3],
        [31, 11],
        [45, 29],
      ]) {
        books(ctx, 5, 27, y, seed);
        R(ctx, 3, y, 26, 2, 'T');
      }
      R(ctx, 3, 52, 26, 2, 'T');
    },
  ],
  // Workshop
  asciify: [
    32,
    52,
    (ctx) => {
      desk(ctx, 32, 52);
      R(ctx, 13, 33, 6, 4, 'x');
      R(ctx, 4, 8, 24, 26, 'k');
      R(ctx, 5, 9, 22, 24, 'l');
      [
        [4, 8],
        [27, 8],
        [4, 33],
        [27, 33],
      ].forEach(([x, y]) => ctx.clearRect(x, y, 1, 1));
      R(ctx, 7, 11, 18, 16, 'k');
      for (let y = 12; y < 26; y += 2) {
        for (let x = 8; x < 24; x++) if ((x * 7 + y * 3) % 5 < 3) R(ctx, x, y, 1, 1, 'g');
      }
      R(ctx, 8, 29, 3, 2, 'g');
      R(ctx, 22, 29, 3, 2, 'n');
    },
  ],
  markov: [
    32,
    54,
    (ctx) => {
      shadow(ctx, 16, 54, 13);
      // Teletype printing password candidates
      R(ctx, 9, 4, 14, 2, 'W');
      R(ctx, 8, 6, 16, 22, 'w');
      for (let y = 8; y < 27; y += 3) R(ctx, 10, y, 6 + ((y * 5) % 7), 1, 'x');
      R(ctx, 4, 26, 24, 5, 'k');
      R(ctx, 5, 27, 22, 3, 'd');
      box(ctx, 2, 30, 28, 24, 'n');
      R(ctx, 3, 31, 26, 3, 'x');
      for (const [y, x0] of [
        [38, 5],
        [42, 6],
        [46, 7],
      ]) {
        for (let x = x0; x < 27 - (x0 - 5); x += 3) R(ctx, x, y, 2, 2, 'l');
      }
      R(ctx, 10, 50, 12, 2, 'l');
    },
  ],
  desktopls: [
    32,
    52,
    (ctx) => {
      desk(ctx, 32, 52);
      R(ctx, 14, 31, 4, 6, 'x');
      R(ctx, 10, 36, 12, 2, 'x');
      box(ctx, 2, 10, 28, 22, 'J');
      for (const [x, y] of [
        [5, 13],
        [5, 19],
        [11, 13],
        [17, 13],
      ]) {
        R(ctx, x, y, 5, 4, 'y');
        R(ctx, x, y, 2, 1, 'o');
      }
      R(ctx, 3, 28, 26, 3, 'k');
      R(ctx, 4, 29, 3, 1, 'c');
    },
  ],
  // Training bay
  tecnokids: [
    32,
    58,
    (ctx) => {
      shadow(ctx, 16, 58, 13);
      R(ctx, 5, 34, 2, 22, 'x');
      R(ctx, 25, 34, 2, 22, 'x');
      R(ctx, 3, 55, 6, 2, 'k');
      R(ctx, 23, 55, 6, 2, 'k');
      box(ctx, 1, 4, 30, 30, 'w');
      R(ctx, 2, 5, 28, 1, 'l');
      // Scratch-style blocks
      R(ctx, 4, 8, 12, 4, 'o');
      R(ctx, 6, 13, 14, 4, 'c');
      R(ctx, 6, 18, 10, 4, 'm');
      R(ctx, 8, 23, 16, 4, 'y');
      R(ctx, 4, 28, 10, 3, 'g');
      R(ctx, 2, 34, 28, 2, 'l');
      R(ctx, 22, 33, 4, 1, 'r');
    },
  ],
  teaching: [
    32,
    50,
    (ctx) => {
      shadow(ctx, 16, 50, 13);
      box(ctx, 1, 6, 30, 28, 'T');
      R(ctx, 3, 8, 26, 24, 'G');
      // Chalk: a grid path and a little snake
      line(ctx, 5, 28, 10, 28, 'w');
      line(ctx, 10, 28, 10, 20, 'w');
      line(ctx, 10, 20, 18, 20, 'w');
      line(ctx, 18, 20, 18, 12, 'w');
      R(ctx, 17, 11, 3, 3, 'y');
      line(ctx, 21, 26, 26, 26, 'g');
      line(ctx, 26, 26, 26, 22, 'g');
      R(ctx, 26, 21, 2, 2, 'r');
      R(ctx, 1, 34, 30, 2, 'B');
      R(ctx, 6, 36, 3, 13, 'B');
      R(ctx, 23, 36, 3, 13, 'B');
    },
  ],
  // Security vault
  dvc: [
    32,
    50,
    (ctx) => {
      shadow(ctx, 16, 50, 14);
      const container = (x: number, y: number, w: number, h: number, c: string, rib: string) => {
        box(ctx, x, y, w, h, c);
        for (let i = x + 3; i < x + w - 2; i += 3) R(ctx, i, y + 2, 1, h - 4, rib);
        R(ctx, x, y, 2, 2, 'k');
        R(ctx, x + w - 2, y, 2, 2, 'k');
      };
      container(1, 31, 30, 18, 'r', 'Y');
      container(3, 14, 26, 17, 'J', 'j');
      R(ctx, 12, 20, 8, 5, 'w');
      R(ctx, 13, 22, 6, 1, 'k');
    },
  ],
  wpair: [
    32,
    50,
    (ctx) => {
      shadow(ctx, 16, 50, 10);
      odisc(ctx, 16, 46, 9, 2.5, 'n');
      R(ctx, 15, 22, 3, 24, 'k');
      R(ctx, 16, 22, 1, 23, 'x');
      // Headphones on the stand
      disc(ctx, 16, 22, 11, 10, 'k');
      disc(ctx, 16, 22, 9, 8, '-');
      ctx.clearRect(4, 22, 24, 12);
      box(ctx, 2, 18, 7, 12, 'r');
      box(ctx, 23, 18, 7, 12, 'r');
      R(ctx, 4, 20, 3, 8, 'm');
      R(ctx, 25, 20, 3, 8, 'm');
      // Bluetooth signal
      line(ctx, 25, 4, 28, 7, 'c');
      line(ctx, 28, 7, 25, 10, 'c');
      line(ctx, 22, 2, 27, 7, 'c');
      line(ctx, 27, 7, 22, 12, 'c');
    },
  ],
  safe: [
    64,
    50,
    (ctx) => {
      shadow(ctx, 32, 50, 28);
      box(ctx, 2, 2, 60, 46, 'n');
      R(ctx, 3, 3, 58, 2, 'x');
      odisc(ctx, 32, 25, 19, 19, 'l');
      disc(ctx, 32, 25, 15, 15, 'x');
      disc(ctx, 32, 25, 13, 13, 'l');
      for (let a = 0; a < 12; a++) {
        const t = (a / 12) * Math.PI * 2;
        R(ctx, 32 + Math.cos(t) * 17 - 1, 25 + Math.sin(t) * 17 - 1, 2, 2, 'k');
      }
      line(ctx, 22, 25, 42, 25, 'k');
      line(ctx, 32, 15, 32, 35, 'k');
      line(ctx, 25, 18, 39, 32, 'k');
      line(ctx, 39, 18, 25, 32, 'k');
      odisc(ctx, 32, 25, 3, 3, 'y');
      R(ctx, 54, 20, 4, 3, 'r');
    },
  ],
  'safe-open': [
    64,
    50,
    (ctx) => {
      shadow(ctx, 32, 50, 28);
      box(ctx, 2, 2, 60, 46, 'n');
      R(ctx, 3, 3, 58, 2, 'x');
      odisc(ctx, 32, 25, 19, 19, 'k');
      disc(ctx, 32, 25, 17, 17, 'd');
      R(ctx, 22, 30, 20, 2, 'x');
      odisc(ctx, 10, 25, 6, 19, 'l');
      disc(ctx, 10, 25, 4, 15, 'x');
      R(ctx, 54, 20, 4, 3, 'g');
    },
  ],
  trophies: [
    32,
    58,
    (ctx) => {
      shadow(ctx, 16, 58, 13);
      box(ctx, 2, 2, 28, 54, 'T');
      R(ctx, 4, 4, 24, 48, 'd');
      for (const y of [19, 35]) R(ctx, 3, y, 26, 2, 'T');
      // Cups and medals on the shelves
      const cup = (x: number, y: number) => {
        R(ctx, x, y - 9, 7, 4, 'y');
        R(ctx, x + 1, y - 5, 5, 1, 'y');
        R(ctx, x + 3, y - 4, 1, 2, 'y');
        R(ctx, x + 1, y - 2, 5, 2, 'Y');
      };
      cup(6, 19);
      cup(18, 19);
      odisc(ctx, 11, 29, 3, 3, 'y');
      R(ctx, 10, 23, 2, 3, 'r');
      R(ctx, 18, 27, 8, 6, 'w');
      R(ctx, 19, 29, 6, 1, 'x');
      cup(12, 51);
      ctx.globalAlpha = 0.35;
      line(ctx, 6, 50, 24, 6, 'w');
      ctx.globalAlpha = 1;
      R(ctx, 3, 52, 26, 2, 'T');
    },
  ],
  // Crew logs
  amvp: [
    32,
    44,
    (ctx) => {
      shadow(ctx, 16, 44, 14);
      ctx.globalAlpha = 0.5;
      for (let x = 5; x < 28; x += 3) R(ctx, x, 9, 1, 30, 'l');
      for (let y = 11; y < 39; y += 3) R(ctx, 4, y, 24, 1, 'l');
      ctx.globalAlpha = 1;
      R(ctx, 2, 6, 28, 3, 'w');
      R(ctx, 2, 6, 3, 34, 'w');
      R(ctx, 27, 6, 3, 34, 'w');
      odisc(ctx, 16, 36, 5, 5, 'w');
      R(ctx, 15, 34, 3, 3, 'k');
      R(ctx, 12, 37, 2, 2, 'k');
      R(ctx, 19, 37, 2, 2, 'k');
    },
  ],
  hospital: [
    32,
    58,
    (ctx) => {
      shadow(ctx, 16, 58, 10);
      R(ctx, 15, 26, 3, 28, 'x');
      R(ctx, 7, 53, 18, 2, 'k');
      R(ctx, 6, 55, 3, 3, 'k');
      R(ctx, 23, 55, 3, 3, 'k');
      box(ctx, 3, 6, 26, 20, 'G');
      // Heartbeat
      const beat = [17, 17, 17, 17, 14, 20, 10, 22, 17, 17, 17, 17, 15, 17, 17, 17, 17, 17, 14, 20, 10, 22, 17];
      beat.forEach((y, i) => R(ctx, 5 + i, y, 1, 1, 'g'));
      box(ctx, 21, 2, 9, 9, 'w');
      R(ctx, 24, 4, 3, 5, 'r');
      R(ctx, 23, 5, 5, 3, 'r');
    },
  ],
  iconic: [
    32,
    48,
    (ctx) => {
      desk(ctx, 32, 48);
      // Laptop and a plant
      box(ctx, 4, 18, 16, 12, 'k');
      R(ctx, 5, 19, 14, 10, 'J');
      R(ctx, 7, 21, 6, 1, 'w');
      R(ctx, 7, 23, 9, 1, 'c');
      R(ctx, 2, 30, 20, 3, 'l');
      box(ctx, 22, 25, 8, 8, 'o');
      disc(ctx, 26, 20, 5, 5, 'g');
      disc(ctx, 23, 17, 3, 3, 'g');
      disc(ctx, 28, 16, 2.5, 3, 'g');
    },
  ],
  ynet: [
    32,
    52,
    (ctx) => {
      shadow(ctx, 16, 52, 13);
      box(ctx, 2, 6, 28, 44, 'x');
      R(ctx, 4, 8, 24, 40, 'd');
      for (const y of [8, 22, 36]) {
        R(ctx, 5, y + 2, 22, 11, 'w');
        R(ctx, 5, y + 2, 22, 3, 'r');
        R(ctx, 7, y + 7, 9, 1, 'k');
        R(ctx, 7, y + 9, 14, 1, 'x');
        R(ctx, 18, y + 6, 7, 5, 'l');
        R(ctx, 3, y + 13, 26, 1, 'k');
      }
    },
  ],
  // Punto Medio core
  pmTable: [
    64,
    40,
    (ctx) => {
      shadow(ctx, 32, 40, 24);
      R(ctx, 25, 24, 14, 14, 'k');
      R(ctx, 26, 25, 12, 12, 'n');
      odisc(ctx, 32, 22, 27, 7, 'l');
      disc(ctx, 32, 22, 23, 5, 'c');
      disc(ctx, 32, 22, 21, 4, 'd');
      disc(ctx, 32, 21, 8, 2, 'J');
    },
  ],
  terraform: [
    64,
    44,
    (ctx) => {
      shadow(ctx, 32, 44, 26);
      line(ctx, 10, 30, 5, 42, 'B');
      line(ctx, 11, 30, 6, 42, 'B');
      line(ctx, 54, 30, 59, 42, 'B');
      line(ctx, 53, 30, 58, 42, 'B');
      R(ctx, 8, 36, 48, 2, 'B');
      // Drafting board with a blueprint
      box(ctx, 3, 6, 58, 26, 'j');
      for (let x = 7; x < 60; x += 5) R(ctx, x, 7, 1, 24, 'J');
      for (let y = 10; y < 31; y += 5) R(ctx, 4, y, 56, 1, 'J');
      R(ctx, 9, 11, 18, 14, 'w');
      R(ctx, 10, 12, 16, 12, 'j');
      R(ctx, 30, 13, 22, 1, 'w');
      R(ctx, 30, 17, 16, 1, 'w');
      R(ctx, 30, 21, 19, 1, 'w');
      R(ctx, 3, 31, 58, 2, 'T');
    },
  ],
  cognito: [
    32,
    52,
    (ctx) => {
      shadow(ctx, 16, 52, 9);
      box(ctx, 10, 22, 12, 29, 'n');
      R(ctx, 11, 23, 10, 2, 'x');
      R(ctx, 14, 30, 4, 4, 'g');
      box(ctx, 4, 2, 24, 22, 'l');
      R(ctx, 6, 4, 20, 17, 'k');
      // Fingerprint
      for (const r of [7, 5, 3]) {
        disc(ctx, 16, 13, r, r + 1, 'c');
        disc(ctx, 16, 13, r - 1, r, 'k');
      }
      R(ctx, 16, 12, 1, 3, 'c');
    },
  ],
  database: [
    64,
    66,
    (ctx) => {
      shadow(ctx, 32, 66, 30);
      R(ctx, 26, 30, 12, 5, 'k');
      R(ctx, 27, 31, 10, 3, 'x');
      for (const cx of [16, 48]) {
        R(ctx, cx - 13, 12, 26, 48, 'k');
        R(ctx, cx - 12, 12, 24, 47, 'l');
        R(ctx, cx - 12, 12, 5, 47, 'W');
        odisc(ctx, cx, 59, 12, 4, 'n');
        R(ctx, cx - 12, 54, 24, 5, 'n');
        for (const y of [24, 40]) R(ctx, cx - 12, y, 24, 2, 'n');
        odisc(ctx, cx, 12, 12, 4, 'W');
        disc(ctx, cx, 12, 6, 2, 'l');
        R(ctx, cx + 4, 30, 2, 2, 'g');
        R(ctx, cx + 4, 46, 2, 2, cx === 16 ? 'c' : 'o');
      }
    },
  ],
  // Arcade
  pokedex: [
    32,
    60,
    (ctx) => cabinet(ctx, 'r', 'j'),
  ],
  snakegame: [
    32,
    60,
    (ctx) => {
      cabinet(ctx, 'g', 'G');
      // A snake on screen
      R(ctx, 9, 21, 8, 2, 'g');
      R(ctx, 15, 17, 2, 6, 'g');
      R(ctx, 15, 17, 6, 2, 'g');
      R(ctx, 21, 17, 2, 2, 'y');
      R(ctx, 11, 16, 2, 2, 'r');
    },
  ],
  slots: [
    32,
    62,
    (ctx) => {
      shadow(ctx, 15, 62, 13);
      R(ctx, 28, 16, 2, 20, 'x');
      odisc(ctx, 29, 14, 2.5, 2.5, 'r');
      odisc(ctx, 14, 12, 12, 9, 'Y');
      box(ctx, 2, 12, 24, 48, 'y');
      for (let x = 4; x < 25; x += 4) R(ctx, x, 13, 2, 2, x % 8 ? 'r' : 'w');
      box(ctx, 4, 20, 20, 12, 'k');
      [
        ['r', 'y'],
        ['y', 'c'],
        ['m', 'r'],
      ].forEach(([a, b], i) => {
        R(ctx, 5 + i * 6, 21, 6, 10, 'w');
        R(ctx, 7 + i * 6, 23, 2, 2, a);
        R(ctx, 7 + i * 6, 27, 2, 2, b);
      });
      R(ctx, 4, 26, 20, 1, 'r');
      R(ctx, 6, 36, 16, 3, 'Y');
      box(ctx, 6, 48, 16, 6, 'k');
      R(ctx, 13, 42, 3, 2, 'k');
    },
  ],
  // Floor demos: the snake tank (board drawn by SnakeDemo) and the robot's mat
  tank: [
    160,
    128,
    (ctx) => {
      shadow(ctx, 80, 128, 74);
      R(ctx, 10, 112, 6, 14, 'k');
      R(ctx, 144, 112, 6, 14, 'k');
      R(ctx, 4, 2, 152, 112, 'k');
      R(ctx, 6, 4, 148, 108, 'x');
      R(ctx, 10, 8, 140, 100, 'J');
      R(ctx, 12, 10, 136, 96, 'k');
      // Gravel along the bottom of the glass
      for (let x = 12; x < 148; x += 3) R(ctx, x, 104 - ((x * 7) % 3), 2, 2, (x * 3) % 2 ? 'T' : 'B');
      R(ctx, 4, 2, 152, 5, 'l');
      R(ctx, 4, 2, 152, 1, 'W');
      for (const x of [8, 150]) for (const y of [5, 109]) R(ctx, x, y, 2, 2, 'W');
      for (const [x, y, r] of [
        [140, 30, 2],
        [143, 20, 1.5],
        [138, 12, 1],
      ]) {
        disc(ctx, x, y, r, r, 'c');
      }
      ctx.globalAlpha = 0.25;
      line(ctx, 18, 92, 40, 14, 'w');
      ctx.globalAlpha = 1;
    },
  ],
  mat: [
    128,
    96,
    (ctx) => {
      shadow(ctx, 64, 96, 60);
      R(ctx, 2, 2, 124, 90, 'k');
      R(ctx, 3, 3, 122, 88, 'J');
      R(ctx, 6, 6, 116, 82, 'f');
      // Track lane for the robot
      R(ctx, 10, 10, 108, 74, 'k');
      R(ctx, 12, 12, 104, 70, 'n');
      R(ctx, 24, 24, 80, 46, 'k');
      R(ctx, 25, 25, 78, 44, 'f');
      for (let x = 20; x < 110; x += 8) R(ctx, x, 17, 4, 1, 'y');
      for (let x = 20; x < 110; x += 8) R(ctx, x, 76, 4, 1, 'y');
      // Cones and a start line
      for (const [x, y] of [
        [34, 34],
        [90, 56],
      ]) {
        R(ctx, x, y + 6, 8, 2, 'k');
        R(ctx, x + 1, y + 3, 6, 3, 'o');
        R(ctx, x + 2, y, 4, 3, 'o');
        R(ctx, x + 2, y + 2, 4, 1, 'w');
      }
      for (let y = 12; y < 24; y += 2) R(ctx, 56 + ((y / 2) % 2) * 2, y, 2, 2, 'w');
    },
  ],
  // Auditorium
  nerdearla: [
    64,
    58,
    (ctx) => {
      shadow(ctx, 32, 58, 22);
      // Projection screen on a stand, showing the talk's point: skip the LLM, save the bill
      line(ctx, 32, 38, 32, 54, 'k');
      line(ctx, 32, 54, 22, 57, 'k');
      line(ctx, 32, 54, 42, 57, 'k');
      R(ctx, 0, 2, 64, 4, 'k');
      R(ctx, 1, 3, 62, 2, 'x');
      box(ctx, 2, 6, 60, 34, 'w');
      R(ctx, 3, 7, 58, 5, 'J');
      R(ctx, 6, 9, 22, 1, 'w');
      box(ctx, 8, 16, 16, 16, 'l');
      for (let i = 10; i < 24; i += 4) {
        R(ctx, i, 14, 2, 2, 'k');
        R(ctx, i, 32, 2, 2, 'k');
      }
      R(ctx, 12, 21, 8, 6, 'n');
      line(ctx, 6, 14, 26, 34, 'r');
      line(ctx, 7, 14, 27, 34, 'r');
      line(ctx, 26, 14, 6, 34, 'r');
      line(ctx, 27, 14, 7, 34, 'r');
      [14, 11, 8, 5].forEach((h, i) => R(ctx, 34 + i * 6, 34 - h * 1.4, 4, h * 1.4, 'g'));
      R(ctx, 33, 34, 26, 1, 'k');
    },
  ],
  ekoparty: [
    32,
    54,
    (ctx) => {
      shadow(ctx, 16, 54, 12);
      // Demo lectern: laptop running the scanner, a mic, a Bluetooth signal
      R(ctx, 5, 24, 22, 29, 'k');
      R(ctx, 6, 25, 20, 27, 'B');
      R(ctx, 8, 30, 16, 14, 'T');
      R(ctx, 10, 34, 12, 2, 'g');
      R(ctx, 3, 22, 26, 3, 'k');
      R(ctx, 4, 22, 24, 2, 'T');
      box(ctx, 8, 10, 16, 12, 'k');
      R(ctx, 9, 11, 14, 9, 'G');
      for (let y = 12; y < 19; y += 2) R(ctx, 10, y, 4 + ((y * 5) % 8), 1, 'g');
      R(ctx, 6, 20, 20, 2, 'l');
      line(ctx, 26, 22, 28, 12, 'k');
      R(ctx, 27, 9, 3, 4, 'x');
      line(ctx, 3, 6, 6, 9, 'c');
      line(ctx, 6, 9, 3, 12, 'c');
      line(ctx, 1, 3, 5, 8, 'c');
    },
  ],
  'badge-nerdearla': [12, 18, (ctx) => badge(ctx, 'm', 'c')],
  'badge-ekoparty': [12, 18, (ctx) => badge(ctx, 'g', 'y')],
  // Workshop and Training bay games
  chromle: [
    64,
    44,
    (ctx) => {
      desk(ctx, 64, 44);
      ['r', 'o', 'y', 'g', 'c', 'm'].forEach((c, i) => {
        const x = 5 + i * 9;
        box(ctx, x, 16, 8, 14, c);
        R(ctx, x, 14, 8, 3, 'l');
        R(ctx, x + 1, 13, 6, 1, 'k');
        R(ctx, x + 2, 30, 2, 1 + (i % 3), c);
      });
    },
  ],
  simon: [
    64,
    40,
    (ctx) => {
      shadow(ctx, 32, 40, 28);
      disc(ctx, 32, 22, 29, 16, 'k');
      const colors = ['c', 'm', 'y', 'g'];
      for (let y = 7; y < 38; y++) {
        for (let x = 4; x < 61; x++) {
          const dx = (x + 0.5 - 32) / 27;
          const dy = (y + 0.5 - 22) / 14;
          if (dx * dx + dy * dy > 1 || Math.abs(x + 0.5 - 32) < 1.5 || Math.abs(y + 0.5 - 22) < 1.5) continue;
          R(ctx, x, y, 1, 1, colors[(x < 32 ? 0 : 1) + (y < 22 ? 0 : 2)]);
        }
      }
      odisc(ctx, 32, 22, 8, 5, 'n');
      disc(ctx, 32, 21, 4, 2, 'x');
    },
  ],
};

/** A speaker badge on a lanyard. */
function badge(ctx: Ctx, strap: string, accent: string) {
  line(ctx, 2, 0, 5, 6, strap);
  line(ctx, 9, 0, 6, 6, strap);
  box(ctx, 1, 6, 10, 12, 'w');
  R(ctx, 2, 7, 8, 3, accent);
  R(ctx, 3, 11, 3, 3, 'h');
  R(ctx, 7, 12, 3, 1, 'k');
  R(ctx, 3, 15, 6, 1, 'x');
}

/** Arcade cabinet front: marquee, screen, controls, coin door. */
function cabinet(ctx: Ctx, body: string, screen: string) {
  shadow(ctx, 16, 60, 13);
  box(ctx, 3, 2, 26, 57, body);
  R(ctx, 4, 3, 2, 55, 'k');
  R(ctx, 26, 3, 2, 55, 'k');
  box(ctx, 6, 4, 20, 8, 'y');
  R(ctx, 8, 7, 16, 2, 'o');
  box(ctx, 6, 13, 20, 16, 'k');
  R(ctx, 8, 15, 16, 12, screen);
  R(ctx, 2, 30, 28, 7, 'k');
  R(ctx, 3, 31, 26, 5, 'n');
  R(ctx, 9, 26, 2, 6, 'k');
  odisc(ctx, 10, 25, 2, 2, 'r');
  R(ctx, 16, 32, 3, 2, 'c');
  R(ctx, 21, 32, 3, 2, 'm');
  box(ctx, 11, 42, 10, 10, 'n');
  R(ctx, 15, 45, 2, 4, 'o');
}

export function makeProps(scene: Phaser.Scene) {
  for (const [id, [w, h, draw]] of Object.entries(PROPS)) canvas(scene, `prop-${id}`, w, h, draw);
  // Round pedestal the pickups float over, neutral enough for any floor
  canvas(scene, 'pedestal', 26, 14, (ctx) => {
    ctx.globalAlpha = 0.35;
    disc(ctx, 13, 9, 12, 4, 'k');
    ctx.globalAlpha = 1;
    odisc(ctx, 13, 7, 10, 4, 'x');
    disc(ctx, 13, 6, 8, 3, 'l');
    disc(ctx, 13, 6, 5, 2, 'W');
  });
  canvas(scene, 'prop-shadow', 24, 6, (ctx) => {
    ctx.globalAlpha = 0.35;
    disc(ctx, 12, 3, 11, 3, 'k');
  });
  // Radar sweep for the Pathfinder helm: a fading wedge from the centre.
  canvas(scene, 'radar-sweep', 24, 24, (ctx) => {
    for (let i = 0; i < 10; i++) {
      ctx.globalAlpha = 0.9 - i * 0.08;
      const t = -i * 0.07;
      line(ctx, 12, 12, Math.round(12 + Math.cos(t) * 11), Math.round(12 + Math.sin(t) * 11), 'g');
    }
  });
}

/** Whether an object has a custom prop texture. */
export const hasProp = (scene: Phaser.Scene, id: string) => scene.textures.exists(`prop-${id}`);
