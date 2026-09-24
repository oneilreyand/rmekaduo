import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const featuresRoot = join(root, 'docs', 'features');
const registryPath = join(featuresRoot, 'README.md');
const requiredDrdHeadings = [
  '# DRD',
  '## Scope',
  '## Sumber dan keputusan',
  '## Requirements dan acceptance criteria',
  '## Evidence ledger',
  '## Release checklist',
];
const allowedStatuses = new Set([
  'DISCOVERY',
  'READY',
  'IN_PROGRESS',
  'BLOCKED',
  'VALIDATING',
  'VALIDATED',
  'RELEASE_READY',
]);

function read(path) {
  return readFileSync(path, 'utf8');
}

function error(message) {
  process.stderr.write(`ERROR: ${message}\n`);
  failures += 1;
}

let failures = 0;

if (!existsSync(featuresRoot)) {
  error('docs/features tidak ditemukan.');
} else {
  const registry = existsSync(registryPath) ? read(registryPath) : '';
  if (!registry) error('docs/features/README.md tidak ditemukan atau kosong.');

  const featureIds = readdirSync(featuresRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .sort();

  for (const featureId of featureIds) {
    const featureRoot = join(featuresRoot, featureId);
    const drdPath = join(featureRoot, 'DRD.md');
    const feTodoPath = join(featureRoot, 'fe', 'TODO.md');
    const beTodoPath = join(featureRoot, 'be', 'TODO.md');

    for (const path of [drdPath, feTodoPath, beTodoPath]) {
      if (!existsSync(path)) error(`${featureId}: file wajib tidak ditemukan: ${path.replace(`${root}/`, '')}`);
    }
    if (!existsSync(drdPath)) continue;

    const drd = read(drdPath);
    for (const heading of requiredDrdHeadings) {
      if (!drd.includes(heading)) error(`${featureId}: DRD tidak memiliki heading wajib "${heading}".`);
    }
    if (!drd.includes(`**Feature ID:** \`${featureId}\``)) {
      error(`${featureId}: Feature ID di DRD harus sama dengan nama folder.`);
    }
    const statusMatch = drd.match(/\*\*Status:\*\* `([A-Z_]+)`/);
    if (!statusMatch) {
      error(`${featureId}: DRD harus memiliki status lifecycle.`);
    } else if (!allowedStatuses.has(statusMatch[1])) {
      error(`${featureId}: status DRD "${statusMatch[1]}" tidak dikenali.`);
    } else if (registry && !registry.includes(`| \`${featureId}\` | \`${statusMatch[1]}\` |`)) {
      error(`${featureId}: status registry harus sama dengan status DRD (${statusMatch[1]}).`);
    }
    if (!/\|\s*`REQ-\d+`\s*\|/.test(drd)) error(`${featureId}: DRD harus memiliki setidaknya satu requirement ber-ID REQ.`);
    if (!/\|\s*`EV-\d+`\s*\|/.test(drd)) error(`${featureId}: DRD harus memiliki setidaknya satu Evidence ID.`);
    if (registry && !registry.includes(`\`${featureId}\``)) error(`${featureId}: belum tercatat di docs/features/README.md.`);

    for (const [owner, path] of [['FE', feTodoPath], ['BE', beTodoPath]]) {
      if (!existsSync(path)) continue;
      const todo = read(path);
      if (!todo.includes('Requirement') || !todo.includes('Evidence')) {
        error(`${featureId}: TODO ${owner} harus memiliki kolom Requirement dan Evidence.`);
      }
    }
  }

  process.stdout.write(`Feature documentation checked: ${featureIds.length} feature(s).\n`);
}

if (failures > 0) process.exitCode = 1;
