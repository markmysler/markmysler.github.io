import Phaser from 'phaser';

/** Palette shared with the CC0 tileset, plus skin and hair for the avatar. */
export const PAL: Record<string, string> = {
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
  B: '#6b3d2e',
  T: '#b27856',
  x: '#6f76ae',
  G: '#17432f',
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

export function drawRows(ctx: Ctx, rows: string[], ox = 0, oy = 0) {
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

export function canvas(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx) => void) {
  const tex = scene.textures.createCanvas(key, w, h)!;
  draw(tex.getContext());
  tex.refresh();
  return tex;
}

// ---------- Avatar (16x24, 9 frames: down, up, side × idle/stepA/stepB) ----------

export const HEAD_DOWN = [
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
export const BODY_DOWN = [
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

// ---------- 12x12 icons for the pipeline machines ----------

const ICONS: Record<string, string[]> = {
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

/** Small pickups and props drawn from rows. */
const ROW_SPRITES: Record<string, string[]> = {
  compass: [
    '....kkkkkk....',
    '..kkwwwwwwkk..',
    '.kwwwwrwwwwwk.',
    '.kwwwwrrwwwwk.',
    'kwwwwwrrwwwwwk',
    'kwwwwrrrwwwwwk',
    'kwwwwwkkwwwwwk',
    'kwwwwwbbbwwwwk',
    'kwwwwwwbbwwwwk',
    '.kwwwwwbwwwwk.',
    '.kwwwwwbwwwwk.',
    '..kkwwwwwwkk..',
    '....kkkkkk....',
  ],
  case: [
    '..kkkkkkkkkk..',
    '.krrrrrrrrrrk.',
    'krrrrrrrrrrrrk',
    'krrrrryyrrrrrk',
    'kkkkkkyykkkkkk',
    'kwwwwwyywwwwwk',
    'kwwwwwwwwwwwwk',
    '.kwwwwwwwwwwk.',
    '..kkkkkkkkkk..',
  ],
  chip: [
    '..k.k.k.k...',
    '.kkkkkkkkk..',
    'kkgggggggkk.',
    '.kgcgggcgk..',
    'kkgggcgggkk.',
    '.kgcgggcgk..',
    'kkgggggggkk.',
    '.kkkkkkkkk..',
    '..k.k.k.k...',
  ],
  robotkit: [
    '....kk......',
    '....rr......',
    '.kkkkkkkkkk.',
    '.kllllllllk.',
    '.klcllllclk.',
    '.kllllllllk.',
    '.kllkkkkllk.',
    '.kllllllllk.',
    '.kkkkkkkkkk.',
    '..knk..knk..',
    '..kkk..kkk..',
  ],
  logbook: [
    '.kkkkkkkkkk.',
    '.kooooooook.',
    '.kowwwwwwok.',
    '.kooooooook.',
    '.kooyyyyook.',
    '.kooooooook.',
    '.kooooooook.',
    '.kooooooook.',
    '.kkkkkkkkkk.',
  ],
  studentid: [
    'kkkkkkkkkkkkkk',
    'kbbbbbbbbbbbbk',
    'kbwwwbbbbbbbbk',
    'kbwhwbwwwwwwbk',
    'kbwswbbbbbbbbk',
    'kbwwwbwwwwbbbk',
    'kbbbbbbbbbbbbk',
    'kkkkkkkkkkkkkk',
  ],
  medal: [
    '..rr..rr..',
    '..rr..rr..',
    '...rrrr...',
    '....rr....',
    '...kkkk...',
    '..kyyyyk..',
    '.kyyYyyyk.',
    '.kyYYYyyk.',
    '.kyyYyyyk.',
    '..kyyyyk..',
    '...kkkk...',
  ],
  certificate: [
    'kkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwk',
    'kwllllllllllwk',
    'kwwwwwwwwwwwwk',
    'kwllllllllwwwk',
    'kwwwwwwwwwwwwk',
    'kwllllllwwrrwk',
    'kwwwwwwwwwrrwk',
    'kkkkkkkkkkkkkk',
  ],
  robot: [
    '..kkkkkkkk..',
    '.kllllllllk.',
    'kkllcllcllkk',
    'kkllllllllkk',
    'kkllllllllkk',
    '.kllkkkkllk.',
    '.kllllllllk.',
    '..kkkkkkkk..',
  ],
};


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
  for (const [key, rows] of Object.entries(ROW_SPRITES)) {
    canvas(scene, key, rows[0].length, rows.length, (ctx) => drawRows(ctx, rows));
  }

  canvas(scene, 'dot', 4, 4, (ctx) => rect(ctx, 0, 0, 4, 4, 'y'));
  canvas(scene, 'star', 1, 1, (ctx) => rect(ctx, 0, 0, 1, 1, 'W'));
}

/**
 * The avatar's front frame as ASCII art: each pixel's brightness picks a character,
 * doubled horizontally because characters are about twice as tall as they are wide.
 */
export function avatarAscii(): string {
  // Light text on a dark panel, so brighter pixels get denser characters.
  const ramp = ' .:-=+*#%@';
  const luma = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  };
  return avatarFrames()[0]
    .slice(3)
    .map((row) =>
      [...row]
        .map((ch) => {
          const col = PAL[ch];
          const c = col ? ramp[Math.max(1, Math.round(luma(col) * (ramp.length - 1)))] : ' ';
          return c + c;
        })
        .join('')
        .trimEnd(),
    )
    .join('\n');
}
