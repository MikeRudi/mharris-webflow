export const workflowFields = [
  ['designReady', 'Design ready'],
  ['workingInWebflow', 'Developing in Webflow'],
  ['desktop', 'Desktop'],
  ['mobile', 'Mobile'],
  ['awaitingContent', 'Awaiting content'],
  ['clientsHands', "Client’s hands"],
  ['complete', 'Complete'],
];

// Existing approvals carry across; new checkboxes never infer approval.
export function normalizePage(page) {
  page.designReady ??= Boolean(page.previewFile || page.previewUrl);
  page.workingInWebflow ??= page.webflow === 'yes';
  page.desktop ??= false;
  page.awaitingContent ??= page.status === 'awaiting-content';
  page.mobile ??= false;
  page.clientsHands ??= false;
  page.complete ??= page.status === 'complete';
  return page;
}

export function normalizeProject(project) {
  project.pages.forEach(normalizePage);
  project.groups.forEach(group => { if (group.name === 'CMS collection') group.name = 'CMS collections'; });
  project.schemaVersion = 2;
  return project;
}
