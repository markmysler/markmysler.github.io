import { button, el } from '../dom';
import { onKeys, type MountGame } from './types';

const N = 18;
const CELL = 14;
const GOAL = 10;
const BEST_KEY = 'station.snakeBest';

type P = { x: number; y: number };
const DIRS: Record<string, P> = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

export const mountSnake: MountGame = (root, { t, won, onWin }) => {
  let best = 0;
  try {
    best = Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    // storage blocked: best score lasts for this visit only
  }
  let snake: P[] = [];
  let dir: P = { x: 1, y: 0 };
  let queued: P[] = [];
  let apple: P = { x: 0, y: 0 };
  let score = 0;
  let timer = 0;
  let running = false;
  let prized = won;

  const board = el('canvas', { className: 'game-canvas', width: N * CELL, height: N * CELL });
  const ctx = board.getContext('2d')!;
  const status = el('p', { className: 'game-status', role: 'status' });
  const start = button(t.start, () => reset());
  const pad = el('div', { className: 'dpad' });
  for (const [key, label] of [
    ['ArrowUp', t.up],
    ['ArrowLeft', t.left],
    ['ArrowRight', t.right],
    ['ArrowDown', t.down],
  ]) {
    const b = button('', () => steer(DIRS[key]), `btn small dpad-${key}`);
    b.ariaLabel = label;
    pad.append(b);
  }
  root.append(el('p', { className: 'caption' }, won ? t.alreadyWon : t.snakeHelp), board, status, el('div', { className: 'game-row' }, start, pad));

  const say = () => {
    status.textContent = `${t.score(score, best)}${!prized && score < GOAL ? ` · ${t.snakeGoal(GOAL - score)}` : ''}`;
  };

  function placeApple() {
    do apple = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    while (snake.some((s) => s.x === apple.x && s.y === apple.y));
  }

  function draw() {
    ctx.fillStyle = '#1f1d2c';
    ctx.fillRect(0, 0, N * CELL, N * CELL);
    ctx.fillStyle = '#272338';
    for (let y = 0; y < N; y++) for (let x = (y % 2); x < N; x += 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    ctx.fillStyle = '#df213f';
    ctx.fillRect(apple.x * CELL + 2, apple.y * CELL + 2, CELL - 4, CELL - 4);
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#f5b62a' : '#289c5c';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }

  function reset() {
    snake = [
      { x: 6, y: 9 },
      { x: 5, y: 9 },
      { x: 4, y: 9 },
    ];
    dir = { x: 1, y: 0 };
    queued = [];
    score = 0;
    placeApple();
    running = true;
    start.textContent = t.again;
    say();
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = window.setTimeout(tick, Math.max(70, 130 - score * 4));
  }

  function steer(d: P) {
    if (!running) return reset();
    const last = queued[queued.length - 1] ?? dir;
    if (d.x === -last.x && d.y === -last.y) return;
    if (queued.length < 3) queued.push(d);
  }

  function tick() {
    if (queued.length) dir = queued.shift()!;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const dead = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.slice(0, -1).some((s) => s.x === head.x && s.y === head.y);
    if (dead) {
      running = false;
      status.textContent = `${t.snakeOver(score)} ${t.score(score, best)}`;
      return;
    }
    snake.unshift(head);
    if (head.x === apple.x && head.y === apple.y) {
      score++;
      if (score > best) {
        best = score;
        try {
          localStorage.setItem(BEST_KEY, String(best));
        } catch {
          // storage blocked
        }
      }
      if (score === GOAL && !prized) {
        prized = true;
        onWin();
      }
      placeApple();
      say();
    } else {
      snake.pop();
    }
    draw();
    schedule();
  }

  // Swipe on the board
  let touch: P | null = null;
  board.addEventListener('touchstart', (e) => (touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }), { passive: true });
  board.addEventListener('touchend', (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    steer(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
  });

  const offKeys = onKeys((key) => {
    if (!DIRS[key]) return false;
    steer(DIRS[key]);
    return true;
  });

  snake = [
    { x: 6, y: 9 },
    { x: 5, y: 9 },
    { x: 4, y: 9 },
  ];
  placeApple();
  draw();
  say();

  return () => {
    clearTimeout(timer);
    offKeys();
  };
};
