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
  return game;
}
