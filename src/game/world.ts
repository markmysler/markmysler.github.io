import type { ItemId, ObjectId, RoomId } from '../content/types';

export const TILE = 32;

/** The subset of the Tiled JSON format the station uses. */
interface TiledProperty {
  name: string;
  value: string | number | boolean;
}
interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  point?: boolean;
  properties?: TiledProperty[];
}
interface TiledLayer {
  name: string;
  type: 'tilelayer' | 'objectgroup';
  data?: number[];
  objects?: TiledObject[];
}
export interface TiledMap {
  width: number;
  height: number;
  layers: TiledLayer[];
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Sprite =
  | { kind: 'machine'; icon: string; face: string }
  | { kind: 'prop'; key: string }
  | { kind: 'demo'; demo: string };

/** Anything with a footprint on the grid: machines, props and demos. In tiles. */
export interface StationObject extends Rect {
  id: ObjectId;
  sprite: Sprite;
  solid: boolean;
  /** Whether the player can walk up to it and press E. */
  interactive: boolean;
}

export interface Pickup {
  id: ItemId;
  x: number;
  y: number;
  key: string;
}

export interface Room extends Rect {
  id: RoomId;
}

/** Decoration painted on the floor (a carpet runner, cable trays, seats). Walkable unless solid. */
export interface Decor extends Rect {
  kind: string;
  solid: boolean;
}

export interface World {
  w: number;
  h: number;
  /** Raw tile layer data (Tiled gids, 0 = empty) for Phaser. */
  tiles: number[][];
  floor: boolean[][];
  /** One entry per room: the bounding box of all its rectangles. */
  rooms: Room[];
  corridors: Rect[];
  objects: StationObject[];
  pickups: Pickup[];
  spawn: { x: number; y: number };
  belt: Rect;
  decor: Decor[];
  solid: boolean[][];
  objectAt: (StationObject | null)[][];
  roomAt: (RoomId | null)[][];
  isFloor(x: number, y: number): boolean;
  isWalkable(x: number, y: number): boolean;
}

const prop = (o: TiledObject, name: string) => o.properties?.find((p) => p.name === name)?.value;
const toTiles = (o: TiledObject): Rect => ({
  x: Math.round(o.x / TILE),
  y: Math.round(o.y / TILE),
  w: Math.max(1, Math.round(o.width / TILE)),
  h: Math.max(1, Math.round(o.height / TILE)),
});

export function buildWorld(map: TiledMap): World {
  const { width: w, height: h } = map;
  const layer = (name: string) => {
    const l = map.layers.find((x) => x.name === name);
    if (!l) throw new Error(`station.tmj has no "${name}" layer`);
    return l;
  };
  const grid = <T>(v: T) => Array.from({ length: h }, () => Array<T>(w).fill(v));

  const data = layer('floor').data!;
  const tiles = grid(0).map((row, y) => row.map((_, x) => data[y * w + x]));
  const floor = tiles.map((row) => row.map((g) => g > 0));
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;

  // A room can be several rectangles with the same name, which gives it a non-rectangular shape.
  const boxes = new Map<RoomId, Rect>();
  const corridors: Rect[] = [];
  const roomAt = grid<RoomId | null>(null);
  for (const o of layer('rooms').objects!) {
    const r = toTiles(o);
    const id = (o.type === 'corridor' ? 'corridor' : o.name) as RoomId;
    if (o.type === 'corridor') corridors.push(r);
    else {
      const b = boxes.get(id);
      if (!b) boxes.set(id, { ...r });
      else {
        const x1 = Math.max(b.x + b.w, r.x + r.w);
        const y1 = Math.max(b.y + b.h, r.y + r.h);
        b.x = Math.min(b.x, r.x);
        b.y = Math.min(b.y, r.y);
        b.w = x1 - b.x;
        b.h = y1 - b.y;
      }
    }
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (inside(x, y)) roomAt[y][x] = id;
  }
  const rooms: Room[] = [...boxes].map(([id, b]) => ({ ...b, id }));

  const objects: StationObject[] = [];
  const pickups: Pickup[] = [];
  let spawn = { x: Math.floor(w / 2), y: Math.floor(h / 2) };
  let belt: Rect = { x: 0, y: 0, w: 0, h: 0 };
  const decor: Decor[] = [];

  for (const o of layer('objects').objects!) {
    const r = toTiles(o);
    switch (o.type) {
      case 'spawn':
        spawn = { x: Math.floor(o.x / TILE), y: Math.floor(o.y / TILE) };
        break;
      case 'belt':
        belt = r;
        break;
      case 'decor':
        decor.push({ ...r, kind: String(prop(o, 'kind') ?? o.name), solid: prop(o, 'solid') === true });
        break;
      case 'pickup':
        pickups.push({ id: o.name as ItemId, x: r.x, y: r.y, key: String(prop(o, 'key')) });
        break;
      case 'machine':
        objects.push({ ...r, id: o.name as ObjectId, solid: true, interactive: true, sprite: { kind: 'machine', icon: String(prop(o, 'icon') ?? o.name), face: String(prop(o, 'face') ?? 'console') } });
        break;
      case 'prop':
        // Drawn with the texture prop-<key>, where key defaults to the object's name.
        objects.push({ ...r, id: o.name as ObjectId, solid: true, interactive: true, sprite: { kind: 'prop', key: `prop-${prop(o, 'key') ?? o.name}` } });
        break;
      case 'demo': {
        const solid = prop(o, 'solid') === true;
        objects.push({ ...r, id: o.name as ObjectId, solid, interactive: solid, sprite: { kind: 'demo', demo: String(prop(o, 'demo')) } });
        break;
      }
    }
  }

  const solid = floor.map((row) => row.map((f) => !f));
  const objectAt = grid<StationObject | null>(null);
  for (const o of objects) {
    if (!o.solid) continue;
    for (let y = o.y; y < o.y + o.h; y++) {
      for (let x = o.x; x < o.x + o.w; x++) {
        if (!inside(x, y)) continue;
        solid[y][x] = true;
        if (o.interactive) objectAt[y][x] = o;
      }
    }
  }
  for (const d of decor) {
    if (!d.solid) continue;
    for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) if (inside(x, y)) solid[y][x] = true;
  }
  for (let x = belt.x; x < belt.x + belt.w; x++) for (let y = belt.y; y < belt.y + belt.h; y++) if (inside(x, y)) solid[y][x] = true;

  return {
    w,
    h,
    tiles,
    floor,
    rooms,
    corridors,
    objects,
    pickups,
    spawn,
    belt,
    decor,
    solid,
    objectAt,
    roomAt,
    isFloor: (x, y) => inside(x, y) && floor[y][x],
    isWalkable: (x, y) => inside(x, y) && !solid[y][x],
  };
}
