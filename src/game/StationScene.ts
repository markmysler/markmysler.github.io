import Phaser from 'phaser';
import { content } from '../content';
import type { Lang, ObjectId, RoomId } from '../content/types';
import type { UI } from '../ui/ui';
import { astar, type Cell } from './astar';
import { RaceDemo, RobotDemo, SnakeDemo, type Demo } from './demos';
import { paintStation } from './floors';
import { makeProps } from './props';
import { COLORS, makeTextures } from './sprites';
import { TILE, buildWorld, type StationObject, type TiledMap, type World } from './world';

const SPEED = 150;
const DASH_MULT = 3.2;
const DASH_TIME = 0.16;
const DASH_COOLDOWN = 0.5;
const BELT_SPEED = 40;
const SPAWN_EVERY = 1600;
const CLUSTER_TINTS = [COLORS.cyan, COLORS.magenta, COLORS.yellow];
/** Avatar scale. With even camera zooms, 1.5 still lands on whole screen pixels. */
const PLAYER_SCALE = 1.5;
const PIPELINE: ObjectId[] = ['eventbridge', 'sqs', 'lambda', 'clusters', 'llm', 'evals', 'wikidata', 'media', 'web'];

type Facing = 'down' | 'up' | 'left' | 'right';

interface Article {
  box: Phaser.GameObjects.Container;
  paper: Phaser.GameObjects.Image;
  marks: Phaser.GameObjects.Image;
  check: Phaser.GameObjects.Image;
  link: Phaser.GameObjects.Image;
  stage: number;
}

