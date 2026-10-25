# The Station

Mark Mysler's portfolio, built as a small top-down pixel-art game. Each room of the station is a project or a part of how I work as an engineer. The title screen also offers a plain [quick view](https://markmysler.github.io/quick/) with the same content.

**Live:** https://markmysler.github.io

## What's in it

- **Airlock:** who I am, a station guide, the comms pod (contact) and a map of the station.
- **Punto Medio core:** the news-analysis platform I co-founded and built, with its AWS pipeline animated along the wall. Articles move from the EventBridge schedule through SQS, Lambda, pgvector + HDBSCAN clustering, LLM analysis, the evaluation harness and Wikidata linking, then out to the Next.js apps.
- **Sealed doors** to the rooms coming next (Navigation deck, Arcade, Security vault, Crew logs), each one already linking to the real project.
- **Inventory:** items you pick up form a CV you can read; the PDF CV is one click away.

Controls: WASD / arrows, or click or tap to move (the route is planned with A*). Press E to interact, I for inventory, Esc to close.

## Stack

Phaser 3, TypeScript and Vite. The quick view is static HTML rendered at build time from the same content files as the game (`src/content/en.ts`, `src/content/es.ts`), so the two never drift apart. Deployed to GitHub Pages by GitHub Actions.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build to dist/
```

## Credits

- Floor and wall tiles: [Sci-fi Interior tiles](https://opengameart.org/content/sci-fi-interior-tiles) by [Buch](https://opengameart.org/users/buch), CC0.
- Font: [Silkscreen](https://fonts.google.com/specimen/Silkscreen) by Jason Kottke, SIL Open Font License.
- Avatar, machines and other sprites are drawn in code in `src/game/sprites.ts`.

## License

Code: MIT. The written content and CV files are © Mark Mysler.
