import { readFile } from 'node:fs/promises';
import { get, put, BlobPreconditionFailedError } from '@vercel/blob';
import { ChecklistError, createChecklistStore } from '../lib/checklist-store.mjs';

let store;
async function getStore() {
  if (store) return store;
  const project = JSON.parse(await readFile(new URL('../project.json', import.meta.url), 'utf8'));
  const pathname = `checklists/${process.env.VERCEL_ENV === 'preview' ? 'preview-' : ''}imprint-engine-v1.json`;
  // Credentials stay in the Function. Private reads bypass Blob's CDN cache.
  const options = { access: 'private', token: process.env.BLOB_READ_WRITE_TOKEN };
  store = createChecklistStore({
    project,
    async read() {
      const result = await get(pathname, { ...options, useCache: false });
      if (!result) return null;
      return { state: await new Response(result.stream).json(), etag: result.blob.etag };
    },
    async write(state, etag) {
      try {
        await put(pathname, JSON.stringify(state), {
          ...options, contentType: 'application/json', addRandomSuffix: false,
          allowOverwrite: Boolean(etag), ...(etag ? { ifMatch: etag } : {}),
        });
      } catch (error) {
        // Another request may have created the initial document first.
        if (!etag && await get(pathname, { ...options, useCache: false })) {
          throw new BlobPreconditionFailedError();
        }
        throw error;
      }
    },
    isConflict: error => error instanceof BlobPreconditionFailedError,
  });
  return store;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    if (req.method === 'PATCH') {
      let origin;
      try { origin = new URL(req.headers.origin); } catch { /* Rejected below. */ }
      if (!origin || origin.host !== req.headers.host || req.headers['sec-fetch-site'] === 'cross-site') {
        throw new ChecklistError('Open the tracker to change checkboxes.', 403);
      }
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
        throw new ChecklistError('Send checkbox changes as JSON.', 415);
      }
      if (Number(req.headers['content-length']) > 1024 || JSON.stringify(req.body || '').length > 1024) {
        throw new ChecklistError('Checkbox change is too large.', 413);
      }
    }
    const checklist = await getStore();
    const result = req.method === 'PATCH' ? await checklist.update(req.body) : await checklist.get();
    return res.status(200).json(result);
  } catch (error) {
    if (!(error instanceof ChecklistError)) console.error('Shared checklist failed:', error.name);
    return res.status(error.status || 503).json({
      error: error instanceof ChecklistError ? error.message : 'Shared saving is unavailable. Please try again.',
    });
  }
}