export class StationScene extends Phaser.Scene {
  private ui!: UI;
  private lang!: Lang;
  private world!: World;
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
  private demos: Demo[] = [];
  private signs: [RoomId, Phaser.GameObjects.Text][] = [];
  private safe: Phaser.GameObjects.Image | null = null;
  private belt: Phaser.GameObjects.TileSprite | null = null;
  private machineX: number[] = [];
  private articles: Article[] = [];
  private spawnTimer = 0;
  private motion = true;
  private motionTweens: Phaser.Tweens.Tween[] = [];
  private dashLeft = 0;
  private dashCooldown = 0;
  private ghostTimer = 0;

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
    this.load.tilemapTiledJSON('station', '/assets/maps/station.tmj');
  }

  create() {
    makeTextures(this);
    makeProps(this);
    const tiles = this.textures.get('tiles');
    tiles.add('wall-top', 0, 0, 80, 32, 32);
    tiles.add('face-plain', 0, 0, 112, 32, 16);
    tiles.add('face-console', 0, 32, 112, 32, 16);
    tiles.add('face-server', 0, 64, 112, 32, 16);

    this.world = buildWorld(this.cache.tilemap.get('station').data as TiledMap);
    this.ui.attachWorld(this.world);
    const { world } = this;

    this.cameras.main.setBackgroundColor(COLORS.void);
    this.addStars();

    // Each room's floor and walls are painted from the map's shapes; see floors.ts.
    const signs = paintStation(this, world, world.decor);
    for (const sign of signs) {
      const text = this.add
        .text(sign.x - sign.dx * 18, sign.y - sign.dy * 22, '', {
          fontFamily: 'Silkscreen',
          fontSize: '8px',
          color: '#23428b',
          backgroundColor: '#d3e9e1',
          padding: { x: 3, y: 2 },
          resolution: 4,
        })
        // Sideways exits put the label beside the arrow, the others under or over it
        .setOrigin(sign.dx > 0 ? 1 : sign.dx < 0 ? 0 : 0.5, 0.5)
        .setDepth(-4);
      this.signs.push([sign.to, text]);
    }
    this.addLasers();
    this.addSpotlights();


    world.objects.forEach((o) => this.addObject(o));
    this.addBelt();
    this.addPickups();

    this.player = this.add
      .sprite(world.spawn.x * TILE + TILE / 2, world.spawn.y * TILE + 20, 'avatar', 0)
      .setOrigin(0.5, 1)
      .setScale(PLAYER_SCALE);
    this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('avatar', { frames: [1, 0, 2, 0] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('avatar', { frames: [4, 3, 5, 3] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-side', frames: this.anims.generateFrameNumbers('avatar', { frames: [7, 6] }), frameRate: 6, repeat: -1 });

    this.prompt = this.add.image(0, 0, 'prompt').setOrigin(0.5, 1).setDepth(10_000).setVisible(false);

    const cam = this.cameras.main;
    // Padding so rooms on the map edge are not hidden under the HUD and minimap.
    cam.setBounds(-TILE * 2, -TILE * 3, (world.w + 4) * TILE, (world.h + 6) * TILE);
    cam.startFollow(this.player, true, 0.15, 0.15);
    cam.setRoundPixels(true);
    this.fitZoom();
    this.scale.on('resize', () => this.fitZoom());

    const kb = this.input.keyboard!;
    // No capture: panels have text inputs, and the page itself never scrolls.
    this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ENTER', false) as Record<string, Phaser.Input.Keyboard.Key>;
    for (const k of ['E', 'ENTER']) this.keys[k].on('down', () => this.interact());
    this.keys.SPACE.on('down', () => this.dash());
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointer(p));

    this.setLang(this.lang);
    this.setMotion(this.motion);
  }

  setLang(lang: Lang) {
    this.lang = lang;
    for (const [id, text] of this.labels) text.setText(content[lang].labels[id] ?? '');
    for (const [room, text] of this.signs) text.setText(content[lang].rooms[room]);
    this.demos.forEach((d) => d.setLang(content[lang].demos));
  }

  setMotion(on: boolean) {
    this.motion = on;
    this.motionTweens.forEach((t) => (on ? t.resume() : t.pause()));
    this.demos.forEach((d) => d.setMotion(on));
    this.articles.forEach((a) => a.box.destroy());
    this.articles = [];
    if (!on && this.machineX.length) {
      // A still life of the pipeline: one article at every other stage.
      for (let i = 1; i < this.machineX.length; i += 2) this.spawnArticle(this.machineX[i] + 16);
    }
  }

  openSafe() {
    this.safe?.setTexture('prop-safe-open');
  }

  /** Autopilot: walk to the walkable cell closest to the room's centre. */
  travelTo(room: RoomId) {
    const r = this.world.rooms.find((x) => x.id === room);
    if (!r) return;
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    let goal: Cell | null = null;
    for (let d = 0; d < Math.max(r.w, r.h) && !goal; d++) {
      for (let y = cy - d; y <= cy + d && !goal; y++) {
        for (let x = cx - d; x <= cx + d && !goal; x++) {
          if (this.world.isWalkable(x, y) && this.world.roomAt[y][x] === room) goal = { x, y };
        }
      }
    }
    if (!goal) return;
    const route = astar(this.cellOf(), goal, this.world.isWalkable, this.world.w);
    if (route) {
      this.setPath(route);
      this.pending = null;
    }
  }

  /** A short burst of speed in the direction you're moving or facing. */
  dash() {
    if (this.ui.isOpen() || this.dashCooldown > 0) return;
    this.dashLeft = DASH_TIME;
    this.dashCooldown = DASH_COOLDOWN;
  }

  private speed() {
    return SPEED * (this.dashLeft > 0 ? DASH_MULT : 1);
  }

  /** Fading afterimages while dashing. */
  private updateDash(dt: number) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    if (this.dashLeft <= 0) return;
    this.dashLeft -= dt;
    this.ghostTimer -= dt;
    if (this.ghostTimer > 0 || !this.motion) return;
    this.ghostTimer = 0.03;
    const ghost = this.add
      .image(this.player.x, this.player.y, 'avatar', this.player.frame.name)
      .setOrigin(0.5, 1)
      .setScale(PLAYER_SCALE)
      .setFlipX(this.player.flipX)
      .setTint(COLORS.cyan)
      .setAlpha(0.5)
      .setDepth(this.player.depth - 0.5);
    this.tweens.add({ targets: ghost, alpha: 0, duration: 220, onComplete: () => ghost.destroy() });
  }

  /** Called by the UI when a panel closes, so held keys don't leak into movement. */
  releaseKeys() {
    this.input.keyboard?.resetKeys();
  }

  // ---------- setup helpers ----------

  private fitZoom() {
    const { width, height } = this.scale.gameSize;
    const fit = Math.floor(Math.min(width / 640, height / 360));
    this.cameras.main.setZoom(Math.max(2, fit - (fit % 2)));
  }

  private addStars() {
    const { world } = this;
    const rng = new Phaser.Math.RandomDataGenerator(['station']);
    for (let i = 0; i < 800; i++) {
      const x = rng.between(-TILE * 2, (world.w + 2) * TILE);
      const y = rng.between(-TILE * 3, (world.h + 3) * TILE);
      if (world.isFloor(Math.floor(x / TILE), Math.floor(y / TILE))) continue;
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
    const w = o.w * TILE;
    const h = o.h * TILE;
    const bottom = py + h;
    let top = py;
    const text = content[this.lang].demos;

    switch (o.sprite.kind) {
      case 'machine': {
        // Wall machines stand on their tile and rise half a tile above it.
        top = py - 16;
        this.add.image(px, top, 'tiles', 'wall-top').setOrigin(0).setDepth(py + TILE);
        this.add.image(px, py + 16, 'tiles', `face-${o.sprite.face}`).setOrigin(0).setDepth(py + TILE);
        const icon = this.add.image(px + 16, top + 16, `icon-${o.sprite.icon}`).setDepth(py + TILE + 1);
        this.icons.set(o.id, icon);
        if (PIPELINE.includes(o.id)) this.machineX[PIPELINE.indexOf(o.id)] = px + TILE / 2;
        break;
      }
      case 'prop': {
        const key = o.id === 'safe' && this.ui.found.has('cc') ? 'prop-safe-open' : o.sprite.key;
        const img = this.add.image(px + w / 2, bottom, key).setOrigin(0.5, 1).setDepth(bottom);
        top = bottom - img.height;
        if (o.id === 'safe') this.safe = img;
        top = this.decorate(o.id, img, top);
        break;
      }
      case 'demo': {
        if (o.sprite.demo === 'race') this.demos.push(new RaceDemo(this, px, py, text));
        if (o.sprite.demo === 'snake') this.demos.push(new SnakeDemo(this, px, py, w, h, text));
        if (o.sprite.demo === 'robot') this.demos.push(new RobotDemo(this, px, py, w, h));
        break;
      }
    }

    this.tops.set(o.id, top);
    const name = content[this.lang].labels[o.id];
    if (o.interactive && name !== undefined) {
      const label = this.add
        .text(px + w / 2, top - 3, name, {
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

  /** Small animations on top of some props. Returns where the label should sit. */
  private decorate(id: ObjectId, img: Phaser.GameObjects.Image, top: number): number {
    const left = img.x - img.width / 2;
    const bottom = img.y;
    const loop = (tween: Phaser.Types.Tweens.TweenBuilderConfig) => this.motionTweens.push(this.tweens.add({ repeat: -1, ...tween }));
    switch (id) {
      case 'guide':
        this.add.image(img.x, bottom - 3, 'prop-shadow').setDepth(bottom - 1);
        img.y -= 4;
        loop({ targets: img, y: img.y - 4, duration: 1100, yoyo: true, ease: 'Sine.inOut' });
        return top - 8;
      case 'pathfinder': {
        const sweep = this.add.image(left + 16, top + 17, 'radar-sweep').setDepth(bottom + 1);
        loop({ targets: sweep, angle: 360, duration: 2600 });
        return top;
      }
      case 'mailbox': {
        const light = this.add.rectangle(left + 26, top + 4, 3, 3, COLORS.red).setDepth(bottom + 1);
        loop({ targets: light, alpha: 0.2, duration: 500, yoyo: true });
        return top;
      }
      case 'asciify': {
        const glow = this.add.rectangle(left + 16, top + 19, 18, 16, COLORS.green, 0.12).setDepth(bottom + 1);
        loop({ targets: glow, alpha: 0.35, duration: 180, yoyo: true, repeatDelay: 900 });
        return top;
      }
      case 'pokedex': {
        // The cabinet's screen cycles through the game's colours.
        const screen = this.add.rectangle(left + 16, top + 21, 16, 12, COLORS.cyan, 0.45).setDepth(bottom + 1);
        this.motionTweens.push(
          this.tweens.addCounter({
            from: 0,
            to: 3,
            duration: 2400,
            repeat: -1,
            onUpdate: (t) => screen.setFillStyle(CLUSTER_TINTS[Math.floor(t.getValue() ?? 0) % 3], 0.45),
          }),
        );
        return top;
      }
      case 'pmTable':
        // Three perspectives on one story, as holographic bars over the projector.
        CLUSTER_TINTS.forEach((color, i) => {
          const bar = this.add
            .rectangle(left + 20 + i * 12, top + 21, 8, 22, color, 0.7)
            .setOrigin(0.5, 1)
            .setDepth(bottom + 1);
          loop({ targets: bar, scaleY: 0.45 + i * 0.2, duration: 900 + i * 300, yoyo: true, ease: 'Sine.inOut' });
        });
        return top - 2;
      default:
        return top;
    }
  }

  /** Two soft spotlights sweeping the Auditorium's stage. */
  private addSpotlights() {
    for (const d of this.world.decor.filter((x) => x.kind === 'stage')) {
      [0.3, 0.7].forEach((f, i) => {
        const x = (d.x + d.w * f) * TILE;
        const y = (d.y + d.h / 2) * TILE;
        const light = this.add.ellipse(x, y, 70, 34, COLORS.yellow, 0.16).setDepth(-3);
        this.motionTweens.push(
          this.tweens.add({ targets: light, x: x + (i ? -24 : 24), alpha: 0.26, duration: 2200 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' }),
        );
      });
    }
  }

  /** Red laser lines across the vault's doorway. Purely for show: you walk straight through. */
  private addLasers() {
    for (const d of this.world.decor.filter((x) => x.kind === 'lasers')) {
      for (let i = 0; i < 4; i++) {
        const y = d.y * TILE + 6 + i * 7;
        const glow = this.add.rectangle(d.x * TILE, y - 1, d.w * TILE, 4, COLORS.red, 0.25).setOrigin(0).setDepth(d.y * TILE + 30);
        const beam = this.add.rectangle(d.x * TILE, y, d.w * TILE, 2, 0xff6b7d, 1).setOrigin(0).setDepth(d.y * TILE + 31);
        this.motionTweens.push(this.tweens.add({ targets: [beam, glow], alpha: 0.2, duration: 300 + i * 130, yoyo: true, repeat: -1 }));
      }
    }
  }

  private addBelt() {
    const { belt } = this.world;
    if (!belt.w) return;
    this.belt = this.add
      .tileSprite(belt.x * TILE, belt.y * TILE, belt.w * TILE, TILE, 'belt')
      .setOrigin(0)
      .setDepth(belt.y * TILE + 1);
  }

  private addPickups() {
    for (const p of this.world.pickups) {
      if (this.ui.found.has(p.id)) continue;
      const cx = p.x * TILE + TILE / 2;
      const cy = p.y * TILE + TILE / 2;
      const pad = this.add.image(cx, cy + 9, 'pedestal').setDepth(-5);
      const item = this.add.image(cx, cy - 2, p.key).setDepth(p.y * TILE + TILE);
      this.motionTweens.push(this.tweens.add({ targets: item, y: cy - 7, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
      this.pickups.set(p.id, [pad, item]);
    }
  }

  // ---------- pipeline ----------

  private spawnArticle(x = this.machineX[0]) {
    const y = this.world.belt.y * TILE + 16;
    const paper = this.add.image(0, 0, 'article');
    const marks = this.add.image(0, 0, 'marks').setVisible(false);
    const check = this.add.image(6, -8, 'check').setVisible(false);
    const link = this.add.image(-7, -7, 'link').setVisible(false);
    const box = this.add.container(x, y, [paper, marks, link, check]).setDepth(this.world.belt.y * TILE + 2);
    const article: Article = { box, paper, marks, check, link, stage: 0 };
    this.articles.push(article);
    this.advanceStages(article);
  }

  private advanceStages(a: Article) {
    while (a.stage < PIPELINE.length - 1 && a.box.x >= this.machineX[a.stage + 1]) {
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
    if (!this.motion || !this.belt || this.machineX.length < PIPELINE.length) return;
    this.belt.tilePositionX -= BELT_SPEED * dt;
    this.spawnTimer -= dt * 1000;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = SPAWN_EVERY;
      this.spawnArticle();
      this.pulse('eventbridge');
    }
    const end = this.machineX[PIPELINE.length - 1];
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
    // Feet hitbox: 14x8 above the sprite's origin.
    const pts = [
      [x - 7, y - 8],
      [x + 7, y - 8],
      [x - 7, y - 1],
      [x + 7, y - 1],
    ];
    return pts.every(([px, py]) => this.world.isWalkable(Math.floor(px / TILE), Math.floor(py / TILE)));
  }

  private onPointer(p: Phaser.Input.Pointer) {
    if (this.ui.isOpen()) return;
    const { world } = this;
    const pt = this.cameras.main.getWorldPoint(p.x, p.y);
    const cell = { x: Math.floor(pt.x / TILE), y: Math.floor(pt.y / TILE) };
    const from = this.cellOf();
    const inside = cell.x >= 0 && cell.y >= 0 && cell.x < world.w && cell.y < world.h;
    let obj = inside ? world.objectAt[cell.y][cell.x] : null;
    // Machines and tall props are drawn above their footprint; clicks there count too.
    const below = !obj && cell.y + 1 < world.h && cell.x >= 0 && cell.x < world.w ? world.objectAt[cell.y + 1][cell.x] : null;
    if (below && pt.y >= (this.tops.get(below.id) ?? Infinity)) obj = below;

    if (obj) {
      // Walk to the closest free tile next to the object, then open it.
      let best: Cell[] | null = null;
      for (let y = obj.y; y < obj.y + obj.h; y++) {
        for (let x = obj.x; x < obj.x + obj.w; x++) {
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const n = { x: x + dx, y: y + dy };
            if (!world.isWalkable(n.x, n.y)) continue;
            const route = n.x === from.x && n.y === from.y ? [] : astar(from, n, world.isWalkable, world.w);
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
    if (!world.isWalkable(cell.x, cell.y)) return;
    const route = astar(from, cell, world.isWalkable, world.w);
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
        .setDepth(-1.5)
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
      if (x < 0 || y < 0 || x >= this.world.w || y >= this.world.h) continue;
      if (this.world.objectAt[y][x]) return this.world.objectAt[y][x];
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
    this.demos.forEach((d) => d.update(dt));
    this.updateDash(dt);
    if (this.ui.isOpen()) {
      this.player.anims.stop();
      return;
    }

    const k = this.keys;
    let vx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    let vy = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);

    if (!vx && !vy && this.dashLeft > 0 && !this.path.length) {
      // Dashing from a standstill goes the way you're facing.
      vx = this.facing === 'right' ? 1 : this.facing === 'left' ? -1 : 0;
      vy = this.facing === 'down' ? 1 : this.facing === 'up' ? -1 : 0;
    }

    if (vx || vy) {
      // Keyboard always wins over a clicked route.
      if (this.path.length) this.setPath([]);
      this.pending = null;
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * this.speed() * dt;
      vy = (vy / len) * this.speed() * dt;
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
      const step = this.speed() * dt;
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
    const room = this.world.roomAt[cell.y]?.[cell.x];
    if (room) this.ui.setRoom(room);
    this.ui.setPlayer(cell.x, cell.y);
    this.checkPickups(cell);

    this.target = this.nearbyObject();
    if (this.target) {
      const t = this.target;
      this.prompt.setPosition((t.x + t.w / 2) * TILE, (this.tops.get(t.id) ?? t.y * TILE) - (this.labels.has(t.id) ? 14 : 2)).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  private checkPickups(cell: Cell) {
    for (const p of this.world.pickups) {
      if (p.x !== cell.x || p.y !== cell.y || this.ui.found.has(p.id)) continue;
      this.pickups.get(p.id)?.forEach((o) => o.destroy());
      this.ui.collect(p.id);
    }
  }
}
