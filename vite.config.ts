import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { renderQuickView } from './src/quick/render';

// Quick view is plain HTML rendered from the same content files the game uses,
// so crawlers, screen readers and link previews get real text.
function quickView(): Plugin {
  return {
    name: 'quick-view',
    transformIndexHtml(html, ctx) {
      const file = ctx.filename.replace(/\\/g, '/');
      if (file.endsWith('/quick/es/index.html')) return html.replace('<!--QUICK-->', renderQuickView('es'));
      if (file.endsWith('/quick/index.html')) return html.replace('<!--QUICK-->', renderQuickView('en'));
      return html;
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [quickView()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        quick: resolve(__dirname, 'quick/index.html'),
        quickEs: resolve(__dirname, 'quick/es/index.html'),
      },
    },
  },
});
