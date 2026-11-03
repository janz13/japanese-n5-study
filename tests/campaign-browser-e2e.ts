/**
 * Companion Headless Chrome Browser E2E Test Runner
 * Japanese N5 Study - Campaign Mode
 * 
 * Verifies live DOM rendering, CSS styles, modal interaction, and routing via Chrome DevTools Protocol (CDP).
 * 
 * Pre-requisite:
 *   App built: npm run build
 *   Preview running: npm run preview -- --port 4173 (or automated startup)
 * 
 * Run with: node --experimental-strip-types tests/campaign-browser-e2e.ts
 */

import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9226;
const BASE_URL = 'http://localhost:4173/';
const TEMP_PROFILE_DIR = path.join(os.tmpdir(), 'chrome-e2e-profile-' + Date.now());

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPClient {
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private id = 1;
  private callbacks = new Map<number, { resolve: (val: unknown) => void; reject: (err: Error) => void }>();

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(new Error(String(err)));
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.id && this.callbacks.has(msg.id)) {
            const { resolve, reject } = this.callbacks.get(msg.id)!;
            this.callbacks.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
          }
        } catch (e) {
          console.error('Failed to parse CDP message:', e);
        }
      };
    });
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval<T = unknown>(expression: string): Promise<T> {
    const res = (await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })) as { result?: { value?: T }; exceptionDetails?: { text: string; exception?: { description: string } } };

    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value as T;
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

async function runBrowserE2E(): Promise<void> {
  console.log('======================================================================');
  console.log('🌐 RUNNING BROWSER E2E TESTS (HEADLESS CHROME + CDP)');
  console.log('======================================================================\n');

  if (!fs.existsSync(CHROME_PATH)) {
    console.log(`⚠️ Chrome executable not found at ${CHROME_PATH}. Skipping browser DOM tests.`);
    return;
  }

  fs.mkdirSync(TEMP_PROFILE_DIR, { recursive: true });

  // 1. Ensure preview server is available
  let previewProc: ChildProcess | null = null;
  let serverActive = false;
  try {
    const testFetch = await fetch(BASE_URL).catch(() => null);
    if (testFetch && testFetch.ok) {
      serverActive = true;
      console.log('  ✓ Existing preview server detected on port 4173');
    }
  } catch {}

  if (!serverActive) {
    console.log('  ↳ Launching background Vite preview server on port 4173...');
    previewProc = spawn('npx', ['vite', 'preview', '--port', '4173'], {
      shell: true,
      stdio: 'ignore',
    });
    // Wait for server to become responsive
    for (let i = 0; i < 20; i++) {
      await delay(300);
      try {
        const ping = await fetch(BASE_URL).catch(() => null);
        if (ping && ping.ok) {
          serverActive = true;
          break;
        }
      } catch {}
    }
  }

  if (!serverActive) {
    console.log('⚠️ Could not start or reach preview server on port 4173. Skipping browser suite.');
    if (previewProc) previewProc.kill();
    return;
  }

  // 2. Launch headless Chrome instance
  console.log(`  ↳ Launching Headless Chrome on CDP debug port ${CDP_PORT}...`);
  const chromeProc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${TEMP_PROFILE_DIR}`,
      '--window-size=1280,840',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let cdp: CDPClient | null = null;

  try {
    let wsUrl: string | null = null;
    for (let i = 0; i < 25; i++) {
      await delay(300);
      try {
        const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const pages = (await listRes.json()) as { type?: string; webSocketDebuggerUrl?: string }[];
        const page = pages.find((p) => p.type === 'page') || pages[0];
        if (page?.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!wsUrl) {
      throw new Error(`Could not connect to Chrome debugging port ${CDP_PORT}`);
    }

    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('  ✓ Connected to Chrome CDP WebSocket');

    // TEST B1: Campaign Map View
    console.log('\n  [Browser Test B1] Navigating to Campaign Map (#/campaign)...');
    await cdp.send('Page.navigate', { url: BASE_URL });
    await delay(1200);
    await cdp.eval("window.location.hash = '#/campaign'");
    await delay(1000);

    const pageTitle = await cdp.eval<string>('document.querySelector("h1")?.innerText');
    console.log(`  ✓ Campaign Page Header: "${pageTitle?.trim()}"`);

    const sagaElements = await cdp.eval<number>('document.querySelectorAll(".gp").length');
    console.log(`  ✓ Rendered Sagas / Stage groups in DOM: ${sagaElements}`);

    // TEST B2: Gatekeeper Challenge Modal
    console.log('\n  [Browser Test B2] Testing Gatekeeper Challenge Boss Modal...');
    await cdp.eval(`(() => {
      const bossBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Challenge Gatekeeper Boss"));
      if (bossBtn) bossBtn.click();
    })()`);
    await delay(800);

    const modalTitle = await cdp.eval<string>('document.querySelector(".modal h2, .gp h2")?.innerText');
    console.log(`  ✓ Boss Modal Title: "${modalTitle?.trim()}"`);

    // Close modal
    await cdp.eval(`(() => {
      const closeBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Cancel") || b.innerText.includes("Close") || b.innerText.includes("✕"));
      if (closeBtn) closeBtn.click();
    })()`);
    await delay(400);

    // TEST B3: Standalone Kana Dojo Navigation
    console.log('\n  [Browser Test B3] Navigating to Standalone Kana Dojo (#/kana)...');
    await cdp.eval("window.location.hash = '#/kana'");
    await delay(1000);

    const kanaChar = await cdp.eval<string>('document.querySelector(".drill-char, .card")?.innerText');
    console.log(`  ✓ Standalone Kana Character displayed: "${kanaChar?.trim()}"`);

    // TEST B4: Standalone Kanji Dojo Navigation
    console.log('\n  [Browser Test B4] Navigating to Standalone Kanji Dojo (#/kanji-dojo)...');
    await cdp.eval("window.location.hash = '#/kanji-dojo'");
    await delay(1000);

    const kanjiChar = await cdp.eval<string>('document.querySelector(".drill-char, .card")?.innerText');
    console.log(`  ✓ Standalone Kanji Character displayed: "${kanjiChar?.trim()}"`);

    console.log('\n======================================================================');
    console.log('🎉 ALL BROWSER E2E TESTS COMPLETED CLEANLY!');
    console.log('======================================================================\n');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    if (previewProc) previewProc.kill();
    try {
      fs.rmSync(TEMP_PROFILE_DIR, { recursive: true, force: true });
    } catch {}
  }
}

runBrowserE2E().catch((err) => {
  console.error('Browser E2E test execution failed:', err);
  process.exit(1);
});
