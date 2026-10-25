import { button, el } from '../dom';
import { onKeys, type MountGame } from './types';

const LEN = 5;
const TRIES = 6;
const COLORS = ['#df213f', '#ed8024', '#f5b62a', '#289c5c', '#1dc7e6', '#ff34c3'];
/** A shape per colour, so the game doesn't rely on telling colours apart. */
const SHAPES = ['●', '▲', '■', '◆', '★', '✚'];
type Mark = 'hit' | 'near' | 'miss';

/** Wordle scoring: exact matches first, then right colour in the wrong place, counting duplicates. */
export function score(guess: number[], code: number[]): Mark[] {
  const marks: Mark[] = guess.map((g, i) => (g === code[i] ? 'hit' : 'miss'));
  const left = new Map<number, number>();
  code.forEach((c, i) => marks[i] !== 'hit' && left.set(c, (left.get(c) ?? 0) + 1));
  guess.forEach((g, i) => {
    if (marks[i] === 'hit' || !left.get(g)) return;
    marks[i] = 'near';
    left.set(g, left.get(g)! - 1);
  });
  return marks;
}

export const mountChromle: MountGame = (root, { t, won, onWin }) => {
  let code: number[] = [];
  let rows: { guess: number[]; marks: Mark[] }[] = [];
  let current: number[] = [];
  let over = false;
  let prized = won;

  const grid = el('div', { className: 'chromle-grid' });
  const status = el('p', { className: 'game-status', role: 'status' });
  const palette = el('div', { className: 'chromle-palette' });
  COLORS.forEach((c, i) => {
    const b = button(SHAPES[i], () => add(i), 'chromle-swatch');
    b.style.background = c;
    b.ariaLabel = `${i + 1} · ${t.colors[i]}`;
    palette.append(b);
  });
  const again = button(t.again, () => reset());
  const controls = el('div', { className: 'game-row' }, button(t.erase, () => erase()), button(t.guess, () => submit(), 'btn small primary'), again);
  root.append(el('p', { className: 'caption' }, won ? t.alreadyWon : t.chromleHelp), grid, palette, controls, status);

  const peg = (c: number | undefined, mark?: Mark) => {
    const cell = el('span', { className: `chromle-peg ${mark ?? ''}` }, c === undefined ? '' : SHAPES[c]);
    if (c !== undefined) {
      cell.style.background = COLORS[c];
      cell.title = `${t.colors[c]}${mark ? ` · ${t[mark]}` : ''}`;
    }
    if (mark) cell.append(el('i', { className: 'chromle-mark' }, mark === 'hit' ? '✓' : mark === 'near' ? '~' : '×'));
    return cell;
  };

  function render() {
    grid.replaceChildren(
      ...Array.from({ length: TRIES }, (_, r) => {
        const row = rows[r];
        const guess = row?.guess ?? (r === rows.length ? current : []);
        return el('div', { className: 'chromle-row' }, ...Array.from({ length: LEN }, (_, i) => peg(guess[i], row?.marks[i])));
      }),
    );
    again.hidden = !over;
  }

  function reset() {
    code = Array.from({ length: LEN }, () => Math.floor(Math.random() * COLORS.length));
    rows = [];
    current = [];
    over = false;
    status.textContent = '';
    render();
  }

  function add(c: number) {
    if (over || current.length >= LEN) return;
    current.push(c);
    render();
  }

  function erase() {
    if (over) return;
    current.pop();
    render();
  }

  function submit() {
    if (over || current.length < LEN) return;
    const marks = score(current, code);
    rows.push({ guess: current, marks });
    current = [];
    if (marks.every((m) => m === 'hit')) {
      over = true;
      status.textContent = t.chromleWin(rows.length);
      if (!prized) {
        prized = true;
        onWin();
      }
    } else if (rows.length === TRIES) {
      over = true;
      status.replaceChildren(t.chromleLose, ' ', el('span', { className: 'chromle-row inline' }, ...code.map((c) => peg(c))));
    }
    render();
  }

  const offKeys = onKeys((key) => {
    const n = Number(key);
    if (n >= 1 && n <= COLORS.length) add(n - 1);
    else if (key === 'Backspace') erase();
    else if (key === 'Enter') submit();
    else return false;
    return true;
  });

  reset();
  return offKeys;
};
