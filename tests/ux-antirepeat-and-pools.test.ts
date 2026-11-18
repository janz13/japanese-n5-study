import './helpers/test-runner.ts';
import assert from 'node:assert/strict';
import {
  DeckBag,
  bumpRoundSeq,
  commitSeenIds,
  pickUnseenBatch,
  readRoundSeq,
  readSeenIds,
} from '../src/lib/deckSampler.ts';
import {
  BEGINNER_BENTO_POOL,
  BEGINNER_TRACE_KANJI,
  TRAVEL_BENTO_POOL,
} from '../src/data/bentoStarterPool.ts';
import { PARTICLE_SLOT_CHALLENGES } from '../src/data/particles.ts';
import { KANJI } from '../src/data/kanji.ts';
import { SIGNS } from '../src/data/signs.ts';

console.log('================================================================');
console.log('UX ANTI-REPETITION ENGINE & EXPANDED POOLS VERIFICATION SUITE');
console.log('================================================================\n');

// Ensure clean test localStorage state for our test keys
const clearKeys = (prefix: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(prefix);
    }
  } catch {
    // ignore
  }
};

// 1. DeckBag Exhaustion Without Duplicates & Boundary Cooldown
{
  const items = Array.from({ length: 12 }, (_, i) => ({ id: `item-${i}`, val: i }));
  clearKeys('n5_seen_test_bag');
  const bag = new DeckBag(items, (x) => x.id, 'test_bag');

  const firstCycle: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const picked = bag.next();
    assert.ok(picked, 'DeckBag.next() must return an item');
    firstCycle.push(picked.id);
  }

  // Every single item must be dealt once before reshuffling
  assert.strictEqual(
    new Set(firstCycle).size,
    items.length,
    'DeckBag must deal all N items with 0 duplicates before reshuffling',
  );

  // Boundary cooldown: the first 3 items of cycle 2 must not overlap the last 3 items of cycle 1
  const lastWindow = new Set(firstCycle.slice(-3));
  const secondCycleHead: string[] = [];
  for (let i = 0; i < 3; i++) {
    const picked = bag.next();
    assert.ok(picked);
    secondCycleHead.push(picked.id);
    assert.ok(
      !lastWindow.has(picked.id),
      `Cycle 2 head item ${picked.id} repeated too early from tail of Cycle 1`,
    );
  }
  console.log('✓ 1. DeckBag full-bag exhaustion (0 duplicates) and boundary cooldown verified.');
}

// 2. DeckBag.requeueMissed Spaced Reinforcement
{
  const items = Array.from({ length: 10 }, (_, i) => ({ id: `rq-${i}` }));
  const bag = new DeckBag(items, (x) => x.id);
  const first = bag.next()!;
  bag.requeueMissed(first, 4);

  const upcoming: string[] = [];
  for (let i = 0; i < 4; i++) {
    upcoming.push(bag.next()!.id);
  }
  assert.ok(
    !upcoming.includes(first.id),
    `Missed item ${first.id} must not appear in the next 4 deals (got: ${upcoming.join(', ')})`,
  );
  const fifth = bag.next()!;
  assert.strictEqual(fifth.id, first.id, 'Missed item must return at the exact spaced offset');
  console.log('✓ 2. DeckBag.requeueMissed spaces missed items cleanly without back-to-back repeats.');
}

// 3. pickUnseenBatch + commitSeenIds Full-Cycle Coverage
{
  const pool = Array.from({ length: 15 }, (_, i) => ({ id: `batch-${i}` }));
  clearKeys('n5_seen_test_batch_cycle');
  const seenAll: string[] = [];

  for (let round = 0; round < 3; round++) {
    const batch = pickUnseenBatch(
      pool,
      (x) => x.id,
      5,
      'test_batch_cycle',
      1000 + round * 997,
      true,
    );
    assert.strictEqual(batch.length, 5);
    seenAll.push(...batch.map((b) => b.id));
  }

  assert.strictEqual(
    new Set(seenAll).size,
    pool.length,
    'Sequential pickUnseenBatch sessions must cover all 15 items with 0 repeats before cycle reset',
  );

  // Cycle wrap should reset seen history while keeping the final batch excluded from immediate repeat
  const round4 = pickUnseenBatch(pool, (x) => x.id, 5, 'test_batch_cycle', 5000, true);
  assert.strictEqual(round4.length, 5);
  const prevBatchIds = new Set(seenAll.slice(-5));
  for (const x of round4) {
    assert.ok(
      !prevBatchIds.has(x.id),
      `Post-wrap round4 picked ${x.id} which was in immediately preceding round3`,
    );
  }
  console.log('✓ 3. pickUnseenBatch + commitSeenIds cycle coverage and anti-repeat wrap verified.');
}

// 4. Round sequence counter helper
{
  clearKeys('n5_seq_test_round');
  assert.strictEqual(readRoundSeq('test_round'), 0);
  assert.strictEqual(bumpRoundSeq('test_round'), 1);
  assert.strictEqual(bumpRoundSeq('test_round'), 2);
  assert.strictEqual(readRoundSeq('test_round'), 2);
  console.log('✓ 4. readRoundSeq / bumpRoundSeq persistence verified.');
}

