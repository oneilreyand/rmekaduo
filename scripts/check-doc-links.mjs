import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const root = process.cwd();
const documentsRoot = join(root, 'docs');
const entryPoints = [join(root, 'AGENTS.md'), join(root, 'README.md')];
const markdownLinkPattern = /!?\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g;
let failures = 0;
let linksChecked = 0;

function collectMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(path);
    return extname(entry.name) === '.md' ? [path] : [];
  });
}

function isExternalOrAnchor(target) {
  return /^(?:https?:|mailto:|tel:|data:|#|\/)/i.test(target);
}

function checkFile(file) {
  const contents = readFileSync(file, 'utf8');
  for (const match of contents.matchAll(markdownLinkPattern)) {
    const target = (match[1] ?? match[2]).split('#', 1)[0];
    if (!target || isExternalOrAnchor(target)) continue;

    linksChecked += 1;
    const targetPath = resolve(dirname(file), decodeURIComponent(target));
    if (!existsSync(targetPath)) {
      process.stderr.write(`ERROR: tautan rusak di ${file.replace(`${root}/`, '')}: ${target}\n`);
      failures += 1;
    }
  }
}

for (const file of [...entryPoints, ...collectMarkdownFiles(documentsRoot)]) checkFile(file);

process.stdout.write(`Documentation links checked: ${linksChecked}.\n`);
if (failures > 0) process.exitCode = 1;
