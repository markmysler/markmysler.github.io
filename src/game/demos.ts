import Phaser from 'phaser';
import { COLORS } from './sprites';

export interface Demo {
  update(dt: number): void;
  setMotion(on: boolean): void;
  setLang(text: DemoText): void;
}

export interface DemoText {
  nodes: string;
  generation: (gen: number, best: number) => string;
}

const label = (scene: Phaser.Scene, x: number, y: number, depth: number) =>
  scene.add
    .text(x, y, '', { fontFamily: 'Silkscreen', fontSize: '8px', color: '#d3e9e1', stroke: '#1f1d2c', strokeThickness: 3, resolution: 4 })
    .setOrigin(0.5, 0)
    .setDepth(depth);

// ---------- Navigation deck: BFS vs Dijkstra vs A* ----------

type Algo = 'BFS' | 'Dijkstra' | 'A*';
const ALGOS: Algo[] = ['BFS', 'Dijkstra', 'A*'];
const ALGO_COLORS = [COLORS.cyan, COLORS.magenta, COLORS.orange];
const COLS = 15;
const ROWS = 18;
const CELL = 8;
const HEAVY = 5;

interface Race {
  algo: Algo;
  steps: Generator<number, number[] | null>;
  visited: number;
  path: number[] | null;
  done: boolean;
  overlay: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  ox: number;
  oy: number;
}

/** One expansion per `next()`, yielding the expanded cell; returns the path (or null). */
function* search(algo: Algo, cost: number[], start: number, goal: number): Generator<number, number[] | null> {
  const g = new Map<number, number>([[start, 0]]);
  const parent = new Map<number, number>();
  const closed = new Set<number>();
  const h = (i: number) => (algo === 'A*' ? Math.abs((i % COLS) - (goal % COLS)) + Math.abs(Math.floor(i / COLS) - Math.floor(goal / COLS)) : 0);
  let open: { i: number; f: number; order: number }[] = [{ i: start, f: h(start), order: 0 }];
  let order = 0;
  while (open.length) {
    // BFS is first-in first-out; the others take the cheapest frontier cell.
    if (algo !== 'BFS') open.sort((a, b) => a.f - b.f || a.order - b.order);
    const cur = open.shift()!;
    if (closed.has(cur.i)) continue;
    closed.add(cur.i);
    yield cur.i;
    if (cur.i === goal) {
      const path = [goal];
      while (path[0] !== start) path.unshift(parent.get(path[0])!);
      return path;
    }
    const x = cur.i % COLS;
    const y = Math.floor(cur.i / COLS);
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const n = ny * COLS + nx;
      if (cost[n] === 0 || closed.has(n)) continue;
      const ng = g.get(cur.i)! + (algo === 'BFS' ? 1 : cost[n]);
      if (algo === 'BFS' ? g.has(n) : ng >= (g.get(n) ?? Infinity)) continue;
      g.set(n, ng);
      parent.set(n, cur.i);
      open.push({ i: n, f: ng + h(n), order: order++ });
    }
  }
  return null;
}

export class RaceDemo implements Demo {
  private races: Race[] = [];
  private board: Phaser.GameObjects.Graphics;
  private cost: number[] = [];
  private seed = 1;
  private tick = 0;
  private pause = 0;
  private motion = true;
  private text: DemoText;

  constructor(scene: Phaser.Scene, x: number, y: number, text: DemoText) {
    this.text = text;
    this.board = scene.add.graphics().setDepth(-3);
    ALGOS.forEach((algo, i) => {
      const ox = x + i * (COLS * CELL + 8) + 4;
      const oy = y + 4;
      this.races.push({
        algo,
        ox,
        oy,
        steps: search(algo, [], 0, 0),
        visited: 0,
        path: null,
        done: true,
        overlay: scene.add.graphics().setDepth(-2),
        text: label(scene, ox + (COLS * CELL) / 2, oy + ROWS * CELL + 2, -1),
      });
    });
    this.reset();
  }

