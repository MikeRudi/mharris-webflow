/* BEGIN WORKFLOW */
const workflowFields = [
  ['desktop', 'Desktop'],
  ['mobile', 'Mobile'],
  ['missingContent', 'Missing content'],
  ['complete', 'Complete'],
];

// Existing approvals carry across; new checkboxes never infer approval.
function normalizePage(page) {
  page.desktop ??= false;
  page.mobile ??= false;
  page.missingContent ??= page.awaitingContent ?? page.status === 'awaiting-content';
  page.complete = Boolean(page.complete ?? page.status === 'complete') || page.clientsHands === true;
  delete page.designReady;
  delete page.workingInWebflow;
  delete page.awaitingContent;
  delete page.clientsHands;
  return page;
}

function normalizeProject(project) {
  project.pages.forEach(normalizePage);
  project.schemaVersion = 3;
  return project;
}
/* END WORKFLOW */

const $ = selector => document.querySelector(selector);
const readOnly = document.documentElement.dataset.readOnly === 'true';
const sharedChecklist = document.documentElement.dataset.sharedChecklist === 'true';
let project, editingId = null, saveQueue = Promise.resolve(), pending = 0, todoSaveTimer = null;
let sharedReady = false, sharedRevision = -1, sharedRequest = 0, sharedRefreshing = false;
const sharedPending = new Map();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = value => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };

async function request(url, init) {
  const response = await fetch(url, init);
  const result = await response.json();
  if (!response.ok) throw Error(result.error || 'Could not save.');
  return result;
}

function setSaveStatus(message, error = false) {
  for (const selector of ['#save-status', '#todo-save-status']) {
    if (!$(selector)) continue;
    $(selector).textContent = message;
    $(selector).classList.toggle('save-error', error);
  }
}

