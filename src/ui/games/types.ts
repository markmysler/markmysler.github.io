import type { Content } from '../../content/types';

export interface GameContext {
  t: Content['games'];
  /** Whether this game's prize is already in the inventory. */
  won: boolean;
  onWin(): void;
}

/** Mounts a game into `root` and returns a cleanup function for when its panel closes. */
export type MountGame = (root: HTMLElement, ctx: GameContext) => () => void;

/** Keyboard handler that ignores typing in inputs and stops the page from scrolling. */
export function onKeys(handler: (key: string) => boolean) {
  const listener = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (handler(e.key)) e.preventDefault();
  };
  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}