  private reset() {
    const rng = new Phaser.Math.RandomDataGenerator([`race-${this.seed++}`]);
    const start = 0;
    const goal = COLS * ROWS - 1;
    do {
      this.cost = Array.from({ length: COLS * ROWS }, () => (rng.frac() < 0.2 ? 0 : rng.frac() < 0.3 ? HEAVY : 1));
      this.cost[start] = 1;
      this.cost[goal] = 1;
    } while (!this.reachable(start, goal));

    this.board.clear();
    for (const r of this.races) {
      this.board.fillStyle(COLORS.void, 0.9).fillRect(r.ox - 3, r.oy - 3, COLS * CELL + 6, ROWS * CELL + 6);
      this.cost.forEach((c, i) => {
        if (!c) return;
        this.board.fillStyle(c === HEAVY ? COLORS.deep : COLORS.hull, 1);
        this.board.fillRect(r.ox + (i % COLS) * CELL, r.oy + Math.floor(i / COLS) * CELL, CELL - 1, CELL - 1);
      });
      this.board.fillStyle(COLORS.green, 1).fillRect(r.ox, r.oy, CELL - 1, CELL - 1);
      this.board.fillStyle(COLORS.red, 1).fillRect(r.ox + (COLS - 1) * CELL, r.oy + (ROWS - 1) * CELL, CELL - 1, CELL - 1);
      r.overlay.clear();
      r.steps = search(r.algo, this.cost, start, goal);
      r.visited = 0;
      r.path = null;
      r.done = false;
      this.label(r);
    }
    if (!this.motion) this.finishAll();
  }

  private reachable(start: number, goal: number) {
    const it = search('BFS', this.cost, start, goal);
    let res = it.next();
    while (!res.done) res = it.next();
    return res.value !== null;
  }

  private step(r: Race, i: number) {
    const res = r.steps.next();
    if (res.done) {
      r.done = true;
      r.path = res.value;
      r.overlay.fillStyle(COLORS.yellow, 1);
      for (const c of r.path ?? []) r.overlay.fillRect(r.ox + (c % COLS) * CELL + 2, r.oy + Math.floor(c / COLS) * CELL + 2, CELL - 5, CELL - 5);
      this.label(r);
      return;
    }
    r.visited++;
    r.overlay.fillStyle(ALGO_COLORS[i], 0.55).fillRect(r.ox + (res.value % COLS) * CELL, r.oy + Math.floor(res.value / COLS) * CELL, CELL - 1, CELL - 1);
    if (r.visited % 5 === 0) this.label(r);
  }

  private label(r: Race) {
    const cost = r.path ? ` · ${r.path.slice(1).reduce((s, c) => s + this.cost[c], 0)}` : '';
    r.text.setText(`${r.algo} · ${r.visited} ${this.text.nodes}${cost}`);
  }

  private finishAll() {
    this.races.forEach((r, i) => {
      while (!r.done) this.step(r, i);
    });
  }

  update(dt: number) {
    if (!this.motion) return;
    if (this.races.every((r) => r.done)) {
      this.pause += dt;
      if (this.pause > 3) {
        this.pause = 0;
        this.reset();
      }
      return;
    }
    this.tick += dt;
    while (this.tick > 0.03) {
      this.tick -= 0.03;
      this.races.forEach((r, i) => !r.done && this.step(r, i));
    }
  }

  setMotion(on: boolean) {
    this.motion = on;
    if (!on) this.finishAll();
  }

  setLang(text: DemoText) {
    this.text = text;
    this.races.forEach((r) => this.label(r));
  }
}

// ---------- Arcade: a snake that gets less random every generation ----------

const SW = 16;
const SH = 11;
const SC = 8;