// 5. Starter Bento Pools & Trace Kanji Data Integrity
{
  assert.ok(
    BEGINNER_BENTO_POOL.length >= 55,
    `BEGINNER_BENTO_POOL must have >= 55 items, found ${BEGINNER_BENTO_POOL.length}`,
  );
  assert.ok(
    TRAVEL_BENTO_POOL.length >= 55,
    `TRAVEL_BENTO_POOL must have >= 55 items, found ${TRAVEL_BENTO_POOL.length}`,
  );

  for (const [name, list] of [
    ['BEGINNER_BENTO_POOL', BEGINNER_BENTO_POOL],
    ['TRAVEL_BENTO_POOL', TRAVEL_BENTO_POOL],
  ] as const) {
    const ids = new Set<string>();
    for (const item of list) {
      assert.ok(item.id && !ids.has(item.id), `Duplicate or empty ID '${item.id}' in ${name}`);
      ids.add(item.id);
      assert.ok(item.front.trim().length > 0, `Empty front on ${item.id}`);
      assert.ok(item.reading.trim().length > 0, `Empty reading on ${item.id}`);
      assert.ok(item.back.trim().length > 0, `Empty back on ${item.id}`);
    }
  }

  const kanjiSet = new Set(KANJI.map((k) => k.k));
  assert.ok(BEGINNER_TRACE_KANJI.length >= 25, 'BEGINNER_TRACE_KANJI must cover >= 25 beginner kanji');
  for (const k of BEGINNER_TRACE_KANJI) {
    assert.ok(kanjiSet.has(k), `BEGINNER_TRACE_KANJI entry '${k}' missing from KANJI catalog`);
  }
  assert.ok(SIGNS.length >= 35, `SIGNS catalog should remain >= 35, found ${SIGNS.length}`);
  console.log(
    `✓ 5. Expanded pools verified (Beginner: ${BEGINNER_BENTO_POOL.length}, Travel: ${TRAVEL_BENTO_POOL.length}, Trace: ${BEGINNER_TRACE_KANJI.length}, Signs: ${SIGNS.length}).`,
  );
}

// 6. Expanded PARTICLE_SLOT_CHALLENGES (psc-1 through psc-26) Invariants
{
  assert.ok(
    PARTICLE_SLOT_CHALLENGES.length >= 25,
    `PARTICLE_SLOT_CHALLENGES must have >= 25 entries, got ${PARTICLE_SLOT_CHALLENGES.length}`,
  );
  const standardParticles = new Set(['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'から', 'まで', 'より', 'も']);
  const ids = new Set<string>();
  for (const ch of PARTICLE_SLOT_CHALLENGES) {
    assert.ok(!ids.has(ch.id), `Duplicate slot challenge ID '${ch.id}'`);
    ids.add(ch.id);
    assert.ok(
      ch.correctParticles.length >= 2 && ch.correctParticles.length <= 3,
      `${ch.id} must have 2-3 slots`,
    );
    assert.strictEqual(
      ch.sentenceSegments.length,
      ch.correctParticles.length + 1,
      `${ch.id} segment/slot invariant mismatch`,
    );
    assert.strictEqual(
      ch.semanticRoles.length,
      ch.correctParticles.length,
      `${ch.id} semanticRoles count mismatch`,
    );
    for (const p of ch.correctParticles) {
      assert.ok(standardParticles.has(p), `${ch.id} invalid target particle '${p}'`);
      assert.ok(ch.particleBank.includes(p), `${ch.id} bank missing '${p}'`);
    }
    const distractors = ch.particleBank.filter((p) => !ch.correctParticles.includes(p));
    assert.ok(distractors.length >= 3, `${ch.id} must have >= 3 distractors`);
    assert.ok(
      ch.particleBank.length >= 6 && ch.particleBank.length <= 8,
      `${ch.id} particleBank length out of 6-8 range`,
    );
    assert.strictEqual(new Set(ch.particleBank).size, ch.particleBank.length, `${ch.id} duplicate particle in bank`);
  }
  console.log(`✓ 6. All ${PARTICLE_SLOT_CHALLENGES.length} PARTICLE_SLOT_CHALLENGES pass every invariant.`);
}

// Direct commitSeenIds test + readSeenIds check
{
  clearKeys('n5_seen_direct_commit');
  commitSeenIds('direct_commit', ['a', 'b'], ['a', 'b', 'c']);
  assert.deepStrictEqual(readSeenIds('direct_commit'), ['a', 'b']);
  commitSeenIds('direct_commit', ['c'], ['a', 'b', 'c']);
  assert.deepStrictEqual(readSeenIds('direct_commit'), ['c']);
}
console.log('\n🎉 ALL UX ANTI-REPEAT & POOL TESTS PASSED!');
