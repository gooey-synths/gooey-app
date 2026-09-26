import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import { writeFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Dev launches read the repo's definitions/ folder directly, so this writes
// there. Unpacked builds seed userData instead; see resolveDefinitionsDir.
const repoRoot = resolve(__dirname, '..');
const definitionsDir = join(repoRoot, 'definitions');

async function launch(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: [join(repoRoot, 'electron/main.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const page = await app.firstWindow();
  await expect(page.locator('app-node-selector')).toBeVisible();
  return { app, page };
}

const added = join(definitionsDir, 'zz-smoke-lfo.json');

test.afterEach(async () => {
  await rm(added, { force: true });
});

test('the renderer gets a narrow preload bridge, not node access', async () => {
  const { app, page } = await launch();
  try {
    const shape = await page.evaluate(() => ({
      bridge: typeof (globalThis as { gooey?: unknown }).gooey?.readDefinitions,
      require: typeof (globalThis as { require?: unknown }).require,
      process: typeof (globalThis as { process?: unknown }).process,
    }));

    expect(shape.bridge).toBe('function');
    expect(shape.require).toBe('undefined');
    expect(shape.process).toBe('undefined');
  } finally {
    await app.close();
  }
});

test('a node dropped into the definitions folder shows up after a restart', async () => {
  const first = await launch();
  const baseline: string = await first.page.locator('app-node-selector').innerText();
  await first.app.close();

  expect(baseline).toContain('Fast Analog Out');
  expect(baseline).not.toContain('Smoke LFO');

  await writeFile(added, JSON.stringify({ type: 'zz-smoke-lfo', label: 'Smoke LFO' }));

  const second = await launch();
  try {
    await expect(second.page.locator('app-node-selector')).toContainText('Smoke LFO');
  } finally {
    await second.app.close();
  }
});
