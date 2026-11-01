/**
 * Stroke data from KanjiVG (CC BY-SA 3.0, © Ulrich Apel).
 * Bundled locally in `./strokes/${hex}.svg` for instant, 100% offline reliability,
 * with a fallback to GitHub Raw for any characters outside the 150-kanji deck.
 */
const cache = new Map<string, Promise<string[]>>();

function parseStrokePaths(txt: string): string[] {
  const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
  const paths = Array.from(doc.querySelectorAll('path'))
    .filter((p) => /-s\d+$/.test(p.id))
    .map((p) => p.getAttribute('d')!);
  if (!paths.length) throw new Error('Empty stroke SVG');
  return paths;
}

export function loadStrokes(kanji: string): Promise<string[]> {
  if (!cache.has(kanji)) {
    const hex = kanji.codePointAt(0)!.toString(16).padStart(5, '0');
    const localUrl = `./strokes/${hex}.svg`;
    const fallbackUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

    const p = fetch(localUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(parseStrokePaths)
      .catch(() =>
        fetch(fallbackUrl)
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.text();
          })
          .then(parseStrokePaths),
      );

    p.catch(() => cache.delete(kanji));
    cache.set(kanji, p);
  }
  return cache.get(kanji)!;
}

/** Start and end points of each stroke, measured in an offscreen SVG. */
export function strokeEnds(paths: string[]) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
  document.body.appendChild(svg);
  const out = paths.map((d) => {
    const el = document.createElementNS(ns, 'path');
    el.setAttribute('d', d);
    svg.appendChild(el);
    const len = el.getTotalLength();
    const a = el.getPointAtLength(0);
    const b = el.getPointAtLength(len);
    return { start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y } };
  });
  svg.remove();
  return out;
}
