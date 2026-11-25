import test from 'node:test';
import assert from 'node:assert/strict';
import { createChecklistStore } from './public/lib/checklist-store.mjs';
import handler from './public/api/checklist.js';

const project = { updatedAt: '2026-11-25T00:00:00Z', pages: [
  { id: 'homepage', desktop: false, mobile: false, monti: false, scott: false, complete: false },
  { id: 'footer', desktop: false, mobile: false, monti: false, scott: false, complete: false },
] };

function memoryStorage() {
  let saved = null, version = 0, conflicts = 0;
  return {
    read: async () => saved && { state: structuredClone(saved), etag: String(version) },
    write: async (state, etag) => {
      if ((saved ? String(version) : undefined) !== etag) {
        conflicts++;
        throw Object.assign(Error('Concurrent write'), { conflict: true });
      }
      saved = structuredClone(state);
      version++;
    },
    isConflict: error => error.conflict === true,
    get conflicts() { return conflicts; },
  };
}

test('two visitors editing different checkboxes preserve both changes', async () => {
  const storage = memoryStorage();
  const first = createChecklistStore({ project, ...storage });
  const second = createChecklistStore({ project, ...storage });
  await first.get();
  await Promise.all([
    first.update({ pageId: 'homepage', field: 'monti', value: true }),
    second.update({ pageId: 'footer', field: 'scott', value: true }),
  ]);
  const state = await second.get();
  assert.equal(state.pages.homepage.monti, true);
  assert.equal(state.pages.footer.scott, true);
  assert.ok(storage.conflicts > 0);
  assert.equal(state.pages.homepage.complete, false);
});

test('simultaneous first loads initialize once and never overwrite an edit', async () => {
  const storage = memoryStorage();
  const first = createChecklistStore({ project, ...storage });
  const second = createChecklistStore({ project, ...storage });
  await Promise.all([first.get(), second.update({ pageId: 'footer', field: 'monti', value: true })]);
  assert.equal((await first.get()).pages.footer.monti, true);
});

test('saved states survive a new deployment and new pages get their defaults', async () => {
  const storage = memoryStorage();
  const old = createChecklistStore({ project, ...storage });
  await old.update({ pageId: 'homepage', field: 'monti', value: true });
  const updatedProject = structuredClone(project);
  updatedProject.pages.push({ ...project.pages[0], id: 'new-page' });
  const fresh = createChecklistStore({ project: updatedProject, ...storage });
  const result = await fresh.get();
  assert.equal(result.pages.homepage.monti, true);
  assert.equal(result.pages['new-page'].complete, false);
  await fresh.update({ pageId: 'new-page', field: 'monti', value: true });
  assert.equal((await fresh.get()).pages['new-page'].monti, true);
});

test('repeated values are idempotent and unchecking persists', async () => {
  const store = createChecklistStore({ project, ...memoryStorage() });
  const change = { pageId: 'homepage', field: 'monti', value: true };
  const first = await store.update(change);
  assert.equal((await store.update(change)).revision, first.revision);
  await store.update({ ...change, value: false });
  assert.equal((await store.get()).pages.homepage.monti, false);
});

test('rejects unknown rows, metadata edits, non-booleans and malformed payloads', async () => {
  const store = createChecklistStore({ project, ...memoryStorage() });
  for (const change of [null, [], {},
    { pageId: 'unknown', field: 'monti', value: true },
    { pageId: '__proto__', field: 'monti', value: true },
    { pageId: 'homepage', field: 'name', value: true },
    { pageId: 'homepage', field: 'monti', value: 'true' },
    { pageId: 'homepage', field: 'monti', value: true, complete: true },
  ]) {
    await assert.rejects(store.update(change), { status: 400 });
  }
});

test('storage failure never acknowledges an unsaved change', async () => {
  const store = createChecklistStore({ project, ...memoryStorage(), write: async () => { throw Error('Offline'); } });
  await assert.rejects(store.update({ pageId: 'footer', field: 'monti', value: true }), /Offline/);
});

test('API rejects cross-site writes and unsupported requests before accessing storage', async () => {
  for (const [request, expected] of [
    [{ method: 'POST', headers: {} }, 405],
    [{ method: 'PATCH', headers: { host: 'tracker.test', origin: 'https://other.test' } }, 403],
    [{ method: 'PATCH', headers: { host: 'tracker.test', origin: 'https://tracker.test', 'content-type': 'text/plain' } }, 415],
    [{ method: 'PATCH', headers: { host: 'tracker.test', origin: 'https://tracker.test', 'content-type': 'application/json' }, body: { pageId: 'homepage', field: 'desktop', value: true } }, 409],
  ]) {
    let status;
    const res = { setHeader() {}, status(value) { status = value; return this; }, json() {} };
    await handler(request, res);
    assert.equal(status, expected);
  }
});