function save() {
  if (readOnly) return Promise.reject(Error('This tracker is view-only.'));
  const snapshot = structuredClone(project);
  const currentProject = project;
  pending++;
  setSaveStatus('Saving…');
  const job = saveQueue.then(async () => {
    snapshot.revision = currentProject.revision;
    const result = await request(`/api/projects/${snapshot.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snapshot) });
    currentProject.revision = result.revision;
    currentProject.updatedAt = result.updatedAt;
  });
  saveQueue = job.catch(error => {
    setSaveStatus(`Not saved: ${error.message}`, true);
  }).finally(() => {
    pending--;
    if (!pending && !todoSaveTimer && !$('#save-status').classList.contains('save-error')) setSaveStatus('All changes saved locally');
  });
  return job;
}

async function loadProject(id) {
  flushTodoSave();
  await saveQueue;
  project = normalizeProject(await request(readOnly ? '/project.json' : `/api/projects/${id}`));
  project.todos ??= [];
  $('#project-title').textContent = project.name;
  setSaveStatus(readOnly ? '' : 'All changes saved locally');
  localStorage.setItem('michael-webdev-project', id);
  render();
  if (sharedChecklist) await refreshSharedChecklist();
}

function syncSharedInputs() {
  for (const input of document.querySelectorAll('#page-list [data-field]')) {
    const page = project.pages.find(item => item.id === input.dataset.id);
    input.checked = page[input.dataset.field];
    input.disabled = !sharedReady || sharedPending.has(`${page.id}:${input.dataset.field}`);
  }
}

function applySharedState(state) {
  if (state.revision < sharedRevision) return;
  sharedRevision = state.revision;
  for (const page of project.pages) {
    for (const [field] of workflowFields) {
      if (!sharedPending.has(`${page.id}:${field}`) && typeof state.pages[page.id]?.[field] === 'boolean') {
        page[field] = state.pages[page.id][field];
      }
    }
  }
}

async function sharedRequestJSON(init) {
  return request('/api/checklist', { cache: 'no-store', signal: AbortSignal.timeout(15000), ...init });
}

async function refreshSharedChecklist() {
  if (!project || pending || sharedRefreshing || document.hidden) return;
  sharedRefreshing = true;
  const version = sharedRequest;
  if (!sharedReady) setSaveStatus('Loading shared checklist…');
  try {
    const state = await sharedRequestJSON();
    if (version !== sharedRequest || pending) return;
    applySharedState(state);
    sharedReady = true;
    syncSharedInputs();
    setSaveStatus('All changes saved');
  } catch {
    if (version === sharedRequest && !pending) setSaveStatus('Could not refresh shared checklist. Retrying…', true);
  } finally { sharedRefreshing = false; }
}

function saveSharedCheckbox(input) {
  const page = project.pages.find(item => item.id === input.dataset.id);
  const field = input.dataset.field, key = `${page.id}:${field}`;
  if (!sharedReady || sharedPending.has(key)) return;
  const previous = page[field], value = input.checked;
  page[field] = value;
  sharedPending.set(key, value);
  sharedRequest++;
  pending++;
  syncSharedInputs();
  setSaveStatus('Saving…');
  saveQueue = saveQueue.then(async () => {
    try {
      const state = await sharedRequestJSON({ method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageId: page.id, field, value }) });
      sharedPending.delete(key);
      applySharedState(state);
      setSaveStatus(pending > 1 ? 'Saving…' : 'All changes saved');
    } catch {
      page[field] = previous;
      sharedPending.delete(key);
      setSaveStatus('Could not confirm save. Please check your connection and try again.', true);
    } finally {
      pending--;
      syncSharedInputs();
    }
  });
}

function render() {
  if (!project) return;
  const pages = project.pages;
  $('#empty').hidden = pages.length !== 0;
  $('#page-list').innerHTML = project.groups.map(group => {
    const items = pages.filter(p => p.groupId === group.id);
    if (!items.length) return '';
    return `<section class="group-section">
      <div class="group-heading"><div><h2>${escape(group.name)}</h2>${group.note ? `<p>${escape(group.note)}</p>` : ''}</div></div>
      <div class="table-wrap"><table class="page-table"><thead><tr>
        <th scope="col">${items.every(p => p.kind === 'collection') ? 'Collection' : 'Page / design'}</th>
        ${workflowFields.map(([, label]) => `<th scope="col" class="status-column">${escape(label)}</th>`).join('')}
        <th scope="col" class="design-column">Design</th><th scope="col" class="link-column">Link</th>
      </tr></thead><tbody>${items.map(p => `<tr data-state="${escape(p.webflow || '')}">
        <td>${readOnly ? (safeUrl(p.webflowUrl) ? `<a class="page-name" href="${escape(safeUrl(p.webflowUrl))}" target="_blank" rel="noreferrer">${escape(p.name)}</a>` : `<span class="page-name">${escape(p.name)}</span>`) : `<button class="page-name" data-page="${escape(p.id)}">${escape(p.name)}</button>`}
          ${p.webflow === 'removed' ? '<span class="type-tag">Removed</span>' : p.kind && !['page', 'collection'].includes(p.kind) ? `<span class="type-tag">${escape(p.kind)}</span>` : ''}
          <div class="page-sub">${escape(p.kind === 'collection' ? '' : p.summary || p.figmaFrame || '')}</div></td>
        ${workflowFields.map(([field, label]) => `<td class="status-column"><input class="check-control" type="checkbox" ${readOnly && (!sharedChecklist || !sharedReady) ? 'disabled' : ''} data-id="${escape(p.id)}" data-field="${field}" ${p[field] ? 'checked' : ''} aria-label="${escape(p.name)}: ${escape(label)}"></td>`).join('')}
        <td>${p.previewFile || p.previewUrl ? `<a class="preview-button" href="${readOnly ? escape(p.previewUrl) : `/api/projects/${encodeURIComponent(project.id)}/pages/${encodeURIComponent(p.id)}/preview`}" target="_blank" rel="noreferrer" aria-label="View ${escape(p.name)} design">View design</a>` : '<span class="muted">—</span>'}</td>
        <td>${safeUrl(p.webflowUrl) ? `<a class="open-link" href="${escape(safeUrl(p.webflowUrl))}" target="_blank" rel="noreferrer" aria-label="Open ${escape(p.name)} in staging">↗</a>` : '<span class="muted">—</span>'}</td>
      </tr>`).join('')}</tbody></table></div></section>`;
  }).join('');
}

function openDetail(id) {
  if (readOnly) return;
  const page = project.pages.find(p => p.id === id) || normalizePage({ name: '', kind: 'page', groupId: project.groups[0]?.id });
  editingId = id || null;
  $('#detail-title').textContent = page.name || 'Add a page';
  $('#form-error').textContent = '';
  const form = $('#detail-form');
  for (const field of ['name', 'kind', 'figmaFrame', 'content', 'notes', 'figmaUrl', 'webflowUrl']) form.elements[field].value = page[field] || '';
  $('#detail-checks').innerHTML = '<legend>Page checklist</legend>' + workflowFields.map(([field, label]) => `<label><input type="checkbox" class="check-control" name="${field}" ${page[field] ? 'checked' : ''}>${escape(label)}</label>`).join('');
  form.elements.group.value = project.groups.find(g => g.id === page.groupId)?.name || 'General';
  $('#group-options').innerHTML = project.groups.map(g => `<option value="${escape(g.name)}"></option>`).join('');
  $('#detail-links').innerHTML = [['Figma reference ↗', page.figmaUrl], ['Webflow staging ↗', page.webflowUrl]].filter(([, u]) => safeUrl(u)).map(([label, u]) => `<a href="${escape(safeUrl(u))}" target="_blank" rel="noreferrer">${label}</a>`).join('');
  $('#evidence').textContent = page.evidence || 'Added locally. Confirm against the current design and Webflow before marking complete.';
  $('#detail').showModal();
}

if (!readOnly || sharedChecklist) {
$('#page-list').addEventListener('change', async event => {
  const input = event.target.closest('[data-field]'); if (!input) return;
  if (sharedChecklist) return saveSharedCheckbox(input);
  const page = project.pages.find(p => p.id === input.dataset.id);
  page[input.dataset.field] = input.checked;
  render(); await save().catch(() => {});
});
}
if (sharedChecklist) {
  setInterval(refreshSharedChecklist, 15000);
  window.addEventListener('focus', refreshSharedChecklist);
  window.addEventListener('online', refreshSharedChecklist);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSharedChecklist(); });
}
if (!readOnly) {
$('#page-list').addEventListener('click', event => { const button = event.target.closest('[data-page]'); if (button) openDetail(button.dataset.page); });
$('#new-page').addEventListener('click', () => openDetail(null));
$('#open-typography').addEventListener('click', () => { renderTypography(); $('#typography-dialog').showModal(); });
$('#close-typography').addEventListener('click', () => $('#typography-dialog').close());
$('#open-todos').addEventListener('click', () => { renderTodos(); $('#todo-dialog').showModal(); });
$('#close-todos').addEventListener('click', () => $('#todo-dialog').close());
$('#todo-dialog').addEventListener('close', flushTodoSave);
$('#todo-add-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#todo-new-title'), title = input.value.trim();
  if (!title) return;
  clearTimeout(todoSaveTimer); todoSaveTimer = null;
  project.todos.push({ id: crypto.randomUUID(), title, done: false });
  input.value = ''; renderTodos(); save().catch(() => {}); input.focus();
});
$('#todo-list').addEventListener('input', event => {
  const input = event.target.closest('[data-todo-field]'); if (!input) return;
  const item = project.todos.find(todo => todo.id === input.dataset.todoId); if (!item) return;
  item[input.dataset.todoField] = input.type === 'checkbox' ? input.checked : input.value;
  input.closest('.todo-item').dataset.done = String(item.done);
  clearTimeout(todoSaveTimer); todoSaveTimer = null;
  if (input.type === 'checkbox') save().catch(() => {});
  else { setSaveStatus('Saving…'); todoSaveTimer = setTimeout(flushTodoSave, 350); }
});
$('#todo-list').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-todo]'); if (!button) return;
  clearTimeout(todoSaveTimer); todoSaveTimer = null;
  project.todos = project.todos.filter(todo => todo.id !== button.dataset.removeTodo);
  renderTodos(); save().catch(() => {});
});
$('#close-detail').addEventListener('click', () => $('#detail').close());
$('#cancel-detail').addEventListener('click', () => $('#detail').close());
$('#detail-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const groupName = form.elements.group.value.trim();
  let group = project.groups.find(g => g.name.toLowerCase() === groupName.toLowerCase());
  if (!group) { group = { id: crypto.randomUUID(), name: groupName }; project.groups.push(group); }
  const page = project.pages.find(p => p.id === editingId) || { id: crypto.randomUUID(), webflow: 'no', status: 'not-started' };
  for (const field of ['name', 'kind', 'figmaFrame', 'content', 'notes', 'figmaUrl', 'webflowUrl']) page[field] = form.elements[field].value.trim();
  for (const [field] of workflowFields) page[field] = form.elements[field].checked;
  page.groupId = group.id;
  if (!editingId) { project.pages.push(page); editingId = page.id; }
  const button = form.querySelector('[type=submit]'); button.disabled = true;
  try { await save(); $('#detail').close(); render(); } catch (error) { $('#form-error').textContent = error.message; } finally { button.disabled = false; }
});
}

function renderTypography() {
  const typography = project?.typography;
  if (!typography) { $('#typography-content').textContent = 'No typography saved for this project.'; return; }
  const number = value => Number(value.toFixed(3));
  $('#typography-content').innerHTML = `<p class="typography-meta">${escape(typography.font)} · ${typography.referenceWidth}px reference width · ${typography.rootSize}px root</p>` +
    typography.groups.map(group => `<section class="typography-group"><h3>${escape(group.name)}</h3><div class="typography-table-wrap"><table class="typography-table"><thead><tr><th scope="col">Class</th><th scope="col">Size (px)</th><th scope="col">Size (rem)</th><th scope="col">Line height</th><th scope="col">Letter spacing</th></tr></thead><tbody>${group.styles.map(style => `<tr><td><code>${escape(style.class)}</code></td><td>${style.size}</td><td>${number(style.size / typography.rootSize)}</td><td>${number(style.lineHeight * 100)}% · ${number(style.size * style.lineHeight)}px</td><td>${style.letterSpacing}em</td></tr>`).join('')}</tbody></table></div></section>`).join('') +
    `<p class="typography-meta">Weight: ${typography.defaultWeight} inherited${typography.weights.map(weight => ` · <code>${escape(weight.class)}</code> ${weight.value}`).join('')}</p><p class="typography-meta">${escape(typography.note)}</p>`;
}

function renderTodos() {
  $('#todo-empty').hidden = project.todos.length !== 0;
  $('#todo-list').innerHTML = project.todos.map(item => `<div class="todo-item" data-done="${item.done === true}">
    <div class="todo-heading"><input class="check-control" type="checkbox" data-todo-id="${escape(item.id)}" data-todo-field="done" ${item.done ? 'checked' : ''} aria-label="Complete ${escape(item.title)}"><input class="todo-item-title" data-todo-id="${escape(item.id)}" data-todo-field="title" value="${escape(item.title)}" aria-label="To-do item" maxlength="500"><button type="button" class="remove-todo" data-remove-todo="${escape(item.id)}" aria-label="Remove ${escape(item.title)}">Remove</button></div>
  </div>`).join('');
}

function flushTodoSave() {
  if (!todoSaveTimer) return;
  clearTimeout(todoSaveTimer); todoSaveTimer = null;
  return save().catch(() => {});
}

function showError(error) { setSaveStatus(error.message, true); }
window.addEventListener('beforeunload', event => { if (pending || todoSaveTimer) { flushTodoSave(); event.preventDefault(); event.returnValue = ''; } });
loadProject('imprint-engine').catch(showError);
