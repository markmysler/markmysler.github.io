import Phaser from 'phaser';

/** Palette shared with the CC0 tileset, plus skin and hair for the avatar. */
const PAL: Record<string, string> = {
  k: '#1f1d2c',
  w: '#f3fff4',
  W: '#d3e9e1',
  s: '#d9a066',
  h: '#3b2a20',
  j: '#23428b',
  J: '#1d6cc6',
  b: '#1d6cc6',
  p: '#372f5f',
  d: '#372f5f',
  n: '#4a4f9b',
  l: '#939cc0',
  f: '#a1cad4',
  o: '#ed8024',
  y: '#f5b62a',
  Y: '#da4320',
  c: '#1dc7e6',
  m: '#ff34c3',
  g: '#289c5c',
  r: '#df213f',
};

export const COLORS = {
  void: 0x1f1d2c,
  deep: 0x372f5f,
  hull: 0x4a4f9b,
  steel: 0x939cc0,
  floor: 0xa1cad4,
  frost: 0xd3e9e1,
  white: 0xf3fff4,
  orange: 0xed8024,
  yellow: 0xf5b62a,
  red: 0xdf213f,
  cyan: 0x1dc7e6,
  magenta: 0xff34c3,
  green: 0x289c5c,
};

type Ctx = CanvasRenderingContext2D;

