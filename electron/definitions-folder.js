const { readdir, readFile, mkdir, copyFile } = require('node:fs/promises');
const { join } = require('node:path');

async function seedDefinitionsFolder(targetDir, sourceDir) {
  await mkdir(targetDir, { recursive: true });

  // Seed only into an empty folder. Once the user has their own files in
  // here they are the source of truth, and a launch must never revert them to
  // the shipped defaults.
  const existing = (await readdir(targetDir)).filter(name => name.endsWith('.json'));
  if (existing.length > 0) {
    return [];
  }

  const names = (await readdir(sourceDir))
    .filter(name => name.endsWith('.json'))
    .sort();

  for (const name of names) {
    await copyFile(join(sourceDir, name), join(targetDir, name));
  }
  return names;
}

async function readDefinitionFiles(dir) {
  let names;
  try {
    names = (await readdir(dir)).filter(name => name.endsWith('.json')).sort();
  } catch (error) {
    return { entries: [], errors: [{ file: dir, message: error.message }] };
  }

  const entries = [];
  const errors = [];
  for (const name of names) {
    try {
      const contents = await readFile(join(dir, name), 'utf8');
      entries.push({ file: name, json: JSON.parse(contents) });
    } catch (error) {
      errors.push({ file: name, message: error.message });
    }
  }
  return { entries, errors };
}

// In dev the repo folder is the folder: edit a JSON file, restart, see it.
// Once packaged the app may be installed somewhere read-only and inside an
// asar, so the folder moves to userData and is seeded from the copy shipped
// in resources. The user owns that folder from then on.
function resolveDefinitionsDir({ isPackaged, resourcesPath, userDataPath, repoRoot }) {
  if (!isPackaged) {
    return { dir: join(repoRoot, 'definitions'), seed: null };
  }
  return {
    dir: join(userDataPath, 'definitions'),
    seed: join(resourcesPath, 'definitions'),
  };
}

module.exports = { readDefinitionFiles, seedDefinitionsFolder, resolveDefinitionsDir };