export class SnakeDemo implements Demo {
  private g: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private snake: { x: number; y: number }[] = [];
  private dir = { x: 1, y: 0 };
  private apple = { x: 0, y: 0 };
  private gen = 1;
  private best = 0;
  private hunger = 0;
  private tick = 0;
  private motion = true;
  private rng = new Phaser.Math.RandomDataGenerator(['snake']);
  private ox: number;
  private oy: number;
  private strings: DemoText;

  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: DemoText) {
    this.strings = text;
    this.ox = x + Math.floor((w - SW * SC) / 2);
    this.oy = y + 12;
    const depth = y + h;
    scene.add.image(x + w / 2, y + h, 'prop-tank').setOrigin(0.5, 1).setDepth(depth - 1);
    this.g = scene.add.graphics().setDepth(depth);
    this.text = label(scene, x + w / 2, this.oy + SH * SC + 1, depth + 1);
    this.restart();
  }

  private restart() {
    this.snake = [
      { x: 5, y: 6 },
      { x: 4, y: 6 },
      { x: 3, y: 6 },
    ];
    this.dir = { x: 1, y: 0 };
    this.hunger = 0;
    this.placeApple();
    this.text.setText(this.strings.generation(this.gen, this.best));
  }

  private placeApple() {
    do {
      this.apple = { x: this.rng.between(0, SW - 1), y: this.rng.between(0, SH - 1) };
    } while (this.snake.some((s) => s.x === this.apple.x && s.y === this.apple.y));
  }

  private blocked(x: number, y: number, body = this.snake) {
    return x < 0 || y < 0 || x >= SW || y >= SH || body.slice(0, -1).some((s) => s.x === x && s.y === y);
  }

  /** Cells reachable from (x, y) after moving there: a cheap "will I trap myself" check. */
  private room(x: number, y: number) {
    const body = [{ x, y }, ...this.snake.slice(0, -1)];
    const seen = new Set([`${x},${y}`]);
    const stack = [{ x, y }];
    while (stack.length && seen.size < this.snake.length + 4) {
      const c = stack.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { x: c.x + dx, y: c.y + dy };
        const k = `${n.x},${n.y}`;
        if (seen.has(k) || this.blocked(n.x, n.y, body)) continue;
        seen.add(k);
        stack.push(n);
      }
    }
    return seen.size;
  }

  private step() {
    const head = this.snake[0];
    const moves = [this.dir, { x: this.dir.y, y: -this.dir.x }, { x: -this.dir.y, y: this.dir.x }];
    const safe = moves.filter((m) => !this.blocked(head.x + m.x, head.y + m.y));
    const epsilon = Math.max(0.02, 0.35 * 0.8 ** (this.gen - 1));
    let move = safe[0];
    if (safe.length && this.rng.frac() < epsilon) {
      move = this.rng.pick(safe);
    } else if (safe.length) {
      const score = (m: { x: number; y: number }) => {
        const nx = head.x + m.x;
        const ny = head.y + m.y;
        const trapped = this.room(nx, ny) < this.snake.length ? 100 : 0;
        return trapped + Math.abs(nx - this.apple.x) + Math.abs(ny - this.apple.y);
      };
      move = safe.reduce((a, b) => (score(b) < score(a) ? b : a));
    }
    this.hunger++;
    if (!move || this.hunger > 250) {
      this.best = Math.max(this.best, this.snake.length - 3);
      this.gen++;
      this.restart();
      return;
    }
    this.dir = move;
    const next = { x: head.x + move.x, y: head.y + move.y };
    this.snake.unshift(next);
    if (next.x === this.apple.x && next.y === this.apple.y) {
      this.hunger = 0;
      this.best = Math.max(this.best, this.snake.length - 3);
      this.text.setText(this.strings.generation(this.gen, this.best));
      if (this.snake.length >= SW * SH - 1) {
        this.gen++;
        this.restart();
        return;
      }
      this.placeApple();
    } else {
      this.snake.pop();
    }
  }

  private draw() {
    const g = this.g.clear();
    g.fillStyle(COLORS.red, 1).fillRect(this.ox + this.apple.x * SC + 1, this.oy + this.apple.y * SC + 1, SC - 2, SC - 2);
    this.snake.forEach((s, i) => {
      g.fillStyle(i === 0 ? COLORS.yellow : COLORS.green, 1).fillRect(this.ox + s.x * SC, this.oy + s.y * SC, SC - 1, SC - 1);
    });
  }

  update(dt: number) {
    if (!this.motion) return;
    this.tick += dt;
    while (this.tick > 0.11) {
      this.tick -= 0.11;
      this.step();
    }
    this.draw();
  }

  setMotion(on: boolean) {
    this.motion = on;
    this.draw();
  }

  setLang(text: DemoText) {
    this.strings = text;
    this.text.setText(text.generation(this.gen, this.best));
  }
}

// ---------- Training bay: a robot running laps on its mat ----------

export class RobotDemo implements Demo {
  private robot: Phaser.GameObjects.Image;
  private t = 0;
  private motion = true;
  private loop: { x: number; y: number }[];

  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
    const inset = 18;
    scene.add.image(x + w / 2, y + h, 'prop-mat').setOrigin(0.5, 1).setDepth(y + h - 1);
    this.loop = [
      { x: x + inset, y: y + inset },
      { x: x + w - inset, y: y + inset },
      { x: x + w - inset, y: y + h - inset },
      { x: x + inset, y: y + h - inset },
    ];
    this.robot = scene.add.image(this.loop[0].x, this.loop[0].y, 'robot').setDepth(y + h);
  }

  update(dt: number) {
    if (!this.motion) return;
    this.t += dt * 30;
    const lens = this.loop.map((p, i) => Phaser.Math.Distance.BetweenPoints(p, this.loop[(i + 1) % 4]));
    let d = this.t % lens.reduce((a, b) => a + b);
    for (let i = 0; i < 4; i++) {
      if (d > lens[i]) {
        d -= lens[i];
        continue;
      }
      const a = this.loop[i];
      const b = this.loop[(i + 1) % 4];
      this.robot.setPosition(a.x + ((b.x - a.x) * d) / lens[i], a.y + ((b.y - a.y) * d) / lens[i]);
      this.robot.setAngle((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90);
      break;
    }
  }

  setMotion(on: boolean) {
    this.motion = on;
  }

  setLang() {}
}
