import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('.');
const extensionDir = resolve(root, 'dist-extension');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

await mkdir(extensionDir, { recursive: true });
await cp(resolve(root, 'extension/manifest.json'), resolve(extensionDir, 'manifest.json'));
await cp(resolve(root, 'extension/background.js'), resolve(extensionDir, 'background.js'));

const manifest = JSON.parse(await readFile(resolve(extensionDir, 'manifest.json'), 'utf8'));
manifest.version = packageJson.version;
await writeFile(resolve(extensionDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
if (manifest.manifest_version !== 3) {
  throw new Error('Extension manifest must use Manifest V3.');
}
if (!manifest.background?.service_worker) {
  throw new Error('Extension manifest must declare a background service worker.');
}
if (!manifest.action || manifest.content_scripts) {
  throw new Error('Extension manifest must use the toolbar action without content scripts.');
}

for (const requiredFile of ['index.html', 'manifest.json', 'background.js']) {
  const file = resolve(extensionDir, requiredFile);
  await stat(file);
}

console.log(`Chromium extension build is ready at ${extensionDir}`);
