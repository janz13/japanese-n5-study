/**
 * E2E Test Runner and Assertion Framework for Japanese N5 Study Campaign Mode
 * 
 * Supports Node 24 native TypeScript execution via --experimental-strip-types
 */

import assert from 'node:assert/strict';

// --- Global Environment Setup (Mocking DOM & Storage for Node environment) ---
const inMemoryStorage = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string): string | null => inMemoryStorage.get(key) ?? null,
  setItem: (key: string, value: string): void => {
    inMemoryStorage.set(key, String(value));
  },
  removeItem: (key: string): void => {
    inMemoryStorage.delete(key);
  },
  clear: (): void => {
    inMemoryStorage.clear();
  },
  get length(): number {
    return inMemoryStorage.size;
  },
  key: (index: number): string | null => {
    return Array.from(inMemoryStorage.keys())[index] ?? null;
  },
};

interface MockLocation {
  href: string;
  hash: string;
  pathname: string;
  search: string;
}

const mockLocation: MockLocation = {
  href: 'http://localhost:5173/#/campaign',
  hash: '#/campaign',
  pathname: '/',
  search: '',
};

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: mockLocalStorage,
    location: mockLocation,
    speechSynthesis: {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
    },
    Audio: class {
      play() {
        return Promise.resolve();
      }
      pause() {}
    },
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: unknown }).localStorage = mockLocalStorage;
}

export function setHashRoute(hashUrl: string): void {
  (globalThis.window as { location: MockLocation }).location.hash = hashUrl;
  (globalThis.window as { location: MockLocation }).location.href = `http://localhost:5173/${hashUrl}`;
}

export function clearMockStorage(): void {
  inMemoryStorage.clear();
}

// --- Test State & Types ---
export type Tier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Unclassified';

export interface TestResult {
  id: string;
  tier: Tier;
  name: string;
  suite: string;
  passed: boolean;
  durationMs: number;
  error?: Error;
}

export interface TestSuite {
  name: string;
  tier: Tier;
  tests: {
    id: string;
    name: string;
    fn: () => void | Promise<void>;
  }[];
}

class TestRegistry {
  suites: TestSuite[] = [];
  currentSuite: TestSuite | null = null;
  beforeEachCallbacks: (() => void | Promise<void>)[] = [];
  afterEachCallbacks: (() => void | Promise<void>)[] = [];

  suite(name: string, tier: Tier, fn: () => void): void {
    const s: TestSuite = { name, tier, tests: [] };
    this.suites.push(s);
    this.currentSuite = s;
    fn();
    this.currentSuite = null;
  }

  test(id: string, name: string, fn: () => void | Promise<void>): void {
    if (!this.currentSuite) {
      this.suite('Default Suite', 'Unclassified', () => {
        this.currentSuite!.tests.push({ id, name, fn });
      });
      return;
    }
    this.currentSuite.tests.push({ id, name, fn });
  }

  beforeEach(fn: () => void | Promise<void>): void {
    this.beforeEachCallbacks.push(fn);
  }

  afterEach(fn: () => void | Promise<void>): void {
    this.afterEachCallbacks.push(fn);
  }

  async runAll(): Promise<{ results: TestResult[]; summary: { total: number; passed: number; failed: number; durationMs: number } }> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    console.log('\n======================================================================');
    console.log('🚀 RUNNING JAPANESE N5 STUDY: CAMPAIGN MODE E2E TEST SUITE');
    console.log('======================================================================\n');

    for (const s of this.suites) {
      console.log(`\n📌 [${s.tier}] ${s.name}`);
      console.log('----------------------------------------------------------------------');

      for (const t of s.tests) {
        for (const be of this.beforeEachCallbacks) {
          await be();
        }

        const tStart = Date.now();
        let passed = true;
        let testError: Error | undefined;

        try {
          await t.fn();
        } catch (err) {
          passed = false;
          testError = err instanceof Error ? err : new Error(String(err));
        }

        for (const ae of this.afterEachCallbacks) {
          await ae();
        }

        const durationMs = Date.now() - tStart;
        results.push({
          id: t.id,
          tier: s.tier,
          name: t.name,
          suite: s.name,
          passed,
          durationMs,
          error: testError,
        });

        if (passed) {
          console.log(`  ✅ [PASS] (${t.id}) ${t.name} (${durationMs}ms)`);
        } else {
          console.log(`  ❌ [FAIL] (${t.id}) ${t.name} (${durationMs}ms)`);
          if (testError) {
            console.log(`     ↳ Reason: ${testError.message}`);
          }
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log('\n======================================================================');
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('======================================================================');
    console.log(`Total Tests Run:  ${total}`);
    console.log(`Passed Tests:     ${passed}`);
    console.log(`Failed Tests:     ${failed}`);
    console.log(`Total Time:       ${totalDuration}ms`);

    // Tier Breakdown
    const tiers: Tier[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
    console.log('\n--- Tier Breakdown ---');
    for (const tr of tiers) {
      const tierResults = results.filter((r) => r.tier === tr);
      if (tierResults.length > 0) {
        const tierPassed = tierResults.filter((r) => r.passed).length;
        const tierFailed = tierResults.filter((r) => !r.passed).length;
        console.log(`  ${tr.padEnd(8)}: ${tierPassed}/${tierResults.length} passed (${tierFailed} failed)`);
      }
    }

    if (failed > 0) {
      console.log('\n--- Failing Tests Detail ---');
      for (const r of results.filter((x) => !x.passed)) {
        console.log(`  • [${r.id}] ${r.name}`);
        console.log(`    Suite: ${r.suite}`);
        console.log(`    Error: ${r.error?.message}\n`);
      }
    }
    console.log('======================================================================\n');

    return {
      results,
      summary: { total, passed, failed, durationMs: totalDuration },
    };
  }
}

export const registry = new TestRegistry();
export const suite = registry.suite.bind(registry);
export const test = registry.test.bind(registry);
export const beforeEach = registry.beforeEach.bind(registry);
export const afterEach = registry.afterEach.bind(registry);
export { assert };
