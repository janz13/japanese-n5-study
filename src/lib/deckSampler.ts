/**
 * Smart anti-repetition sampling utilities and shuffled-bag deck engine.
 * Keeps study drills varied across sessions and prevents early repeats
 * without breaking deterministic or headless Node test execution.
 */

export function readSeenIds(storageKey: string): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(`n5_seen_${storageKey}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

export function writeSeenIds(storageKey: string, ids: readonly string[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(`n5_seen_${storageKey}`, JSON.stringify(ids));
  } catch {
    // Ignore storage quota / restricted context errors
  }
}

export function readRoundSeq(key: string): number {
  try {
    if (typeof localStorage === 'undefined') return 0;
    const raw = localStorage.getItem(`n5_seq_${key}`);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function bumpRoundSeq(key: string): number {
  const next = readRoundSeq(key) + 1;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`n5_seq_${key}`, String(next));
    }
  } catch {
    // Ignore storage errors
  }
  return next;
}

/** Deterministic LCG Fisher–Yates shuffle — never mutates input. */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  let s = Math.abs(seed) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Record picked IDs against the seen history for a storage key.
 * When every ID in `allPoolIds` has been seen, resets the cycle cleanly
 * while preserving the newly picked IDs so they won't immediately repeat next cycle.
 */
export function commitSeenIds(
  storageKey: string,
  pickedIds: readonly string[],
  allPoolIds: readonly string[],
): void {
  if (pickedIds.length === 0) return;
  const prev = readSeenIds(storageKey);
  const prevSet = new Set(prev);
  const nextSet = new Set(prev);
  for (const id of pickedIds) nextSet.add(id);

  const allCovered =
    allPoolIds.length > 0 && allPoolIds.every((id) => nextSet.has(id));

  if (allCovered) {
    // Keep only the most recent picks as "just seen" for the next cycle
    writeSeenIds(storageKey, [...new Set(pickedIds)]);
    return;
  }

  const next = [...prev];
  for (const id of pickedIds) {
    if (!prevSet.has(id)) {
      prevSet.add(id);
      next.push(id);
    }
  }
  writeSeenIds(storageKey, next);
}

/**
 * Pick `count` items from `items` preferring items never seen in `storageKey`.
 * Falls back to shuffled already-seen items only when fewer than `count` unseen remain,
 * excluding the immediately previous seen ID across cycle boundaries when possible.
 */
export function pickUnseenBatch<T>(
  items: readonly T[],
  getId: (item: T) => string,
  count: number,
  storageKey: string,
  seed: number,
  commit = false,
): T[] {
  if (items.length === 0 || count <= 0) return [];
  const target = Math.min(count, items.length);
  const seen = readSeenIds(storageKey);
  const seenSet = new Set(seen);

  const unseen = seededShuffle(
    items.filter((item) => !seenSet.has(getId(item))),
    seed,
  );

  let picked: T[];
  if (unseen.length >= target) {
    picked = unseen.slice(0, target);
  } else {
    const lastSeenId = seen.length > 0 ? seen[seen.length - 1] : null;
    const seenItems = items.filter((item) => seenSet.has(getId(item)));
    const nonBoundary = seenItems.filter((item) => getId(item) !== lastSeenId);
    const tail = seenItems.filter((item) => getId(item) === lastSeenId);
    const fallbackPool = [
      ...seededShuffle(nonBoundary, seed + 97),
      ...seededShuffle(tail, seed + 193),
    ];
    picked = [...unseen, ...fallbackPool.slice(0, target - unseen.length)];
  }

  if (commit && picked.length > 0) {
    commitSeenIds(
      storageKey,
      picked.map(getId),
      items.map(getId),
    );
  }
  return picked;
}

/**
 * Stateful shuffled-bag sampler for endless Dojo sessions.
 * - Deals every item in the pool once before reshuffling a new bag.
 * - Enforces a boundary cooldown so the end of one bag never repeats at the start of the next.
 * - Supports spaced intra-session requeuing for missed prompts.
 */
export class DeckBag<T> {
  private readonly items: readonly T[];
  private readonly getId: (item: T) => string;
  private readonly storageKey?: string;
  private readonly weightFn?: (item: T) => number;
  private queue: T[] = [];
  private recentIds: string[] = [];

  constructor(
    items: readonly T[],
    getId: (item: T) => string,
    storageKey?: string,
    weightFn?: (item: T) => number,
  ) {
    this.items = items;
    this.getId = getId;
    this.storageKey = storageKey;
    this.weightFn = weightFn;
  }

  private refill(initial: boolean): void {
    if (this.items.length === 0) {
      this.queue = [];
      return;
    }

    const rawSeen = initial && this.storageKey ? readSeenIds(this.storageKey) : [];
    const seenSet = new Set(rawSeen);
    const unseen = rawSeen.length > 0 ? this.items.filter((x) => !seenSet.has(this.getId(x))) : [];
    const basePool = unseen.length > 0 ? unseen : [...this.items];

    const cooldown = Math.min(3, Math.floor(basePool.length / 2));
    const boundarySeed =
      this.recentIds.length > 0
        ? this.recentIds.slice(-cooldown)
        : rawSeen.length > 0
          ? rawSeen.slice(-1)
          : [];

    const sorted = [...basePool]
      .map((item) => {
        const w = Math.max(0.25, this.weightFn ? this.weightFn(item) : 1);
        const r = Math.random() || 1e-6;
        return { item, score: Math.pow(r, 1 / w) };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    if (cooldown > 0 && boundarySeed.length > 0 && sorted.length > cooldown) {
      const safe: T[] = [];
      const held: T[] = [];
      for (const item of sorted) {
        if (boundarySeed.includes(this.getId(item)) && safe.length < cooldown) {
          held.push(item);
        } else {
          safe.push(item);
        }
      }
      this.queue = [...safe.slice(0, cooldown), ...held, ...safe.slice(cooldown)];
    } else {
      this.queue = sorted;
    }
  }

  next(): T | null {
    if (this.items.length === 0) return null;
    if (this.queue.length === 0) {
      this.refill(this.recentIds.length === 0);
    }
    const picked = this.queue.shift() ?? null;
    if (!picked) return null;

    const id = this.getId(picked);
    this.recentIds.push(id);
    if (this.recentIds.length > 12) {
      this.recentIds = this.recentIds.slice(-12);
    }

    if (this.storageKey) {
      commitSeenIds(
        this.storageKey,
        [id],
        this.items.map(this.getId),
      );
    }
    return picked;
  }

  requeueMissed(item: T, spacing = 4): void {
    if (this.items.length <= 1) return;
    if (this.queue.length === 0) {
      this.refill(false);
    }
    const id = this.getId(item);
    const safeSpacing = Math.max(1, Math.min(spacing, this.items.length - 1));
    const windowCheck = Math.min(safeSpacing, this.queue.length);
    for (let i = 0; i < windowCheck; i++) {
      if (this.getId(this.queue[i]) === id) return;
    }
    // Remove later occurrence in the current bag so total card count stays clean
    const existingIdx = this.queue.findIndex((q) => this.getId(q) === id);
    if (existingIdx !== -1) {
      this.queue.splice(existingIdx, 1);
    }
    const insertAt = Math.min(safeSpacing, this.queue.length);
    this.queue.splice(insertAt, 0, item);
  }
}
