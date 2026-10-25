export interface Cell {
  x: number;
  y: number;
}

/**
 * A* on a 4-connected grid with a Manhattan heuristic.
 * Returns the cells after `from` up to and including `to`, or null if unreachable.
 */
export function astar(from: Cell, to: Cell, walkable: (x: number, y: number) => boolean, width: number): Cell[] | null {
  if (!walkable(to.x, to.y)) return null;
  const key = (x: number, y: number) => y * width + x;
  const h = (x: number, y: number) => Math.abs(x - to.x) + Math.abs(y - to.y);

  const g = new Map<number, number>([[key(from.x, from.y), 0]]);
  const parent = new Map<number, number>();
  // The grid is small (44x26), so a sorted array is plenty.
  const open: { x: number; y: number; f: number }[] = [{ ...from, f: h(from.x, from.y) }];
  const closed = new Set<number>();

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    const ck = key(cur.x, cur.y);
    if (closed.has(ck)) continue;
    if (cur.x === to.x && cur.y === to.y) {
      const path: Cell[] = [];
      for (let k: number | undefined = ck; k !== undefined && k !== key(from.x, from.y); k = parent.get(k)) {
        path.unshift({ x: k % width, y: Math.floor(k / width) });
      }
      return path;
    }
    closed.add(ck);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (!walkable(nx, ny)) continue;
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;
      const ng = g.get(ck)! + 1;
      if (ng < (g.get(nk) ?? Infinity)) {
        g.set(nk, ng);
        parent.set(nk, ck);
        open.push({ x: nx, y: ny, f: ng + h(nx, ny) });
      }
    }
  }
  return null;
}
