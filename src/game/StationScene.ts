import Phaser from 'phaser';
import { content } from '../content';
import type { Lang, ObjectId } from '../content/types';
import type { UI } from '../ui/ui';
import { astar, type Cell } from './astar';
import {
  BELT_X0,
  BELT_X1,
  BELT_Y,
  MAP_H,
  MAP_W,
  OBJECTS,
  PICKUPS,
  PIPELINE,
  SPAWN,
  TILE,
  isFloor,
  isWalkable,
  objectAt,
  roomOf,
  tileData,
  type StationObject,
} from './map';
import { COLORS, makeTextures } from './sprites';

const SPEED = 96;
const BELT_SPEED = 40;
const SPAWN_EVERY = 1600;
const CLUSTER_TINTS = [COLORS.cyan, COLORS.magenta, COLORS.yellow];

type Facing = 'down' | 'up' | 'left' | 'right';

interface Article {
  box: Phaser.GameObjects.Container;
  paper: Phaser.GameObjects.Image;
  marks: Phaser.GameObjects.Image;
  check: Phaser.GameObjects.Image;
  link: Phaser.GameObjects.Image;
  stage: number;
}

/** Pixel x of the centre of pipeline machine i. */
const machineX = (i: number) => (BELT_X0 + i * 2) * TILE + TILE / 2;

