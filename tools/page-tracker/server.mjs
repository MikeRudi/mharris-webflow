import http from 'node:http';
import { readFile, writeFile, readdir, mkdir, copyFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { workflowFields, normalizeProject } from './workflow.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, 'data');
const port = Number(process.env.PORT || 4318);
const origin = `http://127.0.0.1:${port}`;
const exportsRoot = path.resolve('C:/Users/miker/OneDrive/Desktop/Imprint Engine/Figma exports');
await mkdir(dataDir, { recursive: true });
const projectPath = id => path.join(dataDir, `${id}.json`);
const validId = id => /^[a-z0-9][a-z0-9-]{0,80}$/.test(id);
let writes = Promise.resolve();

function validate(project) {
  if (!project || !validId(project.id) || typeof project.name !== 'string' || !project.name.trim()) throw Error('A project name and valid ID are required.');
  if (!Array.isArray(project.groups) || !Array.isArray(project.pages)) throw Error('Invalid project structure.');
  const groupIds = new Set(project.groups.map(g => g.id));
  if (groupIds.size !== project.groups.length || project.groups.some(g => !validId(g.id) || typeof g.name !== 'string')) throw Error('Invalid groups.');
  const pageIds = new Set();
  for (const page of project.pages) {
    if (!validId(page.id) || pageIds.has(page.id) || !groupIds.has(page.groupId) || typeof page.name !== 'string') throw Error('Invalid page or group.');
    if (workflowFields.some(([field]) => typeof page[field] !== 'boolean')) throw Error('Invalid checklist value.');
    pageIds.add(page.id);
  }
}

async function body(req) {
  let text = '';
  for await (const chunk of req) { text += chunk; if (text.length > 5_000_000) throw Error('Project is too large.'); }
  return JSON.parse(text);
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) return json(res, 403, { error: 'Local access only.' });
    if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin !== origin && req.headers.origin !== `http://localhost:${port}`) return json(res, 403, { error: 'Open this app locally before saving.' });
    const previewMatch = url.pathname.match(/^\/api\/projects\/([a-z0-9-]+)\/pages\/([a-z0-9-]+)\/preview$/);
    if (req.method === 'GET' && previewMatch && validId(previewMatch[1]) && validId(previewMatch[2])) {
      const project = JSON.parse(await readFile(projectPath(previewMatch[1]), 'utf8'));
      const page = project.pages.find(p => p.id === previewMatch[2]);
      if (!page?.previewFile) return json(res, 404, { error: 'No design preview available.' });
      const previewPath = path.resolve(exportsRoot, page.previewFile);
      const relative = path.relative(exportsRoot, previewPath);
      if (relative.startsWith('..') || path.isAbsolute(relative) || path.extname(previewPath).toLowerCase() !== '.png') return json(res, 400, { error: 'Invalid preview path.' });
      const png = await readFile(previewPath);
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': png.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      return res.end(png);
    }
    if (req.method === 'GET' && url.pathname === '/api/projects') {
      const files = (await readdir(dataDir)).filter(f => /^[a-z0-9-]+\.json$/.test(f));
      const projects = await Promise.all(files.map(async f => { const p = JSON.parse(await readFile(path.join(dataDir, f), 'utf8')); return { id: p.id, name: p.name }; }));
      return json(res, 200, projects);
    }
    if (req.method === 'POST' && url.pathname === '/api/projects') {
      const input = await body(req);
      const p = { schemaVersion: 2, id: randomUUID(), name: String(input.name || '').trim(), revision: 1, updatedAt: new Date().toISOString(), groups: [{ id: 'general', name: 'General' }], pages: [], notes: '' };
      validate(p); await writeFile(projectPath(p.id), JSON.stringify(p, null, 2), { flag: 'wx' });
      return json(res, 201, p);
    }
    const match = url.pathname.match(/^\/api\/projects\/([a-z0-9-]+)$/);
    if (match && validId(match[1])) {
      const file = projectPath(match[1]);
      if (req.method === 'GET') return json(res, 200, normalizeProject(JSON.parse(await readFile(file, 'utf8'))));
      if (req.method === 'PUT') {
        const input = await body(req);
        if (input.schemaVersion !== 2) throw Error('The tracker has been updated. Refresh this page before editing.');
        const p = normalizeProject(input); validate(p);
        if (p.id !== match[1]) throw Error('Project ID mismatch.');
        const job = writes.then(async () => {
          const current = JSON.parse(await readFile(file, 'utf8'));
          if (current.revision !== p.revision) { const error = Error('This project changed in another window. Reload before editing.'); error.status = 409; throw error; }
          p.revision++; p.updatedAt = new Date().toISOString();
          await copyFile(file, file + '.backup');
          await writeFile(file + '.tmp', JSON.stringify(p, null, 2));
          await rename(file + '.tmp', file);
          return p;
        });
        writes = job.catch(() => {});
        return json(res, 200, await job);
      }
    }
    const files = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/styles.css': ['styles.css', 'text/css'] };
    if (req.method === 'GET' && url.pathname === '/workflow.mjs') {
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(await readFile(path.join(root, 'workflow.mjs')));
    }
    if (req.method === 'GET' && files[url.pathname]) {
      const [file, type] = files[url.pathname];
      res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
      return res.end(await readFile(path.join(root, 'dist', file)));
    }
    return json(res, 404, { error: 'Not found.' });
  } catch (error) { json(res, error.code === 'ENOENT' ? 404 : error.status || 400, { error: error.message }); }
});
server.listen(port, '127.0.0.1', () => console.log(`Michael's Webdev Tracker: ${origin}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
