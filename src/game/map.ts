import type { ItemId, ObjectId, RoomId } from '../content/types';

export const TILE = 32;
export const MAP_W = 44;
export const MAP_H = 26;

type Zone = 'blue' | 'red';

interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
  zone: Zone;
  room: RoomId;
}

/** Floor areas. Everything else is open space. */
const AREAS: Area[] = [
  { x: 4, y: 7, w: 12, h: 10, zone: 'blue', room: 'hub' },
  { x: 9, y: 3, w: 2, h: 4, zone: 'blue', room: 'hub' }, // to Navigation
  { x: 1, y: 11, w: 3, h: 2, zone: 'blue', room: 'hub' }, // to Arcade
  { x: 9, y: 17, w: 2, h: 4, zone: 'blue', room: 'hub' }, // to Vault
  { x: 16, y: 11, w: 6, h: 2, zone: 'blue', room: 'corridor' },
  { x: 22, y: 3, w: 20, h: 17, zone: 'red', room: 'core' },
  { x: 30, y: 20, w: 2, h: 3, zone: 'red', room: 'core' }, // to Crew logs
];

export const SPAWN = { x: 10, y: 12 };

export type Sprite =
  | { kind: 'machine'; icon: string; face: 'plain' | 'console' | 'server' }
  | { kind: 'image'; key: string; dx?: number; dy?: number; angle?: number }
  | { kind: 'table'; overlay: 'holo' | 'blueprint' };

export interface StationObject {
  id: ObjectId;
  x: number;
  y: number;
  w: number;
  h: number;
  sprite: Sprite;
  label?: boolean;
}

const machine = (id: ObjectId, x: number, y: number, face: 'plain' | 'console' | 'server' = 'console', h = 1): StationObject => ({
  id,
  x,
  y,
  w: 1,
  h,
  sprite: { kind: 'machine', icon: id, face },
  label: true,
});

export const PIPELINE: ObjectId[] = ['eventbridge', 'sqs', 'lambda', 'clusters', 'llm', 'evals', 'wikidata', 'media', 'web'];
export const PIPE_Y = 3;
export const BELT_Y = 4;
export const BELT_X0 = 23;
export const BELT_X1 = 40;

export const OBJECTS: StationObject[] = [
  // Airlock
  machine('guide', 5, 7, 'console'),
  machine('directory', 7, 7, 'plain'),
  machine('about', 13, 7, 'server'),
  { id: 'mailbox', x: 13, y: 14, w: 1, h: 1, sprite: { kind: 'image', key: 'comms' }, label: true },
  { id: 'doorNav', x: 9, y: 3, w: 2, h: 1, sprite: { kind: 'image', key: 'door' }, label: true },
  { id: 'doorArcade', x: 1, y: 11, w: 1, h: 2, sprite: { kind: 'image', key: 'door', angle: 90 }, label: true },
  { id: 'doorVault', x: 9, y: 20, w: 2, h: 1, sprite: { kind: 'image', key: 'door' }, label: true },
  // Punto Medio core: the pipeline runs along the north wall, the belt is part of each machine's footprint
  ...PIPELINE.map((id, i) => machine(id, BELT_X0 + i * 2, PIPE_Y, i % 2 ? 'server' : 'console', 2)),
  { id: 'pmTable', x: 31, y: 9, w: 2, h: 1, sprite: { kind: 'table', overlay: 'holo' }, label: true },
  { id: 'terraform', x: 25, y: 14, w: 2, h: 1, sprite: { kind: 'table', overlay: 'blueprint' }, label: true },
  { id: 'cognito', x: 38, y: 13, w: 1, h: 1, sprite: { kind: 'image', key: 'pillar' }, label: true },
  { id: 'database', x: 34, y: 16, w: 2, h: 2, sprite: { kind: 'image', key: 'database' }, label: true },
  { id: 'doorLogs', x: 30, y: 22, w: 2, h: 1, sprite: { kind: 'image', key: 'door' }, label: true },
];

export interface Pickup {
  id: ItemId;
  x: number;
  y: number;
  key: string;
}

export const PICKUPS: Pickup[] = [
  { id: 'berkeley', x: 6, y: 14, key: 'trophy' },
  { id: 'keycard', x: 40, y: 18, key: 'keycard' },
];

// ---------- Grid ----------

export const floor: boolean[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));
const zoneAt: (Zone | null)[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(null));
const roomAt: (RoomId | null)[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(null));

for (const a of AREAS) {
  for (let y = a.y; y < a.y + a.h; y++) {
    for (let x = a.x; x < a.x + a.w; x++) {
      floor[y][x] = true;
      zoneAt[y][x] = a.zone;
      roomAt[y][x] = a.room;
    }
  }
}

export const isFloor = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && floor[y][x];
export const roomOf = (x: number, y: number): RoomId | null => (isFloor(x, y) ? roomAt[y][x] : null);

/** Solid = not floor, or covered by an object's footprint. */
export const solid: boolean[][] = floor.map((row) => row.map((f) => !f));
export const objectAt: (StationObject | null)[][] = floor.map((row) => row.map(() => null));
for (const o of OBJECTS) {
  for (let y = o.y; y < o.y + o.h; y++) {
    for (let x = o.x; x < o.x + o.w; x++) {
      solid[y][x] = true;
      objectAt[y][x] = o;
    }
  }
}
// The belt between machines is solid too.
for (let x = BELT_X0; x <= BELT_X1; x++) solid[BELT_Y][x] = true;

export const isWalkable = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && !solid[y][x];

// ---------- Autotiling against the 32px CC0 sheet (14 columns) ----------

const SET: Record<Zone, Record<string, number>> = {
  blue: { TL: 5, T: 6, TR: 7, L: 19, C: 20, R: 21, BL: 33, B: 34, BR: 35, V: 18, H: 32, SE: 8, SW: 9, NE: 22, NW: 23 },
  red: { TL: 47, T: 48, TR: 49, L: 61, C: 20, R: 63, BL: 75, B: 76, BR: 77, V: 60, H: 74, SE: 50, SW: 51, NE: 64, NW: 65 },
};

export function tileData(): number[][] {
  return floor.map((row, y) =>
    row.map((f, x) => {
      if (!f) return -1;
      const t = SET[zoneAt[y][x]!];
      const n = isFloor(x, y - 1);
      const s = isFloor(x, y + 1);
      const w = isFloor(x - 1, y);
      const e = isFloor(x + 1, y);
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
      if (!isFloor(x + 1, y + 1)) return t.SE;
      if (!isFloor(x - 1, y + 1)) return t.SW;
      if (!isFloor(x + 1, y - 1)) return t.NE;
      if (!isFloor(x - 1, y - 1)) return t.NW;
      return t.C;
    }),
  );
}
