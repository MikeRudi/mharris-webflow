/* BEGIN WORKFLOW */
const workflowFields = [
  ['designReady', 'Design ready'],
  ['workingInWebflow', 'Developing in Webflow'],
  ['desktop', 'Desktop'],
  ['mobile', 'Mobile'],
  ['awaitingContent', 'Awaiting content'],
  ['clientsHands', "Client’s hands"],
  ['complete', 'Complete'],
];

// Existing approvals carry across; new checkboxes never infer approval.
function normalizePage(page) {
  page.designReady ??= Boolean(page.previewFile || page.previewUrl);
  page.workingInWebflow ??= page.webflow === 'yes';
  page.desktop ??= false;
  page.awaitingContent ??= page.status === 'awaiting-content';
  page.mobile ??= false;
  page.clientsHands ??= false;
  page.complete ??= page.status === 'complete';
  return page;
}

function normalizeProject(project) {
  project.pages.forEach(normalizePage);
  project.groups.forEach(group => { if (group.name === 'CMS collection') group.name = 'CMS collections'; });
  project.schemaVersion = 2;
  return project;
}
/* END WORKFLOW */

const $ = selector => document.querySelector(selector);
const readOnly = document.documentElement.dataset.readOnly === 'true';
let project, activeGroup = 'all', editingId = null, saveQueue = Promise.resolve(), pending = 0, todoSaveTimer = null;
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
  activeGroup = 'all';
  $('#project-title').textContent = project.name;
  setSaveStatus(readOnly ? '' : 'All changes saved locally');
  $('#search').value = '';
  $('#workflow-filters').innerHTML = '<legend>Show pages checked for</legend>' + workflowFields.map(([field, label]) => `<label><input type="checkbox" class="check-control" data-filter="${field}">${escape(label)}</label>`).join('');
  localStorage.setItem('michael-webdev-project', id);
  render();
}

function render() {
  if (!project) return;
  const pages = project.pages;
  const otherGroups = project.groups.filter(g => ['navigation', 'references'].includes(g.id) || /^(navigation|references|cms collections?)$/i.test(g.name) || pages.some(p => p.groupId === g.id && p.kind === 'collection'));
  const otherGroupIds = new Set(otherGroups.map(g => g.id));
  const isPageGroupItem = p => p.kind !== 'collection' && !otherGroupIds.has(p.groupId);
  const activeItems = pages.filter(p => isPageGroupItem(p) && p.webflow !== 'removed');
  $('#metrics').innerHTML = workflowFields.map(([field, label]) => `<div class="metric"><span>${escape(label)}</span><strong>${activeItems.filter(p => p[field]).length}</strong></div>`).join('');
  const groupButton = g => `<button type="button" data-group="${escape(g.id)}" class="${g.id === activeGroup ? 'selected' : ''}" aria-current="${g.id === activeGroup ? 'true' : 'false'}"><span>${escape(g.name)}</span><span>${pages.filter(p => g.id === 'all' ? isPageGroupItem(p) : p.groupId === g.id).length}</span></button>`;
  $('#groups').innerHTML = [{ id: 'all', name: 'All groups' }, ...project.groups.filter(g => !otherGroupIds.has(g.id))].map(groupButton).join('') +
    (otherGroups.length ? '<div class="sidebar-label other-groups-label">OTHER GROUPS</div>' + otherGroups.map(groupButton).join('') : '');
  const q = $('#search').value.trim().toLowerCase();
  const checkedFilters = [...document.querySelectorAll('[data-filter]:checked')].map(input => input.dataset.filter);
  const filtered = pages.filter(p => (activeGroup === 'all' ? isPageGroupItem(p) : p.groupId === activeGroup) && checkedFilters.every(field => p[field]) && [p.name, p.figmaFrame, p.content, p.notes].join(' ').toLowerCase().includes(q));
  $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'} shown`;
  $('#empty').hidden = filtered.length !== 0;
  $('#page-list').innerHTML = project.groups.map(group => {
    const items = filtered.filter(p => p.groupId === group.id);
    if (!items.length) return '';
    const allGroup = pages.filter(p => p.groupId === group.id);
    return `<section class="group-section">
      <div class="group-heading"><div><h2>${escape(group.name)}</h2>${group.note ? `<p>${escape(group.note)}</p>` : ''}</div><span>${allGroup.filter(p => p.complete).length} / ${allGroup.length} complete</span></div>
      <div class="table-wrap"><table class="page-table"><thead><tr>
        <th scope="col">${items.every(p => p.kind === 'collection') ? 'Collection' : 'Page / design'}</th>
        ${workflowFields.map(([, label]) => `<th scope="col" class="status-column">${escape(label)}</th>`).join('')}
        <th scope="col" class="design-column">Design</th><th scope="col" class="link-column"><span class="sr-only">Link</span></th>
      </tr></thead><tbody>${items.map(p => `<tr data-state="${escape(p.webflow || '')}">
        <td>${readOnly ? (safeUrl(p.webflowUrl) ? `<a class="page-name" href="${escape(safeUrl(p.webflowUrl))}" target="_blank" rel="noreferrer">${escape(p.name)}</a>` : `<span class="page-name">${escape(p.name)}</span>`) : `<button class="page-name" data-page="${escape(p.id)}">${escape(p.name)}</button>`}
          ${p.webflow === 'removed' ? '<span class="type-tag">Removed</span>' : p.kind && !['page', 'collection'].includes(p.kind) ? `<span class="type-tag">${escape(p.kind)}</span>` : ''}
          <div class="page-sub">${escape(p.kind === 'collection' ? '' : p.summary || p.figmaFrame || '')}</div></td>
        ${workflowFields.map(([field, label]) => `<td class="status-column"><input class="check-control" type="checkbox" ${readOnly ? 'disabled' : ''} data-id="${escape(p.id)}" data-field="${field}" ${p[field] ? 'checked' : ''} aria-label="${escape(p.name)}: ${escape(label)}"></td>`).join('')}
        <td>${p.previewFile || p.previewUrl ? `<a class="preview-button" href="${readOnly ? escape(p.previewUrl) : `/api/projects/${encodeURIComponent(project.id)}/pages/${encodeURIComponent(p.id)}/preview`}" target="_blank" rel="noreferrer" aria-label="View ${escape(p.name)} design">View design</a>` : '<span class="muted">—</span>'}</td>
        <td>${safeUrl(p.webflowUrl) ? `<a class="open-link" href="${escape(safeUrl(p.webflowUrl))}" target="_blank" rel="noreferrer" aria-label="Open ${escape(p.name)} in staging">↗</a>` : '<span class="muted">—</span>'}</td>
      </tr>`).join('')}</tbody></table></div></section>`;
  }).join('');
}