function drawRows(ctx: Ctx, rows: string[], ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = PAL[row[x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, col: string) {
  ctx.fillStyle = PAL[col] ?? col;
  ctx.fillRect(x, y, w, h);
}

function canvas(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx) => void) {
  const tex = scene.textures.createCanvas(key, w, h)!;
  draw(tex.getContext());
  tex.refresh();
  return tex;
}

// ---------- Avatar (16x24, 9 frames: down, up, side × idle/stepA/stepB) ----------

const HEAD_DOWN = [
  '.....kkkkkk.....',
  '....khhhhhhk....',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '...khsssssshk...',
  '...kskssssksk...',
  '...kssssssssk...',
  '....kssssssk....',
  '.....kssssk.....',
];
const BODY_DOWN = [
  '...kkjjwwjjkk...',
  '..kjjjjwwjjjjk..',
  '..kjJjjwwjjJjk..',
  '..kjJjjwwjjJjk..',
  '..kjjjjjjjjjjk..',
  '..ksjjjjjjjjsk..',
  '...kppppppppk...',
  '...kppppppppk...',
];
const HEAD_UP = [
  '.....kkkkkk.....',
  '....khhhhhhk....',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '....khhhhhhk....',
  '.....kssssk.....',
];
const BODY_UP = [
  '...kkjjjjjjkk...',
  '..kjjjjjjjjjjk..',
  '..kjJjjjjjjJjk..',
  '..kjJjjjjjjJjk..',
  '..kjjjjjjjjjjk..',
  '..ksjjjjjjjjsk..',
  '...kppppppppk...',
  '...kppppppppk...',
];
const LEGS_FRONT = {
  idle: ['...kpppkkpppk...', '...kpppkkpppk...', '...kpppkkpppk...', '...kkkk..kkkk...'],
  a: ['...kpppkkpppk...', '...kpppkkpppk...', '...kpppkkkkkk...', '...kkkk.........'],
  b: ['...kpppkkpppk...', '...kpppkkpppk...', '...kkkkkkpppk...', '.........kkkk...'],
};
const HEAD_SIDE = [
  '.....kkkkkk.....',
  '....khhhhhhk....',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '...khhhhssssk...',
  '...khhhsssksk...',
  '...khhssssssk...',
  '....khssssssk...',
  '.....kssssk.....',
];
const BODY_SIDE = [
  '....kkjjjjkk....',
  '....kjjjjjjk....',
  '....kjJjjjjk....',
  '....kjJjjjjk....',
  '....kjjsjjjk....',
  '....kjjsjjjk....',
  '....kppppppk....',
  '....kppppppk....',
];
const LEGS_SIDE = {
  idle: ['.....kppppk.....', '.....kppppk.....', '.....kppppk.....', '.....kkkkkkk....'],
  a: ['....kppkkppk....', '...kppk..kppk...', '...kpk....kpk...', '..kkkk....kkkk..'],
};

export const PLAYER_W = 16;
export const PLAYER_H = 24;

function avatarFrames(): string[][] {
  const pad = ['', '', ''].map(() => '.'.repeat(16));
  const f = (head: string[], body: string[], legs: string[]) => [...pad, ...head, ...body, ...legs];
  return [
    f(HEAD_DOWN, BODY_DOWN, LEGS_FRONT.idle),
    f(HEAD_DOWN, BODY_DOWN, LEGS_FRONT.a),
    f(HEAD_DOWN, BODY_DOWN, LEGS_FRONT.b),
    f(HEAD_UP, BODY_UP, LEGS_FRONT.idle),
    f(HEAD_UP, BODY_UP, LEGS_FRONT.a),
    f(HEAD_UP, BODY_UP, LEGS_FRONT.b),
    f(HEAD_SIDE, BODY_SIDE, LEGS_SIDE.idle),
    f(HEAD_SIDE, BODY_SIDE, LEGS_SIDE.a),
  ];
}

// ---------- 12x12 machine icons ----------

const ICONS: Record<string, string[]> = {
  guide: [
    '............',
    '...yyyyyy...',
    '..yy....yy..',
    '........yy..',
    '......yyy...',
    '.....yy.....',
    '.....yy.....',
    '............',
    '.....yy.....',
    '.....yy.....',
    '............',
    '............',
  ],
  about: [
    '............',
    '....cccc....',
    '...cccccc...',
    '...cccccc...',
    '....cccc....',
    '............',
    '..cccccccc..',
    '.cccccccccc.',
    '.cccccccccc.',
    '.cccccccccc.',
    '............',
    '............',
  ],
  directory: [
    '............',
    '.ooo....ooo.',
    '.ooo....ooo.',
    '.oooooooooo.',
    '.ooo....ooo.',
    '....o.......',
    '....o.......',
    '..ooooo.....',
    '..ooooo.....',
    '..ooooo.....',
    '............',
    '............',
  ],
  eventbridge: [
    '....kkkk....',
    '..kkwwwwkk..',
    '.kwwwwwwwwk.',
    '.kwwwwkwwwk.',
    'kwwwwwkwwwwk',
    'kwwwwwkwwwwk',
    'kwwwwwkkkwwk',
    'kwwwwwwwwwwk',
    '.kwwwwwwwwk.',
    '.kwwwwwwwwk.',
    '..kkwwwwkk..',
    '....kkkk....',
  ],
  sqs: [
    '............',
    '.kkkkkkkkkk.',
    '.kyyyyyyyyk.',
    '.kkkkkkkkkk.',
    '............',
    '.kkkkkkkkkk.',
    '.kyyyyyyyyk.',
    '.kkkkkkkkkk.',
    '............',
    '.kkkkkkkkkk.',
    '.kyyyyyyyyk.',
    '.kkkkkkkkkk.',
  ],
  lambda: [
    '..ooo.......',
    '....oo......',
    '.....o......',
    '.....oo.....',
    '....ooo.....',
    '....o.oo....',
    '...oo..o....',
    '...o...oo...',
    '..oo....o...',
    '..o.....oo..',
    '.oo......oo.',
    '............',
  ],
  clusters: [
    '..c.........',
    '.ccc....m...',
    'ccccc..mmm..',
    '.ccc..mmmmm.',
    '..c....mmm..',
    '........m...',
    '....y.......',
    '...yyy......',
    '..yyyyy.....',
    '...yyy......',
    '....y.......',
    '............',
  ],
  llm: [
    '............',
    '.kkkkkkkkkk.',
    '.kwwwwwwwwk.',
    '.kwkkkkkkwk.',
    '.kwwwwwwwwk.',
    '.kwkkkkwwwk.',
    '.kwwwwwwwwk.',
    '.kkkkwkkkkk.',
    '....kwk.....',
    '....kk......',
    '............',
    '............',
  ],
  evals: [
    '............',
    '..........gg',
    '.........gg.',
    '........gg..',
    '.......gg...',
    'gg....gg....',
    '.gg..gg.....',
    '..gggg......',
    '...gg.......',
    '............',
    '............',
    '............',
  ],
  wikidata: [
    '....kkkk....',
    '..kkcbbckk..',
    '.kccbbbbcck.',
    '.kbcbbbbcbk.',
    'kcccccccccck',
    'kbbcbbbbcbbk',
    'kbbcbbbbcbbk',
    'kcccccccccck',
    '.kbcbbbbcbk.',
    '.kccbbbbcck.',
    '..kkcbbckk..',
    '....kkkk....',
  ],
  media: [
    '............',
    '.....k...k..',
    '....kk....k.',
    '..kkkk.k..k.',
    '.kwwwk..k.k.',
    '.kwwwk..k.k.',
    '.kwwwk..k.k.',
    '..kkkk.k..k.',
    '....kk....k.',
    '.....k...k..',
    '............',
    '............',
  ],
  web: [
    'kkkkkkkkkkkk',
    'kbbbbbbbbbbk',
    'kbwwwbbbbbbk',
    'kbbbbbbbbbbk',
    'kbwwwwwwbbbk',
    'kbwwwwbbbbbk',
    'kbbbbbbbbbbk',
    'kkkkkkkkkkkk',
    '.....kk.....',
    '....kkkk....',
    '............',
    '............',
  ],
};

export const ICON_KEYS = Object.keys(ICONS);

/** Generates every custom texture. Call once from the scene's create(). */
export function makeTextures(scene: Phaser.Scene) {
  // Avatar sheet
  const frames = avatarFrames();
  const sheet = canvas(scene, 'avatar', PLAYER_W * frames.length, PLAYER_H, (ctx) =>
    frames.forEach((rows, i) => drawRows(ctx, rows, i * PLAYER_W, 0)),
  );
  frames.forEach((_, i) => sheet.add(i, 0, i * PLAYER_W, 0, PLAYER_W, PLAYER_H));

  for (const [key, rows] of Object.entries(ICONS)) {
    canvas(scene, `icon-${key}`, 12, 12, (ctx) => drawRows(ctx, rows));
  }

  // Sealed door, 64x32 (rotated for vertical doors)
  canvas(scene, 'door', 64, 32, (ctx) => {
    rect(ctx, 0, 0, 64, 32, 'k');
    rect(ctx, 2, 2, 60, 28, 'd');
    for (let x = 0; x < 64; x += 8) {
      rect(ctx, x, 0, 4, 4, 'o');
      rect(ctx, x + 4, 0, 4, 4, 'j');
      rect(ctx, x, 28, 4, 4, 'o');
      rect(ctx, x + 4, 28, 4, 4, 'j');
    }
    rect(ctx, 6, 8, 24, 16, 'n');
    rect(ctx, 34, 8, 24, 16, 'n');
    rect(ctx, 6, 8, 24, 2, 'l');
    rect(ctx, 34, 8, 24, 2, 'l');
    rect(ctx, 31, 4, 2, 24, 'k');
    rect(ctx, 26, 13, 4, 6, 'r');
    rect(ctx, 34, 13, 4, 6, 'r');
  });

  // Conveyor belt tile, 32x32; the scene scrolls it
  canvas(scene, 'belt', 32, 32, (ctx) => {
    rect(ctx, 0, 6, 32, 3, 'k');
    rect(ctx, 0, 9, 32, 16, 'n');
    for (let x = 0; x < 32; x += 8) rect(ctx, x, 9, 3, 16, 'd');
    rect(ctx, 0, 25, 32, 3, 'k');
    rect(ctx, 0, 28, 32, 2, 'd');
  });

  // Article on the belt, 10x12
  canvas(scene, 'article', 10, 12, (ctx) => {
    rect(ctx, 0, 0, 10, 12, 'k');
    rect(ctx, 1, 1, 8, 10, 'w');
    rect(ctx, 2, 3, 6, 1, 'l');
    rect(ctx, 2, 5, 5, 1, 'l');
    rect(ctx, 2, 7, 6, 1, 'l');
    rect(ctx, 2, 9, 4, 1, 'l');
  });
  // Highlight marks the LLM adds (framing, actors, claims)
  canvas(scene, 'marks', 10, 12, (ctx) => {
    rect(ctx, 2, 3, 4, 1, 'm');
    rect(ctx, 4, 5, 3, 1, 'c');
    rect(ctx, 2, 7, 5, 1, 'y');
  });
  canvas(scene, 'check', 7, 6, (ctx) =>
    drawRows(ctx, ['......g', '.....gg', 'g...gg.', 'gg.gg..', '.ggg...', '..g....']),
  );
  canvas(scene, 'link', 6, 6, (ctx) => drawRows(ctx, ['.cc...', 'c..c..', 'c..cc.', '.cc..c', '...c.c', '....c.']));

  // Table base, 64x32
  canvas(scene, 'table', 64, 32, (ctx) => {
    rect(ctx, 0, 6, 64, 26, 'k');
    rect(ctx, 2, 8, 60, 14, 'l');
    rect(ctx, 2, 22, 60, 8, 'n');
    rect(ctx, 6, 24, 52, 2, 'd');
  });
  canvas(scene, 'blueprint', 52, 12, (ctx) => {
    rect(ctx, 0, 0, 52, 12, 'j');
    for (let x = 3; x < 52; x += 6) rect(ctx, x, 0, 1, 12, 'J');
    for (let y = 3; y < 12; y += 4) rect(ctx, 0, y, 52, 1, 'J');
    rect(ctx, 6, 3, 14, 5, 'w');
    rect(ctx, 7, 4, 12, 3, 'j');
    rect(ctx, 26, 4, 18, 1, 'w');
    rect(ctx, 26, 7, 12, 1, 'w');
  });

  // Access gate, 32x48
  canvas(scene, 'pillar', 32, 48, (ctx) => {
    rect(ctx, 4, 0, 24, 48, 'k');
    rect(ctx, 6, 2, 20, 30, 'l');
    rect(ctx, 6, 32, 20, 14, 'n');
    drawRows(
      ctx,
      ['..cccccc..', '.cccccccc.', '.ccckkccc.', '.ccckkccc.', '.cccckccc.', '..cccccc..', '...cccc...', '....cc....'],
      11,
      10,
    );
  });

  // Database stack, 64x64
  canvas(scene, 'database', 64, 64, (ctx) => {
    for (let i = 0; i < 3; i++) {
      const y = 6 + i * 18;
      rect(ctx, 6, y, 52, 18, 'k');
      rect(ctx, 8, y + 2, 48, 6, 'l');
      rect(ctx, 8, y + 8, 48, 8, 'n');
      rect(ctx, 12, y + 11, 3, 2, i === 1 ? 'g' : 'c');
      rect(ctx, 17, y + 11, 3, 2, 'g');
      rect(ctx, 22, y + 11, 3, 2, i === 2 ? 'o' : 'g');
    }
    rect(ctx, 6, 60, 52, 4, 'd');
  });

  // Comms pod, 32x48
  canvas(scene, 'comms', 32, 48, (ctx) => {
    rect(ctx, 15, 0, 2, 10, 'k');
    rect(ctx, 14, 0, 4, 3, 'r');
    rect(ctx, 4, 10, 24, 38, 'k');
    rect(ctx, 6, 12, 20, 18, 'l');
    rect(ctx, 6, 30, 20, 16, 'o');
    rect(ctx, 6, 30, 20, 2, 'y');
    rect(ctx, 9, 15, 14, 12, 'w');
    drawRows(
      ctx,
      ['kkkkkkkkkkkk', 'kk........kk', 'k.k......k.k', 'k..k....k..k', 'k...kkkk...k', 'k..........k', 'kkkkkkkkkkkk'],
      10,
      17,
    );
  });

  // Collectibles
  canvas(scene, 'trophy', 16, 20, (ctx) =>
    drawRows(ctx, [
      '..kkkkkkkkkkkk..',
      'kkkyyyyyyyyyykkk',
      'kyykyyyyyyyykyyk',
      'ky.kyyyyyyyyk.yk',
      'kyykyyyyyyyykyyk',
      '.kkkyyyyyyyykkk.',
      '...kyyyyyyyyk...',
      '....kyyyyyyk....',
      '.....kyyyyk.....',
      '......kyyk......',
      '......kyyk......',
      '.....kYYYYk.....',
      '....kyyyyyyk....',
      '...kYYYYYYYYk...',
      '...kkkkkkkkkk...',
    ]),
  );
  canvas(scene, 'keycard', 16, 8, (ctx) =>
    drawRows(ctx, [
      'kkkkkkkkkkkkkkkk',
      'kooooooooooooook',
      'kowwwwoooooooook',
      'kowkkwoyyyyyyook',
      'kowwwwoooooooook',
      'kowkkwoyyyyooook',
      'kowwwwoooooooook',
      'kkkkkkkkkkkkkkkk',
    ]),
  );

  // "Press E" bubble, 11x12
  canvas(scene, 'prompt', 11, 12, (ctx) =>
    drawRows(ctx, [
      'kkkkkkkkkkk',
      'kwwwwwwwwwk',
      'kwwkkkkkwwk',
      'kwwkwwwwwwk',
      'kwwkkkkwwwk',
      'kwwkwwwwwwk',
      'kwwkkkkkwwk',
      'kwwwwwwwwwk',
      'kkkkkwkkkkk',
      '....kwk....',
      '.....k.....',
    ]),
  );
  canvas(scene, 'dot', 4, 4, (ctx) => rect(ctx, 0, 0, 4, 4, 'y'));
  canvas(scene, 'star', 1, 1, (ctx) => rect(ctx, 0, 0, 1, 1, 'W'));
}
