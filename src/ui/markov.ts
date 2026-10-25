// A toy order-2 character chain, the idea behind markov-passgen in a few lines.
const CORPUS = [
  'station', 'airlock', 'pipeline', 'cluster', 'lambda', 'vector', 'postgres', 'terraform', 'pathfinder',
  'dijkstra', 'container', 'payload', 'kernel', 'buenosaires', 'belgrano', 'palermo', 'tango', 'mate',
  'puntomedio', 'noticia', 'perspectiva', 'encuadre', 'medio', 'serpiente', 'snake', 'robot', 'orbita',
];

type Chain = Map<string, string[]>;

function build(order = 2): Chain {
  const chain: Chain = new Map();
  for (const word of CORPUS) {
    const padded = '^'.repeat(order) + word + '$';
    for (let i = 0; i + order < padded.length; i++) {
      const key = padded.slice(i, i + order);
      const next = chain.get(key) ?? [];
      next.push(padded[i + order]);
      chain.set(key, next);
    }
  }
  return chain;
}

const chain = build();
const LEET: Record<string, string> = { a: '4', e: '3', i: '1', o: '0', s: '5' };

function word(): string {
  let key = '^^';
  let out = '';
  while (out.length < 12) {
    const options = chain.get(key);
    if (!options) break;
    const ch = options[Math.floor(Math.random() * options.length)];
    if (ch === '$') break;
    out += ch;
    key = key[1] + ch;
  }
  return out;
}

/** A few candidates in markov-passgen's spirit: chained words, some leetspeak, a digit tail. */
export function candidates(n = 5): string[] {
  return Array.from({ length: n }, () => {
    let w = word();
    while (w.length < 6) w += word();
    w = w.slice(0, 12).replace(/[aeios]/g, (c) => (Math.random() < 0.3 ? LEET[c] : c));
    w = w[0].toUpperCase() + w.slice(1);
    return w + Math.floor(Math.random() * 90 + 10);
  });
}
