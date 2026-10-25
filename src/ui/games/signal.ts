import { button, el } from '../dom';
import { onKeys, type MountGame } from './types';

const PADS = ['#1dc7e6', '#ff34c3', '#f5b62a', '#289c5c'];
const WIN_ROUND = 6;

/** Simon-style memory game: repeat a sequence that grows by one each round. */
export const mountSignal: MountGame = (root, { t, won, onWin }) => {
  let seq: number[] = [];
  let input = 0;
  let listening = false;
  let prized = won;
  const timers: number[] = [];
  const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

  const status = el('p', { className: 'game-status', role: 'status' });
  const pads = PADS.map((c, i) => {
    const b = button(String(i + 1), () => press(i), 'signal-pad');
    b.style.setProperty('--pad', c);
    return b;
  });
  const startBtn = button(t.start, () => start(), 'btn primary small');
  root.append(el('p', { className: 'caption' }, won ? t.alreadyWon : t.signalHelp), el('div', { className: 'signal-grid' }, ...pads), el('div', { className: 'game-row' }, startBtn), status);

  async function flash(i: number, ms: number) {
    pads[i].classList.add('lit');
    await wait(ms);
    pads[i].classList.remove('lit');
  }

  async function playback() {
    listening = false;
    status.textContent = `${t.signalRound(seq.length)} · ${t.signalWatch}`;
    const speed = Math.max(220, 480 - seq.length * 30);
    await wait(500);
    for (const i of seq) {
      await flash(i, speed);
      await wait(140);
    }
    input = 0;
    listening = true;
    status.textContent = `${t.signalRound(seq.length)} · ${t.signalYourTurn}`;
  }

  function start() {
    seq = [Math.floor(Math.random() * PADS.length)];
    startBtn.textContent = t.again;
    void playback();
  }

  function press(i: number) {
    if (!listening) return;
    void flash(i, 160);
    if (i !== seq[input]) {
      listening = false;
      status.textContent = t.signalLost(seq.length);
      return;
    }
    input++;
    if (input < seq.length) return;
    listening = false;
    if (seq.length === WIN_ROUND && !prized) {
      prized = true;
      onWin();
      status.textContent = t.signalWin;
      return;
    }
    seq.push(Math.floor(Math.random() * PADS.length));
    void playback();
  }

  const offKeys = onKeys((key) => {
    const n = Number(key);
    if (!(n >= 1 && n <= PADS.length)) return false;
    press(n - 1);
    return true;
  });

  return () => {
    timers.forEach(clearTimeout);
    listening = false;
    offKeys();
  };
};