export class StationScene extends Phaser.Scene {
  private ui!: UI;
  private lang!: Lang;
  private player!: Phaser.GameObjects.Sprite;
  private facing: Facing = 'down';
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private path: Cell[] = [];
  private pathDots: Phaser.GameObjects.Image[] = [];
  private pending: StationObject | null = null;
  private prompt!: Phaser.GameObjects.Image;
  private target: StationObject | null = null;
  private labels = new Map<ObjectId, Phaser.GameObjects.Text>();
  private tops = new Map<ObjectId, number>();
  private icons = new Map<ObjectId, Phaser.GameObjects.Image>();
  private pickups = new Map<string, Phaser.GameObjects.Image[]>();
  private belt!: Phaser.GameObjects.TileSprite;
  private articles: Article[] = [];
  private spawnTimer = 0;
  private motion = true;
  private motionTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super('station');
  }

  init(data: { ui: UI; lang: Lang }) {
    this.ui = data.ui;
    this.lang = data.lang;
    this.motion = data.ui.motion;
  }

  preload() {
    this.load.image('tiles', '/assets/vendor/buch-scifi/scifitiles-sheet.png');
  }

  create() {
    makeTextures(this);
    const tiles = this.textures.get('tiles');
    tiles.add('wall-top', 0, 0, 80, 32, 32);
    tiles.add('face-plain', 0, 0, 112, 32, 16);
    tiles.add('face-console', 0, 32, 112, 32, 16);
    tiles.add('face-server', 0, 64, 112, 32, 16);
    tiles.add('pad-blue', 0, 64, 0, 32, 32);
    tiles.add('pad-red', 0, 64, 160, 32, 32);

    this.cameras.main.setBackgroundColor(COLORS.void);
    this.addStars();

    const map = this.make.tilemap({ data: tileData(), tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
    map.createLayer(0, tileset, 0, 0)!.setDepth(-10);

    this.add.image(SPAWN.x * TILE, SPAWN.y * TILE, 'tiles', 'pad-blue').setOrigin(0).setDepth(-5);

    this.belt = this.add
      .tileSprite(BELT_X0 * TILE, BELT_Y * TILE, (BELT_X1 - BELT_X0 + 1) * TILE, TILE, 'belt')
      .setOrigin(0)
      .setDepth(BELT_Y * TILE + 1);

    OBJECTS.forEach((o) => this.addObject(o));
    this.addPickups();

    this.player = this.add.sprite(SPAWN.x * TILE + TILE / 2, SPAWN.y * TILE + 20, 'avatar', 0).setOrigin(0.5, 1);
    this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('avatar', { frames: [1, 0, 2, 0] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('avatar', { frames: [4, 3, 5, 3] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-side', frames: this.anims.generateFrameNumbers('avatar', { frames: [7, 6] }), frameRate: 6, repeat: -1 });

    this.prompt = this.add.image(0, 0, 'prompt').setOrigin(0.5, 1).setDepth(10_000).setVisible(false);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    cam.startFollow(this.player, true, 0.15, 0.15);
    cam.setRoundPixels(true);
    this.fitZoom();
    this.scale.on('resize', () => this.fitZoom());

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ENTER') as Record<string, Phaser.Input.Keyboard.Key>;
    for (const k of ['E', 'SPACE', 'ENTER']) this.keys[k].on('down', () => this.interact());
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointer(p));

    this.setMotion(this.motion);
  }

  setLang(lang: Lang) {
    this.lang = lang;
    for (const [id, text] of this.labels) text.setText(content[lang].labels[id] ?? '');
  }

  setMotion(on: boolean) {
    this.motion = on;
    this.motionTweens.forEach((t) => (on ? t.resume() : t.pause()));
    this.articles.forEach((a) => a.box.destroy());
    this.articles = [];
    if (!on) {
      // A still life of the pipeline: one article at every other stage.
      for (let i = 1; i < PIPELINE.length; i += 2) this.spawnArticle(machineX(i) + 16);
    }
  }

  /** Called by the UI when a panel closes, so held keys don't leak into movement. */
  releaseKeys() {
    this.input.keyboard?.resetKeys();
  }

  // ---------- setup helpers ----------

  private fitZoom() {
    const { width, height } = this.scale.gameSize;
    const zoom = Math.max(2, Math.floor(Math.min(width / 640, height / 360)));
    this.cameras.main.setZoom(zoom);
  }

  private addStars() {
    const rng = new Phaser.Math.RandomDataGenerator(['station']);
    for (let i = 0; i < 260; i++) {
      const x = rng.between(0, MAP_W * TILE);
      const y = rng.between(0, MAP_H * TILE);
      if (isFloor(Math.floor(x / TILE), Math.floor(y / TILE))) continue;
      const star = this.add.image(x, y, 'star').setDepth(-20).setAlpha(rng.realInRange(0.3, 1));
      if (rng.frac() < 0.3) {
        this.motionTweens.push(
          this.tweens.add({ targets: star, alpha: 0.15, duration: rng.between(900, 2400), yoyo: true, repeat: -1, delay: rng.between(0, 2000) }),
        );
      }
    }
  }

  private addObject(o: StationObject) {
    const px = o.x * TILE;
    const py = o.y * TILE;
    const bottom = (o.y + o.h) * TILE;
    const depth = bottom;
    let top = py;

    if (o.sprite.kind === 'machine') {
      // Wall machines stand on their tile and rise half a tile above it.
      top = py - 16;
      this.add.image(px, top, 'tiles', 'wall-top').setOrigin(0).setDepth(py + TILE);
      this.add.image(px, py + 16, 'tiles', `face-${o.sprite.face}`).setOrigin(0).setDepth(py + TILE);
      const icon = this.add.image(px + 16, top + 16, `icon-${o.sprite.icon}`).setDepth(py + TILE + 1);
      this.icons.set(o.id, icon);
    } else if (o.sprite.kind === 'image') {
      const cx = px + (o.w * TILE) / 2;
      if (o.sprite.angle) {
        this.add.image(cx, py + (o.h * TILE) / 2, o.sprite.key).setAngle(o.sprite.angle).setDepth(depth);
      } else {
        const img = this.add.image(cx, bottom, o.sprite.key).setOrigin(0.5, 1).setDepth(depth);
        top = bottom - img.height;
      }
    } else {
      this.add.image(px, bottom, 'table').setOrigin(0, 1).setDepth(depth);
      if (o.sprite.overlay === 'blueprint') {
        this.add.image(px + 6, bottom - 24, 'blueprint').setOrigin(0).setDepth(depth + 1);
      } else {
        // Three perspectives on one story, as holographic bars.
        CLUSTER_TINTS.forEach((color, i) => {
          const bar = this.add
            .rectangle(px + 14 + i * 14, bottom - 24, 8, 22, color, 0.75)
            .setOrigin(0.5, 1)
            .setDepth(depth + 1);
          this.motionTweens.push(
            this.tweens.add({ targets: bar, scaleY: 0.45 + i * 0.2, duration: 900 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' }),
          );
        });
        top = bottom - 50;
      }
    }

    this.tops.set(o.id, top);
    if (o.label) {
      const label = this.add
        .text(px + (o.w * TILE) / 2, top - 3, content[this.lang].labels[o.id] ?? '', {
          fontFamily: 'Silkscreen',
          fontSize: '8px',
          color: '#d3e9e1',
          stroke: '#1f1d2c',
          strokeThickness: 3,
          resolution: 4,
        })
        .setOrigin(0.5, 1)
        .setDepth(9_000);
      this.labels.set(o.id, label);
    }
  }

  private addPickups() {
    for (const p of PICKUPS) {
      if (this.ui.found.has(p.id)) continue;
      const cx = p.x * TILE + TILE / 2;
      const cy = p.y * TILE + TILE / 2;
      const pad = this.add.image(p.x * TILE, p.y * TILE, 'tiles', p.id === 'keycard' ? 'pad-red' : 'pad-blue').setOrigin(0).setDepth(-5);
      const item = this.add.image(cx, cy - 2, p.key).setDepth(p.y * TILE + TILE);
      this.motionTweens.push(this.tweens.add({ targets: item, y: cy - 7, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
      this.pickups.set(p.id, [pad, item]);
    }
  }

  // ---------- pipeline ----------

  private spawnArticle(x = machineX(0)) {
    const y = BELT_Y * TILE + 16;
    const paper = this.add.image(0, 0, 'article');
    const marks = this.add.image(0, 0, 'marks').setVisible(false);
    const check = this.add.image(6, -8, 'check').setVisible(false);
    const link = this.add.image(-7, -7, 'link').setVisible(false);
    const box = this.add.container(x, y, [paper, marks, link, check]).setDepth(BELT_Y * TILE + 2);
    const article: Article = { box, paper, marks, check, link, stage: 0 };
    this.articles.push(article);
    this.advanceStages(article);
  }

  private advanceStages(a: Article) {
    while (a.stage < PIPELINE.length - 1 && a.box.x >= machineX(a.stage + 1)) {
      a.stage++;
      const id = PIPELINE[a.stage];
      if (id === 'lambda' && this.motion) this.tweens.add({ targets: a.paper, y: -4, duration: 120, yoyo: true });
      if (id === 'clusters') a.paper.setTint(CLUSTER_TINTS[Math.floor(Math.random() * 3)]);
      if (id === 'llm') a.marks.setVisible(true);
      if (id === 'evals') a.check.setVisible(true);
      if (id === 'wikidata') a.link.setVisible(true);
    }
  }

  private updatePipeline(dt: number) {
    if (!this.motion) return;
    this.belt.tilePositionX -= BELT_SPEED * dt;
    this.spawnTimer -= dt * 1000;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = SPAWN_EVERY;
      this.spawnArticle();
      this.pulse('eventbridge');
    }
    const end = machineX(PIPELINE.length - 1);
    this.articles = this.articles.filter((a) => {
      a.box.x += BELT_SPEED * dt;
      this.advanceStages(a);
      if (a.box.x < end) return true;
      a.box.destroy();
      this.pulse('web');
      return false;
    });
  }

  private pulse(id: ObjectId) {
    const icon = this.icons.get(id);
    if (!icon || icon.scale !== 1) return;
    this.tweens.add({ targets: icon, scale: 1.35, duration: 110, yoyo: true });
  }

  // ---------- movement and interaction ----------

  private cellOf(x = this.player.x, y = this.player.y): Cell {
    return { x: Math.floor(x / TILE), y: Math.floor((y - 4) / TILE) };
  }

  private canStand(x: number, y: number) {
    // Feet hitbox: 12x8 above the sprite's origin.
    const pts = [
      [x - 6, y - 8],
      [x + 6, y - 8],
      [x - 6, y - 1],
      [x + 6, y - 1],
    ];
    return pts.every(([px, py]) => isWalkable(Math.floor(px / TILE), Math.floor(py / TILE)));
  }

  private onPointer(p: Phaser.Input.Pointer) {
    if (this.ui.isOpen()) return;
    const world = this.cameras.main.getWorldPoint(p.x, p.y);
    const cell = { x: Math.floor(world.x / TILE), y: Math.floor(world.y / TILE) };
    const from = this.cellOf();
    const obj = cell.x >= 0 && cell.y >= 0 && cell.x < MAP_W && cell.y < MAP_H ? objectAt[cell.y][cell.x] : null;

    if (obj) {
      // Walk to the closest free tile next to the object, then open it.
      let best: Cell[] | null = null;
      for (let y = obj.y; y < obj.y + obj.h; y++) {
        for (let x = obj.x; x < obj.x + obj.w; x++) {
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const n = { x: x + dx, y: y + dy };
            if (!isWalkable(n.x, n.y)) continue;
            const route = n.x === from.x && n.y === from.y ? [] : astar(from, n, isWalkable, MAP_W);
            if (route && (!best || route.length < best.length)) best = route;
          }
        }
      }
      if (best) {
        this.setPath(best);
        this.pending = obj;
        if (!best.length) this.arrive();
      }
      return;
    }
    if (!isWalkable(cell.x, cell.y)) return;
    const route = astar(from, cell, isWalkable, MAP_W);
    if (route) {
      this.setPath(route);
      this.pending = null;
    }
  }

  private setPath(route: Cell[]) {
    this.path = route;
    this.pathDots.forEach((d) => d.destroy());
    this.pathDots = route.map((c) =>
      this.add
        .image(c.x * TILE + TILE / 2, c.y * TILE + TILE / 2, 'dot')
        .setDepth(-4)
        .setAlpha(0.8),
    );
  }

  private arrive() {
    const obj = this.pending;
    this.pending = null;
    if (!obj) return;
    this.face(obj.x + obj.w / 2 - 0.5, obj.y + obj.h / 2 - 0.5);
    this.ui.showEntry(obj.id);
  }

  private face(tx: number, ty: number) {
    const c = this.cellOf();
    const dx = tx - c.x;
    const dy = ty - c.y;
    this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    this.idleFrame();
  }

  private idleFrame() {
    this.player.anims.stop();
    this.player.setFrame(this.facing === 'down' ? 0 : this.facing === 'up' ? 3 : 6);
    this.player.setFlipX(this.facing === 'left');
  }

  private walkAnim() {
    const key = this.facing === 'down' ? 'walk-down' : this.facing === 'up' ? 'walk-up' : 'walk-side';
    this.player.setFlipX(this.facing === 'left');
    if (this.player.anims.currentAnim?.key !== key || !this.player.anims.isPlaying) this.player.play(key);
  }

  private nearbyObject(): StationObject | null {
    const c = this.cellOf();
    const dirs: Record<Facing, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
    const order = [dirs[this.facing], ...Object.values(dirs).filter((d) => d !== dirs[this.facing])];
    for (const [dx, dy] of order) {
      const x = c.x + dx;
      const y = c.y + dy;
      if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
      if (objectAt[y][x]) return objectAt[y][x];
    }
    return null;
  }

  private interact() {
    if (this.ui.isOpen() || !this.target) return;
    this.path = [];
    this.ui.showEntry(this.target.id);
  }

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs, 50) / 1000;
    this.updatePipeline(dt);
    if (this.ui.isOpen()) {
      this.player.anims.stop();
      return;
    }

    const k = this.keys;
    let vx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    let vy = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);

    if (vx || vy) {
      // Keyboard always wins over a clicked route.
      if (this.path.length) this.setPath([]);
      this.pending = null;
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * SPEED * dt;
      vy = (vy / len) * SPEED * dt;
      if (this.canStand(this.player.x + vx, this.player.y)) this.player.x += vx;
      if (this.canStand(this.player.x, this.player.y + vy)) this.player.y += vy;
      this.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      this.walkAnim();
    } else if (this.path.length) {
      const next = this.path[0];
      const tx = next.x * TILE + TILE / 2;
      const ty = next.y * TILE + 20;
      const dx = tx - this.player.x;
      const dy = ty - this.player.y;
      const dist = Math.hypot(dx, dy);
      const step = SPEED * dt;
      if (dist <= step) {
        this.player.setPosition(tx, ty);
        this.path.shift();
        this.pathDots.shift()?.destroy();
        if (!this.path.length) {
          this.idleFrame();
          this.arrive();
        }
      } else {
        this.player.x += (dx / dist) * step;
        this.player.y += (dy / dist) * step;
        this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        this.walkAnim();
      }
    } else {
      this.idleFrame();
    }

    this.player.setDepth(this.player.y);
    const cell = this.cellOf();
    const room = roomOf(cell.x, cell.y);
    if (room) this.ui.setRoom(room);
    this.checkPickups(cell);

    this.target = this.nearbyObject();
    if (this.target) {
      const t = this.target;
      this.prompt.setPosition((t.x + t.w / 2) * TILE, (this.tops.get(t.id) ?? t.y * TILE) - (t.label ? 14 : 2)).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  private checkPickups(cell: Cell) {
    for (const p of PICKUPS) {
      if (p.x !== cell.x || p.y !== cell.y || this.ui.found.has(p.id)) continue;
      this.pickups.get(p.id)?.forEach((o) => o.destroy());
      this.ui.collect(p.id);
    }
  }
}
