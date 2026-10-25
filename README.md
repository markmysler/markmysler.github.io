# The Station

Mark Mysler's portfolio, built as a small top-down pixel-art game. Each room of the station is a project or a part of how I work as an engineer. The title screen also offers a plain [quick view](https://markmysler.github.io/quick/) with the same content.

**Live:** https://markmysler.github.io

## What's in it

Ten areas around a central Airlock, each a project or a part of my work:

- **Airlock:** who I am, a station guide, the comms pod (contact) and the station map.
- **Punto Medio core:** the news-analysis platform I co-founded and built, with its AWS pipeline animated along the wall.
- **Navigation deck:** Pathfinder, with BFS, Dijkstra and A* racing on the floor.
- **Arcade:** pokedex-next, and a snake-ai tank where a small agent gets less random every generation.
- **Security vault:** Damn Vulnerable Containers, wpair-cli, and a safe with a small puzzle (skippable) that holds two certifications.
- **Workshop:** asciify (it turns the avatar into ASCII live), markov-passgen (it generates candidates live) and DesktopLS.
- **Training bay:** teaching at TecnoKids and the courses inside my projects.
- **Crew logs:** freelance clients and earlier work.
- **Trophy hold:** education and awards.

Items you pick up fill an inventory that reads like a CV; the PDF CV is always one click away. The minimap opens a full map (M) with an A* autopilot to any room.

Four mini-games each award a prize: **Snake** and a **slot machine** in the Arcade, **Chromle** (a Wordle with colours) in the Workshop and **Signal** (a memory game) in the Training bay.

Controls: WASD / arrows, or click or tap to move. Space to dash, E to interact, I for inventory, M for the map, Esc to close.

## Editing the map

The station is a [Tiled](https://www.mapeditor.org/) map: `public/assets/maps/station.tmj`.

- **rooms** layer: rectangles of class `room` (named after the room id) or `corridor`. A room can be several rectangles with the same name, which is how rooms get their shapes. These rectangles define the floor; `zone` (`blue` or `red`) only colours Tiled's preview.
- **objects** layer: machines, props, demos, pickups, the belt and the spawn point. The object's class picks the kind: `prop` (drawn with the texture `prop-<name>` from `src/game/props.ts`), `machine` (pipeline machines, with `icon` and `face`), `demo` (`demo`, `solid`), `pickup` (`key`), `belt` and `spawn`.
- **floor** layer: a preview for Tiled. After moving or resizing room rectangles, run `npm run map:autotile` to repaint it. In the game, each room's floor, walls and trim are painted by theme in `src/game/floors.ts`, and decor objects (`runner`, `cables`, `lasers`, `hazardzone`, `rug`) are painted on top.

Room and object names match the ids in `src/content/types.ts`; their text lives in `src/content/en.ts` and `src/content/es.ts`.

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
- Avatar, props, machines and other sprites are drawn in code in `src/game/sprites.ts` and `src/game/props.ts`.

## License

Code: MIT. The written content and CV files are © Mark Mysler.