function openDetail(id) {
  if (readOnly) return;
  const page = project.pages.find(p => p.id === id) || normalizePage({ name: '', kind: 'page', groupId: activeGroup === 'all' ? project.groups[0]?.id : activeGroup });
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

$('#groups').addEventListener('click', event => { const button = event.target.closest('[data-group]'); if (button) { activeGroup = button.dataset.group; render(); } });
$('#search').addEventListener('input', render);
$('#workflow-filters').addEventListener('change', render);
if (!readOnly) {
$('#page-list').addEventListener('click', event => { const button = event.target.closest('[data-page]'); if (button) openDetail(button.dataset.page); });
$('#page-list').addEventListener('change', async event => {
  const input = event.target.closest('[data-field]'); if (!input) return;
  const page = project.pages.find(p => p.id === input.dataset.id);
  page[input.dataset.field] = input.checked;
  render(); await save().catch(() => {});
});
$('#project').addEventListener('change', event => loadProject(event.target.value).catch(showError));
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
$('#new-project').addEventListener('click', () => { $('#project-form').reset(); $('#project-dialog').showModal(); });
$('#cancel-project').addEventListener('click', () => $('#project-dialog').close());
$('#project-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.currentTarget.querySelector('[type=submit]'); button.disabled = true;
  try {
    const p = await request('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: event.currentTarget.elements.name.value }) });
    $('#project-dialog').close(); await loadProjectList(p.id);
  } catch (error) { showError(error); } finally { button.disabled = false; }
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
async function loadProjectList(preferred) {
  const projects = await request('/api/projects');
  $('#project').innerHTML = projects.map(p => `<option value="${escape(p.id)}">${escape(p.name)}</option>`).join('');
  const id = projects.some(p => p.id === preferred) ? preferred : projects[0]?.id;
  if (id) { $('#project').value = id; await loadProject(id); }
  else { setSaveStatus('Create your first project to begin.'); $('#new-page').disabled = true; $('#open-todos').disabled = true; }
  if (id) { $('#new-page').disabled = false; $('#open-todos').disabled = false; }
}
window.addEventListener('beforeunload', event => { if (pending || todoSaveTimer) { flushTodoSave(); event.preventDefault(); event.returnValue = ''; } });
if (readOnly) loadProject('imprint-engine').catch(showError);
else loadProjectList(localStorage.getItem('michael-webdev-project') || 'imprint-engine').catch(showError);
