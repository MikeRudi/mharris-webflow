import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { workflowFields, normalizeProject } from './workflow.mjs';

// Export the local editor's current Imprint Engine snapshot for public viewing.
// Originals and editing data stay local; only these explicit fields are exported.
const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'public');
const source = normalizeProject(JSON.parse(await readFile(path.join(root, 'data/imprint-engine.json'), 'utf8')));
const exportsRoot = path.resolve(process.env.TRACKER_EXPORTS_ROOT || 'C:/Users/miker/OneDrive/Desktop/Imprint Engine/Figma exports');
const require = createRequire(import.meta.url);
const sharp = require(process.env.TRACKER_SHARP_PATH || 'sharp');

// Keep the browser self-contained so the running local server needs no restart.
const appPath = path.join(root, 'dist/app.js');
const workflowSource = (await readFile(path.join(root, 'workflow.mjs'), 'utf8')).replace(/^export /gm, '');
const appSource = (await readFile(appPath, 'utf8')).replace(/^\/\* BEGIN WORKFLOW \*\/[\s\S]*?\/\* END WORKFLOW \*\/\s*|^import \{ workflowFields, normalizePage, normalizeProject \} from '\/workflow.mjs';\s*/, '');
await writeFile(appPath, `/* BEGIN WORKFLOW */\n${workflowSource}/* END WORKFLOW */\n\n${appSource}`);

await mkdir(path.join(output, 'designs'), { recursive: true });
let bytes = 0;
const pages = [];
for (const page of source.pages) {
  const { id, name, kind, groupId, webflow, status, webflowUrl, figmaFrame } = page;
  if (!/^[a-z0-9-]+$/.test(id)) throw Error(`Invalid page ID: ${id}`);
  const published = { id, name, kind, groupId, webflow, status, webflowUrl, figmaFrame,
    ...Object.fromEntries(workflowFields.map(([field]) => [field, page[field]])) };
  if (page.previewFile) {
    const input = path.resolve(exportsRoot, page.previewFile);
    const relative = path.relative(exportsRoot, input);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw Error(`Invalid preview path: ${id}`);
    const target = path.join(output, 'designs', `${id}.webp`);
    // Keep full resolution and lossless pixels so design text stays sharp.
    const existing = await stat(target).catch(() => null);
    if (!existing || (await stat(input)).mtimeMs > existing.mtimeMs) {
      await sharp(input, { limitInputPixels: false }).webp({ lossless: true, effort: 4 }).toFile(target);
    }
    bytes += (await stat(target)).size;
    published.previewUrl = `/designs/${id}.webp`;
  }
  pages.push(published);
}
const project = {
  id: source.id, name: source.name, updatedAt: source.updatedAt,
  groups: source.groups.map(({ id, name }) => ({ id, name })), pages
};
await writeFile(path.join(output, 'project.json'), JSON.stringify(project, null, 2) + '\n');

let html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
html = html.replace('<html lang="en">', '<html lang="en" data-read-only="true">')
  .replace("<title>Michael's Webdev Tracker</title>", '<title>Imprint Engine — Page Tracker</title><meta name="robots" content="noindex,nofollow">')
  .replace(/  <label class="small-label"[\s\S]*?<button class="text-button" id="new-project">[\s\S]*?<\/button>/, '')
  .replace(/<div class="header-actions">[\s\S]*?<\/div>/, '')
  .replace('<span>Open a page to see its content notes.</span>', '')
  .replace('Find a page, section or content note…', 'Find a page…')
  .replace(/<dialog[\s\S]*<\/dialog>/, '');
await writeFile(path.join(output, 'index.html'), html);
for (const file of ['app.js', 'styles.css']) await copyFile(path.join(root, 'dist', file), path.join(output, file));
await copyFile(path.join(root, 'workflow.mjs'), path.join(output, 'workflow.mjs'));
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
await writeFile(path.join(output, 'vercel.json'), JSON.stringify({
  framework: null,
  headers: [
    { source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    { source: '/project.json', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] }
  ]
}, null, 2) + '\n');
console.log(`Exported ${pages.length} items, ${pages.filter(p => p.previewUrl).length} lossless design previews (${(bytes / 1024 / 1024).toFixed(1)} MB).`);
console.log(output);
