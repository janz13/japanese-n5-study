export const isKana = (ch: string) => {
  const c = ch.charCodeAt(0);
  return (c >= 0x3040 && c <= 0x309f) || (c >= 0x30a0 && c <= 0x30ff);
};

export function splitFurigana(t: string, r: string) {
  if (t === r || !/[\u4e00-\u9faf]/.test(t)) {
    return { prefix: '', base: t, rt: '', suffix: '' };
  }
  let p = 0;
  while (p < t.length && p < r.length && t[p] === r[p] && isKana(t[p])) p++;
  let s = 0;
  while (
    s < t.length - p &&
    s < r.length - p &&
    t[t.length - 1 - s] === r[r.length - 1 - s] &&
    isKana(t[t.length - 1 - s])
  ) {
    s++;
  }
  const prefix = t.slice(0, p);
  const suffix = s > 0 ? t.slice(t.length - s) : '';
  const base = t.slice(p, t.length - s);
  const rt = r.slice(p, r.length - s);
  return { prefix, base: base || t, rt: base ? rt : r, suffix: base ? suffix : '' };
}
