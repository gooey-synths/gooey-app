const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, writeFile, readFile, mkdir, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { readFileSync } = require('node:fs');

const { readDefinitionFiles, seedDefinitionsFolder, resolveDefinitionsDir } = require('./definitions-folder');

async function withTempDir(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'gooey-defs-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('readDefinitionFiles returns one entry per .json file, ignoring others', async () => {
  await withTempDir(async (dir) => {
    await writeFile(join(dir, 'vco.json'), JSON.stringify({ type: 'vco', label: 'VCO' }));
    await writeFile(join(dir, 'readme.txt'), 'ignore me');

    const { entries, errors } = await readDefinitionFiles(dir);

    assert.deepEqual(entries, [{ file: 'vco.json', json: { type: 'vco', label: 'VCO' } }]);
    assert.deepEqual(errors, []);
  });
});

test('readDefinitionFiles reports an unparseable file and still returns the rest', async () => {
  await withTempDir(async (dir) => {
    await writeFile(join(dir, 'a-good.json'), JSON.stringify({ type: 'good' }));
    await writeFile(join(dir, 'b-broken.json'), '{ not json');

    const { entries, errors } = await readDefinitionFiles(dir);

    assert.deepEqual(entries.map(e => e.file), ['a-good.json']);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].file, 'b-broken.json');
  });
});

test('readDefinitionFiles reports a missing folder instead of throwing', async () => {
  const missing = join(tmpdir(), `gooey-defs-missing-${process.pid}`);

  const { entries, errors } = await readDefinitionFiles(missing);

  assert.deepEqual(entries, []);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /ENOENT|no such file/i);
});

test('seedDefinitionsFolder copies the defaults into a missing target folder', async () => {
  await withTempDir(async (source) => {
    await writeFile(join(source, 'vco.json'), JSON.stringify({ type: 'vco' }));
    await writeFile(join(source, 'notes.txt'), 'not a definition');
    const target = join(source, 'userData', 'definitions');

    const copied = await seedDefinitionsFolder(target, source);

    assert.deepEqual(copied, ['vco.json']);
    const { entries } = await readDefinitionFiles(target);
    assert.deepEqual(entries.map(e => e.file), ['vco.json']);
  });
});

test('seedDefinitionsFolder never overwrites an existing folder', async () => {
  await withTempDir(async (dir) => {
    const source = join(dir, 'source');
    const target = join(dir, 'target');
    await mkdir(source, { recursive: true });
    await mkdir(target, { recursive: true });
    await writeFile(join(source, 'vco.json'), JSON.stringify({ type: 'vco', label: 'from source' }));
    await writeFile(join(target, 'vco.json'), JSON.stringify({ type: 'vco', label: 'my edit' }));
    await writeFile(join(target, 'lfo.json'), JSON.stringify({ type: 'lfo' }));

    const copied = await seedDefinitionsFolder(target, source);

    assert.deepEqual(copied, []);
    const edited = JSON.parse(await readFile(join(target, 'vco.json'), 'utf8'));
    assert.equal(edited.label, 'my edit');
    const { entries } = await readDefinitionFiles(target);
    assert.deepEqual(entries.map(e => e.file), ['lfo.json', 'vco.json']);
  });
});

test('resolveDefinitionsDir reads the repo folder in dev, with nothing to seed', () => {
  const resolved = resolveDefinitionsDir({
    isPackaged: false,
    resourcesPath: '/app/resources',
    userDataPath: '/home/u/.config/gooey-app',
    repoRoot: '/repo',
  });

  assert.deepEqual(resolved, { dir: '/repo/definitions', seed: null });
});

test('resolveDefinitionsDir reads userData when packaged, seeded from resources', () => {
  const resolved = resolveDefinitionsDir({
    isPackaged: true,
    resourcesPath: '/app/resources',
    userDataPath: '/home/u/.config/gooey-app',
    repoRoot: '/repo',
  });

  assert.deepEqual(resolved, {
    dir: '/home/u/.config/gooey-app/definitions',
    seed: '/app/resources/definitions',
  });
});

test('the preload bridge and main process agree on the definitions channel', () => {
  const { DEFINITIONS_CHANNEL } = require('./ipc-channels');
  const preload = readFileSync(join(__dirname, 'preload.js'), 'utf8');

  assert.match(preload, new RegExp(`['"\`]${DEFINITIONS_CHANNEL}['"\`]`));
});
