// Repaints the "floor" tile layer of a Tiled map from its "rooms" object layer.
//
// In Tiled you only draw rectangles on the "rooms" layer (class "room" or "corridor",
// with a "zone" property of "blue" or "red"); this script picks the right edge, corner
// and corridor tile for every cell so the hazard borders always line up.
//
// Usage: node scripts/autotile.mjs [path/to/map.tmj]
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2] ?? 'public/assets/maps/station.tmj';
const map = JSON.parse(readFileSync(file, 'utf8'));
const { width: W, height: H, tilewidth: T } = map;
const firstgid = map.tilesets[0].firstgid;

// Tile indices (0-based) in the 14-column CC0 sheet.
const SET = {
  blue: { TL: 5, T: 6, TR: 7, L: 19, C: 20, R: 21, BL: 33, B: 34, BR: 35, V: 18, H: 32, SE: 8, SW: 9, NE: 22, NW: 23 },
  red: { TL: 47, T: 48, TR: 49, L: 61, C: 20, R: 63, BL: 75, B: 76, BR: 77, V: 60, H: 74, SE: 50, SW: 51, NE: 64, NW: 65 },
};

const zone = Array.from({ length: H }, () => Array(W).fill(null));
const rooms = map.layers.find((l) => l.name === 'rooms');
for (const o of rooms.objects) {
  const z = o.properties?.find((p) => p.name === 'zone')?.value ?? 'blue';
  for (let y = Math.round(o.y / T); y < Math.round((o.y + o.height) / T); y++) {
    for (let x = Math.round(o.x / T); x < Math.round((o.x + o.width) / T); x++) {
      if (y >= 0 && x >= 0 && y < H && x < W) zone[y][x] = z;
    }
  }
}

const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && zone[y][x] !== null;

function pick(x, y) {
  const t = SET[zone[y][x]];
  const n = on(x, y - 1);
  const s = on(x, y + 1);
  const w = on(x - 1, y);
  const e = on(x + 1, y);
  if (!n && !s) return t.H;
  if (!w && !e) return t.V;
  if (!n && !w) return t.TL;
  if (!n && !e) return t.TR;
  if (!s && !w) return t.BL;
  if (!s && !e) return t.BR;
  if (!n) return t.T;
  if (!s) return t.B;
  if (!w) return t.L;
  if (!e) return t.R;
  if (!on(x + 1, y + 1)) return t.SE;
  if (!on(x - 1, y + 1)) return t.SW;
  if (!on(x + 1, y - 1)) return t.NE;
  if (!on(x - 1, y - 1)) return t.NW;
  return t.C;
}

const data = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) data.push(on(x, y) ? pick(x, y) + firstgid : 0);

const floor = map.layers.find((l) => l.name === 'floor');
floor.data = data;
writeFileSync(file, JSON.stringify(map, null, 1) + '\n');
console.log(`autotiled ${file}: ${data.filter(Boolean).length} floor tiles`);
