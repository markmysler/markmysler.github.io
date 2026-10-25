export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

export function button(label: string, onClick: () => void, className = 'btn small') {
  const b = el('button', { className, type: 'button', textContent: label });
  b.addEventListener('click', onClick);
  return b;
}
