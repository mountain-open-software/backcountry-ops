import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJSON = async file => JSON.parse(await readFile(file, 'utf8'));
const workspaces = [];
for (const parent of ['packages', 'projects']) {
  for (const entry of await readdir(path.join(root, parent), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(root, parent, entry.name);
    workspaces.push({ directory, kind: parent, manifest: await readJSON(path.join(directory, 'package.json')) });
  }
}
const byName = new Map(workspaces.map(w => [w.manifest.name, w]));
assert.equal(byName.size, workspaces.length, 'Workspace names must be unique');
const errors = [];
// These generated modules are supplied by a declared build plugin, not npm packages.
const virtualProviders = new Map([['virtual:pwa-register/react', 'vite-plugin-pwa']]);
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '.cloudflare', '.wrangler'].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(target));
    else if (/\.(?:js|jsx|mjs|cjs|ts|tsx)$/.test(entry.name)) result.push(target);
  }
  return result;
}
for (const workspace of workspaces) {
  const { manifest, directory } = workspace;
  const declared = { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies };
  if (manifest.license !== 'Apache-2.0') errors.push(`${manifest.name}: declare Apache-2.0 license`);
  if (manifest.private !== true) errors.push(`${manifest.name}: workspaces are private until a release policy is defined`);
  for (const name of Object.keys(declared)) {
    if (name.startsWith('@open-mountain/') && !byName.has(name)) errors.push(`${manifest.name}: missing workspace ${name}`);
    if (byName.get(name)?.kind === 'projects') errors.push(`${manifest.name}: workspaces cannot depend on application internals`);
    if (['@open-mountain/domain', '@open-mountain/application', '@open-mountain/ui-schema'].includes(manifest.name) && name.startsWith('@open-mountain/storage-')) errors.push(`${manifest.name}: platform-independent packages cannot depend on platform storage adapters`);
    if (manifest.name === '@open-mountain/domain' && byName.has(name)) errors.push(`${manifest.name}: domain must not depend on higher-level workspaces`);
  }
  for (const file of await files(directory)) {
    const source = await readFile(file, 'utf8');
    // Static imports/re-exports and literal dynamic imports/require calls.
    const imports = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g)];
    for (const [, specifier] of imports) {
      const label = path.relative(root, file);
      if (specifier.startsWith('.')) {
        const resolved = path.resolve(path.dirname(file), specifier);
        if (!resolved.startsWith(directory + path.sep)) errors.push(`${label}: import other workspaces through their public package exports, not ${specifier}`);
        continue;
      }
      if (specifier.startsWith('node:')) continue;
      const provider = virtualProviders.get(specifier);
      if (provider && declared[provider]) continue;
      const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
      if (name === manifest.name) continue;
      if (!declared[name]) errors.push(`${label}: undeclared dependency ${name}`);
      if (name.startsWith('@open-mountain/') && specifier !== name) {
        const exports = byName.get(name)?.manifest.exports;
        const subpath = `.${specifier.slice(name.length)}`;
        if (!exports || typeof exports !== 'object' || !Object.hasOwn(exports, subpath)) errors.push(`${label}: cross-package deep imports require an explicit public subpath contract`);
      }
    }
  }
}
// Reject workspace dependency cycles; packages should remain reusable independently.
const visiting = new Set();
const visited = new Set();
function visit(name, trail = []) {
  if (visiting.has(name)) { errors.push(`Workspace dependency cycle: ${[...trail, name].join(' -> ')}`); return; }
  if (visited.has(name)) return;
  visiting.add(name);
  const manifest = byName.get(name).manifest;
  for (const dependency of Object.keys({ ...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies })) {
    if (byName.has(dependency)) visit(dependency, [...trail, name]);
  }
  visiting.delete(name); visited.add(name);
}
for (const name of byName.keys()) visit(name);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Verified ${workspaces.length} workspace manifests, declared imports, package boundaries, and dependency cycles.`);
