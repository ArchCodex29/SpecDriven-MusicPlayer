import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const staticDir = process.argv[2] ?? 'dist';
const distDir = resolve(staticDir);
const indexHtml = await readFile(resolve(distDir, 'index.html'), 'utf8');
const entryRefs = [...indexHtml.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)]
  .map(([, ref]) => ref)
  .filter((ref) => !/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(ref));

assert(entryRefs.length > 0, `${staticDir}/index.html must reference at least one local asset`);

async function assertAssetExists(ref, documentUrl, mountPath) {
  const assetUrl = new URL(ref, documentUrl);
  assert.equal(assetUrl.origin, documentUrl.origin, `${ref} must stay on the static host`);
  assert(
    assetUrl.pathname.startsWith(mountPath),
    `${ref} must stay beneath the hosting path ${mountPath}`
  );

  const assetPath = resolve(distDir, decodeURIComponent(assetUrl.pathname.slice(mountPath.length)));
  const pathFromDist = relative(distDir, assetPath);
  assert(
    pathFromDist !== '..' && !pathFromDist.startsWith(`..${sep}`),
    `${ref} must not escape the build directory`
  );
  assert((await stat(assetPath)).isFile(), `${ref} must map to a file in ${staticDir}/`);

  return { assetUrl, assetPath };
}

for (const mount of ['/SpecDriven-MusicPlayer/', '/', '/nested/static/']) {
  const documentUrl = new URL(mount, 'https://static-host.invalid');
  const stylesheets = [];

  for (const ref of entryRefs) {
    const { assetUrl, assetPath } = await assertAssetExists(ref, documentUrl, documentUrl.pathname);
    if (assetUrl.pathname.endsWith('.css')) {
      stylesheets.push({ assetUrl, assetPath });
    }
  }

  for (const { assetUrl, assetPath } of stylesheets) {
    const css = await readFile(assetPath, 'utf8');
    const cssRefs = [...css.matchAll(/url\((["']?)(.*?)\1\)/g)]
      .map(([, , ref]) => ref.trim())
      .filter((ref) => !/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(ref));

    for (const ref of cssRefs) {
      await assertAssetExists(ref, assetUrl, documentUrl.pathname);
    }
  }

  console.log(`${mount}: ${entryRefs.length} entry assets resolve`);
}
