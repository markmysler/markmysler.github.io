import { button, el } from '../dom';
import { onKeys, type MountGame } from './types';

/** Reel symbols: a glyph and its colour. The pity spin always lands on sevens. */
const SYMBOLS: [string, string][] = [
  ['7', '#df213f'],
  ['λ', '#ed8024'],
  ['★', '#f5b62a'],
  ['◆', '#1dc7e6'],
  ['●', '#ff34c3'],
];
const JACKPOT_CHANCE = 0.15;
/** Nobody should have to spin forever for a portfolio prize. */
const PITY_SPIN = 7;

export const mountSlots: MountGame = (root, { t, won, onWin }) => {
  let spinning = false;
  let spins = 0;
  let prized = won;
  const timers: number[] = [];

  const reels = SYMBOLS.slice(0, 3).map(() => el('span', { className: 'slot-reel' }));
  const status = el('p', { className: 'game-status', role: 'status' });
  const counter = el('p', { className: 'caption' });
  const spinBtn = button(t.spin, () => spin(), 'btn primary');
  root.append(
    el('p', { className: 'caption' }, won ? t.alreadyWon : t.slotsHelp),
    el('div', { className: 'slot-window' }, ...reels),
    el('div', { className: 'game-row' }, spinBtn),
    status,
    counter,
  );

  const show = (reel: HTMLElement, s: number) => {
    reel.textContent = SYMBOLS[s][0];
    reel.style.color = SYMBOLS[s][1];
  };
  [1, 2, 3].forEach((s, i) => show(reels[i], s));

  function outcome(): number[] {
    const r = () => Math.floor(Math.random() * SYMBOLS.length);
    if (!prized && (spins >= PITY_SPIN || Math.random() < JACKPOT_CHANCE)) {
      const s = spins >= PITY_SPIN ? 0 : r();
      return [s, s, s];
    }
    // Otherwise any honest roll, minus accidental triples (those only come from the line above).
    let roll: number[];
    do roll = [r(), r(), r()];
    while (!prized && roll[0] === roll[1] && roll[1] === roll[2]);
    return roll;
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    spins++;
    counter.textContent = t.spins(spins);
    status.textContent = '';
    const result = outcome();
    reels.forEach((reel, i) => {
      reel.classList.add('spinning');
      let s = 0;
      const roll = window.setInterval(() => show(reel, (s = (s + 1) % SYMBOLS.length)), 60);
      timers.push(
        roll,
        window.setTimeout(() => {
          clearInterval(roll);
          reel.classList.remove('spinning');
          show(reel, result[i]);
          if (i === reels.length - 1) settle(result);
        }, 600 + i * 350),
      );
    });
  }

  function settle([a, b, c]: number[]) {
    spinning = false;
    spinBtn.disabled = false;
    if (a === b && b === c) {
      status.textContent = t.slotsWin;
      if (!prized) {
        prized = true;
        onWin();
      }
    } else {
      status.textContent = a === b || b === c || a === c ? t.slotsPair : t.slotsMiss;
    }
  }

  const offKeys = onKeys((key) => {
    if (key !== ' ' && key !== 'Enter') return false;
    spin();
    return true;
  });

  return () => {
    timers.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
    });
    offKeys();
  };
};
