import Phaser from 'phaser';
import type { Lang } from '../content/types';
import { UI } from '../ui/ui';
import { StationScene } from './StationScene';

export function startGame(parent: HTMLElement, lang: Lang) {
  const scene = () => game.scene.getScene('station') as StationScene | null;
  const ui = new UI(lang, {
    onLang: (l) => scene()?.setLang(l),
    onMotion: (on) => scene()?.setMotion(on),
    onClose: () => {
      scene()?.releaseKeys();
      parent.querySelector('canvas')?.focus();
    },
    onTravel: (room) => scene()?.travelTo(room),
    onSafeOpen: () => scene()?.openSafe(),
    onDash: () => scene()?.dash(),
  });

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1f1d2c',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [],
  });
  game.scene.add('station', StationScene, true, { ui, lang });
  // Dev only: lets tests step frames while the tab is hidden and rAF is paused.
  if (import.meta.env.DEV) Object.assign(window, { __game: game, __ui: ui });
  return game;
}
